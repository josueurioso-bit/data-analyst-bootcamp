/**
 * LLM Adapter — Wraps AI provider calls so feature code never touches APIs directly
 *
 * TEACHING MOMENT: This is the "Adapter Pattern." Right now we only use Anthropic,
 * but later we'll add Google Gemini as a fallback. When that happens, we only
 * change THIS file — chat.js and every other feature file stays the same.
 *
 * Think of it like a power adapter: your laptop doesn't care if the outlet
 * is US or EU, because the adapter handles the difference.
 */

/**
 * Send a message to the LLM and get a response
 *
 * @param {string} system - The system prompt (instructions for the AI)
 * @param {Array} messages - Conversation history [{role: "user", content: "..."}, ...]
 * @param {Object} options - Optional overrides
 * @param {string} options.model - Model to use (default: claude-haiku-4-5-20251001)
 * @param {number} options.maxTokens - Max response length (default: 2000)
 * @returns {Object} { text: string, raw: object } — the AI response text + full API response
 * @throws {Error} with message and status code if the API call fails
 */
async function sendMessage(system, messages, options = {}) {
  const {
    model = 'claude-haiku-4-5-20251001',
    maxTokens = 2000
  } = options;

  // TEACHING MOMENT: API keys live in environment variables, never in code.
  // On Vercel, you set these in the dashboard under Settings > Environment Variables.
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    const err = new Error('Server configuration error: API key not set');
    err.status = 500;
    throw err;
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system,
      messages
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('LLM API error:', response.status, errorData);
    const err = new Error(errorData.error?.message || 'AI service error');
    err.status = response.status;
    throw err;
  }

  const data = await response.json();
  const text = data.content?.[0]?.text || '';

  return { text, raw: data };
}

module.exports = { sendMessage };
