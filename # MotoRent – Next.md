# MotoRent – Next.js 14 (App Router) + Prisma + NextAuth + Tailwind (MVP)

Below is a **complete minimal project** you can paste into a fresh folder. It includes:
- User auth (register/login) with **NextAuth Credentials**
- Roles (`USER` / `ADMIN`)
- Bikes CRUD (Admin)
- Bookings (User)
- Listing/Detail pages with basic filters
- Tailwind + shadcn/ui ready
- Prisma (SQLite) + seed script

---

## 📁 File Tree
```
.motorrent/
  .env.example
  package.json
  next.config.mjs
  postcss.config.mjs
  tailwind.config.ts
  tsconfig.json
  prisma/
    schema.prisma
    seed.ts
  src/
    app/
      layout.tsx
      globals.css
      page.tsx
      api/
        auth/[...nextauth]/route.ts
        register/route.ts
        bikes/route.ts
        bikes/[id]/route.ts
        bookings/route.ts
      auth/
        login/page.tsx
        register/page.tsx
      bikes/
        page.tsx
        [id]/page.tsx
      profile/page.tsx
      admin/page.tsx
      admin/bikes/page.tsx
      admin/bikes/new/page.tsx
      admin/bikes/[id]/edit/page.tsx
    components/
      NavBar.tsx
      Footer.tsx
      BikeCard.tsx
      RequireRole.tsx
      Input.tsx
      Button.tsx
    lib/
      prisma.ts
      auth.ts
      utils.ts
```

---

## 🧪 Quick Start
1) **Create project folder** and copy these files with the same structure
2) `cp .env.example .env` → edit values
3) `npm install`
4) `npx prisma migrate dev --name init`
5) `npm run seed`
6) `npm run dev` → open http://localhost:3000

> Seed creates an **admin** user: `admin@moto.test` / password: `admin123` and a few bikes.

---

## 🔑 .env.example
```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=CHANGE_ME_TO_A_LONG_RANDOM_STRING

# Database (SQLite file path)
DATABASE_URL="file:./dev.db"
```

---

## 📦 package.json
```json
{
  "name": "motorrent",
  "private": true,
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  },
  "dependencies": {
    "@prisma/client": "^5.17.0",
    "bcryptjs": "^2.4.3",
    "next": "^14.2.5",
    "next-auth": "^5.0.0-beta.20",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "zod": "^3.23.8",
    "clsx": "^2.1.1"
  },
  "devDependencies": {
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.41",
    "prisma": "^5.17.0",
    "tailwindcss": "^3.4.9",
    "typescript": "^5.4.5",
    "ts-node": "^10.9.2"
  }
}
```

---

## 🔧 next.config.mjs
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { serverActions: { allowedOrigins: ["localhost:3000"] } },
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] }
};
export default nextConfig;
```

---

## 🎨 tailwind.config.ts
```ts
import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}'
  ],
  theme: { extend: {} },
  plugins: []
} satisfies Config
```

---

## 🧴 postcss.config.mjs
```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

---

## 🧠 tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "types": ["next", "next/types/global", "next-auth"]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## 🗃️ prisma/schema.prisma
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

enum Role { USER ADMIN }

enum BookingStatus { PENDING CONFIRMED CANCELLED }

model User {
  id           String   @id @default(cuid())
  name         String?
  email        String   @unique
  passwordHash String
  role         Role     @default(USER)
  points       Int      @default(0)
  bookings     Booking[]
  createdAt    DateTime @default(now())
}

model Bike {
  id           String   @id @default(cuid())
  model        String
  year         Int
  transmission String   // auto | manual
  pricePerDay  Int
  location     String
  description  String
  imageUrl     String
  available    Boolean  @default(true)
  bookings     Booking[]
  createdAt    DateTime @default(now())
}

model Booking {
  id        String         @id @default(cuid())
  user      User           @relation(fields: [userId], references: [id])
  userId    String
  bike      Bike           @relation(fields: [bikeId], references: [id])
  bikeId    String
  startDate DateTime
  endDate   DateTime
  total     Int
  status    BookingStatus  @default(PENDING)
  createdAt DateTime       @default(now())
}
```

---

## 🌱 prisma/seed.ts
```ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
const prisma = new PrismaClient()

