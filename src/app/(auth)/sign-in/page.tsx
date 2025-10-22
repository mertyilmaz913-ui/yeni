import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '../../../lib/supabase/server';
import { SignInForm } from './sign-in-form';

export default async function SignInPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/');
  }

  return (
    <div className="card mx-auto max-w-md space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Giriş yap</h1>
        <p className="text-sm text-slate-300">TraderPro hesabınıza erişmek için bilgilerinizi girin.</p>
      </div>
      <SignInForm />
      <p className="text-sm text-slate-300">
        Henüz hesabınız yok mu?{' '}
        <Link href="/sign-up" className="text-sky-400">
          Kayıt olun
        </Link>
      </p>
    </div>
  );
}
