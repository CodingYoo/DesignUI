import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const images = sqliteTable('images', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  url: text('url').notNull(),
  weekNumber: integer('week_number').notNull(),
  year: integer('year').notNull(),
  dayOfWeek: integer('day_of_week').notNull(), // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  terminologies: text('terminologies').notNull(), // JSON string array
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
