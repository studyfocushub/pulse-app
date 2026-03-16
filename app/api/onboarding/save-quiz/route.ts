import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { studentProfiles } from '@/lib/schema'
import { getSession } from '@/lib/auth'

function computeProfile(answers: Record<string, string>) {
  let studentType = 'Slow Burner'
  if (answers.study_time?.includes('Night') || answers.study_time?.includes('Evening')) studentType = 'Night Processor'
  else if (answers.study_time?.includes('Early morning')) studentType = 'Early Bird'
  else if (answers.study_habit?.includes('Cram')) studentType = 'Crammer'
  else if (answers.focus_duration?.includes('Over an hour')) studentType = 'Deep Diver'
  else if (answers.focus_duration?.includes('Under 15') || answers.focus_duration?.includes('15-25')) studentType = 'Sprint Learner'
  const focusMap: Record<string, number> = { 'Under 15 minutes': 12, '15-25 minutes': 22, '25-40 minutes': 32, '40-60 minutes': 48, 'Over an hour': 70 }
  const focusCliff = focusMap[answers.focus_duration || ''] || 30
  const peakMap: Record<string, string> = { 'Early morning (6-9am)': '6am-9am', 'Late morning (9am-12pm)': '9am-12pm', 'Afternoon (12-5pm)': '12pm-5pm', 'Evening (5-9pm)': '5pm-9pm', 'Night (9pm+)': '9pm-12am' }
  const peakHours = peakMap[answers.study_time || ''] || 'Evening'
  const processingStyle = answers.learning_style?.includes('example') ? 'Example-First' : answers.learning_style?.includes('concept') ? 'Concept-First' : answers.learning_style?.includes('draw') ? 'Visual' : 'Verbal'
  const retentionStyle = answers.retention_style?.includes('sleep') || answers.retention_style?.includes('morning') ? 'Sleep-Consolidator' : 'Immediate-Recall'
  return { studentType, focusCliff, peakHours, processingStyle, retentionStyle }
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
  const { answers } = await req.json()
  const computed = computeProfile(answers)
  await db.insert(studentProfiles).values({ userId: session.userId, quizAnswers: answers, ...computed, completedAt: new Date() })
  return NextResponse.json({ success: true })
}