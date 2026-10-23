
import { useState, useEffect, useRef } from "react";
import { C, gr } from "../tokens";
import { CATEGORIES } from "../data/questions";

export default function Questions({ go, category }) {
  const cat = CATEGORIES[category] || CATEGORIES.general;
  const QUESTIONS = cat.questions;
  const TOTAL = QUESTIONS.length;

  const [step, setStep] = useState(0);
  const [sel, setSel] = useState(null);
  const [animKey, setAnimKey] = useState(0);
  const [allAnswers, setAllAnswers] = useState([]);

  const timerRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  const q = QUESTIONS[step];
  const pct = Math.round(((step + 1) / TOTAL) * 100);

  function pick(i) {
    // Prevent multiple selections while transitioning.
    if (sel !== null) return;

    setSel(i);

    const newAnswers = [...allAnswers, i];
    setAllAnswers(newAnswers);

    timerRef.current = setTimeout(() => {
      if (step < TOTAL - 1) {
        setStep((s) => s + 1);
        setSel(null);
        setAnimKey((k) => k + 1);
      } else {
        go(3, undefined, undefined, newAnswers);
      }
    }, 350);
  }

  return (
    <div
      style={{
        boxSizing: "border-box",
        padding: "24px 16px 30px",
        display: "flex",
        flexDirection: "column",
        gap: 24,
        minHeight: "100%",
        background: `radial-gradient(ellipse 100% 45% at 50% 110%, rgba(236,72,153,0.11) 0%, ${C.bg} 65%)`,
      }}
    >
      {/* Progress section */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.08em",
              color: C.sub,
            }}
          >
            QUESTION {step + 1} OF {TOTAL}
          </span>

          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: C.grape,
            }}
          >
            {pct}%
          </span>
        </div>

        <div
          style={{
            height: 7,
            background: "rgba(255,255,255,0.07)",
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background: gr(),
              borderRadius: 999,
              transition: "width 0.4s ease",
            }}
          />
        </div>
      </div>

      {/* Category */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(139,92,246,0.09)",
          border: "1px solid rgba(139,92,246,0.2)",
          borderRadius: 999,
          padding: "7px 12px",
          alignSelf: "flex-start",
        }}
      >
        <span style={{ fontSize: 14 }}>{cat.emoji}</span>

        <span
          style={{
            fontSize: 11,
            fontWeight: 800,
            color: C.sub,
            letterSpacing: "0.05em",
          }}
        >
          {cat.label.toUpperCase()}
        </span>
      </div>

      {/* Question and answers */}
      <div
        key={animKey}
        style={{
          animation: "slideUp 0.3s ease",
          display: "flex",
          flexDirection: "column",
          gap: 22,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: C.muted,
              letterSpacing: "0.08em",
              marginBottom: 10,
            }}
          >
            MAKE YOUR PICK
          </div>

          <h2
            style={{
              fontSize: 25,
              fontWeight: 900,
              color: C.text,
              margin: 0,
              lineHeight: 1.25,
              letterSpacing: "-0.5px",
            }}
          >
            {q.q}
          </h2>

          <p
            style={{
              fontSize: 12,
              color: C.muted,
              margin: "10px 0 0",
              lineHeight: 1.5,
            }}
          >
            Choose the option that feels right to you.
          </p>
        </div>

        {/* Answer cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 12,
          }}
        >
          {q.opts.map((opt, i) => {
            const selected = sel === i;
            const otherSelected = sel !== null && sel !== i;

            return (
              <button
                key={i}
                type="button"
                onClick={() => pick(i)}
                disabled={sel !== null}
                aria-pressed={selected}
                style={{
                  position: "relative",
                  background: selected
                    ? gr()
                    : "rgba(255,255,255,0.035)",
                  border: selected
                    ? "1px solid rgba(255,255,255,0.35)"
                    : `1px solid ${C.glassBdr}`,
                  borderRadius: 18,
                  padding: "24px 12px",
                  minHeight: 128,
                  cursor: sel !== null ? "default" : "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  opacity: otherSelected ? 0.5 : 1,
                  transform: selected ? "scale(1.025)" : "scale(1)",
                  boxShadow: selected
                    ? "0 7px 22px rgba(139,92,246,0.18)"
                    : "none",
                  transition:
                    "background 0.2s ease, transform 0.2s ease, opacity 0.2s ease, box-shadow 0.2s ease",
                  fontFamily: "inherit",
                }}
              >
                {/* Selected indicator */}
                {selected && (
                  <span
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 11,
                      width: 19,
                      height: 19,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      color: "white",
                      fontWeight: 900,
                    }}
                  >
                    ✓
                  </span>
                )}

                <span
                  style={{
                    fontSize: 30,
                    lineHeight: 1.2,
                    transition: "transform 0.2s ease",
                    transform: selected ? "scale(1.1)" : "scale(1)",
                  }}
                >
                  {opt.e}
                </span>

                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: "white",
                    textAlign: "center",
                    lineHeight: 1.4,
                    overflowWrap: "anywhere",
                  }}
                >
                  {opt.l}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom text */}
      <div
        style={{
          textAlign: "center",
          marginTop: "auto",
          paddingTop: 28,
        }}
      >
        <div
          style={{
            width: 35,
            height: 1,
            background: C.glassBdr,
            margin: "0 auto 14px",
          }}
        />

        <span
          style={{
            fontSize: 10,
            color: C.muted,
            letterSpacing: "0.06em",
            fontWeight: 700,
          }}
        >
          🔒 SECURE SESSION ACTIVE
        </span>
      </div>
    </div>
  );
}
