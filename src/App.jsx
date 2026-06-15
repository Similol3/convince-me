import { useState, useEffect } from "react";
import { C } from "./tokens";
import { supabase } from "./lib/supabase";
import {
  getSession,
  onAuthChange,
  getOrCreateProfile,
  signOut,
} from "./lib/auth";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import Login from "./screens/Login";
import Signup from "./screens/Signup";
import ForgotPassword from "./screens/ForgotPassword";
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
import { Analytics } from "@vercel/analytics/react";

export default function App() {
  const [session, setSession] = useState(null);
  const [authScreen, setAuthScreen] = useState("login");
  const [authLoading, setAuthLoading] = useState(true);

  const [screen, setScreen] = useState(0);
  const [optA, setOptA] = useState("");
  const [optB, setOptB] = useState("");
  const [answers, setAnswers] = useState([]);
  const [category, setCategory] = useState("general");
  const [navActive, setNavActive] = useState(0);
  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState("🎲");

  const [lastResult, setLastResult] = useState(null);

  function handleDecided(result) {
    setLastResult(result);
  }

  // ── Auth check on load ──────────────────────────────────
  useEffect(() => {
    getSession().then((s) => {
      setSession(s);
      setAuthLoading(false);
    });

    const { data: listener } = onAuthChange((s) => setSession(s));
    return () => listener?.subscription?.unsubscribe();
  }, []);

  // ── Load profile once session exists ────────────────────
  useEffect(() => {
    if (!session?.user) return;
    getOrCreateProfile(session.user).then((profile) => {
      setUser(profile);
      setAvatar(profile?.avatar || "🎲");
    });
  }, [session]);

  // ── Status bar clock + battery ──────────────────────────
  useEffect(() => {
    const clockInterval = setInterval(() => setTime(new Date()), 1000);
    if (navigator.getBattery) {
      navigator.getBattery().then((bat) => {
        setBattery(Math.round(bat.level * 100));
        bat.addEventListener("levelchange", () =>
          setBattery(Math.round(bat.level * 100))
        );
      });
    }
    return () => clearInterval(clockInterval);
  }, []);

  function formatTime(date) {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  }

  const go = (n, a, b, ans, cat) => {
    if (a !== undefined) setOptA(a);
    if (b !== undefined) setOptB(b);
    if (ans !== undefined) setAnswers(ans);
    if (cat !== undefined) setCategory(cat);
    setScreen(n);
  };

  const handleNav = (i) => {
    setNavActive(i);
    if (i === 0) go(0); // Home
    if (i === 1) go(9); // Connect
    if (i === 2) go(6); // Battles
    if (i === 3) go(8); // Profile
  };

  async function handleAvatarChange(a) {
    setAvatar(a);
    if (user) {
      await supabase.from("users").update({ avatar: a }).eq("id", user.id);
      setUser({ ...user, avatar: a });
    }
  }
  async function handleAvatarImageChange(base64) {
    if (user) {
      await supabase
        .from("users")
        .update({ avatar_image: base64, avatar: null })
        .eq("id", user.id);
      setUser({ ...user, avatar_image: base64, avatar: null });
    }
  }

  const headerConfig = {
    0: { showBack: false, streak: user?.streak?.toString() },
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

  // ── AUTH GATE — show login/signup/forgot if not logged in ──
  if (authLoading) {
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
        <div style={{ fontSize: 32 }}>🎲</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: C.bg,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div style={{ width: "100%", maxWidth: 430 }}>
          {authScreen === "login" && <Login onSwitch={setAuthScreen} />}
          {authScreen === "signup" && <Signup onSwitch={setAuthScreen} />}
          {authScreen === "forgot" && (
            <ForgotPassword onSwitch={setAuthScreen} />
          )}
        </div>
      </div>
    );
  }

  // ── MAIN APP ──────────────────────────────────────────────
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
        <Header
          showBack={hc.showBack}
          streak={hc.streak}
          avatar={avatar}
          avatarImage={user?.avatar_image}
          onAvatarChange={handleAvatarChange}
          onAvatarImageChange={handleAvatarImageChange}
          isPro={user?.is_pro || false}
          onLeaderboard={() => go(14)}
          onUpgrade={() => go(13)}
          onBack={() => {
            if (screen === 7) go(8);
            else go(Math.max(0, screen - 1));
          }}
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
              go={go}
              onDecided={handleDecided}
            />
          )}
          {screen === 5 && (
            <Rematch result={lastResult} onDecided={handleDecided} go={go} />
          )}

          {screen === 4 && <Share optA={optA} go={go} />}

          {screen === 6 && <Battles user={user} />}
          {screen === 7 && <Settings user={user} onSignOut={signOut} />}
          {screen === 8 && <Profile user={user} go={go} avatar={avatar} />}
          {screen === 9 && <Connect user={user} go={go} />}
          {screen === 13 && <Upgrade user={user} go={go} />}
          {screen === 14 && <Leaderboard user={user} />}
        </div>

        <BottomNav active={navActive} setActive={handleNav} />
        <Analytics />
      </div>
    </div>
  );
}
