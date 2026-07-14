/**
 * AI tutor is still mocked pending the real Anthropic-backed endpoint
 * (planned in a later phase). Everything else that used to live here
 * (lessons, achievements, missions, leaderboard, stats) now comes from the
 * real API — see apps/web/src/shared/api/hooks/*.
 */

export const AI_SUGGESTIONS = [
  'Explain the difference between 은/는 and 이/가',
  'How do I politely email my professor?',
  'Quiz me on airport vocabulary',
  'Give me an example with 발표',
];

const AI_RESPONSES: { match: RegExp; reply: string }[] = [
  {
    match: /은\/는|이\/가|particle|subject|topic/i,
    reply:
      '좋은 질문이에요! 👏\n\n**은/는** marks the *topic* — what the sentence is about, often for contrast.\n**이/가** marks the *subject* — who/what does the action, often for new information.\n\n• 저는 학생이에요. → *As for me*, I am a student. (topic)\n• 누가 왔어요? 친구가 왔어요. → A *friend* came. (new subject)\n\nTip: when you introduce something new, reach for 이/가. When you set the scene or contrast, use 은/는.',
  },
  {
    match: /email|professor|교수|polite|formal/i,
    reply:
      "Here's a clean, polite template you can reuse:\n\n교수님께,\n안녕하세요, [전공] [이름]입니다.\n다름이 아니라 [용건]에 대해 여쭤보고 싶습니다.\n혹시 시간 괜찮으실 때 상담이 가능할까요?\n감사합니다.\n[이름] 드림\n\nKeep it short, lead with your name + major, state the one thing you need, and close with 드림. 🙂",
  },
  {
    match: /quiz|test|airport|여권|입국/i,
    reply:
      "Let's do a quick airport drill! ✈️\n\n1. 여권 means…?\n2. Where do you go to exchange money?\n3. Complete: 입국 ___은 어디예요?\n\nType your answers and I'll check them. (Hint: passport, 환전, 심사 😉)",
  },
  {
    match: /발표|presentation/i,
    reply:
      '발표 (balpyo) = "presentation". A few natural examples:\n\n• 다음 주에 발표가 있어요. → I have a presentation next week.\n• 발표 준비를 하고 있어요. → I am preparing my presentation.\n• 발표 잘했어요! → Great presentation!\n\nWant me to build a 3-line self-intro you could open a presentation with?',
  },
];

export function aiReply(input: string): string {
  const found = AI_RESPONSES.find((r) => r.match.test(input));
  if (found) return found.reply;
  return `좋아요! Let's work through "${input.trim()}".\n\nIn Korean learning, the fastest progress comes from *context*. Here's how I'd approach it:\n\n1. Learn the word inside a real sentence.\n2. Say it out loud twice.\n3. Reuse it in a new sentence today.\n\nWould you like an example sentence, a mini-quiz, or a grammar breakdown?`;
}
