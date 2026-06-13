// ─── VOTING ALGORITHM ─────────────────────────────────────
// This generates realistic vote counts based on user answers.
// Users see numbers that feel like real crowd votes.
// The algorithm uses their mood/hunger/time answers to decide.

export function generateVotes(answers) {
    // answers = [moodIndex, hungerIndex, timeIndex]
    // Each answer is 0-3 (which option they picked)
  
    // Base votes — random between 8 and 25
    let vA = Math.floor(Math.random() * 18) + 8;
    let vB = Math.floor(Math.random() * 18) + 8;
  
    // Use answers to slightly bias the result
    // Higher answer index = more energy = favors option B
    const bias = answers.reduce((sum, a) => sum + a, 0);
  
    if (bias >= 6) {
      // High energy answers (Party, Starving, All night) → B wins more
      vB = vB + Math.floor(Math.random() * 8) + 3;
    } else if (bias <= 2) {
      // Low energy answers (Chill, Not really, Fast) → A wins more
      vA = vA + Math.floor(Math.random() * 8) + 3;
    } else {
      // Middle answers → close race, could go either way
      const boost = Math.floor(Math.random() * 5) + 1;
      if (Math.random() > 0.5) vA += boost;
      else vB += boost;
    }
  
    // 8% chance of a draw (triggers coin flip)
    const isDraw = Math.random() < 0.08;
    if (isDraw) vB = vA;
  
    const diff       = Math.abs(vA - vB);
    const isCloseCall = !isDraw && diff <= 2;
  
    return { vA, vB, isDraw, isCloseCall, diff };
  }
  