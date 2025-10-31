-- Example seed data. Adjust UUIDs to match auth user IDs you create manually.
-- Replace the UUIDs below with real auth.users IDs before running.

insert into profiles (user_id, role, display_name, bio, avatar_url, is_public)
values
  ('00000000-0000-4000-8000-000000000001', 'trader', 'Alice Alpha', 'Algo-focused day trader.', null, true),
  ('00000000-0000-4000-8000-000000000002', 'trader', 'Bob Beta', 'Options strategist and mentor.', null, true),
  ('00000000-0000-4000-8000-000000000003', 'client', 'Charlie Client', 'Crypto curious.', null, true)
on conflict (user_id) do nothing;

insert into traders (user_id, price_per_minute, categories, rating)
values
  ('00000000-0000-4000-8000-000000000001', 7.50, array['scalping','bitcoin'], 4.80),
  ('00000000-0000-4000-8000-000000000002', 5.25, array['options','macro'], 4.90)
on conflict (user_id) do nothing;

insert into bookings (client_id, trader_id, minutes, status, estimated_cost, note)
values
  ('00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000001', 30, 'completed', 225.00, 'Great insights!'),
  ('00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000002', 45, 'pending', 236.25, 'Interested in long-term strategy')
returning id;

insert into feedback (booking_id, trader_id, client_id, rating, comment)
select b.id, b.trader_id, b.client_id, 5, 'Extremely helpful session!'
from bookings b
where b.status = 'completed'
  and not exists (
    select 1 from feedback f where f.booking_id = b.id
  );

insert into subscribers (trader_id, user_id)
values
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000003'),
  ('00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000003')
on conflict do nothing;
