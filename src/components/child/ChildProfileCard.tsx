'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Sparkles } from 'lucide-react'
import type { Child } from '@/types'

interface Props {
  child: Child
}

export function ChildProfileCard({ child }: Props) {
  return (
    <div className="group">
      <Link href={`/children/${child.id}`} className="block bg-white rounded-2xl border border-slate-200 p-4 hover:border-indigo-300 hover:shadow-sm transition-all">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mb-3 mx-auto overflow-hidden">
          {child.photo_url ? (
            <Image src={child.photo_url} alt={child.name} width={56} height={56} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl">{child.gender === 'male' ? '👦' : '👧'}</span>
          )}
        </div>
        <div className="text-center">
          <p className="font-bold text-slate-900 text-sm">{child.name}</p>
          <p className="text-xs text-slate-400 mt-0.5">{child.age} سنوات</p>
        </div>
      </Link>
      <div className="mt-2 flex justify-center">
        <Link
          href={`/stories/create?childId=${child.id}`}
          className="inline-flex items-center gap-1 text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-1 rounded-lg hover:bg-indigo-100"
        >
          <Sparkles className="w-3 h-3" />
          قصة جديدة
        </Link>
      </div>
    </div>
  )
}
