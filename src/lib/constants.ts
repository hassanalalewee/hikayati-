import type { DevelopmentCategory } from '@/types'

export const GOALS: { id: DevelopmentCategory; label: string; icon: string; category: string }[] = [
  // Character
  { id: 'honesty', label: 'الصدق', icon: '🤝', category: 'الشخصية' },
  { id: 'responsibility', label: 'المسؤولية', icon: '⚡', category: 'الشخصية' },
  { id: 'courage', label: 'الشجاعة', icon: '🦁', category: 'الشخصية' },
  { id: 'gratitude', label: 'الامتنان', icon: '🙏', category: 'الشخصية' },
  { id: 'discipline', label: 'الانضباط', icon: '🎯', category: 'الشخصية' },
  // Social
  { id: 'friendship', label: 'الصداقة', icon: '👫', category: 'الاجتماعي' },
  { id: 'kindness', label: 'اللطف', icon: '❤️', category: 'الاجتماعي' },
  { id: 'anti_bullying', label: 'ضد التنمر', icon: '🛡️', category: 'الاجتماعي' },
  { id: 'leadership', label: 'القيادة', icon: '⭐', category: 'الاجتماعي' },
  { id: 'respect', label: 'الاحترام', icon: '🌸', category: 'الاجتماعي' },
  // Emotional
  { id: 'self_confidence', label: 'الثقة بالنفس', icon: '💪', category: 'العاطفي' },
  { id: 'emotional_intelligence', label: 'الذكاء العاطفي', icon: '🧠', category: 'العاطفي' },
  { id: 'resilience', label: 'الصمود', icon: '🌳', category: 'العاطفي' },
  // Cognitive
  { id: 'creativity', label: 'الإبداع', icon: '🎨', category: 'الإدراكي' },
  { id: 'problem_solving', label: 'حل المشكلات', icon: '🔍', category: 'الإدراكي' },
  { id: 'time_management', label: 'إدارة الوقت', icon: '⏰', category: 'الإدراكي' },
  // Spiritual
  { id: 'islamic_values', label: 'القيم الإسلامية', icon: '🕌', category: 'الروحي' },
]

export const STORY_STYLES = [
  { id: 'adventure', label: 'مغامرة', icon: '🏔️', description: 'تحديات واكتشاف' },
  { id: 'fantasy', label: 'خيال', icon: '🧚', description: 'عوالم سحرية' },
  { id: 'islamic', label: 'إسلامية', icon: '🕌', description: 'قيم دينية ونبوية' },
  { id: 'animals', label: 'حيوانات', icon: '🐘', description: 'طبيعة وأصدقاء' },
  { id: 'space', label: 'فضاء', icon: '🚀', description: 'استكشاف الكون' },
  { id: 'superhero', label: 'بطل خارق', icon: '🦸', description: 'قوى خاصة' },
  { id: 'mystery', label: 'غموض', icon: '🔍', description: 'ألغاز وتحقيق' },
  { id: 'historical', label: 'تاريخية', icon: '🏛️', description: 'تراث عربي' },
  { id: 'science', label: 'علمية', icon: '🔬', description: 'اكتشاف وفضول' },
  { id: 'everyday', label: 'يومية', icon: '🏡', description: 'مدرسة وعائلة' },
]

export const DIALECTS = [
  { id: 'gulf', label: 'خليجية' },
  { id: 'msa', label: 'فصحى' },
  { id: 'levantine', label: 'شامية' },
  { id: 'egyptian', label: 'مصرية' },
]

export const COUNTRIES = [
  'المملكة العربية السعودية', 'الإمارات العربية المتحدة', 'الكويت', 'قطر',
  'البحرين', 'عُمان', 'الأردن', 'لبنان', 'سوريا', 'فلسطين',
  'مصر', 'العراق', 'اليمن', 'ليبيا', 'تونس', 'الجزائر', 'المغرب', 'السودان',
  'المملكة المتحدة', 'الولايات المتحدة', 'كندا', 'ألمانيا', 'فرنسا', 'أخرى',
]

export const COLORS = [
  { id: 'blue', label: 'أزرق', hex: '#3B82F6' },
  { id: 'green', label: 'أخضر', hex: '#22C55E' },
  { id: 'red', label: 'أحمر', hex: '#EF4444' },
  { id: 'yellow', label: 'أصفر', hex: '#EAB308' },
  { id: 'purple', label: 'بنفسجي', hex: '#A855F7' },
  { id: 'orange', label: 'برتقالي', hex: '#F97316' },
  { id: 'pink', label: 'وردي', hex: '#EC4899' },
  { id: 'gold', label: 'ذهبي', hex: '#F59E0B' },
]

export const ANIMALS = [
  'أسد', 'نمر', 'دب', 'ثعلب', 'أرنب', 'قطة', 'كلب', 'حصان',
  'دلفين', 'فيل', 'زرافة', 'طاووس', 'نسر', 'ببغاء', 'سلحفاة',
]
