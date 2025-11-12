
# HireFlow 🚀

**HireFlow** is a modern full-stack hiring management platform built with Next.js, React, Tailwind CSS, Zustand, and Supabase. Manage job postings, dynamic application forms, and track applicants with ease.

---

## 🎯 Features

### For Admins (Recruiters)
- Create, view, edit, delete job positions
- Build **custom dynamic application forms**
- Track applications through **hiring pipeline** (`Submitted → Under Review → Interview → Accepted/Rejected`)
- View applicant profiles and uploaded files

### For Applicants (Job Seekers)
- Browse active job postings
- Fill **dynamic forms** for each job
- Capture profile photo via **webcam with gesture detection**
- Track application status from dashboard

### Technical
- Role-based access control: Admin / Applicant
- Row Level Security (RLS) on Supabase
- Zustand for global state management
- Full TypeScript support
- Mobile-first responsive design
- Modern UI with shadcn/ui

---

## 💻 Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Database & Auth**: Supabase
- **UI Components**: shadcn/ui
- **Deployment**: Vercel

---

## 🚀 Get Started

### 1. Clone Repository
```bash
git clone <repository-url>
cd hiring-management-app
````

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Setup Supabase

1. Create a new Supabase project.
2. Add `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
```

3. Run SQL scripts in Supabase SQL Editor:

   * `001_create_tables.sql`
   * `002_create_profile_trigger.sql`
   * `003_seed_data.sql` (optional)

### 4. Start Development

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🗂 Project Structure

```
hiring-management-app/
├── app/                   # Pages (Admin, Auth, Jobs, Dashboard)
├── components/            # React components (Admin, Jobs, UI, Webcam)
├── lib/                   # Supabase clients, store, types, utils
├── scripts/               # SQL database scripts
├── middleware.ts
└── README.md
```

---

## 📸 Screenshots

**Admin Job List Page**
<img width="953" height="479" alt="image" src="https://github.com/user-attachments/assets/5904a6b7-2ca1-4dee-ad8a-2e6019e881dd" />

**Admin Candidate List Page**
<img width="951" height="482" alt="image" src="https://github.com/user-attachments/assets/8fc65d24-dde4-4ffa-bcd4-7818655224d6" />

**Applicant Job List Page**
<img width="952" height="478" alt="image" src="https://github.com/user-attachments/assets/15719ba4-fea7-45b1-aa33-af0d6b4b9506" />

---

## 🔒 Security

* Supabase Auth (email/password)
* Role-based access control
* Row Level Security (RLS)
* Type-safe (TypeScript)
* HTTPS enforced in production

---

## ⚡ Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

Set environment variables in Vercel dashboard.

---

## 🛠 Troubleshooting

* **Camera not working**: Check permissions, HTTPS, other apps
* **Email confirmation not received**: Check spam folder, Supabase logs
* **RLS issues**: Verify user role and profile creation
* **Database issues**: Check `.env.local` and Supabase project status

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch
3. Implement changes
4. Test thoroughly
5. Submit a pull request

---

## 🙏 Acknowledgments

* [Next.js](https://nextjs.org/)
* [shadcn/ui](https://ui.shadcn.com/)
* [Supabase](https://supabase.com/)
* [Zustand](https://github.com/pmndrs/zustand)
* [Vercel](https://vercel.com/)

