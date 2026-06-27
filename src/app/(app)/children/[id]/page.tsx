import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, PenLine, BookOpen } from 'lucide-react'
import DeleteChildButton from '@/components/child/DeleteChildButton'

export default async function ChildDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: child } = await supabase
    .from('children').select('*').eq('id', id).eq('user_id', user.id).single()
  if (!child) notFound()

  const { data: stories } = await supabase
    .from('stories').select('*').eq('child_id', id).eq('status', 'complete')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-paper-50" dir="rtl">
      <header className="bg-white border-b border-paper-300 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/dashboard" className="text-ink-400 hover:text-ink-950 transition-colors">
            <ArrowRight className="w-5 h-5" />
          </Link>
          <h1 className="font-bold text-lg text-ink-950 flex-1">ملف {child.name}</h1>
          <DeleteChildButton childId={id} childName={child.name} />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-paper-300 p-6 flex items-center gap-5 shadow-card">
          <div className="w-20 h-20 rounded-2xl bg-paper-200 flex items-center justify-center text-4xl flex-shrink-0">
            {child.gender === 'male' ? '👦' : '👧'}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-ink-950">{child.name}</h2>
            <p className="text-ink-400 mt-1">{child.age} سنوات · {child.gender === 'male' ? 'ولد' : 'بنت'}</p>
            {child.country && <p className="text-ink-200 text-sm mt-0.5">{child.country}</p>}
          </div>
        </div>

        {/* Details */}
        <div className="bg-white rounded-2xl border border-paper-300 p-5 space-y-4 shadow-card">
          {child.hobbies?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-ink-200 uppercase tracking-wide mb-2">الهوايات</p>
              <div className="flex flex-wrap gap-2">
                {child.hobbies.map((h: string) => (
                  <span key={h} className="bg-paper-100 text-ink-600 text-sm px-3 py-1 rounded-full border border-paper-300">{h}</span>
                ))}
              </div>
            </div>
          )}
          {child.favorite_color && (
            <div>
              <p className="text-xs font-semibold text-ink-200 uppercase tracking-wide mb-1">اللون المفضل</p>
              <p className="text-ink-600">{child.favorite_color}</p>
            </div>
          )}
          {child.favorite_animal && (
            <div>
              <p className="text-xs font-semibold text-ink-200 uppercase tracking-wide mb-1">الحيوان المفضل</p>
              <p className="text-ink-600">{child.favorite_animal}</p>
            </div>
          )}
        </div>

        {/* CTA */}
        <Link
          href={`/stories/create?childId=${id}`}
          className="flex items-center justify-center gap-2 bg-[#C9A84C] text-ink-950 py-4 rounded-2xl font-bold hover:bg-[#D9BC76] transition-colors"
        >
          <PenLine className="w-5 h-5" />
          اطلب قصة جديدة لـ {child.name}
        </Link>

        {/* Stories */}
        {stories && stories.length > 0 && (
          <section>
            <h3 className="text-lg font-bold text-ink-950 mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#C9A84C]" />
              قصص {child.name}
            </h3>
            <div className="space-y-3">
              {stories.map(story => (
                <Link key={story.id} href={`/stories/${story.id}`}
                  className="block bg-white rounded-2xl border border-paper-300 p-4 hover:border-teal-600 transition-colors shadow-card">
                  <p className="font-bold text-ink-950">{story.title}</p>
                  <p className="text-sm text-ink-200 mt-1">{new Date(story.created_at).toLocaleDateString('ar-SA')}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {stories?.length === 0 && (
          <div className="bg-white rounded-2xl border-2 border-dashed border-paper-300 p-8 text-center text-ink-200">
            <p className="text-3xl mb-2">📖</p>
            <p>لا توجد قصص بعد</p>
          </div>
        )}
      </main>
    </div>
  )
}