async function main() {
  const adminPass = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@moto.test' },
    update: {},
    create: { email: 'admin@moto.test', passwordHash: adminPass, role: 'ADMIN', name: 'Admin' }
  })

  await prisma.bike.createMany({ data: [
    { model: 'Honda Click 125i', year: 2023, transmission: 'auto', pricePerDay: 250, location: 'Chiang Mai', description: 'คล่องตัว ประหยัดน้ำมัน', imageUrl: 'https://images.unsplash.com/photo-1520975922284-7b6830b6cfb2' },
    { model: 'Yamaha NMAX', year: 2022, transmission: 'auto', pricePerDay: 350, location: 'Bangkok', description: 'นั่งสบาย แรงกำลังดี', imageUrl: 'https://images.unsplash.com/photo-1531938711058-9f2b0f1c7d49' },
    { model: 'Honda PCX 160', year: 2023, transmission: 'auto', pricePerDay: 400, location: 'Chiang Mai', description: 'นิ่ง เงียบ ขับฟิน', imageUrl: 'https://images.unsplash.com/photo-1588348264761-0ca34d4468d8' }
  ], skipDuplicates: true })

  console.log('Seeded with admin:', admin.email)
}

main().finally(() => prisma.$disconnect())
```

---

## 🔌 src/lib/prisma.ts
```ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

---

## 🔐 src/lib/auth.ts
```ts
import NextAuth, { type NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export const authConfig: NextAuthConfig = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/auth/login' },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: { email: {}, password: {} },
      async authorize(creds) {
        const email = (creds?.email ?? '').toString().toLowerCase()
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) return null
        const ok = await bcrypt.compare((creds?.password ?? '').toString(), user.passwordHash)
        if (!ok) return null
        return { id: user.id, email: user.email, name: user.name, role: user.role }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role
      return token
    },
    async session({ session, token }) {
      (session as any).role = token.role
      return session
    }
  }
}
```

---

## 🧩 src/lib/utils.ts
```ts
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}
```

---

## 🎛️ src/components/Button.tsx
```tsx
'use client'
import { cn } from '@/src/lib/utils'
import React from 'react'

export default function Button({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn('rounded-2xl px-4 py-2 text-white bg-black hover:opacity-90 disabled:opacity-50', className)}
      {...props}
    />
  )
}
```

---

## ✏️ src/components/Input.tsx
```tsx
import React from 'react'

export default function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
      {...props}
    />
  )
}
```

---

## 🧭 src/components/NavBar.tsx
```tsx
'use client'
import Link from 'next/link'
import { signIn, signOut, useSession } from 'next-auth/react'

export default function NavBar() {
  const { data: session } = useSession()
  const role = (session as any)?.role as 'ADMIN' | 'USER' | undefined

  return (
    <nav className="border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold">MotoRent</Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/bikes">รถเช่า</Link>
          {role === 'ADMIN' && <Link href="/admin">หลังบ้าน</Link>}
          {session ? (
            <>
              <Link href="/profile">โปรไฟล์</Link>
              <button onClick={() => signOut()} className="text-red-600">ออกจากระบบ</button>
            </>
          ) : (
            <button onClick={() => signIn()} className="">เข้าสู่ระบบ</button>
          )}
        </div>
      </div>
    </nav>
  )
}
```

---

## 🦶 src/components/Footer.tsx
```tsx
export default function Footer() {
  return (
    <footer className="mt-12 border-t">
      <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-gray-500">
        © {new Date().getFullYear()} MotoRent — ขี่ให้สุด…หยุดที่ความอิสระ
      </div>
    </footer>
  )
}
```

---

## 🧩 src/components/BikeCard.tsx
```tsx
import Image from 'next/image'
import Link from 'next/link'
import { Bike } from '@prisma/client'

export default function BikeCard({ bike }: { bike: Bike }) {
  return (
    <div className="rounded-2xl border overflow-hidden">
      <div className="relative h-44 w-full">
        <Image src={bike.imageUrl} alt={bike.model} fill className="object-cover" />
      </div>
      <div className="p-4">
        <div className="font-semibold">{bike.model} • {bike.year}</div>
        <div className="text-sm text-gray-600">{bike.transmission === 'auto' ? 'ออโต้' : 'ธรรมดา'} · {bike.location}</div>
        <div className="mt-2 font-bold">฿{bike.pricePerDay}/วัน</div>
        <Link href={`/bikes/${bike.id}`} className="mt-3 inline-block text-white bg-black px-3 py-2 rounded-xl">ดูรายละเอียด</Link>
      </div>
    </div>
  )
}
```

---

