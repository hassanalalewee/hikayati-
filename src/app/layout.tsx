import type { Metadata } from 'next'
import { Cairo, Noto_Sans_Arabic } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
})

const notoArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  variable: '--font-noto-arabic',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'حكايتي — قصص عربية شخصية لطفلك',
  description: 'منصة الذكاء الاصطناعي لإنشاء قصص أطفال عربية شخصية حيث يصبح طفلك بطل القصة',
  keywords: 'قصص أطفال, قصص عربية, تربية الأطفال, ذكاء اصطناعي, قصص شخصية',
  openGraph: {
    title: 'حكايتي — قصص عربية شخصية لطفلك',
    description: 'اجعل طفلك بطل قصته مع حكايتي',
    locale: 'ar_SA',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${cairo.variable} ${notoArabic.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
