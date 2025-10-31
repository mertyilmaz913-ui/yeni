import Link from 'next/link';
import { createSupabaseServerClient } from '../lib/supabase/server';

export default async function HomePage() {
  const supabase = createSupabaseServerClient();
  const { data: traders } = await supabase
    .from('profiles')
    .select('user_id, display_name, bio')
    .eq('role', 'trader')
    .eq('is_public', true)
    .limit(3);

  let traderMeta: Record<string, { price_per_minute: string; rating: string }> = {};
  if (traders && traders.length) {
    const ids = traders.map((t) => t.user_id);
    const { data: meta } = await supabase
      .from('traders')
      .select('user_id, price_per_minute, rating')
      .in('user_id', ids);
    if (meta) {
      traderMeta = meta.reduce(
        (acc, m) => ({
          ...acc,
          [m.user_id]: {
            price_per_minute: m.price_per_minute,
            rating: m.rating,
          },
        }),
        {}
      );
    }
  }

  return (
    <section className="space-y-10">
      <header className="card">
        <h1 className="text-3xl font-semibold mb-4">Connect with elite crypto traders</h1>
        <p className="text-slate-300 mb-6">
          TraderPro is a curated marketplace where clients book one-on-one sessions with professional traders.
          Explore public trader profiles, request a booking, and grow your trading game.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link className="btn-primary" href="/traders">
            Explore traders
          </Link>
          <Link className="btn-secondary" href="/sign-up">
            Become a trader
          </Link>
        </div>
      </header>

      {traders && traders.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Featured traders</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {traders.map((trader) => {
              const meta = traderMeta[trader.user_id];
              return (
                <article key={trader.user_id} className="card space-y-3">
                  <h3 className="text-lg font-semibold">{trader.display_name}</h3>
                  <p className="text-sm text-slate-300">{trader.bio ?? 'No bio yet.'}</p>
                  {meta && (
                    <p className="text-sm text-slate-300">
                      ${parseFloat(meta.price_per_minute).toFixed(2)}/min · Rating {parseFloat(meta.rating).toFixed(1)}
                    </p>
                  )}
                  <Link className="btn-secondary" href={`/traders/${trader.user_id}`}>
                    View profile
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