## ⛔ src/components/RequireRole.tsx
```tsx
import { getServerSession } from 'next-auth'
import { authConfig } from '@/src/lib/auth'
import Link from 'next/link'

export default async function RequireRole({ role, children }: { role: 'ADMIN' | 'USER', children: React.ReactNode }) {
  const session = await getServerSession(authConfig)
  const sessionRole = (session as any)?.role
  if (!session) return <div className="p-6">โปรด <Link className="underline" href="/auth/login">เข้าสู่ระบบ</Link></div>
  if (role === 'ADMIN' && sessionRole !== 'ADMIN') return <div className="p-6 text-red-600">ต้องเป็นแอดมินเท่านั้น</div>
  return <>{children}</>
}
```

---

## 🏁 src/app/globals.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body { height: 100%; }
```

---

## 🧱 src/app/layout.tsx
```tsx
import './globals.css'
import { ReactNode } from 'react'
import NavBar from '@/src/components/NavBar'
import Footer from '@/src/components/Footer'
import { NextAuthProvider } from './providers'

export const metadata = {
  title: 'MotoRent',
  description: 'เช่ามอเตอร์ไซค์ออนไลน์ ง่าย เร็ว โปร่งใส'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="th">
      <body className="min-h-screen bg-white text-gray-900">
        <NextAuthProvider>
          <NavBar />
          <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
          <Footer />
        </NextAuthProvider>
      </body>
    </html>
  )
}
```

---

## 🤝 src/app/providers.tsx
```tsx
'use client'
import { SessionProvider } from 'next-auth/react'
export function NextAuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
```

---

## 🏠 src/app/page.tsx (Home)
```tsx
import Link from 'next/link'
import { prisma } from '@/src/lib/prisma'
import BikeCard from '@/src/components/BikeCard'

export default async function HomePage() {
  const bikes = await prisma.bike.findMany({ take: 6, orderBy: { createdAt: 'desc' } })
  return (
    <div className="space-y-10">
      <section className="text-center space-y-4">
        <h1 className="text-3xl md:text-5xl font-extrabold">ขี่ให้สุด…หยุดที่ความอิสระ</h1>
        <p className="text-gray-600">เช่ามอเตอร์ไซค์ออนไลน์ เลือก–จอง–จ่าย–รับรถ จบในเว็บเดียว</p>
        <div className="flex justify-center gap-3">
          <Link href="/bikes" className="bg-black text-white px-5 py-3 rounded-2xl">เช่ารถเลย</Link>
          <Link href="/auth/register" className="px-5 py-3 rounded-2xl border">สมัครสมาชิกฟรี</Link>
        </div>
      </section>
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">รถยอดนิยม</h2>
          <Link href="/bikes" className="text-sm underline">ดูทั้งหมด</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {bikes.map(b => <BikeCard key={b.id} bike={b} />)}
        </div>
      </section>
    </div>
  )
}
```

---

## 🔐 API: src/app/api/auth/[...nextauth]/route.ts
```ts
import NextAuth from 'next-auth'
import { authConfig } from '@/src/lib/auth'

