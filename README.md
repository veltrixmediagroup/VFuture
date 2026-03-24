# 🎮 VFuture - Next.js Admin CMS Platform

**© 2026 Veltrix Media Group. All Rights Reserved.**

⚠️ **PROPRIETARY SOFTWARE** - This repository is PRIVATE. Unauthorized access, copying, modification, or distribution is strictly prohibited.

Nền tảng quản lý nội dung hiện đại dành cho cộng đồng game, kết hợp trang chủ công khai với hệ thống CMS quản trị đầy đủ.

---

## 📋 Mục Lục

1. [Cấu Trúc Hệ Thống](#cấu-trúc-hệ-thống)
2. [Tech Stack](#tech-stack)
3. [Cài Đặt & Thiết Lập](#cài-đặt--thiết-lập)
4. [Người Dùng Cuối vs Admin](#người-dùng-cuối-vs-admin)
5. [Cấu Trúc Cơ Sở Dữ Liệu](#cấu-trúc-cơ-sở-dữ-liệu)
6. [API & Security](#api--security)
7. [Thiết Lập Email](#thiết-lập-email)
8. [Performance & Optimization](#performance--optimization)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

## 🏗️ Cấu Trúc Hệ Thống

```
VFuture V5
├── 🌍 Public Pages (User Site)
│   ├── Home - Trang chủ với hero animation
│   ├── Calendar - Lịch sự kiện 30 ngày
│   ├── Events - Danh sách sự kiện với filter/sort
│   ├── News - Blog tin tức
│   ├── Contact - Form liên hệ
│   └── Auth Pages (Login, Register, Forgot Password, OTP)
│
├── 🔐 Admin Dashboard (/admin)
│   ├── Dashboard - Tổng quan
│   ├── Events Manager - CRUD sự kiện
│   ├── News Manager - Editor tin tức rich text
│   ├── Gallery Manager - Quản lý ảnh
│   ├── Users Manager - Phân quyền admin
│   ├── Activity Logs - Lịch sử hoạt động
│   └── Settings - Cấu hình hệ thống
│
├── ⚙️ Backend Services
│   ├── Supabase Auth - Xác thực người dùng
│   ├── PostgreSQL Database - Lưu trữ dữ liệu
│   ├── Storage - Lưu ảnh (events, gallery)
│   └── SMTP Email - Gửi email khôi phục mật khẩu
│
└── 🔌 API Routes (/api)
    ├── Public - news, events, gallery, contact
    └── Admin - admin/*, auth/demo-*
```

### Data Flow (Sơ đồ Cây Tư Duy)

```
┌─────────────┐
│  Browser    │ (User hoặc Admin)
└──────┬──────┘
       │
       ├─→ [Public Pages] → getNews() → Supabase DB
       │   (SSG/SSR)                    +
       │                                Redis Cache (Performance)
       │
       ├─→ [Admin Pages] → Middleware Auth → /admin
       │   (Protected)      ↓
       │               ✓ Login?
       │               ✓ Role Check?
       │
       └─→ [API Routes] → Rate Limit
           (Rate Limited)  ↓
                      ✓ Request Valid?
                      ✓ Auth Valid?
                      ✓ Sanitize Input?
                      ↓
                      Execute → Supabase
                      ↓
                      Log Activity
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14 (App Router) | SSR/SSG/ISR pages |
| **UI Framework** | TailwindCSS + shadcn/ui | Styling + Components |
| **Animations** | Framer Motion | Smooth animations |
| **State** | Zustand + React Query | Global state + server cache |
| **Backend** | Supabase (PostgreSQL) | Database + Auth + Storage |
| **Rich Text** | TipTap | News editor |
| **Validation** | Zod | Schema validation |
| **Security** | Supabase RLS | Row-level security |
| **Deployment** | Vercel | Hosting |
| **Email** | Gmail SMTP | Password reset emails |
| **SEO** | next-seo | JSON-LD + OG tags |

---

## 📦 Cài Đặt & Thiết Lập

### 1. Clone & Dependencies

```bash
git clone https://github.com/YOUR_USERNAME/vfuture.git
cd vfuture
npm install
```

### 2. Supabase Setup

1. Tạo project tại [supabase.com](https://supabase.com)
2. Chạy SQL schema:
   - Truy cập Supabase Dashboard → SQL Editor
   - Mở file [supabase/schema.sql](supabase/schema.sql)
   - Copy & paste toàn bộ nội dung
   - Chạy lệnh

3. Tạo Storage Buckets:
   - **Storage** → **New Bucket** → `events` (Public)
   - **Storage** → **New Bucket** → `gallery` (Public)

4. Lấy API Keys:
   - **Settings** → **API** → Copy URL & Keys

### 3. Thiết Lập Environment Variables

```bash
cp .env.example .env.local
```

Điền vào `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Email (Gmail + Supabase SMTP)
# Tham khảo: Supabase-Huong-Dan-Thiet-Lap-Email.md
# Được cấu hình trong Supabase Dashboard

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://vfuture.vercel.app
NEXT_PUBLIC_EXPERIMENTAL_MODE=false
NEXT_PUBLIC_ENABLE_DEMO_ADMIN_AUTH=false

# Admin Invite Email (Resend)
RESEND_API_KEY=re_...
ADMIN_INVITE_FROM_EMAIL=admin@vfuture.com
ADMIN_INVITE_REPLY_TO_EMAIL=support@vfuture.com
```

### 4. Chạy Development Server

```bash
npm run dev
```

- **User Site**: http://localhost:3000
- **Admin**: http://localhost:3000/admin (Demo auth enabled)

---

## 👥 Người Dùng Cuối vs Admin

### Public User
- ✅ Xem trang chủ, lịch, sự kiện, tin tức
- ✅ Gửi form liên hệ
- ✅ Đăng ký / Đăng nhập (nếu bật)
- ✅ Khôi phục mật khẩu (OTP email)
- ❌ Không truy cập /admin

### Admin User
- ✅ Tất cả quyền user
- ✅ Truy cập /admin dashboard
- ✅ CRUD Events, News, Gallery
- ✅ Quản lý user roles
- ✅ Xem activity logs
- ✅ Cấu hình settings
- ⚠️ Chỉ Senior Admin mới có quyền xóa user

### Roles Hierarchy
```
Senior Admin ⊃ Admin ⊃ Editor
```

---

## 💾 Cấu Trúc Cơ Sở Dữ Liệu

### Bảng Chính

#### 1. `users` (Đồng Bộ từ auth.users)
```sql
id UUID PRIMARY KEY
email TEXT UNIQUE
role TEXT ('admin', 'senior_admin', 'editor')
views INT (tương lai: thống kê view)
created_at TIMESTAMP
```

#### 2. `events`
```sql
id UUID PRIMARY KEY
title TEXT
description TEXT
start_date TIMESTAMP
end_date TIMESTAMP
image_url TEXT
thumbnail_url TEXT (optional)
link TEXT (optional, link sự kiện)
status ENUM ('active', 'upcoming', 'expired')
created_at TIMESTAMP

INDEX: start_date, status
```

**Logic**: Status auto-update dựa vào date so với hiện tại (Vietnam time)

#### 3. `news`
```sql
id UUID PRIMARY KEY
title TEXT
slug TEXT UNIQUE (auto-generate từ title)
excerpt TEXT
content TEXT (rich HTML)
cover TEXT (image URL)
category TEXT ('ESPORTS', ...)
status ENUM ('draft', 'published')
created_at TIMESTAMP
updated_at TIMESTAMP (auto-update)

INDEX: slug, status, created_at
```

#### 4. `gallery`
```sql
id UUID PRIMARY KEY
image_url TEXT
tag TEXT (phân loại ảnh)
created_at TIMESTAMP

INDEX: created_at
```

#### 5. `settings` (Key-Value Config)
```sql
id UUID PRIMARY KEY
key TEXT UNIQUE
value TEXT
updated_at TIMESTAMP (auto-update)

INDEX: updated_at
```

**Ví dụ**: 
- `site_title` → "VFuture - Cộng Đồng Game"
- `hero_background` → URL ảnh
- `seo_description` → Meta description

#### 6. `admin_activity_logs`
```sql
id UUID PRIMARY KEY
actor_email TEXT
action TEXT ('EVENT_CREATED', 'NEWS_UPDATED', ...)
target_type TEXT ('EVENT', 'NEWS', 'USER', ...)
target_id TEXT
summary TEXT (mô tả action)
created_at TIMESTAMP

INDEX: created_at DESC
```

### Row Level Security (RLS)

Mỗi bảng có policy riêng:

| Table | Public | Admin/Editor | Admin Only |
|-------|--------|-------------|-----------|
| **events** | SELECT all | CRUD | - |
| **news** | SELECT published | CRUD all | - |
| **gallery** | SELECT all | CRUD | - |
| **users** | SELECT own | CRUD all | - |
| **settings** | SELECT all | - | UPDATE |
| **logs** | - | SELECT | DELETE |

---

## 🔌 API & Security

### Public API Endpoints

```
GET  /api/events?search=...&status=active
GET  /api/news?status=published
GET  /api/gallery
POST /api/contact (rate-limited: 12/min)
```

### Admin API Endpoints

```
GET  /api/admin/events
POST /api/admin/events
PATCH /api/admin/events/:id
DELETE /api/admin/events/:id

(Tương tự: /news, /gallery, /users, /settings, /logs)
```

### Security Layers

1. **Rate Limiting**
   - Contact form: 12 req/min per IP
   - Public API: 50-100 req/min per IP
   - Admin API: 20-30 req/min per IP

2. **Input Validation**
   - Zod schemas cho tất cả POST/PATCH routes
   - Example:
     ```typescript
     const eventSchema = z.object({
       title: z.string().min(1).max(200),
       start_date: z.string().datetime(),
       image_url: z.string().url(),
     });
     ```

3. **Sanitization**
   - Plain text: xoá HTML tags
   - Rich text: cho phép chính xác các tags (p, a, img, ...)
   - Data URIs: hỗ trợ base64 images

4. **Authentication**
   - Supabase Auth (built-in)
   - Demo mode cho development (feature flag)
   - Session management via cookies

5. **Authorization**
   - Middleware check `/admin` routes
   - API guards kiểm tra role
   - RLS policies ở database layer

6. **Headers Security** (next.config.mjs)
   ```
   ✅ Content-Security-Policy
   ✅ X-Frame-Options: DENY
   ✅ X-Content-Type-Options: nosniff
   ✅ Permissions-Policy: camera, mic, geo disabled
   ✅ HSTS: 63 days + preload
   ```

---

## 📧 Thiết Lập Email

### Khôi Phục Mật Khẩu (Supabase SMTP)

**Tham khảo**: [Supabase-Huong-Dan-Thiet-Lap-Email.md](Supabase-Huong-Dan-Thiet-Lap-Email.md)

**Quy Trình**:
1. User nhập email ở `/auth/forgot-password`
2. Frontend gọi `supabase.auth.resetPasswordForEmail(email)`
3. Supabase lấy SMTP config từ settings
4. Gửi email với OTP 6 số
5. User nhập OTP ở `/auth/verify-otp`
6. Chuyển đến `/auth/update-password` để đặt lại

**Cấu Hình Gmail** (trong Supabase):
- SMTP Host: `smtp.gmail.com`
- SMTP Port: `465` (TLS) hoặc `587`
- User: `veltrixmediagroup@gmail.com`
- Password: App Password (16 chữ từ Google Account)
- Sender Name: `VFuture Admin`

### Invite Email (Resend)

Admin có thể mời email mới tạo tài khoản admin.

**File**: [src/lib/server/admin-invite-email.ts](src/lib/server/admin-invite-email.ts)

---

## ⚡ Performance & Optimization

### Caching Strategy

| Layer | Type | TTL | Example |
|-------|------|-----|---------|
| **Page** | ISR (Incremental Static Regeneration) | 60s | `/news/[slug]` rebuild nếu có update |
| **API** | React Query | 5 min | Events list cache |
| **Image** | Next.js Image Optimization | 1 year | Automatic format (AVIF, WebP) |
| **Browser** | Cache-Control headers | 1 year | Static assets |

### SEO Optimization

- **Metadata API**: Dynamic title, description, OG tags
- **JSON-LD**: Structured data cho news, events
- **Sitemap**: Auto-generated từ routes
- **Robots.txt**: Cho search engine crawl

### Bundle Size

- **First Load JS**: ~201 kB (good)
- **Shared Chunks**: 87.3 kB (dependencies)
- **Page Average**: 2-8 kB (route code)

### Lighthouse Scores (Expected)

```
Performance:   85-90 (ISR + Image Optimization)
Accessibility: 90-95 (shadcn/ui + ARIA)
Best Practices: 95-98 (Security headers)
SEO:           95-98 (Metadata + Structured data)
```

---

## 🚀 Deployment

### GitHub Preparation

```bash
# 1. Initialize git (if not already)
git init
git add .
git commit -m "Initial commit: VFuture V5"

# 2. Create .gitignore
echo "node_modules/
.next/
.env.local
build/
dist/" > .gitignore

# 3. Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/vfuture.git
git branch -M main
git push -u origin main
```

### Vercel Deployment

1. **Connect GitHub**:
   - Truy cập [vercel.com](https://vercel.com)
   - Import repository

2. **Environment Variables**:
   - Add all `.env.local` variables
   - Vercel sẽ encrypted & store

3. **Build Settings**:
   - Build Command: `npm run build` (automatic)
   - Output Directory: `.next` (automatic)

4. **Deploy**:
   - Vercel tự build & deploy
   - URL: `https://vfuture.vercel.app`

### Custom Domain (Optional)

```bash
# In Vercel Dashboard:
1. Settings → Domains
2. Add "yourdomain.com"
3. Update DNS (CNAME to Vercel)
```

---

## 🐛 Troubleshooting

### Email Không Gửi Được

**Vấn đề**: Forgot-password không gửi email

**Giải Pháp**:
1. Kiểm tra SMTP config ở Supabase Dashboard
2. Verify Gmail App Password (không phải mật khẩu thường)
3. Test trực tiếp trên Supabase Dashboard
   - Auth → Email Templates → Send Test

### Admin Page Không Tải

**Vấn đề**: `/admin` hiển thị redirect to login

**Giải Pháp**:
1. Nếu SUPABASE_URL/KEY không set: dùng demo auth (set flag)
2. Nếu Supabase không kết nối: check API keys
3. Check middleware.ts logic

### Build Fails

**Vấn đề**: Build error ở `npm run build`

**Giải Pháp**:
1. `npm run lint` → check ESLint
2. `npm run typecheck` → check TypeScript
3. `npm run dev` → test locally trước
4. Delete `.next/` & rebuild

### Database Connect Fails

**Vấn đề**: "Could not find table" ở dev mode

**Giải Pháp**:
1. Check NEXT_PUBLIC_SUPABASE_URL & ANON_KEY
2. Check schema.sql đã chạy chưa
3. App sẽ dùng fallback data (demo mode) nếu không connect

---

## 📞 Support

- **GitHub Issues**: Report bugs
- **Email**: Admin contact (set ở settings)
- **Docs**: See SUPABASE_GOOGLE_EMAIL_SETUP_GUIDE.md

---

**Made with ❤️ for VFuture Community**
