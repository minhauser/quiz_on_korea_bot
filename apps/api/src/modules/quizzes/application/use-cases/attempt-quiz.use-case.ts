import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { XpRewardService } from '../../../../shared/infrastructure/gameplay/xp-reward.service';

export interface QuizAnswerInput {
  questionId: string;
  optionId?: string;
  textAnswer?: string;
}

export interface AttemptQuizCommand {
  quizId: string;
  userId: string;
  answers: QuizAnswerInput[];
  durationSeconds: number;
}

@Injectable()
export class AttemptQuizUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly xpReward: XpRewardService,
  ) {}

  async execute(command: AttemptQuizCommand) {
    const quiz = await this.prisma.quizTemplate.findFirst({
      where: { id: command.quizId, deletedAt: null },
      include: { questions: { include: { options: true } } },
    });
    if (!quiz) {
      throw new NotFoundException('Quiz not found.');
    }

    const answerByQuestion = new Map(command.answers.map((a) => [a.questionId, a]));

    const results = quiz.questions.map((question) => {
      const answer = answerByQuestion.get(question.id);
      let correct = false;

      if (question.options.length > 0) {
        const selected = answer?.optionId
          ? question.options.find((o) => o.id === answer.optionId)
          : undefined;
        correct = selected?.isCorrect ?? false;
      } else if (question.correctAnswer) {
        correct = (answer?.textAnswer ?? '').trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
      }

      return {
        questionId: question.id,
        correct,
        xpReward: question.xpReward,
        correctOptionId: question.options.find((o) => o.isCorrect)?.id,
        explanation: question.explanation,
      };
    });

    const totalQuestions = quiz.questions.length || 1;
    const correctCount = results.filter((r) => r.correct).length;
    const accuracy = Math.round((correctCount / totalQuestions) * 100);
    const xpEarned = results.reduce((sum, r) => sum + (r.correct ? r.xpReward : 0), 0);
    const coinsEarned = Math.floor(xpEarned / 2);

    const attempt = await this.prisma.$transaction(async (tx) => {
      const created = await tx.quizAttempt.create({
        data: {
          userId: command.userId,
          quizId: command.quizId,
          score: accuracy,
          accuracy,
          duration: command.durationSeconds,
          xpEarned,
          completedAt: new Date(),
        },
      });

      if (xpEarned > 0) {
        await this.xpReward.award(tx, command.userId, {
          xp: xpEarned,
          coins: coinsEarned,
          quizzesCompleted: 1,
        });
      }

      return created;
    });

    return { attempt, accuracy, correctCount, totalQuestions, xpEarned, coinsEarned, results };
  }
}