const handler = NextAuth(authConfig)
export { handler as GET, handler as POST }
```

---

## 👤 API: src/app/api/register/route.ts (Sign up)
```ts
import { prisma } from '@/src/lib/prisma'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  const { email, password, name } = await req.json()
  if (!email || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (exists) return NextResponse.json({ error: 'Email already used' }, { status: 400 })
  const passwordHash = await bcrypt.hash(password, 10)
  await prisma.user.create({ data: { email: email.toLowerCase(), passwordHash, name } })
  return NextResponse.json({ ok: true })
}
```

---

## 🛵 API: src/app/api/bikes/route.ts (GET list, POST create)
```ts
import { prisma } from '@/src/lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/src/lib/auth'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || undefined
  const transmission = searchParams.get('transmission') || undefined
  const location = searchParams.get('location') || undefined
  const min = Number(searchParams.get('min')) || 0
  const max = Number(searchParams.get('max')) || 999999

  const bikes = await prisma.bike.findMany({
    where: {
      AND: [
        q ? { model: { contains: q, mode: 'insensitive' } } : {},
        transmission ? { transmission } : {},
        location ? { location } : {},
        { pricePerDay: { gte: min, lte: max } }
      ]
    },
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(bikes)
}

export async function POST(req: Request) {
  const session = await getServerSession(authConfig)
  if (!(session as any) || (session as any).role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const bike = await prisma.bike.create({ data: body })
  return NextResponse.json(bike)
}
```

---

## 🛵 API: src/app/api/bikes/[id]/route.ts (GET/PUT/DELETE)
```ts
import { prisma } from '@/src/lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/src/lib/auth'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const bike = await prisma.bike.findUnique({ where: { id: params.id } })
  if (!bike) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(bike)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authConfig)
  if (!(session as any) || (session as any).role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const bike = await prisma.bike.update({ where: { id: params.id }, data: body })
  return NextResponse.json(bike)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authConfig)
  if (!(session as any) || (session as any).role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await prisma.bike.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
```

---

## 📅 API: src/app/api/bookings/route.ts (POST create booking)
```ts
import { prisma } from '@/src/lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/src/lib/auth'

export async function POST(req: Request) {
  const session = await getServerSession(authConfig)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { bikeId, startDate, endDate } = await req.json()
  const bike = await prisma.bike.findUnique({ where: { id: bikeId } })
  if (!bike) return NextResponse.json({ error: 'Bike not found' }, { status: 404 })
  const s = new Date(startDate), e = new Date(endDate)
  if (e <= s) return NextResponse.json({ error: 'Invalid dates' }, { status: 400 })
  const days = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24))
  const total = days * bike.pricePerDay
  const booking = await prisma.booking.create({ data: { bikeId, userId: (session as any).user.id ?? '', startDate: s, endDate: e, total, status: 'PENDING' } })
  return NextResponse.json(booking)
}
```

---

## 🔐 Pages: Auth – /auth/login & /auth/register
### src/app/auth/login/page.tsx
```tsx
'use client'
import Input from '@/src/components/Input'
import Button from '@/src/components/Button'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await signIn('credentials', { email, password, redirect: false })
    if (res?.error) setErr('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
    else router.push('/')
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold">เข้าสู่ระบบ</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <Input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <Input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        {err && <div className="text-sm text-red-600">{err}</div>}
        <Button type="submit">เข้าสู่ระบบ</Button>
      </form>
      <div className="text-sm">ยังไม่มีบัญชี? <a className="underline" href="/auth/register">สมัครสมาชิก</a></div>
    </div>
  )
}
```

### src/app/auth/register/page.tsx
```tsx
'use client'
import Input from '@/src/components/Input'
import Button from '@/src/components/Button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/register', { method: 'POST', body: JSON.stringify({ name, email, password }) })
    if (!res.ok) setErr('สมัครไม่สำเร็จ อีเมลอาจถูกใช้แล้ว')
    else router.push('/auth/login')
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold">สมัครสมาชิก</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <Input placeholder="ชื่อ (ไม่บังคับ)" value={name} onChange={e=>setName(e.target.value)} />
        <Input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <Input type="password" placeholder="Password (≥ 8 ตัวอักษร)" value={password} onChange={e=>setPassword(e.target.value)} />
        {err && <div className="text-sm text-red-600">{err}</div>}
        <Button type="submit">สมัครสมาชิก</Button>
      </form>
    </div>
  )
}
```

---

## 🛵 Pages: Bikes – /bikes & /bikes/[id]
### src/app/bikes/page.tsx (Listing + filters)
```tsx
import { prisma } from '@/src/lib/prisma'
import BikeCard from '@/src/components/BikeCard'

export const dynamic = 'force-dynamic'

