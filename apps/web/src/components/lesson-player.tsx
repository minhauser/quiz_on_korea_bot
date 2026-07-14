'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Sparkles, Volume2, X } from 'lucide-react';
import * as React from 'react';

import { Confetti } from '@/components/confetti';
import { useCompleteLesson, useLesson, useStartLesson } from '@/shared/api/hooks/use-lessons';
import { useAttemptQuiz, useLessonQuizzes, type QuizAnswerInput } from '@/shared/api/hooks/use-quizzes';
import { useReviewVocabulary } from '@/shared/api/hooks/use-vocabulary';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';
import { useLessonPlayerStore } from '@/store/use-lesson-player-store';
import { useToastStore } from '@/store/use-toast-store';

type Stage = 'vocab' | 'quiz' | 'result';

export function LessonPlayer() {
  const activeLessonId = useLessonPlayerStore((s) => s.activeLessonId);
  const setActiveLesson = useLessonPlayerStore((s) => s.setActiveLesson);
  const toast = useToastStore((s) => s.toast);

  const { data: lesson } = useLesson(activeLessonId);
  const { data: quizzes } = useLessonQuizzes(activeLessonId);
  const startLesson = useStartLesson();
  const reviewVocabulary = useReviewVocabulary();
  const attemptQuiz = useAttemptQuiz();
  const completeLesson = useCompleteLesson();

  const [stage, setStage] = React.useState<Stage>('vocab');
  const [vocabIndex, setVocabIndex] = React.useState(0);
  const [quizIndex, setQuizIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [selectedOptionId, setSelectedOptionId] = React.useState<string | null>(null);
  const [combo, setCombo] = React.useState(0);
  const [quizStartedAt, setQuizStartedAt] = React.useState<number>(0);
  const [attemptResult, setAttemptResult] = React.useState<{
    accuracy: number;
    xpEarned: number;
    coinsEarned: number;
  } | null>(null);
  const [lessonReward, setLessonReward] = React.useState<{ xpAwarded: number; coinsAwarded: number } | null>(null);

  const quiz = quizzes?.[0] ?? null;

  React.useEffect(() => {
    if (activeLessonId) {
      setStage('vocab');
      setVocabIndex(0);
      setQuizIndex(0);
      setAnswers({});
      setSelectedOptionId(null);
      setCombo(0);
      setAttemptResult(null);
      setLessonReward(null);
      document.body.style.overflow = 'hidden';
      startLesson.mutate(activeLessonId);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLessonId]);

  if (!activeLessonId || !lesson) return null;

  const vocab = lesson.vocabulary;
  const totalSteps = vocab.length + (quiz?.questions.length ?? 0);
  const currentStep = stage === 'vocab' ? vocabIndex : vocab.length + quizIndex;
  const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  const close = () => setActiveLesson(null);

  const currentWord = vocab[vocabIndex];

  const nextVocab = () => {
    if (currentWord) {
      reviewVocabulary.mutate({ wordId: currentWord.id, correct: true });
    }
    if (vocabIndex + 1 < vocab.length) {
      setVocabIndex((i) => i + 1);
    } else if (quiz && quiz.questions.length > 0) {
      setQuizStartedAt(Date.now());
      setStage('quiz');
    } else {
      finishLesson(0);
    }
  };

  const selectOption = (questionId: string, optionId: string, isCorrect: boolean) => {
    if (selectedOptionId !== null) return; // already answered this question
    setSelectedOptionId(optionId);
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    setCombo((c) => (isCorrect ? c + 1 : 0));
  };

  const nextQuestion = () => {
    if (!quiz) return;
    setSelectedOptionId(null);
    if (quizIndex + 1 < quiz.questions.length) {
      setQuizIndex((i) => i + 1);
    } else {
      submitQuiz();
    }
  };

  const submitQuiz = async () => {
    if (!quiz) return;
    const durationSeconds = Math.max(1, Math.round((Date.now() - quizStartedAt) / 1000));
    const answerList: QuizAnswerInput[] = quiz.questions.map((q) => ({
      questionId: q.id,
      optionId: answers[q.id],
    }));

    const result = await attemptQuiz.mutateAsync({ quizId: quiz.id, answers: answerList, durationSeconds });
    setAttemptResult(result);
    finishLesson(result.accuracy);
  };

  const finishLesson = async (accuracy: number) => {
    const result = await completeLesson.mutateAsync({ lessonId: lesson.id, score: Math.round(accuracy) });
    setLessonReward({ xpAwarded: result.xpAwarded, coinsAwarded: result.coinsAwarded });

    for (const achievement of result.unlockedAchievements) {
      toast({ variant: 'success', icon: achievement.icon ?? '🏆', title: 'Achievement unlocked!', description: achievement.title });
    }
    for (const mission of result.completedMissions) {
      toast({ variant: 'success', icon: '🎯', title: 'Mission complete!', description: mission.title });
    }

    setStage('result');
  };

  const totalXp = (lessonReward?.xpAwarded ?? 0) + (attemptResult?.xpEarned ?? 0);
  const totalCoins = (lessonReward?.coinsAwarded ?? 0) + (attemptResult?.coinsEarned ?? 0);

  return (
    <AnimatePresence>
      {activeLessonId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex flex-col bg-background/95 backdrop-blur-xl"
        >
          <div className="flex items-center gap-4 px-4 py-4 sm:px-8">
            <button onClick={close} className="grid size-10 place-items-center rounded-full hover:bg-accent">
              <X className="size-5" />
            </button>
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                animate={{ width: `${stage === 'result' ? 100 : progress}%` }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              />
            </div>
            <AnimatePresence>
              {combo >= 2 && stage === 'quiz' && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="flex items-center gap-1 rounded-full bg-warning/15 px-3 py-1 text-sm font-bold text-warning"
                >
                  🔥 {combo} combo
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative flex flex-1 flex-col overflow-y-auto px-4 pb-16 sm:px-8 sm:pb-10">
            <div className="m-auto w-full max-w-2xl py-4">
              <AnimatePresence mode="wait">
                {/* ---------- VOCAB ---------- */}
                {stage === 'vocab' && currentWord && (
                  <motion.div
                    key={`vocab-${vocabIndex}`}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.25 }}
                  >
                    <p className="mb-3 text-center text-sm font-medium text-muted-foreground">
                      New word {vocabIndex + 1} of {vocab.length}
                    </p>
                    <div className="rounded-3xl border border-border bg-card p-5 text-center shadow-xl sm:p-8">
                      <div className="text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl">{currentWord.word}</div>
                      <p className="mt-2 text-lg text-muted-foreground">{currentWord.romanization}</p>
                      <div className="mx-auto my-5 h-px w-16 bg-border" />
                      <p className="text-2xl font-semibold text-gradient">{currentWord.translation}</p>
                      <button
                        onClick={() => useToastStore.getState().toast({ icon: '🔊', title: 'Playing audio', description: currentWord.word })}
                        className="mx-auto mt-6 flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
                      >
                        <Volume2 className="size-4" /> Listen
                      </button>
                      {currentWord.exampleSentences[0] && (
                        <div className="mt-6 rounded-2xl bg-muted/50 p-4 text-left">
                          <p className="text-lg font-medium">{currentWord.exampleSentences[0].sentenceKo}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{currentWord.exampleSentences[0].translation}</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex items-center justify-between gap-3">
                      <Button
                        variant="ghost"
                        onClick={() => setVocabIndex((i) => Math.max(0, i - 1))}
                        disabled={vocabIndex === 0}
                      >
                        <ArrowLeft className="size-4" /> Back
                      </Button>
                      <Button variant="gradient" size="lg" onClick={nextVocab}>
                        {vocabIndex + 1 < vocab.length ? (
                          <>
                            Next <ArrowRight className="size-4" />
                          </>
                        ) : (
                          <>
                            {quiz && quiz.questions.length > 0 ? 'Start quiz' : 'Finish'} <Sparkles className="size-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* ---------- QUIZ (instant reveal per question) ---------- */}
                {stage === 'quiz' && quiz && quiz.questions[quizIndex] && (
                  <motion.div
                    key={`quiz-${quizIndex}`}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.25 }}
                  >
                    <p className="mb-3 text-center text-sm font-medium text-muted-foreground">
                      Question {quizIndex + 1} of {quiz.questions.length}
                    </p>
                    <h2 className="mb-6 text-center text-2xl font-bold">{quiz.questions[quizIndex].question}</h2>
                    <div className="grid gap-3">
                      {quiz.questions[quizIndex].options.map((opt) => {
                        const reveal = selectedOptionId !== null;
                        const isPicked = selectedOptionId === opt.id;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => selectOption(quiz.questions[quizIndex]!.id, opt.id, opt.isCorrect)}
                            disabled={reveal}
                            className={cn(
                              'flex items-center justify-between rounded-2xl border-2 px-4 py-3 text-left text-sm font-medium transition-all sm:px-5 sm:py-4 sm:text-base',
                              !reveal && 'border-border bg-card hover:border-primary/60 hover:bg-accent',
                              reveal && opt.isCorrect && 'border-success bg-success/15 text-success',
                              reveal && isPicked && !opt.isCorrect && 'border-destructive bg-destructive/15 text-destructive',
                              reveal && !opt.isCorrect && !isPicked && 'border-border opacity-50',
                            )}
                          >
                            {opt.text}
                            {reveal && opt.isCorrect && <Check className="size-5" />}
                            {reveal && isPicked && !opt.isCorrect && <X className="size-5" />}
                          </button>
                        );
                      })}
                    </div>

                    <AnimatePresence>
                      {selectedOptionId !== null && (
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
                          {(() => {
                            const isSelectedCorrect =
                              quiz.questions[quizIndex]!.options.find((o) => o.id === selectedOptionId)?.isCorrect ?? false;
                            const explanation = quiz.questions[quizIndex]!.explanation;
                            if (!explanation) return null;
                            return (
                              <div
                                className={cn(
                                  'rounded-2xl p-4 text-sm',
                                  isSelectedCorrect ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive',
                                )}
                              >
                                <p className="font-bold">{isSelectedCorrect ? 'Correct! 🎉' : 'Not quite.'}</p>
                                <p className="mt-1 opacity-90">{explanation}</p>
                              </div>
                            );
                          })()}
                          <Button
                            variant="gradient"
                            size="lg"
                            className="mt-4 w-full"
                            disabled={attemptQuiz.isPending || completeLesson.isPending}
                            onClick={nextQuestion}
                          >
                            {quizIndex + 1 < quiz.questions.length
                              ? 'Next question'
                              : attemptQuiz.isPending || completeLesson.isPending
                                ? 'Submitting…'
                                : 'See results'}
                            <ArrowRight className="size-4" />
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                {/* ---------- RESULT ---------- */}
                {stage === 'result' && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                    className="relative text-center"
                  >
                    <Confetti />
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1, rotate: [0, -8, 8, 0] }}
                      transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                      className="mx-auto grid size-24 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-5xl shadow-2xl shadow-primary/40"
                    >
                      {(attemptResult?.accuracy ?? 100) === 100 ? '🏆' : (attemptResult?.accuracy ?? 100) >= 60 ? '🎉' : '💪'}
                    </motion.div>
                    <h2 className="mt-6 text-3xl font-black">Lesson complete!</h2>
                    <p className="mt-1 text-muted-foreground">{lesson.title}</p>

                    <div className="mx-auto mt-7 flex w-full justify-center gap-3 sm:max-w-sm">
                      <div className="flex-1 rounded-2xl border border-border bg-card p-4">
                        <p className="text-2xl font-black text-gradient">{attemptResult?.accuracy ?? 100}%</p>
                        <p className="text-xs text-muted-foreground">Accuracy</p>
                      </div>
                      <div className="flex-1 rounded-2xl border border-border bg-card p-4">
                        <p className="text-2xl font-black text-amber-400">+{totalXp}</p>
                        <p className="text-xs text-muted-foreground">XP</p>
                      </div>
                      <div className="flex-1 rounded-2xl border border-border bg-card p-4">
                        <p className="text-2xl font-black text-success">+{totalCoins}</p>
                        <p className="text-xs text-muted-foreground">Coins</p>
                      </div>
                    </div>

                    <Button variant="gradient" size="lg" className="mt-8 w-full max-w-sm" onClick={close}>
                      Claim &amp; continue <Sparkles className="size-4" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
