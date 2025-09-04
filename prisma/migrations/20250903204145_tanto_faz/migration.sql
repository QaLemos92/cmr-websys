/*
  Warnings:

  - Made the column `userId` on table `proposal` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `proposal` DROP FOREIGN KEY `Proposal_userId_fkey`;

-- DropIndex
DROP INDEX `Proposal_userId_fkey` ON `proposal`;

-- AlterTable
ALTER TABLE `proposal` MODIFY `userId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Proposal` ADD CONSTRAINT `Proposal_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
