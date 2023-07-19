/*
  Warnings:

  - You are about to drop the column `region` on the `instances_details` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `instances_details` DROP COLUMN `region`;

-- CreateTable
CREATE TABLE `WeeksPeriod` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `label` VARCHAR(191) NOT NULL,
    `start` DATETIME(3) NOT NULL,
    `end` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
