export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-primary to-secondary text-2xl font-black text-white shadow-2xl shadow-primary/40">
            한
          </div>
          <h1 className="text-xl font-black tracking-tight">pAIr · Korea Quest</h1>
        </div>
        {children}
      </div>
    </div>
  );
}
