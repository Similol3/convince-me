export async function createCrewDecision(userId, optionA, optionB, category) {
  try {
    const res = await fetch('/api/crew?action=create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, optionA, optionB, category }),
    });
    const data = await res.json();
    if (!data.success) return null;
    return {
      shareToken: data.shareToken,
      shareUrl:   `https://convince-me-tau.vercel.app/vote/${data.shareToken}`,
    };
  } catch {
    return null;
  }
}
