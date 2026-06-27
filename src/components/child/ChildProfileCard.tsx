'use client'

import Link from 'next/link'
import Image from 'next/image'
import { PenLine } from 'lucide-react'
import type { Child } from '@/types'

interface Props {
  child: Child
}

export function ChildProfileCard({ child }: Props) {
  return (
    <div className="group">
      <Link
        href={`/children/${child.id}`}
        className="block bg-white rounded-2xl border border-paper-300 p-5 hover:border-teal-600 hover:shadow-card transition-all duration-200"
      >
        {/* Avatar */}
        <div className="w-14 h-14 rounded-2xl bg-paper-200 flex items-center justify-center mb-3 mx-auto overflow-hidden">
          {child.photo_url ? (
            <Image
              src={child.photo_url}
              alt={child.name}
              width={56}
              height={56}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl select-none">
              {child.gender === 'male' ? '👦' : '👧'}
            </span>
          )}
        </div>

        {/* Name + age */}
        <div className="text-center">
          <p className="font-bold text-ink-950 text-sm">{child.name}</p>
          <p className="text-xs text-ink-200 mt-0.5">{child.age} سنوات</p>
        </div>
      </Link>

      {/* New story CTA */}
      <div className="mt-2 flex justify-center">
        <Link
          href={`/stories/create?childId=${child.id}`}
          className="inline-flex items-center gap-1.5 text-xs text-teal-600 font-semibold bg-teal-50 px-3 py-1.5 rounded-lg hover:bg-teal-100 transition-colors"
        >
          <PenLine className="w-3 h-3" />
          قصة جديدة
        </Link>
      </div>
    </div>
  )
}
