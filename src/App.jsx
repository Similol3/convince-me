import { useState, useEffect } from "react";
import { C } from "./tokens";
import { supabase } from "./lib/supabase";
import {
  getSession,
  onAuthChange,
  getOrCreateProfile,
  signOut,
} from "./lib/auth";
import { getGuestUser, updateGuestUser } from "./lib/guests";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import Login from "./screens/Login";
import Signup from "./screens/Signup";
import ForgotPassword from "./screens/ForgotPassword";
import ProSuccess from "./screens/ProSuccess";
import Home from "./screens/Home";
import Options from "./screens/Options";
import Questions from "./screens/Questions";
import Reveal from "./screens/Reveal";
import Share from "./screens/Share";
import Rematch from "./screens/Rematch";
import Battles from "./screens/Battles";
import Settings from "./screens/Settings";
import Profile from "./screens/Profile";
import Connect from "./screens/Connect";
import Upgrade from "./screens/Upgrade";
import Leaderboard from "./screens/Leaderboard";
import { isDecisionLimitReached, incrementDecisionCount, getTodayDecisionCount, updateStreak, scheduleStreakReminder } from './lib/decisions';
import { promptNotifications, scheduleStreakReminder } from './lib/notifications';
import ProAd from './screens/ProAd';
import InstallBanner from './components/InstallBanner';

