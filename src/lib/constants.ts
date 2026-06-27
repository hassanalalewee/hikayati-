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

/**
 * Goal mood colors — each story goal has its own visual mood.
 * Colors are soft, gender-neutral, and chosen for emotional resonance.
 *
 * bg:     card/cover background (very light tint)
 * accent: icon, badge, and spine color
 * border: card border
 * label:  human-readable mood name in Arabic
 */
export const GOAL_COLORS: Record<string, {
  bg: string
  accent: string
  border: string
  label: string
}> = {
  // Courage — warm amber, strength and energy
  courage: {
    bg:     '#FFF8EE',
    accent: '#D97706',
    border: '#FDE68A',
    label:  'الشجاعة',
  },
  // Honesty — soft teal, clarity and trust
  honesty: {
    bg:     '#E8FAF7',
    accent: '#0D7C6F',
    border: '#D0F0EC',
    label:  'الصدق',
  },
  // Friendship — warm rose, warmth and connection
  friendship: {
    bg:     '#FFF0F3',
    accent: '#E11D6A',
    border: '#FECDD3',
    label:  'الصداقة',
  },
  // Kindness — soft pink-rose, gentleness
  kindness: {
    bg:     '#FFF0F5',
    accent: '#DB2777',
    border: '#FBCFE8',
    label:  'اللطف',
  },
  // Resilience — sage green, growth and nature
  resilience: {
    bg:     '#F0FDF4',
    accent: '#15803D',
    border: '#BBF7D0',
    label:  'الصمود',
  },
  // Self confidence — golden yellow, radiance
  self_confidence: {
    bg:     '#FFFBEB',
    accent: '#B45309',
    border: '#FDE68A',
    label:  'الثقة بالنفس',
  },
  // Creativity — soft violet, imagination
  creativity: {
    bg:     '#F5F3FF',
    accent: '#7C3AED',
    border: '#DDD6FE',
    label:  'الإبداع',
  },
  // Responsibility — deep blue, reliability
  responsibility: {
    bg:     '#EFF6FF',
    accent: '#1D4ED8',
    border: '#BFDBFE',
    label:  'المسؤولية',
  },
  // Patience — dusty lavender, calm
  patience: {
    bg:     '#F5F3FF',
    accent: '#6D28D9',
    border: '#DDD6FE',
    label:  'الصبر',
  },
  // Respect — warm terracotta, dignity
  respect: {
    bg:     '#FFF7ED',
    accent: '#C2410C',
    border: '#FED7AA',
    label:  'الاحترام',
  },
  // Gratitude — gold, appreciation and richness
  gratitude: {
    bg:     '#FFFBEB',
    accent: '#C9A84C',
    border: '#FEF08A',
    label:  'الامتنان',
  },
  // Discipline — slate blue, focus and order
  discipline: {
    bg:     '#F0F9FF',
    accent: '#0369A1',
    border: '#BAE6FD',
    label:  'الانضباط',
  },
  // Forgiveness — soft peach, warmth and healing
  forgiveness: {
    bg:     '#FFF7ED',
    accent: '#EA580C',
    border: '#FDBA74',
    label:  'التسامح',
  },
  // Leadership — deep gold, confidence
  leadership: {
    bg:     '#FFFBEB',
    accent: '#A16207',
    border: '#FEF08A',
    label:  'القيادة',
  },
  // Sharing — soft sky, openness
  sharing: {
    bg:     '#F0F9FF',
    accent: '#0284C7',
    border: '#BAE6FD',
    label:  'التعاون',
  },
  // Anti-bullying — strong teal-green, protection
  anti_bullying: {
    bg:     '#ECFDF5',
    accent: '#059669',
    border: '#A7F3D0',
    label:  'ضد التنمر',
  },
  // Problem solving — indigo, intellect
  problem_solving: {
    bg:     '#EEF2FF',
    accent: '#4338CA',
    border: '#C7D2FE',
    label:  'حل المشكلات',
  },
  // Emotional intelligence — soft lilac, depth
  emotional_intelligence: {
    bg:     '#FDF4FF',
    accent: '#A21CAF',
    border: '#F0ABFC',
    label:  'الذكاء العاطفي',
  },
  // Islamic values — deep green, faith
  islamic_values: {
    bg:     '#F0FDF4',
    accent: '#166534',
    border: '#BBF7D0',
    label:  'القيم الإسلامية',
  },
  // Time management — cool gray-blue, precision
  time_management: {
    bg:     '#F8FAFC',
    accent: '#475569',
    border: '#CBD5E1',
    label:  'إدارة الوقت',
  },
  // Creativity (duplicate alias for 'creative')
  creative: {
    bg:     '#F5F3FF',
    accent: '#7C3AED',
    border: '#DDD6FE',
    label:  'الإبداع',
  },
}

/** Returns goal color config, falling back to a neutral if goal not found */
export function getGoalColor(goal: string) {
  return GOAL_COLORS[goal] ?? {
    bg:     '#FAFAF8',
    accent: '#6B6560',
    border: '#E8E4DC',
    label:  goal,
  }
}

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
  { id: 'blue',   label: 'أزرق',    hex: '#3B82F6' },
  { id: 'green',  label: 'أخضر',    hex: '#22C55E' },
  { id: 'red',    label: 'أحمر',    hex: '#EF4444' },
  { id: 'yellow', label: 'أصفر',    hex: '#EAB308' },
  { id: 'purple', label: 'بنفسجي',  hex: '#A855F7' },
  { id: 'orange', label: 'برتقالي', hex: '#F97316' },
  { id: 'pink',   label: 'وردي',    hex: '#EC4899' },
  { id: 'gold',   label: 'ذهبي',    hex: '#F59E0B' },
]

export const ANIMALS = [
  'أسد', 'نمر', 'دب', 'ثعلب', 'أرنب', 'قطة', 'كلب', 'حصان',
  'دلفين', 'فيل', 'زرافة', 'طاووس', 'نسر', 'ببغاء', 'سلحفاة',
]
