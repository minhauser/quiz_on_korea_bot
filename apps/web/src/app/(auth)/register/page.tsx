'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { ApiError } from '@/shared/api/client';
import { useLogin, useRegister } from '@/shared/api/hooks/use-auth';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';

const schema = z.object({
  nickname: z.string().min(2, 'At least 2 characters').max(30),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters').max(72),
  nativeLanguage: z.string().min(2).max(10),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const registerMutation = useRegister();
  const loginMutation = useLogin();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { nativeLanguage: 'en' } });

  const onSubmit = async (values: FormValues) => {
    try {
      await registerMutation.mutateAsync(values);
      await loginMutation.mutateAsync({ email: values.email, password: values.password });
      router.push('/dashboard');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Something went wrong. Please try again.';
      setError('root', { message });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Create your account</CardTitle>
        <CardDescription>Start learning Korean for university life.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Nickname</label>
            <input
              {...register('nickname')}
              className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              placeholder="minji"
            />
            {errors.nickname && <p className="mt-1 text-xs text-destructive">{errors.nickname.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Email</label>
            <input
              type="email"
              {...register('email')}
              className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              placeholder="student@example.com"
            />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Password</label>
            <input
              type="password"
              {...register('password')}
              className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              placeholder="At least 8 characters"
            />
            {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
          </div>

          {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}

          <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account…' : 'Sign up'}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
