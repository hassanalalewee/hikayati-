import { create } from 'zustand'
import type { DevelopmentCategory, Dialect, StoryStyle } from '@/types'

interface WizardState {
  // Step tracking
  currentStep: number

  // Step 1: Advisor
  advisorChallenge: string

  // Step 2: Goals
  selectedGoals: DevelopmentCategory[]

  // Step 3: Child info
  childId: string | null
  childName: string
  childAge: number
  childGender: 'male' | 'female'
  childCountry: string
  childHobbies: string[]
  childFavoriteColor: string
  childFavoriteAnimal: string
  childFavoriteActivities: string[]
  childPhotoUrl: string | null
  saveChildProfile: boolean

  // Step 4: Story style
  storyStyle: StoryStyle | null
  dialect: Dialect
  wordCountTarget: number

  // Generation
  jobId: string | null
  storyId: string | null

  // Actions
  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  setAdvisorChallenge: (text: string) => void
  toggleGoal: (goal: DevelopmentCategory) => void
  setChildField: (field: string, value: unknown) => void
  setStoryStyle: (style: StoryStyle) => void
  setDialect: (dialect: Dialect) => void
  setJobId: (id: string) => void
  setStoryId: (id: string) => void
  reset: () => void
}

const initialState = {
  currentStep: 1,
  advisorChallenge: '',
  selectedGoals: [] as DevelopmentCategory[],
  childId: null,
  childName: '',
  childAge: 6,
  childGender: 'male' as const,
  childCountry: '',
  childHobbies: [] as string[],
  childFavoriteColor: '',
  childFavoriteAnimal: '',
  childFavoriteActivities: [] as string[],
  childPhotoUrl: null,
  saveChildProfile: true,
  storyStyle: null,
  dialect: 'gulf' as Dialect,
  wordCountTarget: 1200,
  jobId: null,
  storyId: null,
}

export const useWizardStore = create<WizardState>((set) => ({
  ...initialState,

  setStep: (step) => set({ currentStep: step }),
  nextStep: () => set((s) => ({ currentStep: Math.min(s.currentStep + 1, 5) })),
  prevStep: () => set((s) => ({ currentStep: Math.max(s.currentStep - 1, 1) })),
  setAdvisorChallenge: (text) => set({ advisorChallenge: text }),

  toggleGoal: (goal) => set((s) => {
    const exists = s.selectedGoals.includes(goal)
    if (exists) return { selectedGoals: s.selectedGoals.filter(g => g !== goal) }
    if (s.selectedGoals.length >= 3) return s
    return { selectedGoals: [...s.selectedGoals, goal] }
  }),

  setChildField: (field, value) => set((s) => ({ ...s, [field]: value })),
  setStoryStyle: (style) => set({ storyStyle: style }),
  setDialect: (dialect) => set({ dialect }),
  setJobId: (id) => set({ jobId: id }),
  setStoryId: (id) => set({ storyId: id }),
  reset: () => set(initialState),
}))
