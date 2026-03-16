import { pgTable, text, timestamp, integer, boolean, jsonb, serial } from 'drizzle-orm/pg-core'

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  licenseKey: text('license_key').notNull().unique(),
  planType: text('plan_type').notNull().default('monthly'), // 'monthly' | 'lifetime'
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
  name: text('name'),
  photoUrl: text('photo_url'),
})

// DNA Quiz results - who they are as a student
export const studentProfiles = pgTable('student_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  // Quiz answers stored as JSON
  quizAnswers: jsonb('quiz_answers'),
  // Computed student type
  studentType: text('student_type'), // e.g. "Night Processor", "Crammer", "Slow Burner"
  processingStyle: text('processing_style'), // "Example-First" | "Concept-First"
  focusCliff: integer('focus_cliff'), // minutes before retention drops
  peakHours: text('peak_hours'), // e.g. "8pm-10pm"
  peakDays: text('peak_days'), // e.g. "Tuesday,Thursday"
  worstTime: text('worst_time'), // e.g. "Sunday morning"
  retentionStyle: text('retention_style'), // "Sleep-Consolidator" | "Immediate-Recall"
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
})

// Daily session logs
export const sessionLogs = pgTable('session_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  topic: text('topic').notNull(),
  subject: text('subject').notNull(),
  technique: text('technique').notNull(), // flashcards | re-reading | practice | mindmap | notes | video
  durationMinutes: integer('duration_minutes').notNull(),
  confidenceScore: integer('confidence_score').notNull(), // 1-5
  energyBefore: integer('energy_before').notNull(), // 1-5
  energyAfter: integer('energy_after').notNull(), // 1-5
  timeOfDay: text('time_of_day').notNull(), // morning | afternoon | evening | night
  dayOfWeek: text('day_of_week').notNull(),
  studiedAt: timestamp('studied_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
})

// Forget predictor - tracks when user will forget topics
export const forgetPredictions = pgTable('forget_predictions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  sessionLogId: integer('session_log_id').references(() => sessionLogs.id),
  topic: text('topic').notNull(),
  subject: text('subject').notNull(),
  studiedAt: timestamp('studied_at').notNull(),
  predictedForgetAt: timestamp('predicted_forget_at').notNull(),
  retentionPercentage: integer('retention_percentage').notNull(), // current % they remember
  isReviewed: boolean('is_reviewed').default(false),
  createdAt: timestamp('created_at').defaultNow(),
})

// AI Brain insights - generated after 7 days
export const brainInsights = pgTable('brain_insights', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  insightType: text('insight_type').notNull(), // peak_hours | focus_cliff | retention_killers | processing_type | exam_performance | energy_map
  title: text('title').notNull(),
  description: text('description').notNull(),
  actionableTip: text('actionable_tip').notNull(),
  generatedAt: timestamp('generated_at').defaultNow(),
})

// AI Coach chat history
export const coachChats = pgTable('coach_chats', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  role: text('role').notNull(), // 'user' | 'assistant'
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

// Streaks
export const streaks = pgTable('streaks', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  currentStreak: integer('current_streak').default(0),
  longestStreak: integer('longest_streak').default(0),
  lastLoggedAt: timestamp('last_logged_at'),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Feedback from users
export const feedback = pgTable('feedback', {
  id: serial('id').primaryKey(),
  name: text('name'),
  email: text('email'),
  type: text('type'), // feature | bug | general | affiliate
  message: text('message').notNull(),
  isShipped: boolean('is_shipped').default(false),
  createdAt: timestamp('created_at').defaultNow(),
})
