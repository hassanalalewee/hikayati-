export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div dir="rtl" className="min-h-screen bg-[#FAFAF8]">
      <header className="border-b border-[#E8E4DC] bg-white">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-bold text-[#1A1814] text-lg">حكايتي — لوحة التحرير</span>
            <nav className="flex items-center gap-4 text-sm">
              <a href="/editor/queue" className="text-[#6B6560] hover:text-[#1A1814] transition-colors">
                طابور المراجعة
              </a>
            </nav>
          </div>
          <a href="/dashboard" className="text-sm text-[#6B6560] hover:text-[#1A1814]">
            لوحة تحكم الأسرة
          </a>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}
