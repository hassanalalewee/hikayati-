import Link from 'next/link'
import { BookOpen, Sparkles, Star, Shield, Globe } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Nav */}
      <nav className="border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            <span className="font-bold text-xl text-slate-900">حكايتي</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-slate-600 text-sm font-medium hover:text-slate-900">
              تسجيل الدخول
            </Link>
            <Link href="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700">
              ابدأ مجاناً
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          مدعوم بأحدث تقنيات الذكاء الاصطناعي
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight mb-6">
          اجعل طفلك<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-l from-indigo-600 to-purple-600">
            بطل قصته
          </span>
        </h1>
        <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          قصص عربية شخصية تُحقق أهدافك التربوية — يُنشئها الذكاء الاصطناعي في 90 ثانية بجودة كتب الأطفال الاحترافية
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/register" className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors">
            ابدأ أول قصة مجاناً ✨
          </Link>
          <Link href="#how-it-works" className="border border-slate-200 text-slate-700 px-8 py-4 rounded-xl font-medium text-lg hover:bg-slate-50">
            كيف يعمل؟
          </Link>
        </div>
        <p className="text-sm text-slate-400 mt-4">بدون بطاقة ائتمانية • قصة مجانية كاملة</p>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-slate-50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">كيف يعمل حكايتي؟</h2>
          <div className="grid sm:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'اختر الهدف', desc: 'الصدق، الشجاعة، الثقة — 16 هدفاً تربوياً', icon: '🎯' },
              { step: '2', title: 'أخبرنا عن طفلك', desc: 'الاسم والعمر والهوايات لقصة مخصصة 100%', icon: '👦' },
              { step: '3', title: 'الذكاء الاصطناعي يبدع', desc: '12 وكيل ذكاء اصطناعي يعملون معاً', icon: '✨' },
              { step: '4', title: 'استمتع بالنتيجة', desc: 'قصة + رسوم + صوت + دليل الوالدين', icon: '📖' },
            ].map(item => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-2xl mx-auto mb-4">
                  {item.icon}
                </div>
                <div className="text-xs text-indigo-600 font-bold mb-1">الخطوة {item.step}</div>
                <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Hikayati */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">لماذا حكايتي؟</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { icon: <Star className="w-6 h-6 text-amber-500" />, title: 'جودة أدبية حقيقية', desc: '12 وكيل ذكاء اصطناعي متخصص ينتجون قصصاً بجودة كتب الأطفال الاحترافية' },
            { icon: <Shield className="w-6 h-6 text-green-500" />, title: 'آمن ومُثري تربوياً', desc: 'قصص تُعلّم بالتجربة لا بالوعظ، آمنة عاطفياً، ومبنية على علم نفس الطفولة' },
            { icon: <Globe className="w-6 h-6 text-indigo-500" />, title: 'عربي 100%', desc: 'فصحى وخليجية وشامية ومصرية — محتوى أصيل لا مترجم' },
          ].map(item => (
            <div key={item.title} className="bg-slate-50 rounded-2xl p-6">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm">
                {item.icon}
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-l from-indigo-600 to-purple-700 py-16 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">ابدأ رحلة طفلك اليوم</h2>
          <p className="text-indigo-100 mb-8">قصة مجانية كاملة — بدون بطاقة ائتمانية</p>
          <Link href="/register" className="inline-block bg-white text-indigo-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-colors">
            إنشاء حساب مجاني ✨
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-slate-700">حكايتي</span>
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-slate-600">الخصوصية</Link>
            <Link href="/terms" className="hover:text-slate-600">الشروط</Link>
            <Link href="mailto:hello@hikayati.ai" className="hover:text-slate-600">تواصل معنا</Link>
          </div>
          <p>© 2026 حكايتي. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  )
}
