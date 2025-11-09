/*
  Warnings:

  - You are about to drop the column `conversation` on the `Subject` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Subject" DROP COLUMN "conversation";

-- CreateTable
CREATE TABLE "Conversation" (
    "id" SERIAL NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "isGenerated" BOOLEAN NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
