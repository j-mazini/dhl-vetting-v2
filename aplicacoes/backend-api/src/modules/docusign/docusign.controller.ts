import {
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DocuSignService } from './docusign.service';

class SignatureRequestDto {
  signerName!: string;
  signerEmail!: string;
  declarationVersion!: string;
}

@ApiTags('Signature')
@Controller()
export class DocuSignController {
  constructor(private readonly docusign: DocuSignService) {}

  /**
   * Called by the apply form after the driver record is created. Creates the
   * DocuSign envelope and emails the BA Application Form to the candidate.
   *
   * TODO(verify:auth): this is reached from the public apply page, so it is
   * currently unauthenticated. Add throttling / a shared secret / App Check
   * before production so it can't be abused to send envelopes.
   */
  @Post('applications/:driverId/signature-request')
  async requestSignature(
    @Param('driverId') driverId: string,
    @Body() body: SignatureRequestDto,
  ) {
    return this.docusign.createEnvelopeForDriver({
      driverId,
      signerName: body.signerName,
      signerEmail: body.signerEmail,
      declarationVersion: body.declarationVersion,
    });
  }

  /**
   * DocuSign Connect webhook. Configure this URL in the DocuSign admin →
   * Connect. Must be publicly reachable (use a tunnel in dev).
   */
  @Post('docusign/connect')
  @HttpCode(200)
  async connect(@Body() payload: any) {
    await this.docusign.handleConnectWebhook(payload);
    return { received: true };
  }
}
