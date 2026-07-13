-- CreateEnum
CREATE TYPE "Role" AS ENUM ('GUEST', 'STUDENT', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('EMAIL', 'GOOGLE', 'APPLE', 'KAKAO', 'GUEST');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED');

-- CreateEnum
CREATE TYPE "Theme" AS ENUM ('LIGHT', 'DARK', 'SYSTEM');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "PartOfSpeech" AS ENUM ('NOUN', 'PRONOUN', 'NUMERAL', 'VERB', 'ADJECTIVE', 'DETERMINER', 'ADVERB', 'PARTICLE', 'INTERJECTION', 'CONJUNCTION', 'AFFIX', 'OTHER');

-- CreateEnum
CREATE TYPE "QuizType" AS ENUM ('MULTIPLE_CHOICE', 'TYPING', 'LISTENING', 'FLASHCARDS', 'TRANSLATION', 'MATCHING', 'CONVERSATION', 'IMAGE', 'AUDIO', 'BOSS');

-- CreateEnum
CREATE TYPE "RewardType" AS ENUM ('COINS', 'XP', 'AVATAR', 'THEME', 'TITLE', 'CHEST', 'BADGE');

-- CreateEnum
CREATE TYPE "Rarity" AS ENUM ('COMMON', 'RARE', 'EPIC', 'LEGENDARY');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('DAILY_REMINDER', 'MISSION_REMINDER', 'REVIEW_REMINDER', 'ACHIEVEMENT_UNLOCKED', 'NEW_LESSON', 'EVENT', 'FRIEND_ACTIVITY');

-- CreateEnum
CREATE TYPE "MissionPeriod" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'AUDIO', 'ILLUSTRATION', 'ICON', 'LESSON_ASSET', 'VIDEO');

