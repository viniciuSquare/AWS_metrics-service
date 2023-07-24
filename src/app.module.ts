import { Module } from '@nestjs/common';
import { AwsCapacityModule } from './aws_capacity/aws_capacity.module';

@Module({
  imports: [AwsCapacityModule]
})
export class AppModule {}
