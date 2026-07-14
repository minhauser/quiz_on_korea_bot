/**
 * Lessons from the API have no visual metadata (icon/gradient) — those were
 * mock-only decorative fields. Derive them deterministically from the lesson
 * id so cards stay visually distinct without the backend knowing about
 * frontend CSS.
 */
const ICONS = ['✈️', '🏠', '🎓', '👩‍🏫', '🍱', '🧑‍💻', '📚', '🗺️', '🏛️', '🎭'];
const ACCENTS = [
  'from-sky-500 to-indigo-500',
  'from-emerald-500 to-teal-500',
  'from-violet-500 to-fuchsia-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500',
  'from-cyan-500 to-blue-500',
];

function hash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = (h * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function lessonIcon(lessonId: string): string {
  const icon = ICONS[hash(lessonId) % ICONS.length];
  return icon ?? '📘';
}

export function lessonAccent(lessonId: string): string {
  const accent = ACCENTS[hash(`accent-${lessonId}`) % ACCENTS.length];
  return accent ?? ACCENTS[0]!;
}
