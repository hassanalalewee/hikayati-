export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { BookOpen, Star, Shield, Globe, PenLine } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]" dir="rtl">

      {/* Nav */}
      <nav className="border-b border-[#E8E4DC] sticky top-0 bg-[#FAFAF8]/90 backdrop-blur z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#C9A84C]" />
            <span className="font-bold text-xl">
              <span className="text-[#C9A84C]">ح</span><span className="text-[#1A1814]">كايتي</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-[#6B6560] text-sm font-medium hover:text-[#1A1814] transition-colors">
              تسجيل الدخول
            </Link>
            <Link href="/register" className="bg-[#C9A84C] text-[#1A1814] px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#D9BC76] transition-colors">
              اطلب قصة طفلك
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
          <span className="text-[#1A1814]">قصة طفلك،</span><br />
          <span className="text-[#C9A84C]">كُتبت له وحده</span>
        </h1>
        <p className="text-xl text-[#4B4640] mb-4 max-w-2xl mx-auto leading-relaxed">
          نكتب لطفلك قصةً مخصوصةً به — مراجعةً ومعتمدةً من فريق تحريري متخصص في أدب الأطفال.
        </p>
        <p className="text-base text-[#6B6560] mb-10 max-w-xl mx-auto leading-relaxed">
          أخبرنا عن طفلك، وفريقنا يتولى الباقي.
        </p>
        <Link
          href="/register"
          className="inline-block bg-[#C9A84C] text-[#1A1814] px-10 py-4 rounded-xl font-bold text-lg hover:bg-[#D9BC76] transition-colors"
        >
          اطلب قصة طفلك الآن
        </Link>
        <p className="text-sm text-[#9B9590] mt-4">جاهزة خلال 24 ساعة • مراجعة بشرية مضمونة</p>
      </section>

      {/* Trust banner */}
      <section className="bg-[#F5F0E8] border-y border-[#C9A84C]/30 py-5">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-[#4B4640]">
            <div className="flex items-center gap-2">
              <span className="text-[#C9A84C]">✓</span>
              <span>مراجعة بشرية لكل قصة</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-[#C9A84C]/30" />
            <div className="flex items-center gap-2">
              <span className="text-[#C9A84C]">✓</span>
              <span>عربي أصيل بلهجتك</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-[#C9A84C]/30" />
            <div className="flex items-center gap-2">
              <span className="text-[#C9A84C]">✓</span>
              <span>آمن للأطفال ومعتمد تربوياً</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-[#C9A84C]/30" />
            <div className="flex items-center gap-2">
              <span className="text-[#C9A84C]">✓</span>
              <span>إذا لم تُعجبك نعيد الكتابة مجاناً</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-[#1A1814] mb-4">كيف يعمل حكايتي؟</h2>
        <p className="text-center text-[#6B6560] mb-14">ثلاث خطوات بسيطة — وفريقنا يتولى الباقي</p>
        <div className="grid sm:grid-cols-3 gap-8">
          {[
            {
              number: '١',
              title: 'أخبرنا عن طفلك',
              desc: 'الاسم، العمر، الشخصية، والدرس الذي تريده أن يتعلمه اليوم.',
              icon: '👦',
            },
            {
              number: '٢',
              title: 'فريقنا يكتب القصة',
              desc: 'فريقنا التحريري يراجع كل كلمة — اللغة، السلامة العاطفية، والقيمة التربوية.',
              icon: '✍️',
            },
            {
              number: '٣',
              title: 'استلم قصة طفلك',
              desc: 'قصة مُصوّرة مخصصة، قابلة للتحميل والطباعة، ستبقى في ذاكرة طفلك.',
              icon: '📖',
            },
          ].map(item => (
            <div key={item.number} className="text-center">
              <div className="w-16 h-16 bg-white border border-[#E8E4DC] rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5 shadow-sm">
                {item.icon}
              </div>
              <div className="text-xs text-[#9B9590] font-medium mb-2">الخطوة {item.number}</div>
              <h3 className="font-bold text-[#1A1814] text-lg mb-2">{item.title}</h3>
              <p className="text-sm text-[#6B6560] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Editorial trust section */}
      <section className="bg-white border-y border-[#E8E4DC] py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="w-14 h-14 bg-[#FAFAF8] border border-[#E8E4DC] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <PenLine className="w-6 h-6 text-[#1A1814]" />
          </div>
          <h2 className="text-2xl font-bold text-[#1A1814] mb-4">
            كل قصة تمرّ بمراجعة بشرية متخصصة
          </h2>
          <p className="text-[#4B4640] leading-relaxed mb-6">
            فريقنا التحريري من خبراء اللغة العربية وأدب الأطفال.
            قبل أن تصل القصة إليك، يقرأها محرر متخصص ويتحقق من جودة اللغة،
            والسلامة العاطفية، والقيم التربوية — كل مرة، بلا استثناء.
          </p>
          <div className="inline-flex items-center gap-2 bg-[#F5F0E8] border border-[#C9A84C]/40 rounded-xl px-5 py-3 text-sm text-[#4B4640]">
            <span className="text-[#C9A84C]">✓</span>
            راجعها فريقنا التحريري — كل كلمة، كل مرة
          </div>
        </div>
      </section>

      {/* Why Hikayati */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-[#1A1814] mb-14">لماذا حكايتي؟</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              icon: <Star className="w-5 h-5 text-[#C9A84C]" />,
              title: 'مخصصة لطفلك وحده',
              desc: 'قصة كُتبت حول اسم طفلك، شخصيته، والدرس الذي يحتاجه الآن — ليست قالباً جاهزاً.',
            },
            {
              icon: <Shield className="w-5 h-5 text-[#C9A84C]" />,
              title: 'آمنة ومعتمدة تربوياً',
              desc: 'كل قصة مراجعة للتأكد من السلامة العاطفية والملاءمة التربوية لعمر طفلك.',
            },
            {
              icon: <Globe className="w-5 h-5 text-[#C9A84C]" />,
              title: 'عربي أصيل بلهجتك',
              desc: 'فصحى، خليجية، شامية، أو مصرية — محتوى أصيل كُتب بالعربية، لا مترجم.',
            },
          ].map(item => (
            <div key={item.title} className="bg-white border border-[#E8E4DC] rounded-2xl p-6">
              <div className="w-10 h-10 bg-[#F5F0E8] rounded-xl flex items-center justify-center mb-4">
                {item.icon}
              </div>
              <h3 className="font-bold text-[#1A1814] mb-2">{item.title}</h3>
              <p className="text-sm text-[#6B6560] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#F5F0E8] py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center text-[#1A1814] mb-10">آراء الآباء والأمهات</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                text: '"بكت ابنتي حين رأت اسمها في القصة. لم أتوقع هذا الأثر."',
                name: 'مريم، الرياض',
                stars: 5,
              },
              {
                text: '"أخيراً قصة عربية تشعر أن أحداً يعرف طفلي فعلاً."',
                name: 'طارق، لندن',
                stars: 5,
              },
            ].map(t => (
              <div key={t.name} className="bg-white rounded-2xl p-6 border border-[#E8E4DC]">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <span key={i} className="text-[#C9A84C] text-sm">★</span>
                  ))}
                </div>
                <p className="text-[#1A1814] leading-relaxed mb-4">{t.text}</p>
                <p className="text-sm text-[#9B9590]">— {t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <div className="max-w-xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-[#1A1814] mb-4">أهدِ طفلك قصته اليوم</h2>
          <p className="text-[#6B6560] mb-8">قصة مخصصة، مراجعة من فريقنا، جاهزة خلال 24 ساعة.</p>
          <Link
            href="/register"
            className="inline-block bg-[#C9A84C] text-[#1A1814] px-10 py-4 rounded-xl font-bold text-lg hover:bg-[#D9BC76] transition-colors"
          >
            اطلب قصة طفلك الآن
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E8E4DC] py-8 bg-white">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#9B9590]">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#C9A84C]" />
            <span className="font-bold">
              <span className="text-[#C9A84C]">ح</span><span className="text-[#1A1814]">كايتي</span>
            </span>
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-[#1A1814] transition-colors">الخصوصية</Link>
            <Link href="/terms" className="hover:text-[#1A1814] transition-colors">الشروط</Link>
            <Link href="mailto:hello@hikayati.com" className="hover:text-[#1A1814] transition-colors">تواصل معنا</Link>
          </div>
          <p>© 2026 حكايتي. جميع الحقوق محفوظة.</p>
        </div>
      </footer>

    </div>
  )
}
