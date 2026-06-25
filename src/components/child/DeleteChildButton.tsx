'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export default function DeleteChildButton({ childId, childName }: { childId: string; childName: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    const res = await fetch(`/api/children/${childId}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/dashboard')
      router.refresh()
    } else {
      setLoading(false)
      setConfirming(false)
      alert('حدث خطأ أثناء الحذف')
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500">حذف {childName}؟</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs bg-red-600 text-white px-2 py-1 rounded-lg hover:bg-red-700 disabled:opacity-60"
        >
          {loading ? '...' : 'نعم'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs text-slate-500 px-2 py-1 rounded-lg hover:bg-slate-100"
        >
          لا
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-slate-400 hover:text-red-500 transition-colors"
      title="حذف الطفل"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}
