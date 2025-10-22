import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '../../../lib/supabase/server';

export default async function TraderDashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, display_name')
    .eq('user_id', user.id)
    .maybeSingle();

  if (profile?.role !== 'trader') {
    return (
      <div className="card space-y-3">
        <h1 className="text-2xl font-semibold">Trader paneli</h1>
        <p className="text-sm text-slate-300">Bu alana erişmek için trader rolünde olmanız gerekir.</p>
      </div>
    );
  }

  const { data: metrics } = await supabase
    .from('trader_dashboard_metrics')
    .select('total_minutes, total_revenue, active_subscribers')
    .eq('trader_id', user.id)
    .maybeSingle();

  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const { data: dailyCompleted } = await supabase
    .from('bookings')
    .select('estimated_cost')
    .eq('trader_id', user.id)
    .eq('status', 'completed')
    .gte('created_at', startOfDay.toISOString());

  const dailyRevenue = (dailyCompleted ?? []).reduce(
    (sum, booking) => sum + parseFloat(String(booking.estimated_cost)),
    0
  );

  const { data: feedback } = await supabase
    .from('feedback')
    .select('id, rating, comment, created_at, client_id')
    .eq('trader_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  const clientIds = Array.from(new Set((feedback ?? []).map((item) => item.client_id)));
  const { data: clients } = clientIds.length
    ? await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', clientIds)
    : { data: [] as any[] };
  const clientMap = new Map((clients ?? []).map((client) => [client.user_id, client.display_name]));

  const formatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold">Tekrar hoş geldiniz, {profile.display_name}</h1>
        <p className="text-sm text-slate-300">Performansınızı tek bakışta izleyin.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="card space-y-2">
          <p className="text-sm text-slate-400">Bugünkü gelir</p>
          <p className="text-2xl font-semibold">${dailyRevenue.toFixed(2)}</p>
        </div>
        <div className="card space-y-2">
          <p className="text-sm text-slate-400">Toplam tamamlanan dakika</p>
          <p className="text-2xl font-semibold">{metrics?.total_minutes ?? 0}</p>
        </div>
        <div className="card space-y-2">
          <p className="text-sm text-slate-400">Aktif aboneler</p>
          <p className="text-2xl font-semibold">{metrics?.active_subscribers ?? 0}</p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Son geri bildirimler</h2>
        {feedback && feedback.length ? (
          <div className="space-y-3">
            {feedback.map((item) => (
              <article key={item.id} className="card space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>{clientMap.get(item.client_id) ?? 'Client'}</span>
                  <span>Puan {item.rating}/5</span>
                </div>
                {item.comment && <p className="text-sm text-slate-200">{item.comment}</p>}
                <p className="text-xs text-slate-500">{formatter.format(new Date(item.created_at))}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-300">Henüz geri bildirim yok.</p>
        )}
      </section>
    </div>
  );
}