export default async function BikesPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const q = (searchParams.q as string) || ''
  const transmission = (searchParams.transmission as string) || ''
  const location = (searchParams.location as string) || ''
  const min = Number(searchParams.min || 0)
  const max = Number(searchParams.max || 999999)

  const bikes = await prisma.bike.findMany({
    where: {
      AND: [
        q ? { model: { contains: q, mode: 'insensitive' } } : {},
        transmission ? { transmission } : {},
        location ? { location } : {},
        { pricePerDay: { gte: min, lte: max } }
      ]
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">เลือกคันที่ใช่ แล้วไปมันส์ให้สุดทาง</h1>
      <form className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <input name="q" placeholder="ค้นหารุ่น…" defaultValue={q} className="border rounded-xl px-3 py-2" />
        <select name="transmission" defaultValue={transmission} className="border rounded-xl px-3 py-2">
          <option value="">เกียร์ทั้งหมด</option>
          <option value="auto">ออโต้</option>
          <option value="manual">ธรรมดา</option>
        </select>
        <input name="location" placeholder="พื้นที่" defaultValue={location} className="border rounded-xl px-3 py-2" />
        <input name="min" type="number" placeholder="ราคาเริ่ม" defaultValue={min} className="border rounded-xl px-3 py-2" />
        <input name="max" type="number" placeholder="ราคาสูงสุด" defaultValue={max} className="border rounded-xl px-3 py-2" />
        <button className="md:col-span-5 bg-black text-white px-4 py-2 rounded-xl">กรอง</button>
      </form>

      {bikes.length === 0 ? (
        <div className="text-gray-500">เงียบกว่าถนนตอนตีสาม ลองเปลี่ยนตัวกรองดูนะ 🙌</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {bikes.map(b => <BikeCard key={b.id} bike={b} />)}
        </div>
      )}
    </div>
  )
}
```

### src/app/bikes/[id]/page.tsx (Detail + booking form)
```tsx
import Image from 'next/image'
import { prisma } from '@/src/lib/prisma'

export default async function BikeDetail({ params }: { params: { id: string } }) {
  const bike = await prisma.bike.findUnique({ where: { id: params.id } })
  if (!bike) return <div>ไม่พบรถ</div>
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="relative w-full h-72 md:h-[28rem] rounded-2xl overflow-hidden border">
        <Image src={bike.imageUrl} alt={bike.model} fill className="object-cover" />
      </div>
      <div>
        <h1 className="text-2xl font-bold">{bike.model} ({bike.year})</h1>
        <div className="text-gray-600">{bike.transmission === 'auto' ? 'ออโต้' : 'ธรรมดา'} · {bike.location}</div>
        <p className="mt-3 whitespace-pre-line">{bike.description}</p>
        <div className="mt-4 text-2xl font-extrabold">฿{bike.pricePerDay}/วัน</div>
        <form action={createBooking} className="mt-4 space-y-3">
          <input type="hidden" name="bikeId" value={bike.id} />
          <label className="block">วันที่รับ
            <input type="date" name="startDate" required className="mt-1 w-full border rounded-xl px-3 py-2" />
          </label>
          <label className="block">วันที่คืน
            <input type="date" name="endDate" required className="mt-1 w-full border rounded-xl px-3 py-2" />
          </label>
          <button className="bg-black text-white px-4 py-2 rounded-xl">จองรถคันนี้</button>
        </form>
        <small className="block mt-2 text-gray-500">สมาชิกสะสมแต้ม + รับส่วนลดทันที</small>
      </div>
    </div>
  )
}

async function createBooking(formData: FormData) {
  'use server'
  const payload = Object.fromEntries(formData.entries())
  await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}
```

---

## 👤 Page: /profile
```tsx
import { getServerSession } from 'next-auth'
import { authConfig } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'

export default async function ProfilePage() {
  const session = await getServerSession(authConfig)
  if (!session) return <div>โปรดเข้าสู่ระบบ</div>
  const bookings = await prisma.booking.findMany({ where: { userId: (session as any).user.id }, include: { bike: true }, orderBy: { createdAt: 'desc' } })
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">โปรไฟล์ของฉัน</h1>
      <div className="text-sm text-gray-600">อีเมล: {session.user?.email}</div>
      <h2 className="font-semibold">การจองล่าสุด</h2>
      <div className="space-y-3">
        {bookings.map(b => (
          <div key={b.id} className="rounded-xl border p-3">
            <div className="font-medium">{b.bike.model}</div>
            <div className="text-sm">{new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()} • ฿{b.total} • {b.status}</div>
          </div>
        ))}
        {bookings.length === 0 && <div className="text-gray-500">ยังไม่มีการจอง</div>}
      </div>
    </div>
  )
}
```

---

## 🛠️ Admin: /admin
```tsx
import RequireRole from '@/src/components/RequireRole'
import Link from 'next/link'

export default async function AdminIndex() {
  return (
    <RequireRole role="ADMIN">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">หลังบ้าน</h1>
        <div className="grid gap-3">
          <Link href="/admin/bikes" className="underline">จัดการรถ</Link>
        </div>
      </div>
    </RequireRole>
  )
}
```

---

## 🛠️ Admin: /admin/bikes (list)
```tsx
import RequireRole from '@/src/components/RequireRole'
import { prisma } from '@/src/lib/prisma'
import Link from 'next/link'

