'use client';

import { motion } from 'framer-motion';
import { Code2, GraduationCap, Palette } from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';

const DEVELOPERS = [
  {
    name: '순나툴러',
    nameKo: '대포님',
    role: 'Developer',
    roleIcon: Code2,
    university: '순천향대학교',
    department: '사물인터넷학과',
    departmentEn: 'IoT Engineering',
    emoji: '🧑‍💻',
    gradient: 'from-primary to-secondary',
  },
  {
    name: '이혜원',
    nameKo: '이혜원',
    role: 'Developer & Designer',
    roleIcon: Palette,
    university: '순천향대학교',
    department: '정보보호학과',
    departmentEn: 'Information Security',
    emoji: '👩‍💻',
    gradient: 'from-fuchsia-500 to-pink-500',
  },
] as const;

export default function DevelopersPage() {
  const [imgError, setImgError] = React.useState(false);

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Developers</h1>
        <p className="mt-1 text-muted-foreground">
          The team behind KoreaQuest — built at Soonchunhyang University.
        </p>
      </motion.div>

      {/* Team photo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
      >
        {!imgError ? (
          <div className="relative aspect-[16/9] w-full sm:aspect-[21/9]">
            <Image
              src="/images/team.jpg"
              alt="KoreaQuest development team"
              fill
              className="object-cover object-top"
              onError={() => setImgError(true)}
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-5 text-sm font-semibold text-white drop-shadow">
              📍 X Station · Soonchunhyang University
            </div>
          </div>
        ) : (
          <div className="flex aspect-[16/9] w-full items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 sm:aspect-[21/9]">
            <span className="text-6xl">👥</span>
          </div>
        )}
      </motion.div>

      {/* Developer cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {DEVELOPERS.map((dev, i) => (
          <motion.div
            key={dev.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 + i * 0.08 }}
            className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm"
          >
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br opacity-10" />

            <div className="flex items-start gap-4">
              <span
                className={`grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-3xl shadow-lg ${dev.gradient}`}
              >
                {dev.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-black">{dev.name}</h2>
                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <dev.roleIcon className="size-3.5 shrink-0" />
                  <span className="font-semibold text-foreground">{dev.role}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-2.5">
              <div className="flex items-center gap-2.5 rounded-xl bg-muted/50 px-3.5 py-2.5">
                <GraduationCap className="size-4 shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">University</p>
                  <p className="text-sm font-semibold">{dev.university}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl bg-muted/50 px-3.5 py-2.5">
                <dev.roleIcon className="size-4 shrink-0 text-secondary" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Department</p>
                  <p className="text-sm font-semibold">{dev.department}</p>
                  <p className="text-xs text-muted-foreground">{dev.departmentEn}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 to-secondary/10 p-5 text-center text-sm text-muted-foreground"
      >
        Built with ❤️ at <span className="font-semibold text-foreground">순천향대학교</span> ·{' '}
        <span className="text-gradient font-bold">KoreaQuest 2025</span>
      </motion.div>
    </div>
  );
}
