import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { DocuSignModule } from './modules/docusign/docusign.module';

@Module({
  imports: [
    // Environment configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // BA Application Form e-signature (DocuSign, email/remote signing)
    DocuSignModule,

    // Feature modules (empty for now, will be populated)
    // AuthModule,
    // DriversModule,
    // PreregistrationModule,
    // PrescreeningModule,
    // InterviewModule,
    // DocumentsModule,
    // VettingModule,
    // DhlIntegrationModule,
    // StateMachineModule,
    // EmailModule,
    // LifecycleModule,
    // AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
