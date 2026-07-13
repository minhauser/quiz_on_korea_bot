'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Send, Sparkles } from 'lucide-react';
import * as React from 'react';

import { AI_SUGGESTIONS, aiReply } from '@/lib/mock-data';
import { Button } from '@/shared/ui/button';
import { cn, uid } from '@/shared/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

function renderRich(text: string): React.ReactNode {
  return text.split('\n').map((line, li) => (
    <span key={li} className="block min-h-[1.2em]">
      {line.split('**').map((chunk, ci) =>
        ci % 2 === 1 ? <strong key={ci}>{chunk}</strong> : <React.Fragment key={ci}>{chunk}</React.Fragment>,
      )}
    </span>
  ));
}

export function AiTutor() {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: 'greeting',
      role: 'assistant',
      content:
        '안녕하세요! 👋 I’m your AI Korean tutor. Ask me about grammar, vocabulary, or campus situations — or tap a suggestion below to get started.',
    },
  ]);
  const [input, setInput] = React.useState('');
  const [typing, setTyping] = React.useState(false);
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([]);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  React.useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;
    const reply = aiReply(trimmed);
    const assistantId = uid('m');

    setMessages((prev) => [
      ...prev,
      { id: uid('m'), role: 'user', content: trimmed },
      { id: assistantId, role: 'assistant', content: '' },
    ]);
    setInput('');
    setTyping(true);

    const words = reply.split(' ');
    const start = setTimeout(() => {
      let i = 0;
      const tick = () => {
        i += 1;
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: words.slice(0, i).join(' ') } : m)),
        );
        if (i < words.length) {
          timers.current.push(setTimeout(tick, 28));
        } else {
          setTyping(false);
        }
      };
      tick();
    }, 600);
    timers.current.push(start);
  };

  return (
    <div className="flex h-[calc(100dvh-12rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card sm:h-[calc(100dvh-13rem)] lg:h-[calc(100dvh-11rem)]">
      <div className="flex items-center gap-3 border-b border-border px-5 py-3.5">
        <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-lg shadow-lg shadow-primary/30">
          ✨
        </span>
        <div>
          <p className="text-sm font-bold">AI Tutor</p>
          <p className="flex items-center gap-1.5 text-xs text-success">
            <span className="size-1.5 rounded-full bg-success" /> Online · powered by KoreaQuest AI
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn('flex gap-3', m.role === 'user' && 'flex-row-reverse')}
            >
              <span
                className={cn(
                  'grid size-8 shrink-0 place-items-center rounded-full text-sm',
                  m.role === 'user'
                    ? 'bg-gradient-to-br from-primary/30 to-secondary/30'
                    : 'bg-gradient-to-br from-primary to-secondary',
                )}
              >
                {m.role === 'user' ? '🚀' : '✨'}
              </span>
              <div
                className={cn(
                  'max-w-[88%] rounded-2xl px-3 py-2.5 text-sm leading-relaxed sm:max-w-[78%] sm:px-4',
                  m.role === 'user'
                    ? 'rounded-tr-sm bg-primary text-primary-foreground'
                    : 'rounded-tl-sm bg-muted',
                )}
              >
                {m.content ? (
                  renderRich(m.content)
                ) : typing ? (
                  <span className="flex gap-1 py-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="size-1.5 rounded-full bg-muted-foreground"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </span>
                ) : null}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-border p-3">
        <div className="mb-2 flex flex-wrap gap-2">
          {AI_SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2"
        >
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-background px-3">
            <Sparkles className="size-4 text-muted-foreground" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your AI tutor anything…"
              className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <Button type="submit" variant="gradient" size="icon" disabled={!input.trim() || typing}>
            <Send className="size-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
