import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AwsCapacityModule } from './aws_capacity/aws_capacity.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [AwsCapacityModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
