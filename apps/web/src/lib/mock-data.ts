/**
 * Local mock data powering the clickable demo. No network, no backend.
 */

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface VocabItem {
  word: string;
  romanization: string;
  translation: string;
  example: string;
  exampleTranslation: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface Lesson {
  id: string;
  order: number;
  title: string;
  scenario: string;
  world: string;
  chapter: string;
  icon: string;
  difficulty: Difficulty;
  xpReward: number;
  accent: string; // tailwind gradient stops
  vocab: VocabItem[];
  quiz: QuizQuestion[];
}

export const LESSONS: Lesson[] = [
  {
    id: 'arrival-airport',
    order: 1,
    title: 'At the Airport',
    scenario: 'Arrival in Korea',
    world: 'Arrival in Korea',
    chapter: 'Chapter 1 · First Steps',
    icon: '✈️',
    difficulty: 'Beginner',
    xpReward: 60,
    accent: 'from-sky-500 to-indigo-500',
    vocab: [
      { word: '여권', romanization: 'yeogwon', translation: 'passport', example: '여권을 보여 주세요.', exampleTranslation: 'Please show your passport.' },
      { word: '입국', romanization: 'ipguk', translation: 'entry / immigration', example: '입국 심사는 어디예요?', exampleTranslation: 'Where is immigration?' },
      { word: '수하물', romanization: 'suhamul', translation: 'baggage', example: '수하물을 찾고 있어요.', exampleTranslation: 'I am looking for my baggage.' },
      { word: '환전', romanization: 'hwanjeon', translation: 'currency exchange', example: '환전은 어디서 해요?', exampleTranslation: 'Where can I exchange money?' },
      { word: '도착', romanization: 'dochak', translation: 'arrival', example: '도착 시간이 언제예요?', exampleTranslation: 'What is the arrival time?' },
    ],
    quiz: [
      { id: 'q1', prompt: 'What does 여권 mean?', options: ['ticket', 'passport', 'baggage', 'visa'], answerIndex: 1, explanation: '여권 (yeogwon) means "passport".' },
      { id: 'q2', prompt: 'Choose the best reply: "여권을 보여 주세요."', options: ['네, 여기 있어요.', '맛있어요.', '안녕히 가세요.', '얼마예요?'], answerIndex: 0, explanation: '"네, 여기 있어요." = "Yes, here it is."' },
      { id: 'q3', prompt: '"환전" is used when you want to…', options: ['find a taxi', 'exchange money', 'order food', 'buy a SIM card'], answerIndex: 1, explanation: '환전 (hwanjeon) = currency exchange.' },
    ],
  },
  {
    id: 'dorm-checkin',
    order: 2,
    title: 'Dormitory Check-in',
    scenario: 'Getting your room key',
    world: 'Arrival in Korea',
    chapter: 'Chapter 1 · First Steps',
    icon: '🏠',
    difficulty: 'Beginner',
    xpReward: 70,
    accent: 'from-emerald-500 to-teal-500',
    vocab: [
      { word: '기숙사', romanization: 'gisuksa', translation: 'dormitory', example: '기숙사가 어디에 있어요?', exampleTranslation: 'Where is the dormitory?' },
      { word: '열쇠', romanization: 'yeolsoe', translation: 'key', example: '방 열쇠를 받았어요.', exampleTranslation: 'I received the room key.' },
      { word: '룸메이트', romanization: 'rummeiteu', translation: 'roommate', example: '제 룸메이트는 친절해요.', exampleTranslation: 'My roommate is kind.' },
      { word: '세탁실', romanization: 'setaksil', translation: 'laundry room', example: '세탁실은 1층이에요.', exampleTranslation: 'The laundry room is on the first floor.' },
    ],
    quiz: [
      { id: 'q1', prompt: 'What does 기숙사 mean?', options: ['library', 'dormitory', 'cafeteria', 'classroom'], answerIndex: 1, explanation: '기숙사 = dormitory.' },
      { id: 'q2', prompt: 'You need to wash clothes. Where do you go?', options: ['도서관', '세탁실', '식당', '체육관'], answerIndex: 1, explanation: '세탁실 = laundry room.' },
      { id: 'q3', prompt: 'Translate: 방 열쇠를 받았어요.', options: ['I lost the key.', 'I received the room key.', 'I cleaned the room.', 'I paid the rent.'], answerIndex: 1, explanation: '받았어요 = received.' },
    ],
  },
  {
    id: 'campus-tour',
    order: 3,
    title: 'Campus Orientation',
    scenario: 'Finding your way around',
    world: 'University Life',
    chapter: 'Chapter 2 · Orientation',
    icon: '🎓',
    difficulty: 'Beginner',
    xpReward: 80,
    accent: 'from-violet-500 to-fuchsia-500',
    vocab: [
      { word: '도서관', romanization: 'doseogwan', translation: 'library', example: '도서관에서 공부해요.', exampleTranslation: 'I study at the library.' },
      { word: '강의실', romanization: 'ganguisil', translation: 'lecture room', example: '강의실이 몇 층이에요?', exampleTranslation: 'What floor is the lecture room on?' },
      { word: '학생증', romanization: 'haksaengjeung', translation: 'student ID', example: '학생증을 만들었어요.', exampleTranslation: 'I made a student ID.' },
      { word: '수강 신청', romanization: 'sugang sincheong', translation: 'course registration', example: '수강 신청은 내일이에요.', exampleTranslation: 'Course registration is tomorrow.' },
    ],
    quiz: [
      { id: 'q1', prompt: 'Where do you study and borrow books?', options: ['강의실', '도서관', '식당', '기숙사'], answerIndex: 1, explanation: '도서관 = library.' },
      { id: 'q2', prompt: 'What is 학생증?', options: ['tuition fee', 'student ID', 'timetable', 'diploma'], answerIndex: 1, explanation: '학생증 = student ID card.' },
      { id: 'q3', prompt: '"수강 신청" refers to…', options: ['graduating', 'registering for courses', 'joining a club', 'paying rent'], answerIndex: 1, explanation: '수강 신청 = course registration.' },
    ],
  },
  {
    id: 'professor-office',
    order: 4,
    title: 'Meeting the Professor',
    scenario: 'Office hours & email etiquette',
    world: 'University Life',
    chapter: 'Chapter 2 · Orientation',
    icon: '👩‍🏫',
    difficulty: 'Intermediate',
    xpReward: 110,
    accent: 'from-amber-500 to-orange-500',
    vocab: [
      { word: '교수님', romanization: 'gyosunim', translation: 'professor (honorific)', example: '교수님께 이메일을 보냈어요.', exampleTranslation: 'I sent an email to the professor.' },
      { word: '발표', romanization: 'balpyo', translation: 'presentation', example: '다음 주에 발표가 있어요.', exampleTranslation: 'There is a presentation next week.' },
      { word: '과제', romanization: 'gwaje', translation: 'assignment', example: '과제를 제출했어요.', exampleTranslation: 'I submitted the assignment.' },
      { word: '상담', romanization: 'sangdam', translation: 'consultation', example: '교수님과 상담을 했어요.', exampleTranslation: 'I had a consultation with the professor.' },
    ],
    quiz: [
      { id: 'q1', prompt: 'Polite way to address a professor?', options: ['선생', '교수님', '친구', '학생'], answerIndex: 1, explanation: '교수님 adds the honorific 님.' },
      { id: 'q2', prompt: 'Translate: 다음 주에 발표가 있어요.', options: ['There is a holiday next week.', 'There is a presentation next week.', 'I have an exam today.', 'Class is canceled.'], answerIndex: 1, explanation: '발표 = presentation.' },
      { id: 'q3', prompt: 'You finished homework. Say:', options: ['과제를 제출했어요.', '밥을 먹었어요.', '집에 갔어요.', '운동했어요.'], answerIndex: 0, explanation: '과제를 제출했어요 = I submitted the assignment.' },
    ],
  },
  {
    id: 'cafeteria',
    order: 5,
    title: 'Ordering at the Cafeteria',
    scenario: 'Campus dining',
    world: 'Campus Life',
    chapter: 'Chapter 3 · Daily Life',
    icon: '🍱',
    difficulty: 'Intermediate',
    xpReward: 120,
    accent: 'from-rose-500 to-pink-500',
    vocab: [
      { word: '식당', romanization: 'sikdang', translation: 'cafeteria / restaurant', example: '학생 식당에서 점심을 먹어요.', exampleTranslation: 'I eat lunch at the student cafeteria.' },
      { word: '주문', romanization: 'jumun', translation: 'order', example: '주문하시겠어요?', exampleTranslation: 'Would you like to order?' },
      { word: '계산', romanization: 'gyesan', translation: 'payment / bill', example: '계산은 카드로 할게요.', exampleTranslation: 'I will pay by card.' },
      { word: '메뉴', romanization: 'menyu', translation: 'menu', example: '메뉴 좀 보여 주세요.', exampleTranslation: 'Please show me the menu.' },
    ],
    quiz: [
      { id: 'q1', prompt: '"주문하시겠어요?" means…', options: ['Are you full?', 'Would you like to order?', 'Where is the exit?', 'Is it spicy?'], answerIndex: 1, explanation: '주문 = order.' },
      { id: 'q2', prompt: 'Pay by card: "계산은 ___(으)로 할게요."', options: ['카드', '의자', '책', '버스'], answerIndex: 0, explanation: '카드 = card.' },
      { id: 'q3', prompt: 'What does 식당 mean?', options: ['library', 'cafeteria', 'gym', 'bank'], answerIndex: 1, explanation: '식당 = cafeteria/restaurant.' },
    ],
  },
  {
    id: 'group-project',
    order: 6,
    title: 'The Group Project',
    scenario: 'Teamwork & deadlines',
    world: 'Campus Life',
    chapter: 'Chapter 3 · Daily Life',
    icon: '🧑‍💻',
    difficulty: 'Advanced',
    xpReward: 160,
    accent: 'from-cyan-500 to-blue-500',
    vocab: [
      { word: '조별 과제', romanization: 'jobyeol gwaje', translation: 'group assignment', example: '조별 과제가 너무 많아요.', exampleTranslation: 'There are too many group assignments.' },
      { word: '마감', romanization: 'magam', translation: 'deadline', example: '마감이 금요일이에요.', exampleTranslation: 'The deadline is Friday.' },
      { word: '회의', romanization: 'hoeui', translation: 'meeting', example: '오후에 회의가 있어요.', exampleTranslation: 'There is a meeting in the afternoon.' },
      { word: '역할', romanization: 'yeokhal', translation: 'role', example: '제 역할은 발표예요.', exampleTranslation: 'My role is the presentation.' },
    ],
    quiz: [
      { id: 'q1', prompt: '"마감" means…', options: ['opening', 'deadline', 'discount', 'holiday'], answerIndex: 1, explanation: '마감 = deadline.' },
      { id: 'q2', prompt: 'Translate: 오후에 회의가 있어요.', options: ['There is a meeting in the afternoon.', 'I have lunch at noon.', 'The class is in the morning.', 'I will go home tonight.'], answerIndex: 0, explanation: '회의 = meeting.' },
      { id: 'q3', prompt: '"제 역할은 발표예요." — your role is…', options: ['note-taking', 'the presentation', 'cooking', 'driving'], answerIndex: 1, explanation: '역할 = role; 발표 = presentation.' },
    ],
  },
];

export interface DailyMission {
  id: string;
  title: string;
  icon: string;
  goal: number;
  reward: number;
}

export const DAILY_MISSIONS: DailyMission[] = [
  { id: 'm1', title: 'Learn 15 new words', icon: '📚', goal: 15, reward: 100 },
  { id: 'm2', title: 'Complete 1 lesson', icon: '🎯', goal: 1, reward: 80 },
  { id: 'm3', title: 'Score 90%+ on a quiz', icon: '⚡', goal: 1, reward: 120 },
  { id: 'm4', title: 'Keep your streak alive', icon: '🔥', goal: 1, reward: 50 },
];

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  unlocked: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'a1', title: 'First Steps', description: 'Complete your first lesson', icon: '🌱', rarity: 'Common', unlocked: true },
  { id: 'a2', title: 'Student Visa', description: 'Finish the Arrival world', icon: '🛂', rarity: 'Rare', unlocked: false },
  { id: 'a3', title: 'Bookworm', description: 'Master 100 vocabulary words', icon: '🐛', rarity: 'Rare', unlocked: false },
  { id: 'a4', title: 'Perfectionist', description: 'Score 100% on 5 quizzes', icon: '💎', rarity: 'Epic', unlocked: false },
  { id: 'a5', title: 'On Fire', description: 'Reach a 7-day streak', icon: '🔥', rarity: 'Epic', unlocked: true },
  { id: 'a6', title: 'Campus Legend', description: 'Reach the top of the leaderboard', icon: '👑', rarity: 'Legendary', unlocked: false },
];

