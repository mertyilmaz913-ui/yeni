alter table profiles enable row level security;
alter table traders enable row level security;
alter table bookings enable row level security;
alter table subscribers enable row level security;
alter table feedback enable row level security;

-- Profiles policies
create policy "Public profiles" on profiles
  for select using (is_public = true);

create policy "Users read own profile" on profiles
  for select using (auth.uid() = user_id);

create policy "Users update own profile" on profiles
  for update using (auth.uid() = user_id);

create policy "Users insert own profile" on profiles
  for insert with check (auth.uid() = user_id);

-- Traders policies
create policy "Public trader view" on traders
  for select using (
    exists (
      select 1 from profiles p
      where p.user_id = traders.user_id
        and p.is_public = true
    )
  );

create policy "Trader manage own trader row" on traders
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Bookings policies
create policy "Clients can insert bookings" on bookings
  for insert with check (
    auth.uid() = client_id
    and exists (
      select 1 from profiles p
      where p.user_id = auth.uid()
        and p.role = 'client'
    )
  );

create policy "Clients view their bookings" on bookings
  for select using (auth.uid() = client_id);

create policy "Traders view bookings sent to them" on bookings
  for select using (auth.uid() = trader_id);

create policy "Clients cancel own booking" on bookings
  for update using (
    auth.uid() = client_id
  ) with check (
    auth.uid() = client_id and status = 'cancelled'
  );

create policy "Traders manage assigned bookings" on bookings
  for update using (
    auth.uid() = trader_id
  ) with check (
    auth.uid() = trader_id and status in ('pending', 'accepted', 'rejected', 'completed')
  );

-- Subscribers policies
create policy "Public subscribers select" on subscribers
  for select using (true);

create policy "Users manage their subscriptions" on subscribers
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Feedback policies
create policy "Feedback visible to participants" on feedback
  for select using (
    auth.uid() = trader_id or auth.uid() = client_id
  );

create policy "Public feedback for trader" on feedback
  for select using (
    exists (
      select 1 from profiles p
      where p.user_id = feedback.trader_id
        and p.is_public = true
    )
  );

create policy "Clients insert feedback for completed booking" on feedback
  for insert with check (
    auth.uid() = client_id and
    exists (
      select 1 from bookings b
      where b.id = booking_id
        and b.status = 'completed'
        and b.client_id = auth.uid()
    )
  );
