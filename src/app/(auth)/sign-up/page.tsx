import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '../../../lib/supabase/server';
import { SignUpForm } from './sign-up-form';

export default async function SignUpPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/');
  }

  return (
    <div className="card mx-auto max-w-lg space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">TraderPro hesabı oluşturun</h1>
        <p className="text-sm text-slate-300">Trader olarak oturum açın veya client olarak rezervasyon yapın.</p>
      </div>
      <SignUpForm />
      <p className="text-sm text-slate-300">
        Zaten hesabınız var mı?{' '}
        <Link href="/sign-in" className="text-sky-400">
          Giriş yapın
        </Link>
      </p>
    </div>
  );
}
