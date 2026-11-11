CREATE TABLE `moment_comments` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`author` text NOT NULL,
	`nickname` text NOT NULL,
	`content` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `moment_posts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `comments_post_idx` ON `moment_comments` (`post_id`);--> statement-breakpoint
CREATE INDEX `comments_author_idx` ON `moment_comments` (`author`);--> statement-breakpoint
CREATE TABLE `moment_likes` (
	`post_id` text NOT NULL,
	`author` text NOT NULL,
	PRIMARY KEY(`post_id`, `author`),
	FOREIGN KEY (`post_id`) REFERENCES `moment_posts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `moment_posts` (
	`id` text PRIMARY KEY NOT NULL,
	`author` text NOT NULL,
	`event_id` text NOT NULL,
	`nickname` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`images` text DEFAULT '[]' NOT NULL,
	`created_at` integer NOT NULL,
	`hidden` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `posts_created_idx` ON `moment_posts` (`created_at`);--> statement-breakpoint
CREATE INDEX `posts_author_idx` ON `moment_posts` (`author`);