export default async function AdminBikes() {
  const bikes = await prisma.bike.findMany({ orderBy: { createdAt: 'desc' } })
  return (
    <RequireRole role="ADMIN">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">รถทั้งหมด</h1>
          <Link href="/admin/bikes/new" className="bg-black text-white px-4 py-2 rounded-xl">เพิ่มรถ</Link>
        </div>
        <div className="space-y-2">
          {bikes.map(b => (
            <div key={b.id} className="border rounded-xl p-3 flex items-center justify-between">
              <div>
                <div className="font-semibold">{b.model} • ฿{b.pricePerDay}/วัน</div>
                <div className="text-sm text-gray-600">{b.year} · {b.transmission} · {b.location}</div>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/bikes/${b.id}/edit`} className="px-3 py-2 border rounded-xl">แก้ไข</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </RequireRole>
  )
}
```

---

## 🛠️ Admin: /admin/bikes/new (create)
```tsx
import RequireRole from '@/src/components/RequireRole'

export default function NewBikePage() {
  return (
    <RequireRole role="ADMIN">
      <div className="space-y-4 max-w-xl">
        <h1 className="text-2xl font-bold">เพิ่มรถใหม่</h1>
        <form action={createBike} className="space-y-3">
          <input name="model" placeholder="รุ่น" className="border rounded-xl px-3 py-2 w-full" required />
          <input name="year" type="number" placeholder="ปี" className="border rounded-xl px-3 py-2 w-full" required />
          <select name="transmission" className="border rounded-xl px-3 py-2 w-full"><option value="auto">ออโต้</option><option value="manual">ธรรมดา</option></select>
          <input name="pricePerDay" type="number" placeholder="ราคา/วัน" className="border rounded-xl px-3 py-2 w-full" required />
          <input name="location" placeholder="พื้นที่" className="border rounded-xl px-3 py-2 w-full" required />
          <input name="imageUrl" placeholder="ลิงก์รูป" className="border rounded-xl px-3 py-2 w-full" required />
          <textarea name="description" placeholder="รายละเอียด" className="border rounded-xl px-3 py-2 w-full" required />
          <button className="bg-black text-white px-4 py-2 rounded-xl">บันทึก</button>
        </form>
      </div>
    </RequireRole>
  )
}

async function createBike(fd: FormData) {
  'use server'
  const body = Object.fromEntries(fd.entries())
  body.year = Number(body.year)
  body.pricePerDay = Number(body.pricePerDay)
  await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/bikes`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  })
}
```

---

## 🛠️ Admin: /admin/bikes/[id]/edit (update)
```tsx
import RequireRole from '@/src/components/RequireRole'
import { prisma } from '@/src/lib/prisma'

export default async function EditBikePage({ params }: { params: { id: string } }) {
  const bike = await prisma.bike.findUnique({ where: { id: params.id } })
  if (!bike) return <div>ไม่พบรถ</div>
  return (
    <RequireRole role="ADMIN">
      <div className="space-y-4 max-w-xl">
        <h1 className="text-2xl font-bold">แก้ไข: {bike.model}</h1>
        <form action={updateBike} className="space-y-3">
          <input type="hidden" name="id" defaultValue={bike.id} />
          <input name="model" defaultValue={bike.model} className="border rounded-xl px-3 py-2 w-full" />
          <input name="year" type="number" defaultValue={bike.year} className="border rounded-xl px-3 py-2 w-full" />
          <select name="transmission" defaultValue={bike.transmission} className="border rounded-xl px-3 py-2 w-full"><option value="auto">ออโต้</option><option value="manual">ธรรมดา</option></select>
          <input name="pricePerDay" type="number" defaultValue={bike.pricePerDay} className="border rounded-xl px-3 py-2 w-full" />
          <input name="location" defaultValue={bike.location} className="border rounded-xl px-3 py-2 w-full" />
          <input name="imageUrl" defaultValue={bike.imageUrl} className="border rounded-xl px-3 py-2 w-full" />
          <textarea name="description" defaultValue={bike.description} className="border rounded-xl px-3 py-2 w-full" />
          <button className="bg-black text-white px-4 py-2 rounded-xl">อัปเดต</button>
        </form>
      </div>
    </RequireRole>
  )
}

async function updateBike(fd: FormData) {
  'use server'
  const body = Object.fromEntries(fd.entries()) as any
  const id = body.id
  delete body.id
  body.year = Number(body.year)
  body.pricePerDay = Number(body.pricePerDay)
  await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/bikes/${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  })
}
```

---

## ✅ Notes
- This MVP focuses on **core flows**: Auth → Browse → Book → Admin CRUD
- Add-ons to consider: payment gateway, email notifications, image upload (S3), booking overlap checks, discount codes, points system
- For production, rotate `NEXTAUTH_SECRET`, switch DB to Postgres, add input validation (Zod) and CSRF protection
