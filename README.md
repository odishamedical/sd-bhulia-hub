# Bhulia Enterprise Hub

The central command and e-commerce ecosystem for the SD Bhulia organization. This Next.js 15 application handles everything from public product storefronts and directories, to verified seller dashboards, and a robust Super Admin panel for global oversight.

## 🚀 Live Site
Production: [https://sd-bhulia-hub.vercel.app](https://sd-bhulia-hub.vercel.app)

## 🏗️ Architecture & Stack
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS (Vanilla CSS approach without utility bloat where possible)
- **Database / Backend:** Firebase (Firestore, Authentication, Storage)
- **Authentication:** SD Auth Center (Custom JWT + Firebase Auth)
- **Deployment:** Vercel

## 📂 Core Structure
- `/src/app/(public)` - The public-facing storefront and directories.
- `/src/app/dashboard` - The authenticated Seller and Weaver portal for managing products and orders.
- `/src/app/admin` - The Super Admin Single Page Application (SPA) for ecosystem oversight and verification.
- `/src/lib/db-hooks.ts` - Centralized Firebase hooks for real-time data syncing.
- `/scripts/` - Custom Node.js utility scripts for database migrations and hotfixes.

## ⚙️ Local Development Setup
1. Clone the repository.
2. Install dependencies: `npm install`
3. Set up your `.env.local` with your Firebase config credentials.
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

## 📜 Contributing
Ensure all code passes the ESLint checks before pushing. We prioritize a clean, warning-free terminal. For any major structural changes, consult the Super Admin guidelines first.
