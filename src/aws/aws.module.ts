import { Module } from '@nestjs/common';
import { AwsService } from './aws.service';
import { AwsController } from './aws.controller';
import AWS from 'aws-sdk'

@Module({
  providers: [
    AwsService,
  ],
  imports: [
  ],
  controllers: [AwsController]
})
export class AwsModule {}
