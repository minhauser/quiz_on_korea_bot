-- AlterTable
ALTER TABLE "quiz_templates" ADD COLUMN     "lesson_id" TEXT;

-- CreateIndex
CREATE INDEX "quiz_templates_lesson_id_idx" ON "quiz_templates"("lesson_id");

-- AddForeignKey
ALTER TABLE "quiz_templates" ADD CONSTRAINT "quiz_templates_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