-- CreateEnum
CREATE TYPE "InsightKind" AS ENUM ('WEAK', 'STRONG');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "provider" "AuthProvider" NOT NULL DEFAULT 'EMAIL',
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "avatar" TEXT,
    "country" TEXT,
    "native_language" TEXT NOT NULL,
    "learning_language" TEXT NOT NULL DEFAULT 'ko',
    "current_level" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "coins" INTEGER NOT NULL DEFAULT 0,
    "diamonds" INTEGER NOT NULL DEFAULT 0,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "longest_streak" INTEGER NOT NULL DEFAULT 0,
    "bio" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "theme" "Theme" NOT NULL DEFAULT 'SYSTEM',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "universities" (
    "id" TEXT NOT NULL,
    "name_ko" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "city" TEXT,
    "logo" TEXT,
    "description" TEXT,
    "ranking" INTEGER,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "universities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faculties" (
    "id" TEXT NOT NULL,
    "university_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "faculties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vocabulary_categories" (
    "id" TEXT NOT NULL,
    "parent_category" TEXT,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'BEGINNER',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "vocabulary_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lessons" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'BEGINNER',
    "estimated_time" INTEGER NOT NULL DEFAULT 0,
    "xp_reward" INTEGER NOT NULL DEFAULT 0,
    "unlock_level" INTEGER NOT NULL DEFAULT 1,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vocabulary" (
    "id" TEXT NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "romanization" TEXT,
    "translation" TEXT NOT NULL,
    "pronunciation" TEXT,
    "part_of_speech" "PartOfSpeech" NOT NULL DEFAULT 'OTHER',
    "difficulty" "Difficulty" NOT NULL DEFAULT 'BEGINNER',
    "frequency" INTEGER,
    "audio" TEXT,
    "image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "vocabulary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "example_sentences" (
    "id" TEXT NOT NULL,
    "word_id" TEXT NOT NULL,
    "sentence_ko" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "audio" TEXT,
    "grammar_note" TEXT,
    "context" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "example_sentences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grammar" (
    "id" TEXT NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "pattern" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'BEGINNER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "grammar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grammar_examples" (
    "id" TEXT NOT NULL,
    "grammar_id" TEXT NOT NULL,
    "sentence_ko" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "note" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grammar_examples_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dialogues" (
    "id" TEXT NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "scenario" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'BEGINNER',
    "audio" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "dialogues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dialogue_lines" (
    "id" TEXT NOT NULL,
    "dialogue_id" TEXT NOT NULL,
    "speaker" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "audio" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dialogue_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_templates" (
    "id" TEXT NOT NULL,
    "type" "QuizType" NOT NULL,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'BEGINNER',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "quiz_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_questions" (
    "id" TEXT NOT NULL,
    "quiz_id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "correct_answer" TEXT,
    "explanation" TEXT,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'BEGINNER',
    "xp_reward" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "answer_options" (
    "id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "answer_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "completion" INTEGER NOT NULL DEFAULT 0,
    "score" INTEGER,
    "review_due" TIMESTAMP(3),
    "mastery" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lesson_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vocabulary_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "word_id" TEXT NOT NULL,
    "times_seen" INTEGER NOT NULL DEFAULT 0,
    "times_correct" INTEGER NOT NULL DEFAULT 0,
    "times_wrong" INTEGER NOT NULL DEFAULT 0,
    "mastery_level" INTEGER NOT NULL DEFAULT 0,
    "last_review" TIMESTAMP(3),
    "next_review" TIMESTAMP(3),
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vocabulary_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_attempts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "quiz_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "accuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "xp_earned" INTEGER NOT NULL DEFAULT 0,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quiz_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "xp_reward" INTEGER NOT NULL DEFAULT 0,
    "condition" JSONB NOT NULL,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "achievement_id" TEXT NOT NULL,
    "earned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "missions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "goal" INTEGER NOT NULL,
    "reward_xp" INTEGER NOT NULL DEFAULT 0,
    "reward_coins" INTEGER NOT NULL DEFAULT 0,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'BEGINNER',
    "period" "MissionPeriod" NOT NULL DEFAULT 'DAILY',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "missions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_missions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "mission_id" TEXT NOT NULL,
    "assigned_on" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_missions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rewards" (
    "id" TEXT NOT NULL,
    "type" "RewardType" NOT NULL,
    "title" TEXT NOT NULL,
    "icon" TEXT,
    "rarity" "Rarity" NOT NULL DEFAULT 'COMMON',
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "rewards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "reward_id" TEXT NOT NULL,
    "equipped" BOOLEAN NOT NULL DEFAULT false,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "statistics" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "study_minutes" INTEGER NOT NULL DEFAULT 0,
    "words_learned" INTEGER NOT NULL DEFAULT 0,
    "words_mastered" INTEGER NOT NULL DEFAULT 0,
    "lessons_completed" INTEGER NOT NULL DEFAULT 0,
    "accuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_xp" INTEGER NOT NULL DEFAULT 0,
    "login_days" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_activity" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "xp_earned" INTEGER NOT NULL DEFAULT 0,
    "study_minutes" INTEGER NOT NULL DEFAULT 0,
    "lessons_completed" INTEGER NOT NULL DEFAULT 0,
    "quizzes_completed" INTEGER NOT NULL DEFAULT 0,
    "words_learned" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leaderboard" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "weekly_xp" INTEGER NOT NULL DEFAULT 0,
    "monthly_xp" INTEGER NOT NULL DEFAULT 0,
    "global_rank" INTEGER,
    "country_rank" INTEGER,
    "university_rank" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leaderboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_logs" (
    "id" TEXT NOT NULL,
    "admin_id" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT,
    "ip" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_library" (
    "id" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "url" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL DEFAULT 0,
    "alt" TEXT,
    "uploaded_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "media_library_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_learning_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "learning_speed" DOUBLE PRECISION,
    "preferred_time" TEXT,
    "motivation_score" DOUBLE PRECISION,
    "recommended_review" JSONB,
    "ai_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_learning_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_category_insights" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "kind" "InsightKind" NOT NULL,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_category_insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "family_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "replaced_by_token_id" TEXT,
    "user_agent" TEXT,
    "ip" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_provider_idx" ON "users"("provider");

-- CreateIndex
CREATE INDEX "users_deleted_at_idx" ON "users"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "user_profiles"("user_id");

-- CreateIndex
CREATE INDEX "user_profiles_nickname_idx" ON "user_profiles"("nickname");

-- CreateIndex
CREATE INDEX "user_profiles_current_level_idx" ON "user_profiles"("current_level");

-- CreateIndex
CREATE INDEX "universities_city_idx" ON "universities"("city");

-- CreateIndex
CREATE INDEX "universities_status_idx" ON "universities"("status");

-- CreateIndex
CREATE INDEX "universities_ranking_idx" ON "universities"("ranking");

-- CreateIndex
CREATE INDEX "universities_deleted_at_idx" ON "universities"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "universities_name_en_key" ON "universities"("name_en");

-- CreateIndex
CREATE INDEX "faculties_university_id_idx" ON "faculties"("university_id");

-- CreateIndex
CREATE UNIQUE INDEX "faculties_university_id_name_key" ON "faculties"("university_id", "name");

-- CreateIndex
CREATE INDEX "vocabulary_categories_parent_category_idx" ON "vocabulary_categories"("parent_category");

-- CreateIndex
CREATE INDEX "vocabulary_categories_status_idx" ON "vocabulary_categories"("status");

-- CreateIndex
CREATE INDEX "vocabulary_categories_sort_order_idx" ON "vocabulary_categories"("sort_order");

-- CreateIndex
CREATE INDEX "vocabulary_categories_deleted_at_idx" ON "vocabulary_categories"("deleted_at");

-- CreateIndex
CREATE INDEX "lessons_category_id_idx" ON "lessons"("category_id");

-- CreateIndex
CREATE INDEX "lessons_status_idx" ON "lessons"("status");

-- CreateIndex
CREATE INDEX "lessons_unlock_level_idx" ON "lessons"("unlock_level");

-- CreateIndex
CREATE INDEX "lessons_category_id_display_order_idx" ON "lessons"("category_id", "display_order");

-- CreateIndex
CREATE INDEX "lessons_deleted_at_idx" ON "lessons"("deleted_at");

-- CreateIndex
CREATE INDEX "vocabulary_lesson_id_idx" ON "vocabulary"("lesson_id");

-- CreateIndex
CREATE INDEX "vocabulary_word_idx" ON "vocabulary"("word");

-- CreateIndex
CREATE INDEX "vocabulary_part_of_speech_idx" ON "vocabulary"("part_of_speech");

-- CreateIndex
CREATE INDEX "vocabulary_difficulty_idx" ON "vocabulary"("difficulty");

-- CreateIndex
CREATE INDEX "vocabulary_frequency_idx" ON "vocabulary"("frequency");

-- CreateIndex
CREATE INDEX "vocabulary_deleted_at_idx" ON "vocabulary"("deleted_at");

-- CreateIndex
CREATE INDEX "example_sentences_word_id_idx" ON "example_sentences"("word_id");

-- CreateIndex
CREATE INDEX "grammar_lesson_id_idx" ON "grammar"("lesson_id");

-- CreateIndex
CREATE INDEX "grammar_difficulty_idx" ON "grammar"("difficulty");

-- CreateIndex
CREATE INDEX "grammar_deleted_at_idx" ON "grammar"("deleted_at");

-- CreateIndex
CREATE INDEX "grammar_examples_grammar_id_idx" ON "grammar_examples"("grammar_id");

-- CreateIndex
CREATE INDEX "dialogues_lesson_id_idx" ON "dialogues"("lesson_id");

-- CreateIndex
CREATE INDEX "dialogues_difficulty_idx" ON "dialogues"("difficulty");

-- CreateIndex
CREATE INDEX "dialogues_deleted_at_idx" ON "dialogues"("deleted_at");

-- CreateIndex
CREATE INDEX "dialogue_lines_dialogue_id_idx" ON "dialogue_lines"("dialogue_id");

-- CreateIndex
CREATE INDEX "dialogue_lines_dialogue_id_display_order_idx" ON "dialogue_lines"("dialogue_id", "display_order");

-- CreateIndex
CREATE INDEX "quiz_templates_type_idx" ON "quiz_templates"("type");

-- CreateIndex
CREATE INDEX "quiz_templates_difficulty_idx" ON "quiz_templates"("difficulty");

-- CreateIndex
CREATE INDEX "quiz_templates_deleted_at_idx" ON "quiz_templates"("deleted_at");

-- CreateIndex
CREATE INDEX "quiz_questions_quiz_id_idx" ON "quiz_questions"("quiz_id");

-- CreateIndex
CREATE INDEX "quiz_questions_difficulty_idx" ON "quiz_questions"("difficulty");

-- CreateIndex
CREATE INDEX "answer_options_question_id_idx" ON "answer_options"("question_id");

-- CreateIndex
CREATE INDEX "lesson_progress_user_id_idx" ON "lesson_progress"("user_id");

-- CreateIndex
CREATE INDEX "lesson_progress_lesson_id_idx" ON "lesson_progress"("lesson_id");

-- CreateIndex
CREATE INDEX "lesson_progress_review_due_idx" ON "lesson_progress"("review_due");

-- CreateIndex
CREATE INDEX "lesson_progress_completed_at_idx" ON "lesson_progress"("completed_at");

-- CreateIndex
CREATE UNIQUE INDEX "lesson_progress_user_id_lesson_id_key" ON "lesson_progress"("user_id", "lesson_id");

-- CreateIndex
CREATE INDEX "vocabulary_progress_user_id_idx" ON "vocabulary_progress"("user_id");

-- CreateIndex
CREATE INDEX "vocabulary_progress_word_id_idx" ON "vocabulary_progress"("word_id");

-- CreateIndex
CREATE INDEX "vocabulary_progress_next_review_idx" ON "vocabulary_progress"("next_review");

-- CreateIndex
CREATE INDEX "vocabulary_progress_user_id_favorite_idx" ON "vocabulary_progress"("user_id", "favorite");

-- CreateIndex
CREATE UNIQUE INDEX "vocabulary_progress_user_id_word_id_key" ON "vocabulary_progress"("user_id", "word_id");

-- CreateIndex
CREATE INDEX "quiz_attempts_user_id_idx" ON "quiz_attempts"("user_id");

-- CreateIndex
CREATE INDEX "quiz_attempts_quiz_id_idx" ON "quiz_attempts"("quiz_id");

-- CreateIndex
CREATE INDEX "quiz_attempts_user_id_completed_at_idx" ON "quiz_attempts"("user_id", "completed_at");

-- CreateIndex
CREATE UNIQUE INDEX "achievements_title_key" ON "achievements"("title");

-- CreateIndex
CREATE INDEX "achievements_hidden_idx" ON "achievements"("hidden");

-- CreateIndex
CREATE INDEX "achievements_deleted_at_idx" ON "achievements"("deleted_at");

-- CreateIndex
CREATE INDEX "user_achievements_user_id_idx" ON "user_achievements"("user_id");

-- CreateIndex
CREATE INDEX "user_achievements_achievement_id_idx" ON "user_achievements"("achievement_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievements_user_id_achievement_id_key" ON "user_achievements"("user_id", "achievement_id");

-- CreateIndex
CREATE INDEX "missions_period_idx" ON "missions"("period");

-- CreateIndex
CREATE INDEX "missions_difficulty_idx" ON "missions"("difficulty");

-- CreateIndex
CREATE INDEX "missions_deleted_at_idx" ON "missions"("deleted_at");

-- CreateIndex
CREATE INDEX "user_missions_user_id_idx" ON "user_missions"("user_id");

-- CreateIndex
CREATE INDEX "user_missions_completed_idx" ON "user_missions"("completed");

-- CreateIndex
CREATE INDEX "user_missions_user_id_assigned_on_idx" ON "user_missions"("user_id", "assigned_on");

-- CreateIndex
CREATE UNIQUE INDEX "user_missions_user_id_mission_id_assigned_on_key" ON "user_missions"("user_id", "mission_id", "assigned_on");

-- CreateIndex
CREATE INDEX "rewards_type_idx" ON "rewards"("type");

-- CreateIndex
CREATE INDEX "rewards_rarity_idx" ON "rewards"("rarity");

-- CreateIndex
CREATE INDEX "rewards_deleted_at_idx" ON "rewards"("deleted_at");

-- CreateIndex
CREATE INDEX "inventory_user_id_idx" ON "inventory"("user_id");

-- CreateIndex
CREATE INDEX "inventory_reward_id_idx" ON "inventory"("reward_id");

-- CreateIndex
CREATE INDEX "inventory_user_id_equipped_idx" ON "inventory"("user_id", "equipped");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_user_id_reward_id_key" ON "inventory"("user_id", "reward_id");

-- CreateIndex
CREATE UNIQUE INDEX "statistics_user_id_key" ON "statistics"("user_id");

-- CreateIndex
CREATE INDEX "daily_activity_user_id_date_idx" ON "daily_activity"("user_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_activity_user_id_date_key" ON "daily_activity"("user_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "leaderboard_user_id_key" ON "leaderboard"("user_id");

-- CreateIndex
CREATE INDEX "leaderboard_weekly_xp_idx" ON "leaderboard"("weekly_xp");

-- CreateIndex
CREATE INDEX "leaderboard_monthly_xp_idx" ON "leaderboard"("monthly_xp");

-- CreateIndex
CREATE INDEX "leaderboard_global_rank_idx" ON "leaderboard"("global_rank");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_read_idx" ON "notifications"("user_id", "read");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

-- CreateIndex
CREATE INDEX "admin_logs_admin_id_idx" ON "admin_logs"("admin_id");

-- CreateIndex
CREATE INDEX "admin_logs_entity_entity_id_idx" ON "admin_logs"("entity", "entity_id");

-- CreateIndex
CREATE INDEX "admin_logs_created_at_idx" ON "admin_logs"("created_at");

-- CreateIndex
CREATE INDEX "media_library_type_idx" ON "media_library"("type");

-- CreateIndex
CREATE INDEX "media_library_uploaded_by_id_idx" ON "media_library"("uploaded_by_id");

-- CreateIndex
CREATE INDEX "media_library_deleted_at_idx" ON "media_library"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "ai_learning_profiles_user_id_key" ON "ai_learning_profiles"("user_id");

-- CreateIndex
CREATE INDEX "ai_category_insights_profile_id_idx" ON "ai_category_insights"("profile_id");

-- CreateIndex
CREATE INDEX "ai_category_insights_category_id_idx" ON "ai_category_insights"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "ai_category_insights_profile_id_category_id_kind_key" ON "ai_category_insights"("profile_id", "category_id", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_family_id_idx" ON "refresh_tokens"("family_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_expires_at_idx" ON "refresh_tokens"("expires_at");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculties" ADD CONSTRAINT "faculties_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocabulary_categories" ADD CONSTRAINT "vocabulary_categories_parent_category_fkey" FOREIGN KEY ("parent_category") REFERENCES "vocabulary_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "vocabulary_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocabulary" ADD CONSTRAINT "vocabulary_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "example_sentences" ADD CONSTRAINT "example_sentences_word_id_fkey" FOREIGN KEY ("word_id") REFERENCES "vocabulary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grammar" ADD CONSTRAINT "grammar_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grammar_examples" ADD CONSTRAINT "grammar_examples_grammar_id_fkey" FOREIGN KEY ("grammar_id") REFERENCES "grammar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dialogues" ADD CONSTRAINT "dialogues_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dialogue_lines" ADD CONSTRAINT "dialogue_lines_dialogue_id_fkey" FOREIGN KEY ("dialogue_id") REFERENCES "dialogues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quiz_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer_options" ADD CONSTRAINT "answer_options_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "quiz_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocabulary_progress" ADD CONSTRAINT "vocabulary_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocabulary_progress" ADD CONSTRAINT "vocabulary_progress_word_id_fkey" FOREIGN KEY ("word_id") REFERENCES "vocabulary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quiz_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_missions" ADD CONSTRAINT "user_missions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_missions" ADD CONSTRAINT "user_missions_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "missions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_reward_id_fkey" FOREIGN KEY ("reward_id") REFERENCES "rewards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "statistics" ADD CONSTRAINT "statistics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_activity" ADD CONSTRAINT "daily_activity_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaderboard" ADD CONSTRAINT "leaderboard_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_logs" ADD CONSTRAINT "admin_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_library" ADD CONSTRAINT "media_library_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_learning_profiles" ADD CONSTRAINT "ai_learning_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_category_insights" ADD CONSTRAINT "ai_category_insights_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "ai_learning_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_category_insights" ADD CONSTRAINT "ai_category_insights_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "vocabulary_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
