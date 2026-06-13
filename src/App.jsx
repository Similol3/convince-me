import { useState, useEffect } from "react";
import { C } from "./tokens";
import { getOrCreateUser } from "./lib/db";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
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

export default function App() {
  const [screen, setScreen] = useState(0);
  const [optA, setOptA] = useState("");
  const [optB, setOptB] = useState("");
  const [answers, setAnswers] = useState([]);
  const [category, setCategory] = useState("general");
  const [navActive, setNavActive] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    getOrCreateUser("ghost_digits").then((u) => setUser(u));
  }, []);
  const [avatar, setAvatar] = useState(
    () => localStorage.getItem("cm_avatar") || "🎲"
  );

  function handleAvatarChange(a) {
    setAvatar(a);
    localStorage.setItem("cm_avatar", a);
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
    if (i === 1) go(9); // Connect (new social feature)
    if (i === 2) go(6); // Battles
    if (i === 3) go(8); // Profile
  };

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
  };

  const hc = headerConfig[screen] || {};

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
          onAvatarChange={handleAvatarChange}
          onBack={() => {
            if (screen === 7) go(8);
            else go(Math.max(0, screen - 1));
          }}
        />

        {/* Screen content — extra bottom padding so fixed nav never covers content */}
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
            />
          )}
          {screen === 4 && <Share optA={optA} go={go} />}
          {screen === 5 && <Rematch go={go} />}
          {screen === 6 && <Battles user={user} />}
          {screen === 7 && <Settings user={user} />}
          {screen === 8 && <Profile user={user} go={go} avatar={avatar} />}
          {screen === 9 && <Connect />}
        </div>

        <BottomNav active={navActive} setActive={handleNav} />
      </div>
    </div>
  );
}
