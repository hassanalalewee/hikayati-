import Link from 'next/link'
import Image from 'next/image'
import { BookOpen } from 'lucide-react'
import { getGoalColor } from '@/lib/constants'

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

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'اليوم'
  if (days === 1) return 'أمس'
  if (days < 7) return `${days} أيام`
  if (days < 30) return `${Math.floor(days / 7)} أسابيع`
  return `${Math.floor(days / 30)} أشهر`
}

export function StoryCard({ story }: StoryCardProps) {
  const coverAsset = story.story_assets?.find(a => a.type === 'cover')
  const coverUrl   = story.cover_url || coverAsset?.url
  const primaryGoal = story.goals?.[0] ?? ''
  const mood = getGoalColor(primaryGoal)

  return (
    <Link href={`/stories/${story.id}`} className="group block">
      <div
        className="bg-white rounded-2xl border overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-200"
        style={{ borderColor: mood.border }}
      >
        {/* Cover — portrait book format with goal mood background */}
        <div
          className="relative aspect-[3/4]"
          style={{ backgroundColor: mood.bg }}
        >
          {coverUrl ? (
            <Image src={coverUrl} alt={story.title} fill className="object-cover" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <BookOpen className="w-10 h-10" style={{ color: mood.accent, opacity: 0.4 }} />
            </div>
          )}

          {/* Goal badge — bottom of cover */}
          {primaryGoal && (
            <div
              className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold"
              style={{ backgroundColor: mood.accent + '22', color: mood.accent }}
            >
              {mood.label}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          {/* Colored spine accent line */}
          <div
            className="w-8 h-0.5 rounded-full mb-2"
            style={{ backgroundColor: mood.accent }}
          />
          <h3 className="font-bold text-ink-950 text-sm truncate leading-snug">
            {story.title}
          </h3>
          <p className="text-xs text-ink-200 mt-1">{timeAgo(story.created_at)}</p>
        </div>
      </div>
    </Link>
  )
}
