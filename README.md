# Tumkur AutoConnect Ecosystem 🏭

> **Enterprise ERP & Marketplace for the Industrial Auto-Component Sector — Tumkur, Karnataka**
> Designed and crafted by **Roaring Thunders** ❤️

[![Mobile: Expo](https://img.shields.io/badge/Mobile-Expo%20SDK%2051-000?logo=expo)](https://expo.dev)
[![Web: Next.js](https://img.shields.io/badge/Web-Next.js%2014-000?logo=next.js)](https://nextjs.org)
[![Deploy: Vercel](https://img.shields.io/badge/Deploy-Vercel-000?logo=vercel)](https://vercel.com)

---

## 🗂 Monorepo Structure

```
tc/
├── mobile/        → Expo React Native app (iOS + Android)
├── web/           → Next.js 14 HR Dashboard (→ Vercel)
├── backend/       → Node.js / Express REST API
├── prisma/        → PostgreSQL schema (Prisma ORM)
└── .github/       → CI / CD workflows
```

---

## 🧑‍🤝‍🧑 Supported Roles

| Role | App | Description |
|---|---|---|
| **WORKER** | Mobile | Browse jobs, geo-check-in, track bus route |
| **INDUSTRY_HR** | Mobile + Web | Post jobs, view attendance, manage workers |
| **DRIVER** | Mobile | Live route console, SOS, mark stops |
| **INSTITUTE** | Web | Manage trainee records |
| **CONTRACTOR** | Web | Commission tracking, worker placement |

---

## 🚀 Quick Start

### Mobile App (Expo)

```bash
cd mobile
npm install
npx expo start
# Press 'a' for Android, 'i' for iOS
```

### Web Dashboard (Next.js)

```bash
cd web
npm install
npm run dev
# Opens at http://localhost:3000
```

### Backend API (Express)

```bash
cd backend
npm install
cp .env.example .env   # Add your secrets
npm run dev
```

---

## 🌐 Deployment

### Web → Vercel

1. Push to GitHub
2. Import `web/` folder in [vercel.com/new](https://vercel.com/new)
3. Set Root Directory to `web`
4. Vercel auto-detects Next.js and deploys

### Mobile → Expo EAS

```bash
cd mobile
npm install -g eas-cli
eas login
eas build --platform all
```

---

## 🔑 Environment Variables

Create `backend/.env`:

```env
DATABASE_URL="postgresql://user:pass@host:5432/tumkur_ac"
OPENAI_API_KEY="sk-..."
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="ap-south-1"
AWS_S3_BUCKET="tumkur-autoconnect"
FIREBASE_PROJECT_ID="..."
```

---

## ✨ Tech Stack

| Layer | Technology |
|---|---|
| Mobile UI | React Native (Expo SDK 51) + `expo-blur` glassmorphism |
| Gestures | `react-native-gesture-handler` + `react-native-reanimated` v3 |
| Navigation | React Navigation 6 native stack + custom animated tab bar |
| Web Dashboard | Next.js 14 App Router + Vanilla CSS design system |
| Backend | Node.js + Express |
| Database | PostgreSQL + Prisma ORM |
| Auth | Firebase Authentication (RBAC) |
| Storage | AWS S3 (AES-256 encrypted presigned uploads) |
| AI Matching | OpenAI GPT-4 |
| Geo-fencing | Haversine formula (50m radius validation) |
| Routing | OSRM |

---

## 📱 Features

- **AI Job Matching** — GPT-4 scores worker profiles against factory requirements
- **Geo-Fenced Attendance** — GPS check-in validated within 50m of factory boundary
- **Secure Document Upload** — AES-256 encrypted Aadhaar / certificates via S3
- **Live Bus Tracking** — Driver console with stop management and SOS
- **Role-Based Navigation** — Dynamic tab bars per user role
- **Glassmorphism UI** — `expo-blur` + CSS `backdrop-filter` dark glass design
- **Buttery Smooth Animations** — Spring physics, haptics, stagger animations
- **All Screen Sizes** — Responsive scale utilities (phones, tablets, desktop)

---

## 🏷 Branding

> **"This app is designed and crafted by Roaring Thunders with ❤️"**
> Help & Support: tumkuru.connect@gmail.com

---

## 📄 License

MIT © 2026 Roaring Thunders
