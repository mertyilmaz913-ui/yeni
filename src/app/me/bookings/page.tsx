import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '../../../lib/supabase/server';

interface SearchParams {
  success?: string;
}

export default async function MyBookingsPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle();

  if (profile?.role !== 'client') {
    return (
      <div className="card space-y-2">
        <h1 className="text-2xl font-semibold">Rezervasyonlarım</h1>
        <p className="text-sm text-slate-300">Rezervasyonları görüntülemek için client rolünde olmalısınız.</p>
        <Link className="btn-secondary" href="/traders">
          Trader&apos;ları keşfet
        </Link>
      </div>
    );
  }

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('id, trader_id, minutes, status, estimated_cost, scheduled_at, created_at, note')
    .eq('client_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const traderIds = (bookings ?? []).map((booking) => booking.trader_id);
  const { data: traders } = traderIds.length
    ? await supabase.from('profiles').select('user_id, display_name').in('user_id', traderIds)
    : { data: [] as any[] };

  const traderMap = new Map<string, string>(
    (traders ?? []).map((trader) => [trader.user_id, trader.display_name])
  );

  const formatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Rezervasyonlarım</h1>

      {searchParams.success === 'true' && (
        <div className="card border border-emerald-500/50 bg-emerald-900/20">
          <p className="text-emerald-400">✓ Rezervasyon talebiniz başarıyla gönderildi. Trader onayını bekleyin.</p>
        </div>
      )}

      {!bookings?.length ? (
        <div className="card space-y-3">
          <p className="text-sm text-slate-300">Henüz rezervasyon talebiniz yok.</p>
          <Link className="btn-primary" href="/traders">
            Trader bul
          </Link>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Trader</th>
                <th>Durum</th>
                <th>Dakika</th>
                <th>Tahmini maliyet</th>
                <th>Oluşturulma</th>
                <th>Planlanan</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>
                    <Link className="text-sky-400" href={`/traders/${booking.trader_id}`}>
                      {traderMap.get(booking.trader_id) ?? 'Bilinmeyen trader'}
                    </Link>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        booking.status === 'completed'
                          ? 'bg-emerald-900/30 text-emerald-400'
                          : booking.status === 'accepted'
                          ? 'bg-sky-900/30 text-sky-400'
                          : booking.status === 'pending'
                          ? 'bg-amber-900/30 text-amber-400'
                          : booking.status === 'rejected'
                          ? 'bg-rose-900/30 text-rose-400'
                          : 'bg-slate-700/30 text-slate-400'
                      }`}
                    >
                      {booking.status === 'pending'
                        ? 'Beklemede'
                        : booking.status === 'accepted'
                        ? 'Onaylandı'
                        : booking.status === 'completed'
                        ? 'Tamamlandı'
                        : booking.status === 'rejected'
                        ? 'Reddedildi'
                        : booking.status === 'cancelled'
                        ? 'İptal edildi'
                        : booking.status}
                    </span>
                  </td>
                  <td>{booking.minutes}</td>
                  <td>${parseFloat(String(booking.estimated_cost)).toFixed(2)}</td>
                  <td>{formatter.format(new Date(booking.created_at))}</td>
                  <td>
                    {booking.scheduled_at ? formatter.format(new Date(booking.scheduled_at)) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
