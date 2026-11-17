export default function HomePage(){
  return (
    <main className="max-w-5xl mx-auto p-6">
      <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_25px_40px_-10px_rgba(20,70,35,0.35)] text-center">
        <h1 className="text-5xl font-black text-[#123321] tracking-tight">Driving School</h1>
        <p className="text-[#4a7a58] mt-3 text-lg">Next.js 16.3.4 · React 19 · Prisma 6.19 · Supabase · Fixed Pool Type</p>
        <p className="text-sm text-gray-400 mt-1">Build error TS2345 fixed with connectionString adapter</p>

        <div className="mt-10 grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <a href="/student" className="group bg-[#f3faf5] border-2 border-[#cbe4d3] rounded-[1.8rem] p-8 hover:border-[#1a7a3a] hover:bg-white transition text-left">
            <div className="text-5xl mb-4">🎓</div>
            <h2 className="text-2xl font-bold text-[#123321]">Student</h2>
            <p className="text-[#5b8a6a] mt-2 text-sm">Take K53 learner test · 60 SA signs with emojis · 70% pass · Progress bar</p>
            <div className="mt-6 inline-flex px-5 py-2 rounded-full bg-[#1a7a3a] text-white font-semibold group-hover:bg-[#14612d]">Start Learning →</div>
          </a>

          <a href="/admin" className="group bg-[#123321] rounded-[1.8rem] p-8 hover:bg-[#0f2a1b] transition text-left text-white">
            <div className="text-5xl mb-4">🛠️</div>
            <h2 className="text-2xl font-bold">Admin</h2>
            <p className="text-[#a9cbb5] mt-2 text-sm">CRUD questions · Upload sign images to Supabase · Edit sign types & controls</p>
            <div className="mt-6 inline-flex px-5 py-2 rounded-full bg-white text-[#123321] font-semibold">Manage Questions →</div>
          </a>
        </div>

        <div className="mt-10 text-xs text-gray-400 bg-gray-50 rounded-xl p-4 max-w-3xl mx-auto text-left font-mono">
          <div>✓ Fixed: lib/prisma.ts now uses PrismaPg({`{ connectionString }`}) not Pool</div>
          <div>✓ Routes: / (home) · /student (test) · /admin (crud)</div>
          <div>✓ Seed: 60 SA questions (40 signs, 10 rules, 10 controls)</div>
        </div>
      </div>
    </main>
  )
}
