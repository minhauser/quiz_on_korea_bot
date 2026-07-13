'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Sparkles, Volume2, X } from 'lucide-react';
import * as React from 'react';

import { LESSONS } from '@/lib/mock-data';
import { Button } from '@/shared/ui/button';
import { Confetti } from '@/components/confetti';
import { cn } from '@/shared/lib/utils';
import { useGameStore } from '@/store/use-game-store';
import { useToastStore } from '@/store/use-toast-store';

type Stage = 'vocab' | 'quiz' | 'result';

export function LessonPlayer() {
  const activeLessonId = useGameStore((s) => s.activeLessonId);
  const setActiveLesson = useGameStore((s) => s.setActiveLesson);
  const completeLesson = useGameStore((s) => s.completeLesson);
  const toast = useToastStore((s) => s.toast);

  const lesson = LESSONS.find((l) => l.id === activeLessonId) ?? null;

  const [stage, setStage] = React.useState<Stage>('vocab');
  const [vocabIndex, setVocabIndex] = React.useState(0);
  const [quizIndex, setQuizIndex] = React.useState(0);
  const [selected, setSelected] = React.useState<number | null>(null);
  const [correct, setCorrect] = React.useState(0);
  const [combo, setCombo] = React.useState(0);

  React.useEffect(() => {
    if (activeLessonId) {
      setStage('vocab');
      setVocabIndex(0);
      setQuizIndex(0);
      setSelected(null);
      setCorrect(0);
      setCombo(0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeLessonId]);

  if (!lesson) return null;

  const totalSteps = lesson.vocab.length + lesson.quiz.length;
  const currentStep = stage === 'vocab' ? vocabIndex : lesson.vocab.length + quizIndex;
  const progress = (currentStep / totalSteps) * 100;
  const question = lesson.quiz[quizIndex];
  const accuracy = Math.round((correct / lesson.quiz.length) * 100);

  const close = () => setActiveLesson(null);

  const answer = (i: number) => {
    if (selected !== null || !question) return;
    setSelected(i);
    if (i === question.answerIndex) {
      setCorrect((c) => c + 1);
      setCombo((c) => c + 1);
    } else {
      setCombo(0);
    }
  };

  const nextQuestion = () => {
    if (quizIndex + 1 < lesson.quiz.length) {
      setQuizIndex((q) => q + 1);
      setSelected(null);
    } else {
      setStage('result');
    }
  };

  const finish = () => {
    completeLesson(lesson.id, accuracy);
    toast({ variant: 'xp', icon: '⚡', title: `+${lesson.xpReward} XP earned`, description: `${lesson.title} · ${accuracy}% accuracy` });
    close();
  };

  return (
    <AnimatePresence>
      {activeLessonId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex flex-col bg-background/95 backdrop-blur-xl"
        >
          {/* header */}
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
              {stage === 'vocab' && (
                <motion.div
                  key={`vocab-${vocabIndex}`}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.25 }}
                >
                  <p className="mb-3 text-center text-sm font-medium text-muted-foreground">
                    New word {vocabIndex + 1} of {lesson.vocab.length}
                  </p>
                  <div className="rounded-3xl border border-border bg-card p-5 text-center shadow-xl sm:p-8">
                    <div className="text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl">
                      {lesson.vocab[vocabIndex]?.word}
                    </div>
                    <p className="mt-2 text-lg text-muted-foreground">
                      {lesson.vocab[vocabIndex]?.romanization}
                    </p>
                    <div className="mx-auto my-5 h-px w-16 bg-border" />
                    <p className="text-2xl font-semibold text-gradient">
                      {lesson.vocab[vocabIndex]?.translation}
                    </p>
                    <button
                      onClick={() => toast({ icon: '🔊', title: 'Playing audio', description: lesson.vocab[vocabIndex]?.word })}
                      className="mx-auto mt-6 flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
                    >
                      <Volume2 className="size-4" /> Listen
                    </button>
                    <div className="mt-6 rounded-2xl bg-muted/50 p-4 text-left">
                      <p className="text-lg font-medium">{lesson.vocab[vocabIndex]?.example}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {lesson.vocab[vocabIndex]?.exampleTranslation}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-3">
                    <Button
                      variant="ghost"
                      onClick={() => setVocabIndex((i) => Math.max(0, i - 1))}
                      disabled={vocabIndex === 0}
                    >
                      <ArrowLeft className="size-4" /> Back
                    </Button>
                    {vocabIndex + 1 < lesson.vocab.length ? (
                      <Button variant="gradient" size="lg" onClick={() => setVocabIndex((i) => i + 1)}>
                        Next <ArrowRight className="size-4" />
                      </Button>
                    ) : (
                      <Button variant="gradient" size="lg" onClick={() => setStage('quiz')}>
                        Start quiz <Sparkles className="size-4" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ---------- QUIZ ---------- */}
              {stage === 'quiz' && question && (
                <motion.div
                  key={`quiz-${quizIndex}`}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.25 }}
                >
                  <p className="mb-3 text-center text-sm font-medium text-muted-foreground">
                    Question {quizIndex + 1} of {lesson.quiz.length}
                  </p>
                  <h2 className="mb-6 text-center text-2xl font-bold">{question.prompt}</h2>
                  <div className="grid gap-3">
                    {question.options.map((opt, i) => {
                      const isAnswer = i === question.answerIndex;
                      const isPicked = selected === i;
                      const reveal = selected !== null;
                      return (
                        <button
                          key={i}
                          onClick={() => answer(i)}
                          disabled={reveal}
                          className={cn(
                            'flex items-center justify-between rounded-2xl border-2 px-4 py-3 text-left text-sm font-medium transition-all sm:px-5 sm:py-4 sm:text-base',
                            !reveal && 'border-border bg-card hover:border-primary/60 hover:bg-accent',
                            reveal && isAnswer && 'border-success bg-success/15 text-success',
                            reveal && isPicked && !isAnswer && 'border-destructive bg-destructive/15 text-destructive',
                            reveal && !isAnswer && !isPicked && 'border-border opacity-50',
                          )}
                        >
                          {opt}
                          {reveal && isAnswer && <Check className="size-5" />}
                          {reveal && isPicked && !isAnswer && <X className="size-5" />}
                        </button>
                      );
                    })}
                  </div>

                  <AnimatePresence>
                    {selected !== null && (
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-5"
                      >
                        <div
                          className={cn(
                            'rounded-2xl p-4 text-sm',
                            selected === question.answerIndex
                              ? 'bg-success/10 text-success'
                              : 'bg-destructive/10 text-destructive',
                          )}
                        >
                          <p className="font-bold">
                            {selected === question.answerIndex ? 'Correct! 🎉' : 'Not quite.'}
                          </p>
                          <p className="mt-1 opacity-90">{question.explanation}</p>
                        </div>
                        <Button variant="gradient" size="lg" className="mt-4 w-full" onClick={nextQuestion}>
                          {quizIndex + 1 < lesson.quiz.length ? 'Next question' : 'See results'}
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
                    {accuracy === 100 ? '🏆' : accuracy >= 60 ? '🎉' : '💪'}
                  </motion.div>
                  <h2 className="mt-6 text-3xl font-black">Lesson complete!</h2>
                  <p className="mt-1 text-muted-foreground">{lesson.title}</p>

                  <div className="mx-auto mt-7 flex w-full justify-center gap-3 sm:max-w-sm">
                    <div className="flex-1 rounded-2xl border border-border bg-card p-4">
                      <p className="text-2xl font-black text-gradient">{accuracy}%</p>
                      <p className="text-xs text-muted-foreground">Accuracy</p>
                    </div>
                    <div className="flex-1 rounded-2xl border border-border bg-card p-4">
                      <p className="text-2xl font-black text-amber-400">+{lesson.xpReward}</p>
                      <p className="text-xs text-muted-foreground">XP</p>
                    </div>
                    <div className="flex-1 rounded-2xl border border-border bg-card p-4">
                      <p className="text-2xl font-black text-success">+{Math.round(lesson.xpReward / 3)}</p>
                      <p className="text-xs text-muted-foreground">Coins</p>
                    </div>
                  </div>

                  <Button variant="gradient" size="lg" className="mt-8 w-full max-w-sm" onClick={finish}>
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
