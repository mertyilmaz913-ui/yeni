import Link from 'next/link';
import { createSupabaseServerClient } from '../../lib/supabase/server';

export default async function TradersPage() {
  const supabase = await createSupabaseServerClient();

  const { data: traders } = await supabase
    .from('traders')
    .select('user_id, price_per_minute, rating, categories')
    .order('rating', { ascending: false });

  const traderIds = (traders ?? []).map((trader) => trader.user_id);
  const { data: profiles } = traderIds.length
    ? await supabase
        .from('profiles')
        .select('user_id, display_name, bio, is_public')
        .in('user_id', traderIds)
    : { data: [] as any[] };

  const profileMap = new Map((profiles ?? []).map((profile) => [profile.user_id, profile]));

  const publicTraders = (traders ?? []).filter((trader) => profileMap.get(trader.user_id)?.is_public);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">Trader&apos;lar</h1>
        <p className="text-sm text-slate-300">Onaylı trader profillerini görüntüleyin.</p>
      </header>

      {!publicTraders.length ? (
        <div className="card">
          <p className="text-sm text-slate-300">Şu anda yayınlanmış trader bulunmuyor.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {publicTraders.map((trader) => {
            const profile = profileMap.get(trader.user_id)!;
            return (
              <article key={trader.user_id} className="card space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-xl font-semibold">{profile.display_name}</h2>
                    <p className="text-sm text-slate-300">{profile.bio ?? 'Henüz bio eklenmemiş.'}</p>
                  </div>
                  <span className="badge">
                    ${parseFloat(String(trader.price_per_minute)).toFixed(2)}/dk ·{' '}
                    {parseFloat(String(trader.rating)).toFixed(1)}/5
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Kategoriler: {trader.categories?.length ? trader.categories.join(', ') : '—'}
                </p>
                <Link className="btn-secondary" href={`/traders/${trader.user_id}`}>
                  Profili görüntüle
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
