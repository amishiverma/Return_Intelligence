export function useCopilot() {
  const askCopilot = async (question: string) => {
    const res = await fetch('http://127.0.0.1:8000/copilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });

    const data = await res.json();
    return data.answer;
  };

  return { askCopilot };
}
