import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import path from 'node:path';
import process from 'node:process';
import type { Database } from '../src/lib/types';

config({ path: path.resolve(process.cwd(), '.env') });

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const traderOneId = process.env.SEED_TRADER_ONE_ID;
  const traderTwoId = process.env.SEED_TRADER_TWO_ID;
  const clientOneId = process.env.SEED_CLIENT_ONE_ID;

  if (!url || !serviceRole) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.');
  }

  if (!traderOneId || !traderTwoId || !clientOneId) {
    console.warn(
      'Set SEED_TRADER_ONE_ID, SEED_TRADER_TWO_ID, and SEED_CLIENT_ONE_ID in your .env file before running this script.'
    );
    console.warn('You can grab these IDs from the auth.users table via the Supabase dashboard or CLI.');
    process.exit(1);
  }

  const supabase = createClient<Database>(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  await supabase.from('profiles').upsert(
    [
      {
        user_id: traderOneId,
        role: 'trader',
        display_name: 'Alice Alpha',
        bio: 'Algo-focused day trader specializing in BTC.',
        is_public: true,
      },
      {
        user_id: traderTwoId,
        role: 'trader',
        display_name: 'Bob Beta',
        bio: 'Options strategist with macro insights.',
        is_public: true,
      },
      {
        user_id: clientOneId,
        role: 'client',
        display_name: 'Charlie Client',
        bio: 'Crypto curious investor looking for mentorship.',
        is_public: true,
      },
    ],
    { onConflict: 'user_id' }
  );

  await supabase.from('traders').upsert(
    [
      {
        user_id: traderOneId,
        price_per_minute: '7.50',
        categories: ['scalping', 'bitcoin'],
        rating: '4.85',
      },
      {
        user_id: traderTwoId,
        price_per_minute: '5.25',
        categories: ['options', 'macro'],
        rating: '4.92',
      },
    ],
    { onConflict: 'user_id' }
  );

  const bookingRows = [
    {
      id: '11111111-1111-4111-8111-111111111111',
      client_id: clientOneId,
      trader_id: traderOneId,
      minutes: 30,
      status: 'completed' as const,
      estimated_cost: '225.00',
      note: 'Great strategy walkthrough.',
    },
    {
      id: '22222222-2222-4222-8222-222222222222',
      client_id: clientOneId,
      trader_id: traderTwoId,
      minutes: 45,
      status: 'pending' as const,
      estimated_cost: '236.25',
      note: 'Interested in long-term options positioning.',
    },
  ];

  await supabase.from('bookings').upsert(bookingRows, { onConflict: 'id' });

  await supabase.from('feedback').upsert(
    [
      {
        id: '33333333-3333-4333-8333-333333333333',
        booking_id: bookingRows[0].id,
        trader_id: traderOneId,
        client_id: clientOneId,
        rating: 5,
        comment: 'Extremely helpful session! Learned actionable tactics.',
      },
    ],
    { onConflict: 'id' }
  );

  await supabase.from('subscribers').upsert(
    [
      { id: '44444444-4444-4444-8444-444444444444', trader_id: traderOneId, user_id: clientOneId },
      { id: '55555555-5555-4555-8555-555555555555', trader_id: traderTwoId, user_id: clientOneId },
    ],
    { onConflict: 'id' }
  );

  console.log('Seed data applied successfully.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