export interface Player {
  id: string;
  name: string;
  flag: string;
  avatar: string;
  xp: number;
  country: string;
  university: string;
  isUser?: boolean;
}

export const LEADERBOARD_SEED: Player[] = [
  { id: 'u-aiko',   name: 'Aiko',   flag: '🇯🇵', avatar: '🦊', xp: 4820, country: 'Japan',       university: 'Yonsei University' },
  { id: 'u-minh',   name: 'Minh',   flag: '🇻🇳', avatar: '🐼', xp: 4510, country: 'Vietnam',     university: 'Seoul Nat\'l Univ.' },
  { id: 'you',      name: 'You',    flag: '🇺🇿', avatar: '🚀', xp: 4290, country: 'Uzbekistan',  university: 'Soonchunhyang Univ.', isUser: true },
  { id: 'u-sara',   name: 'Sara',   flag: '🇺🇿', avatar: '🦉', xp: 4180, country: 'Uzbekistan',  university: 'Soonchunhyang Univ.' },
  { id: 'u-carlos', name: 'Carlos', flag: '🇲🇽', avatar: '🐯', xp: 3990, country: 'Mexico',      university: 'Yonsei University' },
  { id: 'u-wei',    name: 'Wei',    flag: '🇨🇳', avatar: '🐉', xp: 3760, country: 'China',       university: 'Soonchunhyang Univ.' },
  { id: 'u-amara',  name: 'Amara',  flag: '🇳🇬', avatar: '🦁', xp: 3540, country: 'Nigeria',     university: 'KAIST' },
  { id: 'u-lena',   name: 'Lena',   flag: '🇩🇪', avatar: '🐧', xp: 3310, country: 'Germany',     university: 'Seoul Nat\'l Univ.' },
  { id: 'u-omar',   name: 'Omar',   flag: '🇪🇬', avatar: '🐪', xp: 3120, country: 'Egypt',       university: 'KAIST' },
  { id: 'u-yuki',   name: 'Yuki',   flag: '🇯🇵', avatar: '🐰', xp: 2980, country: 'Japan',       university: 'Soonchunhyang Univ.' },
];

