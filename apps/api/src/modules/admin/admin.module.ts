import { Module } from '@nestjs/common';

import { AdminAchievementsService } from './application/services/admin-achievements.service';
import { AdminAuditService } from './application/services/admin-audit.service';
import { AdminContentService } from './application/services/admin-content.service';
import { AdminDialoguesService } from './application/services/admin-dialogues.service';
import { AdminGamificationService } from './application/services/admin-gamification.service';
import { AdminGrammarService } from './application/services/admin-grammar.service';
import { AdminLearningService } from './application/services/admin-learning.service';
import { AdminQuizzesService } from './application/services/admin-quizzes.service';
import { AdminVocabularyService } from './application/services/admin-vocabulary.service';
import { AdminAchievementsController } from './presentation/controllers/admin-achievements.controller';
import { AdminContentController } from './presentation/controllers/admin-content.controller';
import { AdminDialoguesController } from './presentation/controllers/admin-dialogues.controller';
import { AdminGamificationController } from './presentation/controllers/admin-gamification.controller';
import { AdminGrammarController } from './presentation/controllers/admin-grammar.controller';
import { AdminLearningController } from './presentation/controllers/admin-learning.controller';
import { AdminLogsController } from './presentation/controllers/admin-logs.controller';
import { AdminQuizzesController } from './presentation/controllers/admin-quizzes.controller';
import { AdminVocabularyController } from './presentation/controllers/admin-vocabulary.controller';

@Module({
  controllers: [
    AdminContentController,
    AdminLearningController,
    AdminVocabularyController,
    AdminGrammarController,
    AdminDialoguesController,
    AdminQuizzesController,
    AdminAchievementsController,
    AdminGamificationController,
    AdminLogsController,
  ],
  providers: [
    AdminAuditService,
    AdminContentService,
    AdminLearningService,
    AdminVocabularyService,
    AdminGrammarService,
    AdminDialoguesService,
    AdminQuizzesService,
    AdminAchievementsService,
    AdminGamificationService,
  ],
})
export class AdminModule {}
