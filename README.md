## AI Chat Case

Fastify tabanlı bu proje, AI destekli sohbet akışlarını sunarken kullanıcı başına sohbet ve mesaj geçmişini yönetir. Sistem Prisma ile PostgreSQL, Redis tabanlı feature flag stratejileri ve OpenAI modeli kullanan tamamlayıcı servisleri bir araya getirir.

### Özellikler
- Fastify + TypeScript servis mimarisi, Prisma ile Postgres veri katmanı
- Redis destekli feature flag sistemi (pagination limiti, AI araçları, chat history vb.)
- Chat/Messages servisleri ile kullanıcıya ait sohbet listesi ve geçmiş sorguları
- Streaming ve JSON completion stratejileri ile OpenAI entegrasyonu
- JWT tabanlı auth middleware, merkezi hata yakalama ve Winston logger entegrasyonu

### Gereksinimler
- Node.js 20+ ve npm
- Docker & Docker Compose (opsiyonel fakat tavsiye edilen kurulum yolu)
- PostgreSQL

### Kurulum
1. Repoyu klonlayın ve kök dizine geçin.
2. Bağımlılıkları yükleyin:
	```bash
	npm install
	```
3. `.env` dosyasını oluşturun (aşağıdaki değişkenlere bakın).

### Ortam Değişkenleri
| Değişken | Açıklama | Varsayılan |
| --- | --- | --- |
| `DATABASE_URL` | Prisma'nın bağlanacağı PostgreSQL connection string'i | Zorunlu |
| `REDIS_URL` | Redis bağlantı adresi | `redis://localhost:6379` |
| `JWT_SECRET_KEY` | Auth middleware için imzalama anahtarı | `supersecret` |
| `OPENAI_API_KEY` | `@ai-sdk/openai` tarafından okunan API anahtarı | Zorunlu |
| `STREAMING_ENABLED` | Streaming completion flag'i | `true` |
| `PAGINATION_LIMIT` | Chat listesi limit flag'i (10-100 arası) | `20` |
| `AI_TOOLS_ENABLED` | AI mock tool flag'i | `false` |
| `CHAT_HISTORY_ENABLED` | Tam geçmiş döndürme flag'i | `true` |
| `CHAT_HISTORY_FALLBACK_LIMIT` | History kapalıyken dönecek mesaj sayısı | `10` |
| `PORT` / `HOST` | Fastify sunucusu adres bilgileri | `3000` / `0.0.0.0` |

### Docker ile Çalıştırma
1. `.env` dosyanızı hazırlayın ve proje köküne yerleştirin.
2. Uygulama ve Redis servislerini başlatın:
	```bash
	docker compose up --build
	```
3. Sunucu varsayılan olarak `http://localhost:3000` adresinden ulaşılabilir.
4. Gerekirse Prisma client üretimi için container içinde aşağıdaki komutu çalıştırın:
	```bash
	docker compose exec app npm run prisma:generate
	```
5. Logları takip etmek için:
	```bash
	docker compose logs -f app
	```

### Lokal Geliştirme (Docker olmadan)
1. Postgres ve Redis servislerini lokalinizde ayağa kaldırın.
2. `.env` dosyanızda ilgili bağlantıları tanımlayın.
3. Prisma client'ı üretin:
	```bash
	npm run prisma:generate
	```
4. Development sunucusunu başlatın:
	```bash
	npm run dev
	```
5. Prod benzeri kurulum için:
	```bash
	npm run build && npm start
	```

### Komut Referansı
- `npm run lint` / `npm run lint:fix`: ESLint kontrolleri
- `npm run prisma:pull`: Var olan şemayı veritabanından çekme
- `npm run prisma:generate`: Prisma client üretimi

### API Özet
| Metod | Yol | Açıklama |
| --- | --- | --- |
| `GET /` | Auth sonrası kullanıcının sohbet listesi (feature flag ile limitlenir) |
| `GET /:chatId` | Kullanıcının sohbet geçmişi (history flag'ine göre tam veya kısıtlı) |
| `POST /:chatId/completion` | AI completion isteği (streaming flag'ine göre strateji seçer) |

Tüm endpoint'ler Bearer token ile korunur; `Authorization: Bearer <JWT>` başlığı gerektirir.

### Feature Flag Davranışları
- `PAGINATION_LIMIT`: Chat listesi dönerken maksimum kayıt sayısını 10-100 aralığında sınırlar.
- `CHAT_HISTORY_ENABLED`: `true` ise tam sohbet geçmişi döner, `false` ise yalnızca son `CHAT_HISTORY_FALLBACK_LIMIT` mesajı.
- `AI_TOOLS_ENABLED`: AI mock tool'larının kullanılmasına izin verir (gelecekteki entegrasyonlar için).
- `STREAMING_ENABLED`: Completion stratejisinin streaming veya JSON modunda çalışacağını belirler.

### Yardımcı Notlar
- Logger varsayılan olarak `application.log` dosyasına yazar; `LOG_FILE` ile özelleştirilebilir.
- Redis feature flag stratejisi için öncelikle `featureFlagService.init()` çalıştırılır; Docker senaryosunda Redis servisi otomatik olarak compose ile ayağa kalkar.

Sorun yaşarsanız `docker compose down -v` ile ortamı sıfırlayabilir ve yeniden başlatabilirsiniz.
