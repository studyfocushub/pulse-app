import OpenAI from 'openai'

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL,
    'X-Title': 'Pulse by StudyFocus Hub',
  },
})

const MODEL = 'meta-llama/llama-3.3-70b-instruct:free'

export async function generateBrainInsights(studentData: {
  quizAnswers: Record<string, string>
  sessionLogs: Array<{
    topic: string
    subject: string
    technique: string
    durationMinutes: number
    confidenceScore: number
    energyBefore: number
    energyAfter: number
    timeOfDay: string
    dayOfWeek: string
  }>
}) {
  const prompt = `You are a student performance analyst. Based on this student's data, generate deeply personal brain insights.

QUIZ ANSWERS:
${JSON.stringify(studentData.quizAnswers, null, 2)}

SESSION LOGS (last 7 days):
${JSON.stringify(studentData.sessionLogs, null, 2)}

Generate exactly 6 insights in this JSON format:
{
  "studentType": "one of: Night Processor | Early Bird | Crammer | Slow Burner | Sprint Learner | Deep Diver",
  "processingStyle": "one of: Example-First | Concept-First | Visual | Verbal",
  "focusCliff": <number in minutes>,
  "peakHours": "<time range e.g. 8pm-10pm>",
  "peakDays": "<comma separated e.g. Tuesday,Thursday>",
  "worstTime": "<e.g. Sunday morning>",
  "insights": [
    {
      "type": "peak_hours",
      "title": "<punchy title>",
      "description": "<2-3 sentences, very specific to their data>",
      "actionableTip": "<one specific action they can take today>"
    },
    {
      "type": "focus_cliff",
      "title": "<punchy title>",
      "description": "<2-3 sentences>",
      "actionableTip": "<one specific action>"
    },
    {
      "type": "retention_killers",
      "title": "<punchy title>",
      "description": "<2-3 sentences>",
      "actionableTip": "<one specific action>"
    },
    {
      "type": "processing_type",
      "title": "<punchy title>",
      "description": "<2-3 sentences>",
      "actionableTip": "<one specific action>"
    },
    {
      "type": "exam_performance",
      "title": "<punchy title>",
      "description": "<2-3 sentences>",
      "actionableTip": "<one specific action>"
    },
    {
      "type": "energy_map",
      "title": "<punchy title>",
      "description": "<2-3 sentences>",
      "actionableTip": "<one specific action>"
    }
  ]
}

ONLY return valid JSON. No other text.`

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
  })

  const text = response.choices[0].message.content || ''
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

export async function generateForgetPrediction(data: {
  topic: string
  subject: string
  technique: string
  confidenceScore: number
  durationMinutes: number
  studentType: string
  focusCliff: number
}) {
  const prompt = `You are a memory science expert. Given this study session data, predict when the student will forget this material.

Topic: ${data.topic}
Subject: ${data.subject}
Technique used: ${data.technique}
Confidence after studying: ${data.confidenceScore}/5
Duration: ${data.durationMinutes} minutes
Student type: ${data.studentType}
Their focus cliff: ${data.focusCliff} minutes

Return ONLY this JSON:
{
  "hoursUntilForgetting": <number>,
  "retentionAt24h": <percentage 0-100>,
  "retentionAt48h": <percentage 0-100>,
  "retentionAt7d": <percentage 0-100>,
  "reviewRecommendation": "<when they should review e.g. tomorrow evening>",
  "reason": "<one sentence explaining why based on their student type>"
}`

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
  })

  const text = response.choices[0].message.content || ''
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

export async function chatWithCoach(messages: Array<{ role: 'user' | 'assistant'; content: string }>, studentContext: {
  studentType: string
  peakHours: string
  focusCliff: number
  recentLogs: Array<{ topic: string; subject: string; confidenceScore: number; studiedAt: string }>
  insights: Array<{ title: string; description: string }>
}) {
  const systemPrompt = `You are a personal AI study coach for this specific student. You ONLY answer based on their personal data. Never give generic advice.

THEIR PROFILE:
- Student type: ${studentContext.studentType}
- Peak study hours: ${studentContext.peakHours}
- Focus cliff (when retention drops): ${studentContext.focusCliff} minutes
- Recent study sessions: ${JSON.stringify(studentContext.recentLogs)}
- Their personal brain insights: ${JSON.stringify(studentContext.insights)}

Always reference their specific data in your answers. Be direct, personal, and actionable. Max 3 sentences per response. Don't be generic.`

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
    temperature: 0.8,
    max_tokens: 200,
  })

  return response.choices[0].message.content
}

export async function generateExamBattlePlan(data: {
  examTopic: string
  examDate: string
  studentProfile: {
    studentType: string
    peakHours: string
    peakDays: string
    focusCliff: number
    processingStyle: string
  }
  topicsToReview: string[]
}) {
  const daysUntilExam = Math.ceil((new Date(data.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  const prompt = `Create a hyper-personalised exam battle plan for this student.

Exam: ${data.examTopic}
Days until exam: ${daysUntilExam}
Topics to cover: ${data.topicsToReview.join(', ')}

STUDENT PROFILE:
- Type: ${data.studentProfile.studentType}
- Peak hours: ${data.studentProfile.peakHours}
- Best days: ${data.studentProfile.peakDays}
- Focus cliff: ${data.studentProfile.focusCliff} minutes
- Processing style: ${data.studentProfile.processingStyle}

Return ONLY this JSON:
{
  "overview": "<2 sentence personalised strategy based on their type>",
  "dailyPlan": [
    {
      "day": "Day 1 - <date>",
      "focus": "<topic>",
      "sessions": [
        {
          "time": "<their peak time>",
          "duration": <their focus cliff minus 2 minutes>,
          "activity": "<specific activity>",
          "technique": "<best technique for their processing style>"
        }
      ],
      "warning": "<optional - if this day is their worst day>"
    }
  ],
  "examDayTips": ["<3 specific tips based on their student type>"]
}`

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.6,
  })

  const text = response.choices[0].message.content || ''
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}
