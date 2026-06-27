import {
  Document, Page, Text, View, StyleSheet, Font, pdf,
} from '@react-pdf/renderer'
import type { ReactElement } from 'react'
import React from 'react'

// Register Arabic font from Google Fonts CDN
Font.register({
  family: 'Cairo',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/cairo/v28/SLXgc1nY6HkvalIhTp2mxdt0UX8.woff2',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/s/cairo/v28/SLXgc1nY6HkvalIhTp2mxdt0UX8.woff2',
      fontWeight: 700,
    },
  ],
})

Font.registerHyphenationCallback(word => [word]) // disable hyphenation for Arabic

// ── Color palette ──────────────────────────────────────
const COLORS = {
  ink:       '#1A1814',
  gold:      '#C9A84C',
  goldLight: '#F5F0E8',
  teal:      '#0D7C6F',
  tealLight: '#E8FAF7',
  paper:     '#FAFAF8',
  border:    '#E8E4DC',
  white:     '#FFFFFF',
  textMain:  '#2E2A24',
  textSoft:  '#6B6560',
}

// ── Goal colors ────────────────────────────────────────
const GOAL_COLORS: Record<string, { bg: string; accent: string }> = {
  courage:         { bg: '#FFF8EE', accent: '#D97706' },
  honesty:         { bg: '#E8FAF7', accent: '#0D7C6F' },
  friendship:      { bg: '#FFF0F3', accent: '#E11D6A' },
  kindness:        { bg: '#FFF0F5', accent: '#DB2777' },
  resilience:      { bg: '#F0FDF4', accent: '#15803D' },
  self_confidence: { bg: '#FFFBEB', accent: '#B45309' },
  creativity:      { bg: '#F5F3FF', accent: '#7C3AED' },
  responsibility:  { bg: '#EFF6FF', accent: '#1D4ED8' },
  patience:        { bg: '#F5F3FF', accent: '#6D28D9' },
  respect:         { bg: '#FFF7ED', accent: '#C2410C' },
  gratitude:       { bg: '#FFFBEB', accent: '#C9A84C' },
  discipline:      { bg: '#F0F9FF', accent: '#0369A1' },
  forgiveness:     { bg: '#FFF7ED', accent: '#EA580C' },
  islamic_values:  { bg: '#F0FDF4', accent: '#166534' },
  sharing:         { bg: '#F0F9FF', accent: '#0284C7' },
  problem_solving: { bg: '#EEF2FF', accent: '#4338CA' },
}

const GOAL_LABELS: Record<string, string> = {
  courage:'الشجاعة', honesty:'الأمانة', sharing:'التعاون', friendship:'الصداقة',
  patience:'الصبر', responsibility:'المسؤولية', kindness:'اللطف',
  self_confidence:'الثقة بالنفس', respect:'الاحترام', gratitude:'الامتنان',
  discipline:'الانضباط', forgiveness:'التسامح', creativity:'الإبداع',
  problem_solving:'حل المشكلات', resilience:'المرونة', islamic_values:'القيم الإسلامية',
}

// ── Styles ─────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    backgroundColor: COLORS.paper,
    fontFamily: 'Cairo',
    padding: 0,
  },
  // Cover page
  coverPage: {
    backgroundColor: COLORS.ink,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
  },
  coverBadge: {
    backgroundColor: COLORS.gold,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 32,
  },
  coverBadgeText: {
    color: COLORS.ink,
    fontSize: 11,
    fontWeight: 700,
    textAlign: 'center',
  },
  coverTitle: {
    color: COLORS.white,
    fontSize: 36,
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 1.4,
  },
  coverSubtitle: {
    color: '#9B9590',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 1.6,
  },
  coverDivider: {
    width: 60,
    height: 3,
    backgroundColor: COLORS.gold,
    borderRadius: 2,
    marginBottom: 32,
  },
  coverChildName: {
    color: COLORS.gold,
    fontSize: 22,
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: 8,
  },
  coverGoal: {
    color: '#6B6560',
    fontSize: 13,
    textAlign: 'center',
  },
  coverFooter: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  coverFooterText: {
    color: '#4B4640',
    fontSize: 11,
    textAlign: 'center',
  },
  // Story pages
  storyPage: {
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  pageHeader: {
    height: 8,
  },
  pageContent: {
    flex: 1,
    padding: 48,
    paddingTop: 40,
  },
  pageNumber: {
    fontSize: 10,
    color: COLORS.textSoft,
    textAlign: 'center',
    marginBottom: 20,
  },
  storyText: {
    fontSize: 16,
    lineHeight: 2.2,
    color: COLORS.textMain,
    textAlign: 'right',
    fontFamily: 'Cairo',
    direction: 'rtl',
  },
  pageFooter: {
    height: 40,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
  },
  footerBrand: {
    fontSize: 9,
    color: COLORS.textSoft,
  },
  footerGold: {
    fontSize: 9,
    color: COLORS.gold,
  },
  // End page
  endPage: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
  },
  endDecoration: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 24,
  },
  endTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: COLORS.ink,
    textAlign: 'center',
    marginBottom: 12,
  },
  endSubtitle: {
    fontSize: 14,
    color: COLORS.textSoft,
    textAlign: 'center',
    lineHeight: 1.8,
    marginBottom: 32,
  },
  trustBadge: {
    backgroundColor: COLORS.goldLight,
    borderWidth: 1,
    borderColor: '#E8D9A8',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  trustBadgeText: {
    fontSize: 11,
    color: COLORS.textMain,
    textAlign: 'center',
  },
})

