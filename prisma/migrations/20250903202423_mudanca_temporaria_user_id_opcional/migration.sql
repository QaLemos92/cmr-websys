-- DropForeignKey
ALTER TABLE `proposal` DROP FOREIGN KEY `Proposal_userId_fkey`;

-- DropIndex
DROP INDEX `Proposal_userId_fkey` ON `proposal`;

-- AlterTable
ALTER TABLE `proposal` MODIFY `userId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Proposal` ADD CONSTRAINT `Proposal_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