export default function App() {
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [authModal, setAuthModal] = useState(null); // null | 'login' | 'signup' | 'forgot'
  const [showProSuccess, setShowProSuccess] = useState(false);
  const [showProAd, setShowProAd] = useState(false);

  const [screen, setScreen] = useState(0);
  const [optA, setOptA] = useState("");
  const [optB, setOptB] = useState("");
  const [answers, setAnswers] = useState([]);
  const [category, setCategory] = useState("general");
  const [navActive, setNavActive] = useState(0);
  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState("🎲");
  const [lastResult, setLastResult] = useState(null);
  const [aiRecommendation, setAiRecommendation] = useState(null);

  // ── Auth listener ──────────────────────────────────────
  useEffect(() => {
    getSession().then((s) => {
      setSession(s);
      setAuthReady(true);
    });

    const { data: listener } = onAuthChange((s) => {
      setSession(s);
      // Auto-close any open auth modal once a real session exists
      if (s) setAuthModal(null);
    });

    return () => listener?.subscription?.unsubscribe();
  }, []);

  // ── Load user (real or guest) ──────────────────────────
  useEffect(() => {
    if (!authReady) return;

    if (session?.user) {
      // Real user — load from Supabase
      getOrCreateProfile(session.user).then((profile) => {
        if (profile) {
          setUser(profile);
          setAvatar(profile.avatar || "🎲");
        }
      });
    } else {
      // No session — use guest
      const guest = getGuestUser();
      setUser(guest);
      setAvatar(guest.avatar || "🎲");
    }
  }, [session, authReady]);

  // ── Check for payment success on load ─────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment");

    if (paymentStatus === "success") {
      window.history.replaceState({}, "", window.location.pathname);

      // Refresh user data first, THEN show success screen
      if (session?.user) {
        getOrCreateProfile(session.user).then((profile) => {
          if (profile) {
            setUser(profile);
            setAvatar(profile.avatar || "🎲");
          
            scheduleReminder(profile.streak || 0);
            setTimeout(() => promptNotifications(), 3000);
          }
          setShowProSuccess(true);
        });
      } else {
        setShowProSuccess(true);
      }
    } else if (paymentStatus === "cancelled") {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [session]);

  // ── Navigation ─────────────────────────────────────────
  const go = (n, a, b, ans, cat, rec) => {
    // Check decision limit when starting a new decision
    if (n === 1 && !user?.is_pro) {
      if (isDecisionLimitReached(user?.is_pro)) {
        setShowProAd(true);
        return;
      }
    }
  
    if (a !== undefined) setOptA(a);
    if (b !== undefined) setOptB(b);
    if (ans !== undefined) setAnswers(ans);
    if (cat !== undefined) setCategory(cat);
    if (rec !== undefined) setAiRecommendation(rec);
    setScreen(n);
  };

  const handleNav = (i) => {
    setNavActive(i);
    if (i === 0) go(0);
    if (i === 1) go(9);
    if (i === 2) go(6);
    if (i === 3) go(8);
  };

  function handleDecided(result) {
    setLastResult(result);
  
    // Track today's decision
    incrementDecisionCount();
  
    // Update guest XP locally
    if (user?.is_guest) {
      const updated = updateGuestUser({
        xp: (user.xp || 0) + 10,
        total_decisions: (user.total_decisions || 0) + 1,
      });
      setUser(updated);
    } else if (user) {
      // Update streak for logged-in users
      updateStreak(user, supabase);
    }
  }

  async function handleAvatarChange(a) {
    setAvatar(a);
    if (user?.is_guest) {
      const updated = updateGuestUser({ avatar: a, avatar_image: null });
      setUser(updated);
    } else if (user) {
      await supabase
        .from("users")
        .update({ avatar: a, avatar_image: null })
        .eq("id", user.id);
      setUser({ ...user, avatar: a, avatar_image: null });
    }
  }

  async function handleAvatarImageChange(base64) {
    if (user?.is_guest) {
      const updated = updateGuestUser({ avatar_image: base64, avatar: null });
      setUser(updated);
    } else if (user) {
      await supabase
        .from("users")
        .update({ avatar_image: base64, avatar: null })
        .eq("id", user.id);
      setUser({ ...user, avatar_image: base64, avatar: null });
    }
  }

  async function handleSignOut() {
    await signOut();
    setSession(null);
    const guest = getGuestUser();
    setUser(guest);
    setAvatar(guest.avatar || "🎲");
    go(0);
  }

  function requireAuth(action) {
    if (user?.is_guest) {
      setAuthModal("signup");
      return false;
    }
    return true;
  }

  const headerConfig = {
    0: {
      showBack: false,
      streak: user?.is_guest ? null : user?.streak?.toString(),
    },
    1: { showBack: true },
    2: { showBack: true },
    3: { showBack: false },
    4: { showBack: false },
    5: { showBack: true },
    6: { showBack: false },
    7: { showBack: true },
    8: { showBack: false },
    9: { showBack: false },
    13: { showBack: true },
    14: { showBack: true },
  };

  const hc = headerConfig[screen] || {};

  function handleBack() {
    if (screen === 7) return go(8);
    if (screen === 13) return go(8);
    if (screen === 14) return go(0);
    go(Math.max(0, screen - 1));
  }

  // ── Loading state ──────────────────────────────────────
  if (!authReady || !user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: C.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{ fontSize: 40, animation: "float 1.5s ease-in-out infinite" }}
        >
          🎲
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        justifyContent: "center",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 430,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          background: C.bg,
          position: "relative",
        }}
      >
        {/* Pro Success overlay */}
        {showProSuccess && (
          <ProSuccess
            go={(n) => {
              setShowProSuccess(false);
              go(n);
            }}
          />
        )}

       {showProAd && (
  <ProAd
    decisionsUsed={getTodayDecisionCount()}
    onUpgrade={() => {
      setShowProAd(false);
      go(13);
    }}
    onDismiss={() => setShowProAd(false)}
  />
)}
        {/* Auth Modal overlay */}
        {authModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 200,
              background: "rgba(0,0,0,0.85)",
              display: "flex",
              alignItems: "flex-end",
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: 430,
                margin: "0 auto",
                background: C.bg,
                borderRadius: "24px 24px 0 0",
                maxHeight: "90vh",
                overflowY: "auto",
                border: `1px solid ${C.border}`,
              }}
            >
              {/* Close button */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  padding: "16px 16px 0",
                }}
              >
                <button
                  onClick={() => setAuthModal(null)}
                  style={{
                    background: C.glass,
                    border: `1px solid ${C.border}`,
                    borderRadius: "50%",
                    width: 32,
                    height: 32,
                    color: "white",
                    fontSize: 16,
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>

              {authModal === "login" && (
                <Login
                  onSwitch={setAuthModal}
                  onClose={() => setAuthModal(null)}
                />
              )}
              {authModal === "signup" && (
                <Signup
                  onSwitch={setAuthModal}
                  onClose={() => setAuthModal(null)}
                />
              )}
              {authModal === "forgot" && (
                <ForgotPassword onSwitch={setAuthModal} />
              )}
            </div>
          </div>
        )}

        <Header
          showBack={hc.showBack}
          streak={hc.streak}
          avatar={avatar}
          avatarImage={user?.avatar_image}
          onAvatarChange={handleAvatarChange}
          onAvatarImageChange={handleAvatarImageChange}
          isPro={user?.is_pro || false}
          isGuest={user?.is_guest || false}
          onLeaderboard={() => go(14)}
          onUpgrade={() => go(13)}
          onBack={handleBack}
        />

        <div style={{ flex: 1, overflowY: "auto", paddingBottom: 110 }}>
          {screen === 0 && <Home go={go} user={user} />}
          {screen === 1 && <Options go={go} category={category} />}
          {screen === 2 && <Questions go={go} category={category} />}
          {screen === 3 && (
            <Reveal
              optA={optA}
              optB={optB}
              answers={answers}
              user={user}
              category={category}
              aiRecommendation={aiRecommendation}
              go={go}
              onDecided={handleDecided}
            />
          )}
          {screen === 4 && (
            <Share optA={optA} aiRecommendation={aiRecommendation} go={go} />
          )}
          {screen === 5 && (
            <Rematch result={lastResult} onDecided={handleDecided} go={go} />
          )}
          {screen === 6 && <Battles user={user} />}
          {screen === 7 && <Settings user={user} onSignOut={handleSignOut} />}
          {screen === 8 && (
            <Profile
              user={user}
              go={go}
              avatar={avatar}
              onSignIn={() => setAuthModal("login")}
              onSignUp={() => setAuthModal("signup")}
            />
          )}
          {screen === 9 && <Connect user={user} go={go} />}
          {screen === 13 && (
            <Upgrade
              user={user}
              go={go}
              onRequireLogin={() => setAuthModal("signup")}
            />
          )}

          {screen === 14 && <Leaderboard user={user} />}
        </div>
        <InstallBanner />
<BottomNav active={navActive} setActive={handleNav} />
      </div>
    </div>
  );
}