// ── Split story into pages (max ~250 words per page) ───
function splitIntoPages(content: string, maxWordsPerPage = 200): string[] {
  const paragraphs = content.split('\n').filter(p => p.trim())
  const pages: string[] = []
  let current: string[] = []
  let wordCount = 0

  for (const para of paragraphs) {
    const words = para.split(/\s+/).length
    if (wordCount + words > maxWordsPerPage && current.length > 0) {
      pages.push(current.join('\n\n'))
      current = [para]
      wordCount = words
    } else {
      current.push(para)
      wordCount += words
    }
  }
  if (current.length > 0) pages.push(current.join('\n\n'))
  return pages
}

// ── PDF Document component ─────────────────────────────
interface StoryPDFProps {
  title: string
  childName: string
  storyGoal: string
  content: string
  dialect: string
}

function StoryPDF({ title, childName, storyGoal, content }: StoryPDFProps): ReactElement {
  const pages      = splitIntoPages(content)
  const goalColor  = GOAL_COLORS[storyGoal] ?? { bg: COLORS.goldLight, accent: COLORS.gold }
  const goalLabel  = GOAL_LABELS[storyGoal] || storyGoal

  return (
    <Document title={title} author="حكايتي" language="ar">

      {/* ── Cover Page ── */}
      <Page size="A4" style={styles.coverPage}>
        <View style={styles.coverBadge}>
          <Text style={styles.coverBadgeText}>حكايتي — قصتك، بلمسة إنسانية</Text>
        </View>

        <Text style={styles.coverTitle}>{title}</Text>
        <View style={styles.coverDivider} />
        <Text style={styles.coverSubtitle}>قصة مخصصة كُتبت خصيصاً لـ</Text>
        <Text style={styles.coverChildName}>{childName}</Text>
        <Text style={styles.coverGoal}>الهدف التربوي: {goalLabel}</Text>

        <View style={styles.coverFooter}>
          <Text style={styles.coverFooterText}>✓ راجعها فريقنا التحريري — كل كلمة، كل مرة</Text>
        </View>
      </Page>

      {/* ── Story Pages ── */}
      {pages.map((pageContent, index) => (
        <Page key={index} size="A4" style={styles.storyPage}>
          {/* Colored top bar */}
          <View style={[styles.pageHeader, { backgroundColor: goalColor.accent }]} />

          <View style={styles.pageContent}>
            <Text style={styles.pageNumber}>— {index + 1} —</Text>
            <Text style={styles.storyText}>{pageContent}</Text>
          </View>

          {/* Footer */}
          <View style={styles.pageFooter}>
            <Text style={styles.footerGold}>حكايتي</Text>
            <Text style={styles.footerBrand}>{title}</Text>
          </View>
        </Page>
      ))}

      {/* ── End Page ── */}
      <Page size="A4" style={[styles.storyPage, { backgroundColor: goalColor.bg }]}>
        <View style={[styles.pageHeader, { backgroundColor: goalColor.accent }]} />
        <View style={[styles.endPage, { flex: 1 }]}>
          <Text style={styles.endDecoration}>✨</Text>
          <Text style={styles.endTitle}>نهاية قصة {childName}</Text>
          <Text style={styles.endSubtitle}>
            {`نتمنى أن تكون قصة ${childName} قد أضافت قيمة جميلة لحياتكم.\nتذكّروا: الهدف من هذه القصة هو ${goalLabel}.`}
          </Text>
          <View style={styles.trustBadge}>
            <Text style={styles.trustBadgeText}>✓ كُتبت ومُراجعة بعناية من فريق حكايتي التحريري</Text>
          </View>
        </View>
      </Page>

    </Document>
  )
}

// ── Main export: generate PDF as ArrayBuffer ──────────
export async function generateStoryPDF(params: StoryPDFProps): Promise<ArrayBuffer> {
  const doc    = StoryPDF(params) as React.ReactElement
  const instance = pdf(doc as Parameters<typeof pdf>[0])
  const blob   = await instance.toBlob()
  return await blob.arrayBuffer()
}
