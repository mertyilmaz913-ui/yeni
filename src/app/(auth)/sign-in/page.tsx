import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '../../../lib/supabase/server';
import { SignInForm } from './sign-in-form';

export default async function SignInPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/');
  }

  return (
    <div className="card max-w-md mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="text-sm text-slate-300">
          Welcome back! Please use your email and password to continue.
        </p>
      </div>
      <SignInForm />
      <p className="text-sm text-slate-300">
        Need an account?{' '}
        <Link href="/sign-up" className="text-sky-400">
          Sign up instead
        </Link>
      </p>
    </div>
  );
}
