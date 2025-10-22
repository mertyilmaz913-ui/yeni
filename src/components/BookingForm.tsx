'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { bookingSchema } from '../lib/validation';

interface BookingFormProps {
  traderId: string;
  pricePerMinute: number;
}

export function BookingForm({ traderId, pricePerMinute }: BookingFormProps) {
  const router = useRouter();
  const [minutes, setMinutes] = useState(30);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const estimatedCost = (minutes * pricePerMinute).toFixed(2);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsed = bookingSchema.safeParse({ traderId, minutes, note: note.trim() || undefined });
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? 'Geçersiz istek');
      return;
    }

    setLoading(true);
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
    });
    setLoading(false);

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.error?.message ?? 'Rezervasyon oluşturulamadı');
      return;
    }

    router.push('/me/bookings?success=true');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="minutes">Süre (dakika)</label>
        <input
          id="minutes"
          type="number"
          min={5}
          max={240}
          value={minutes}
          onChange={(event) => setMinutes(Number(event.target.value))}
          required
        />
      </div>

      <div>
        <label htmlFor="note">Not (opsiyonel)</label>
        <textarea
          id="note"
          rows={3}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Görüşmek istediğiniz konular..."
        />
      </div>

      <p className="text-sm text-slate-300">Tahmini maliyet: ${estimatedCost}</p>
      {error && <p className="text-sm text-rose-400">{error}</p>}

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Gönderiliyor…' : 'Rezervasyon talebi gönder'}
      </button>
    </form>
  );
}
