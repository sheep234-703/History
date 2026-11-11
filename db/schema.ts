import { sqliteTable, text, integer, primaryKey, index } from 'drizzle-orm/sqlite-core';
export const posts = sqliteTable('moment_posts', {
 id:text('id').primaryKey(),author:text('author').notNull(),eventId:text('event_id').notNull(),nickname:text('nickname').notNull(),role:text('role').notNull(),content:text('content').notNull(),images:text('images').notNull().default('[]'),createdAt:integer('created_at').notNull(),hidden:integer('hidden').notNull().default(0)
},t=>[index('posts_created_idx').on(t.createdAt),index('posts_author_idx').on(t.author)]);
export const comments=sqliteTable('moment_comments',{
 id:text('id').primaryKey(),postId:text('post_id').notNull().references(()=>posts.id),author:text('author').notNull(),nickname:text('nickname').notNull(),content:text('content').notNull(),createdAt:integer('created_at').notNull()
},t=>[index('comments_post_idx').on(t.postId),index('comments_author_idx').on(t.author)]);
export const likes=sqliteTable('moment_likes',{
 postId:text('post_id').notNull().references(()=>posts.id),author:text('author').notNull()
},t=>[primaryKey({columns:[t.postId,t.author]})]);
export const uploads=sqliteTable('moment_uploads',{
 key:text('key').primaryKey(),author:text('author').notNull(),mime:text('mime').notNull(),size:integer('size').notNull(),createdAt:integer('created_at').notNull()
},t=>[index('uploads_author_idx').on(t.author)]);
