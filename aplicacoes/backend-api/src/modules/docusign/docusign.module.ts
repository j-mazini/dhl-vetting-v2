import { Module } from '@nestjs/common';
import { DocuSignController } from './docusign.controller';
import { DocuSignService } from './docusign.service';

@Module({
  controllers: [DocuSignController],
  providers: [DocuSignService],
  exports: [DocuSignService],
})
export class DocuSignModule {}
