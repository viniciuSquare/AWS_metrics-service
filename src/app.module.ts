import { Module } from '@nestjs/common';
import { AwsCapacityModule } from './aws_capacity/aws_capacity.module';
import { AwsModule } from './aws/aws.module';

@Module({
  imports: [
    AwsCapacityModule, 
    AwsModule
  ],
  providers: []
})
export class AppModule {}
