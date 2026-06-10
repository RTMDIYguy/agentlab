CREATE TABLE `blogComments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`articleId` varchar(255) NOT NULL,
	`userId` int NOT NULL,
	`content` text NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'approved',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `blogComments_id` PRIMARY KEY(`id`)
);
