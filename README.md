# Eksperin.com Platform Tasarımı

## Genel Bakış
Eksperin.com; uzmanlar ile danışanları sesli ve görüntülü görüşmeler aracılığıyla bir araya getiren uzmanlık platformudur. Platformun hedefi, uzman kişilerin bilgi ve deneyimini danışanların anında erişebileceği şekilde organize etmek, uzmanlara sürdürülebilir gelir sağlarken danışanlara güvenilir bir bilgi ağı sunmaktır. Türkiye'den başlayarak çevrim içi danışmanlık alanında güvenilir bir ekosistem kurmak amaçlanmaktadır.

## Rol Tabanlı Giriş Sistemi
Platform iki ayrı giriş sistemine sahiptir:

### Kullanıcı Girişi
- "Kullanıcı" sekmesinden e-posta ve şifre ile giriş yapılır.
- Kullanıcılar giriş sonrası **Kullanıcı Ana Sayfasına (User Home)** yönlendirilir.
- Kullanıcı ana sayfasında onaylı uzmanlar listelenir, randevu oluşturulabilir, geçmiş görüşmeler görüntülenebilir ve görüşme sonrası yorum yapılabilir.

### Uzman Girişi
- "Uzman" sekmesinden e-posta ve şifre ile giriş yapılır.
- Uzmanlar giriş sonrası **Uzman Ana Sayfasına (Expert Dashboard)** yönlendirilir.
- Dashboard üzerinden gelen randevular, kazançlar, görüşme geçmişi ve yorumlar incelenebilir; müsaitlik durumu ve dakika ücreti güncellenebilir.

### Uzman Kayıt Süreci
- Uzman kayıt olurken "uzman başvuru formu" doldurur.
- Form; eğitim, deneyim, sertifika, uzmanlık alanı ve açıklama gibi bilgileri toplar.
- Başvuru sonrasında "Başvurunuz alınmıştır. En kısa sürede incelenecektir." mesajı gösterilir.
- Admin onayı ile profil "expert" rolüne yükseltilir ve uzman kendi dashboard'una erişir.

## Temel Özellikler

### Kullanıcı Ana Sayfası
- Uzman listesi (kategori, fiyat ve puana göre filtreleme).
- Randevu oluşturma (dakika ve tarih seçimi).
- Görüşme geçmişini görüntüleme.
- Değerlendirme yapma.
- Hesap ayarları yönetimi.

### Uzman Ana Sayfası
- Güncel randevular listesi.
- Kazanç istatistikleri (dakika × ücret).
- Görüşme geçmişi, gelen yorumlar ve puanlar.
- Profil düzenleme (bio, fiyat, dış bağlantılar).
- Müsaitlik durumunu ayarlama.
- Otomatik gelir hesaplama.

### Ortak Özellikler
- Görüşme öncesi, sırası ve sonrası mesajlaşma.
- Dakika bazlı ödeme sistemi.
- Sesli ve görüntülü görüşme entegrasyonu.
- Yapay zekâ destekli özetleme ve hatırlatma.
- Mobil uyumlu arayüz.

## Yapay Zekâ Katmanı
- **Vapi.ai entegrasyonu:** Görüşme özetleri, hatırlatıcılar ve içerik notları.
- **Perplexity entegrasyonu:** Finans ve kripto gibi alanlarda güncel bilgi ve veri desteği.
- **AI Asistan:** Danışanlara görüşme öncesi soru önerileri sunar.
- **AI Raporlama:** Uzman performans analizleri ve kullanıcı etkileşim özetleri sağlar.

## Ödeme ve Kazanç Modeli
- Dakika bazlı fiyatlandırma `price_per_min` alanı üzerinden yönetilir.
- Toplam ücret = dakika × birim fiyat formülü ile hesaplanır.
- Platform komisyonu (ör. %15) düşüldükten sonra kalan tutar uzman bakiyesine aktarılır.
- Uzman bakiyesi `wallet_transactions` tablosuna yansır ve çekimler yönetici onayıyla gerçekleşir.
- Admin panelinde gelir ve komisyon istatistikleri takip edilir.

## Veri Tabanı (Supabase)
- **Tablolar:** `profiles`, `expert_applications`, `bookings`, `messages`, `reviews`.
- **View'lar:** `v_bookings_with_profiles`, `v_expert_upcoming`, `v_expert_last_reviews`.
- **RLS Politikaları:**
  - Kullanıcılar yalnızca kendi randevu ve mesajlarını görebilir.
  - Uzmanlar yalnızca kendi görüşme ve mesajlarına erişebilir.
  - Yorumlar ve profiller herkese açıktır.

## Gelecekteki Özellikler
- Dakika paketleri (10, 30, 60 dakika gibi).
- Yapay zekâ özetli görüşme raporları.
- Telegram ve WhatsApp entegrasyonları.
- FlutterFlow tabanlı mobil uygulama.
- Admin paneli (uzman onayı, gelir ve istatistikler).
- Oylama ve rozet sistemi (en yüksek puanlı uzmanlar).

## Özet
- İki ayrı giriş ve ana sayfa (Kullanıcı / Uzman).
- Dakika bazlı ödeme sistemi ve komisyon yapısı.
- Yapay zekâ destekli görüşme, özetleme ve bildirimler.
- Supabase tabanlı altyapı ve katmanlı güvenlik politikaları.
- Mobil uyumlu, genişletilebilir uzmanlık platformu.
