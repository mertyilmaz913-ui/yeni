'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '../../../lib/supabase/client';
import { signUpSchema, type SignUpInput } from '../../../lib/validation';

const defaultForm: SignUpInput = {
  email: '',
  password: '',
  role: 'client',
  displayName: '',
};

export function SignUpForm() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [form, setForm] = useState<SignUpInput>(defaultForm);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = signUpSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? 'Invalid input');
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined,
      },
    });
    if (signUpError) {
      setLoading(false);
      setError(signUpError.message);
      return;
    }

    const user = data.user;
    if (user) {
      const { error: profileError } = await supabase.from('profiles').upsert(
        {
          user_id: user.id,
          role: parsed.data.role,
          display_name: parsed.data.displayName,
        },
        { onConflict: 'user_id' }
      );
      if (profileError) {
        setLoading(false);
        setError(profileError.message);
        return;
      }
      if (parsed.data.role === 'trader') {
        const { error: traderError } = await supabase.from('traders').upsert(
          {
            user_id: user.id,
          },
          { onConflict: 'user_id' }
        );
        if (traderError) {
          setLoading(false);
          setError(traderError.message);
          return;
        }
      }
    }

    setLoading(false);
    router.push('/');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          required
        />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          required
        />
      </div>
      <div>
        <label htmlFor="displayName">Display name</label>
        <input
          id="displayName"
          value={form.displayName}
          onChange={(event) => setForm((prev) => ({ ...prev, displayName: event.target.value }))}
          required
        />
      </div>
      <div>
        <label htmlFor="role">Role</label>
        <select
          id="role"
          value={form.role}
          onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value as SignUpInput['role'] }))}
        >
          <option value="client">Client</option>
          <option value="trader">Trader</option>
        </select>
      </div>
      {error && <p className="text-sm text-rose-400">{error}</p>}
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  );
}
