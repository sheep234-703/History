CREATE TABLE `moment_uploads` (
	`key` text PRIMARY KEY NOT NULL,
	`author` text NOT NULL,
	`mime` text NOT NULL,
	`size` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `uploads_author_idx` ON `moment_uploads` (`author`);