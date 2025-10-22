import Link from 'next/link';
import { createSupabaseServerClient } from '../lib/supabase/server';

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();

  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, display_name, bio')
    .eq('role', 'trader')
    .eq('is_public', true)
    .order('created_at', { ascending: true })
    .limit(3);

  const traderIds = (profiles ?? []).map((profile) => profile.user_id);
  const { data: traders } = traderIds.length
    ? await supabase
        .from('traders')
        .select('user_id, price_per_minute, rating')
        .in('user_id', traderIds)
    : { data: [] as any[] };

  const traderMap = new Map((traders ?? []).map((trader) => [trader.user_id, trader]));

  return (
    <section className="space-y-10">
      <header className="card">
        <h1 className="mb-4 text-3xl font-semibold">Profesyonel trader&apos;larla tanışın</h1>
        <p className="mb-6 text-slate-300">
          TraderPro, kripto odaklı uzmanlarla birebir görüşmeler yapmanızı sağlayan kürasyonlu bir pazaryeridir.
          Trader profillerini keşfedin, rezervasyon talebinde bulunun ve stratejilerinizi geliştirin.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link className="btn-primary" href="/traders">
            Trader&apos;ları keşfet
          </Link>
          <Link className="btn-secondary" href="/sign-up">
            Trader ol
          </Link>
        </div>
      </header>

      {profiles && profiles.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Öne çıkan trader&apos;lar</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {profiles.map((profile) => {
              const meta = traderMap.get(profile.user_id);
              return (
                <article key={profile.user_id} className="card space-y-3">
                  <h3 className="text-lg font-semibold">{profile.display_name}</h3>
                  <p className="text-sm text-slate-300">{profile.bio ?? 'Henüz bio eklenmemiş.'}</p>
                  {meta && (
                    <p className="text-sm text-slate-300">
                      ${parseFloat(String(meta.price_per_minute)).toFixed(2)}/dk · Puan{' '}
                      {parseFloat(String(meta.rating)).toFixed(1)}
                    </p>
                  )}
                  <Link className="btn-secondary" href={`/traders/${profile.user_id}`}>
                    Profili görüntüle
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