export const WEEKLY_XP = [
  { day: 'Mon', xp: 210 },
  { day: 'Tue', xp: 340 },
  { day: 'Wed', xp: 180 },
  { day: 'Thu', xp: 420 },
  { day: 'Fri', xp: 300 },
  { day: 'Sat', xp: 540 },
  { day: 'Sun', xp: 380 },
];

export const CATEGORY_MASTERY = [
  { label: 'Daily Life', value: 0.82 },
  { label: 'University', value: 0.64 },
  { label: 'Grammar', value: 0.71 },
  { label: 'Listening', value: 0.49 },
  { label: 'TOPIK', value: 0.38 },
];

/** 16 weeks × 7 days activity heatmap (0..4 intensity). */
export const HEATMAP: number[][] = Array.from({ length: 16 }, (_, w) =>
  Array.from({ length: 7 }, (_, d) => {
    const seed = (w * 7 + d) * 9301 + 49297;
    const r = ((seed % 233280) / 233280) * 4.2;
    return w > 13 && d > 4 ? 0 : Math.max(0, Math.floor(r));
  }),
);

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

export const LIVE_NOTIFICATIONS = [
  { icon: '🏆', title: 'Aiko just passed you!', body: 'You dropped to rank #4 on the weekly board.' },
  { icon: '🔥', title: 'Streak reminder', body: 'Study 5 more minutes to keep your 12-day streak.' },
  { icon: '✨', title: 'New lesson unlocked', body: '“The Group Project” is now available.' },
  { icon: '💎', title: 'Daily chest ready', body: 'Open your free chest for bonus coins.' },
  { icon: '📣', title: 'Event: TOPIK Month', body: 'Earn 2× XP on listening lessons this week.' },
];
