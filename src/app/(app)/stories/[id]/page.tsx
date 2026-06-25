import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, BookOpen, Download, Heart } from 'lucide-react'
import { ParentGuideSection } from '@/components/story/ParentGuideSection'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function StoryPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [storyRes, assetsRes, guideRes] = await Promise.all([
    supabase.from('stories').select('*, children(name, age, gender)').eq('id', id).eq('user_id', user.id).single(),
    supabase.from('story_assets').select('*').eq('story_id', id).order('page_num'),
    supabase.from('parent_guides').select('*').eq('story_id', id).single(),
  ])

  if (!storyRes.data) notFound()

  const story = storyRes.data
  const assets = assetsRes.data || []
  const guide = guideRes.data
  const cover = assets.find(a => a.type === 'cover')
  const pages = assets.filter(a => a.type === 'page').sort((a, b) => (a.page_num ?? 0) - (b.page_num ?? 0))

  const childName = (story.children as { name: string } | null)?.name || 'طفلك'

  // Increment view count
  await supabase.from('stories').update({ view_count: story.view_count + 1 }).eq('id', id)

  // Split story body into paragraphs
  const paragraphs = story.body.split('\n').filter((p: string) => p.trim().length > 0)

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
            <ArrowRight className="w-5 h-5" />
            <span className="text-sm font-medium">الرجوع</span>
          </Link>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
              <Heart className="w-5 h-5" />
            </button>
            {story.pdf_url && (
              <a href={story.pdf_url} target="_blank" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
                <Download className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {/* Cover */}
        {cover && (
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-lg">
            <Image src={cover.url} alt={`غلاف قصة ${childName}`} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 right-4 left-4 text-white">
              <h1 className="text-2xl font-bold">{story.title}</h1>
              {story.subtitle && <p className="text-white/80 text-sm mt-1">{story.subtitle}</p>}
            </div>
          </div>
        )}

        {!cover && (
          <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl p-8 text-center">
            <BookOpen className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-slate-900">{story.title}</h1>
            {story.subtitle && <p className="text-slate-500 text-sm mt-2">{story.subtitle}</p>}
          </div>
        )}

        {/* Story Body with interleaved illustrations */}
        <article className="bg-white rounded-2xl p-6 space-y-6">
          {paragraphs.map((paragraph: string, idx: number) => {
            const pageAsset = pages[Math.floor(idx / Math.ceil(paragraphs.length / pages.length))]

            return (
              <div key={idx}>
                {pageAsset && idx > 0 && idx % Math.ceil(paragraphs.length / pages.length) === 0 && (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden my-4">
                    <Image src={pageAsset.url} alt={pageAsset.alt_text || ''} fill className="object-cover" />
                    {pageAsset.alt_text && (
                      <div className="absolute bottom-2 right-2 left-2 text-xs text-white/90 text-center bg-black/30 rounded px-2 py-1">
                        {pageAsset.alt_text}
                      </div>
                    )}
                  </div>
                )}
                <p className="story-body">{paragraph}</p>
              </div>
            )
          })}
        </article>

        {/* Parent Guide */}
        {guide && <ParentGuideSection guide={guide} childName={childName} />}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pb-6">
          <Link
            href="/stories/create"
            className="bg-indigo-600 text-white py-3 rounded-xl text-center font-bold text-sm hover:bg-indigo-700"
          >
            ✨ قصة جديدة
          </Link>
          {story.pdf_url ? (
            <a
              href={story.pdf_url}
              target="_blank"
              className="bg-white border border-slate-200 text-slate-700 py-3 rounded-xl text-center font-medium text-sm hover:bg-slate-50"
            >
              📄 تنزيل PDF
            </a>
          ) : (
            <button className="bg-white border border-slate-200 text-slate-400 py-3 rounded-xl text-center font-medium text-sm cursor-not-allowed">
              📄 PDF قريباً
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
