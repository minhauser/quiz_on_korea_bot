'use client';

import { AiTutor } from '@/components/ai-tutor';

export default function TutorPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-black tracking-tight">AI Tutor</h1>
        <p className="mt-1 text-muted-foreground">
          Your 24/7 Korean mentor — grammar, vocabulary, writing feedback and quizzes.
        </p>
      </div>
      <AiTutor />
    </div>
  );
}
