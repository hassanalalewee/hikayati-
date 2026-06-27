'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function Redirect() {
  const router      = useRouter()
  const searchParams = useSearchParams()
  const childId     = searchParams.get('childId')

  useEffect(() => {
    router.replace(childId ? `/order/new?childId=${childId}` : '/order/new')
  }, [router, childId])

  return (
    <div className="min-h-screen bg-paper-50 flex items-center justify-center" dir="rtl">
      <p className="text-ink-400 text-sm">جاري التحويل...</p>
    </div>
  )
}

export default function CreateStoryPage() {
  return <Suspense><Redirect /></Suspense>
}
