import { Module } from '@nestjs/common';
import { AwsCapacityService } from './aws_capacity.service';
import { AwsCapacityController } from './aws_capacity.controller';
import { DashboardsService } from './services/Dashboard.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AWSMetricsFileHandler } from '../handlers/AWSMetricsHandler';

@Module({
  providers: [
    AwsCapacityService,
    DashboardsService,
    PrismaService,
    AWSMetricsFileHandler
  ],
  controllers: [AwsCapacityController]
})
export class AwsCapacityModule {}
