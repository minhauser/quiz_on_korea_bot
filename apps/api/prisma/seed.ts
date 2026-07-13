import {
  ContentStatus,
  Difficulty,
  MissionPeriod,
  PartOfSpeech,
  PrismaClient,
  QuizType,
  Rarity,
  RewardType,
} from '@prisma/client';

const prisma = new PrismaClient();

const DIFFICULTY_MAP: Record<string, Difficulty> = {
  Beginner: Difficulty.BEGINNER,
  Intermediate: Difficulty.INTERMEDIATE,
  Advanced: Difficulty.ADVANCED,
};

interface VocabSeed {
  word: string;
  romanization: string;
  translation: string;
  example: string;
  exampleTranslation: string;
}

interface QuizQuestionSeed {
  id: string;
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

interface LessonSeed {
  id: string;
  order: number;
  title: string;
  scenario: string;
  world: string;
  chapter: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  xpReward: number;
  vocab: VocabSeed[];
  quiz: QuizQuestionSeed[];
}

// Mirrors apps/web/src/lib/mock-data.ts LESSONS — kept in sync manually until
// the admin content API (Phase 4) replaces this as the source of truth.
const LESSONS: LessonSeed[] = [
  {
    id: 'arrival-airport',
    order: 1,
    title: 'At the Airport',
    scenario: 'Arrival in Korea',
    world: 'Arrival in Korea',
    chapter: 'Chapter 1 · First Steps',
    difficulty: 'Beginner',
    xpReward: 60,
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
    difficulty: 'Beginner',
    xpReward: 70,
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
    difficulty: 'Beginner',
    xpReward: 80,
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
    difficulty: 'Intermediate',
    xpReward: 110,
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
    difficulty: 'Intermediate',
    xpReward: 120,
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
    difficulty: 'Advanced',
    xpReward: 160,
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

const DAILY_MISSIONS = [
  { id: 'm1', title: 'Learn 15 new words', goal: 15, reward: 100 },
  { id: 'm2', title: 'Complete 1 lesson', goal: 1, reward: 80 },
  { id: 'm3', title: 'Score 90%+ on a quiz', goal: 1, reward: 120 },
  { id: 'm4', title: 'Keep your streak alive', goal: 1, reward: 50 },
];

const ACHIEVEMENTS = [
  { title: 'First Steps', description: 'Complete your first lesson', icon: '🌱', rarity: Rarity.COMMON, xpReward: 30, condition: { type: 'lessons_completed', value: 1 } },
  { title: 'Student Visa', description: 'Finish the Arrival world', icon: '🛂', rarity: Rarity.RARE, xpReward: 80, condition: { type: 'world_completed', world: 'Arrival in Korea' } },
  { title: 'Bookworm', description: 'Master 100 vocabulary words', icon: '🐛', rarity: Rarity.RARE, xpReward: 100, condition: { type: 'words_mastered', value: 100 } },
  { title: 'Perfectionist', description: 'Score 100% on 5 quizzes', icon: '💎', rarity: Rarity.EPIC, xpReward: 150, condition: { type: 'perfect_quizzes', value: 5 } },
  { title: 'On Fire', description: 'Reach a 7-day streak', icon: '🔥', rarity: Rarity.EPIC, xpReward: 150, condition: { type: 'streak', value: 7 } },
  { title: 'Campus Legend', description: 'Reach the top of the leaderboard', icon: '👑', rarity: Rarity.LEGENDARY, xpReward: 300, condition: { type: 'leaderboard_rank', value: 1 } },
];

const REWARDS = [
  { type: RewardType.THEME, title: 'Midnight Theme', icon: '🌙', rarity: Rarity.RARE, description: 'Unlock the dark midnight color theme.' },
  { type: RewardType.AVATAR, title: 'Fox Avatar', icon: '🦊', rarity: Rarity.COMMON, description: 'A friendly fox avatar.' },
  { type: RewardType.TITLE, title: 'Wordsmith', icon: '📖', rarity: Rarity.RARE, description: 'Display the "Wordsmith" title on your profile.' },
  { type: RewardType.CHEST, title: 'Daily Chest', icon: '🎁', rarity: Rarity.COMMON, description: 'A chest of bonus coins, opened once per day.' },
  { type: RewardType.BADGE, title: 'TOPIK Ready', icon: '🏅', rarity: Rarity.EPIC, description: 'Badge for completing TOPIK prep content.' },
];

async function clearContent() {
  // Cascades take care of children (vocabulary, quiz questions/options, dialogue
  // lines, grammar examples) — only top-level content rows need deleting here.
  await prisma.lesson.deleteMany();
  await prisma.vocabularyCategory.deleteMany();
  await prisma.mission.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.reward.deleteMany();
  await prisma.faculty.deleteMany();
  await prisma.university.deleteMany();
}

async function seedUniversity() {
  const university = await prisma.university.create({
    data: {
      nameKo: '순천향대학교',
      nameEn: 'Soonchunhyang University',
      city: 'Asan',
      status: ContentStatus.PUBLISHED,
      faculties: {
        create: [{ name: 'IoT Engineering' }, { name: 'Information Security' }],
      },
    },
  });
  return university;
}

async function seedCategoriesAndLessons() {
  const worldOrder = new Map<string, number>();
  const chapterByKey = new Map<string, string>(); // `${world}::${chapter}` -> category id

  for (const lesson of LESSONS) {
    const worldKey = lesson.world;
    if (!worldOrder.has(worldKey)) worldOrder.set(worldKey, worldOrder.size);

    const chapterKey = `${lesson.world}::${lesson.chapter}`;
    if (!chapterByKey.has(chapterKey)) {
      const worldCategory = await prisma.vocabularyCategory.upsert({
        where: { id: `world-${slug(worldKey)}` },
        update: {},
        create: {
          id: `world-${slug(worldKey)}`,
          name: worldKey,
          difficulty: DIFFICULTY_MAP[lesson.difficulty],
          sortOrder: worldOrder.get(worldKey)!,
          status: ContentStatus.PUBLISHED,
        },
      });
      const chapterCategory = await prisma.vocabularyCategory.create({
        data: {
          name: lesson.chapter,
          parentCategoryId: worldCategory.id,
          difficulty: DIFFICULTY_MAP[lesson.difficulty],
          sortOrder: chapterByKey.size,
          status: ContentStatus.PUBLISHED,
        },
      });
      chapterByKey.set(chapterKey, chapterCategory.id);
    }

    const categoryId = chapterByKey.get(chapterKey)!;
    const difficulty = DIFFICULTY_MAP[lesson.difficulty];

    await prisma.lesson.create({
      data: {
        id: lesson.id,
        categoryId,
        title: lesson.title,
        description: lesson.scenario,
        difficulty,
        estimatedTime: 10,
        xpReward: lesson.xpReward,
        unlockLevel: Math.max(1, lesson.order - 1),
        order: lesson.order,
        status: ContentStatus.PUBLISHED,
        vocabulary: {
          create: lesson.vocab.map((v) => ({
            word: v.word,
            romanization: v.romanization,
            translation: v.translation,
            partOfSpeech: PartOfSpeech.OTHER,
            difficulty,
            exampleSentences: {
              create: [{ sentenceKo: v.example, translation: v.exampleTranslation }],
            },
          })),
        },
        quizzes: {
          create: [
            {
              type: QuizType.MULTIPLE_CHOICE,
              difficulty,
              title: `${lesson.title} Quiz`,
              questions: {
                create: lesson.quiz.map((q) => ({
                  question: q.prompt,
                  explanation: q.explanation,
                  difficulty,
                  xpReward: 10,
                  options: {
                    create: q.options.map((text, i) => ({
                      text,
                      isCorrect: i === q.answerIndex,
                      order: i,
                    })),
                  },
                })),
              },
            },
          ],
        },
      },
    });
  }
}

async function seedMissions() {
  await prisma.mission.createMany({
    data: DAILY_MISSIONS.map((m) => ({
      title: m.title,
      goal: m.goal,
      rewardXp: m.reward,
      rewardCoins: 0,
      period: MissionPeriod.DAILY,
    })),
  });
}

async function seedAchievements() {
  await prisma.achievement.createMany({
    data: ACHIEVEMENTS.map((a) => ({
      title: a.title,
      description: a.description,
      icon: a.icon,
      xpReward: a.xpReward,
      condition: a.condition,
      hidden: false,
    })),
  });
}

async function seedRewards() {
  await prisma.reward.createMany({
    data: REWARDS.map((r) => ({
      type: r.type,
      title: r.title,
      icon: r.icon,
      rarity: r.rarity,
      description: r.description,
    })),
  });
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function main() {
  console.log('Clearing existing content...');
  await clearContent();

  console.log('Seeding university/faculties...');
  await seedUniversity();

  console.log('Seeding categories, lessons, vocabulary, quizzes...');
  await seedCategoriesAndLessons();

  console.log('Seeding missions...');
  await seedMissions();

  console.log('Seeding achievements...');
  await seedAchievements();

  console.log('Seeding reward catalog...');
  await seedRewards();

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
