CREATE TABLE `newsletterCampaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`subject` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`templateId` int,
	`status` enum('draft','scheduled','sending','sent','paused','failed') NOT NULL DEFAULT 'draft',
	`recipientCount` int NOT NULL DEFAULT 0,
	`sentCount` int NOT NULL DEFAULT 0,
	`openCount` int NOT NULL DEFAULT 0,
	`clickCount` int NOT NULL DEFAULT 0,
	`bounceCount` int NOT NULL DEFAULT 0,
	`complaintCount` int NOT NULL DEFAULT 0,
	`unsubscribeCount` int NOT NULL DEFAULT 0,
	`scheduledFor` timestamp,
	`sentAt` timestamp,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `newsletterCampaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `newsletterEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`subscriberId` int NOT NULL,
	`email` varchar(320) NOT NULL,
	`eventType` enum('sent','open','click','bounce','complaint','unsubscribe') NOT NULL,
	`linkUrl` varchar(500),
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `newsletterEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `newsletterSubscribers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` varchar(255),
	`status` enum('subscribed','unsubscribed','bounced','complained') NOT NULL DEFAULT 'subscribed',
	`verificationToken` varchar(255),
	`verifiedAt` timestamp,
	`unsubscribeToken` varchar(255),
	`unsubscribedAt` timestamp,
	`source` varchar(100) NOT NULL DEFAULT 'website',
	`tags` text,
	`preferences` text,
	`lastEmailSentAt` timestamp,
	`bounceCount` int NOT NULL DEFAULT 0,
	`complaintCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `newsletterSubscribers_id` PRIMARY KEY(`id`),
	CONSTRAINT `newsletterSubscribers_email_unique` UNIQUE(`email`),
	CONSTRAINT `newsletterSubscribers_unsubscribeToken_unique` UNIQUE(`unsubscribeToken`)
);
--> statement-breakpoint
CREATE TABLE `newsletterTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`content` text NOT NULL,
	`previewUrl` varchar(500),
	`category` varchar(100) NOT NULL DEFAULT 'general',
	`isDefault` boolean NOT NULL DEFAULT false,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `newsletterTemplates_id` PRIMARY KEY(`id`)
);
