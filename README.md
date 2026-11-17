# Driving School CRUD v5 - Fixed + Student/Admin

Fixed TS2345 Pool type error + Student/Admin sections.

## Fix
Before:
```ts
const pool = new pg.Pool(...)
const adapter = new PrismaPg(pool)
```
After:
```ts
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
```

## Routes
- / -> Landing
- /student -> Student test (K53, 70% pass, progress bar)
- /admin -> Admin CRUD with upload to Supabase bucket traffic-signs

## Setup
1. npm install
2. .env with DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
3. Create Supabase bucket traffic-signs public
4. npx prisma db push
5. npm run seed
6. npm run build -> should now pass
7. npm run dev

Stack: Next 16.3.4, React 19.2.8, TS5, Tailwind v4, Prisma 6.19.3, pg 8.23.0, adapter-pg 7.10.0, Supabase 2.115.0
