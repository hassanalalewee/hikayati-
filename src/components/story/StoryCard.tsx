import Link from 'next/link'
import Image from 'next/image'
import { BookOpen } from 'lucide-react'

interface StoryCardProps {
  story: {
    id: string
    title: string
    cover_url: string | null
    child_id: string
    created_at: string
    goals: string[]
    story_assets?: { url: string; type: string; page_num: number | null }[]
  }
}

export function StoryCard({ story }: StoryCardProps) {
  const coverAsset = story.story_assets?.find(a => a.type === 'cover')
  const coverUrl = story.cover_url || coverAsset?.url

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return 'اليوم'
    if (days === 1) return 'أمس'
    if (days < 7) return `${days} أيام`
    if (days < 30) return `${Math.floor(days / 7)} أسابيع`
    return `${Math.floor(days / 30)} أشهر`
  }

  return (
    <Link href={`/stories/${story.id}`} className="group">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
        {/* Cover */}
        <div className="relative aspect-square bg-gradient-to-br from-indigo-50 to-purple-50">
          {coverUrl ? (
            <Image src={coverUrl} alt={story.title} fill className="object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-indigo-200" />
            </div>
          )}
        </div>
        {/* Info */}
        <div className="p-3">
          <h3 className="font-bold text-slate-800 text-sm truncate">{story.title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{timeAgo(story.created_at)}</p>
        </div>
      </div>
    </Link>
  )
}
