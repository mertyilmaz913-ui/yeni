import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../lib/supabase/server';
import { bookingSchema } from '../../../lib/validation';

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: { code: 'unauthorized', message: 'Sign in to create a booking.' } },
      { status: 401 }
    );
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle();

  if (profile?.role !== 'client') {
    return NextResponse.json(
      { error: { code: 'forbidden', message: 'Only clients can create bookings.' } },
      { status: 403 }
    );
  }

  const payload = await request.json().catch(() => null);
  const parsed = bookingSchema.safeParse({
    traderId: payload?.traderId,
    minutes:
      typeof payload?.minutes === 'number' ? payload.minutes : Number(payload?.minutes ?? 0),
    note: payload?.note,
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'invalid_body',
          message: parsed.error.errors[0]?.message ?? 'Invalid payload',
        },
      },
      { status: 400 }
    );
  }

  if (parsed.data.traderId === user.id) {
    return NextResponse.json(
      { error: { code: 'invalid_target', message: 'You cannot book yourself.' } },
      { status: 400 }
    );
  }

  const { data: trader, error: traderError } = await supabase
    .from('traders')
    .select('price_per_minute')
    .eq('user_id', parsed.data.traderId)
    .maybeSingle();

  if (traderError || !trader) {
    return NextResponse.json(
      { error: { code: 'not_found', message: 'Trader not found.' } },
      { status: 404 }
    );
  }

  const estimatedCost = (parseFloat(String(trader.price_per_minute)) * parsed.data.minutes).toFixed(2);

  const { data: booking, error: insertError } = await supabase
    .from('bookings')
    .insert({
      client_id: user.id,
      trader_id: parsed.data.traderId,
      minutes: parsed.data.minutes,
      note: parsed.data.note,
      estimated_cost: estimatedCost,
      status: 'pending',
    })
    .select('id, status, estimated_cost')
    .single();

  if (insertError) {
    return NextResponse.json(
      { error: { code: 'insert_failed', message: insertError.message } },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      id: booking.id,
      status: booking.status,
      estimated_cost: booking.estimated_cost,
    },
    { status: 201 }
  );
}
