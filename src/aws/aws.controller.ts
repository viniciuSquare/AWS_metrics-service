import { Body, Controller, Get } from '@nestjs/common';
import { AwsService } from './aws.service';
@Controller('aws')
export class AwsController {
  constructor(private awsService: AwsService){}

  @Get('budget/AWS')
  async processAWSPeriodBudget(@Body() period) {
    const { start, end } = period;
    
    try {
      return await this.awsService.getMetricsDataFromCloudWatch({
        MetricDataQueries: [
          {
            Id: 'm1',
            MetricStat: {
              Metric: {
                Namespace: 'AWS/Billing',
                MetricName: 'EstimatedCharges',
                Dimensions: [
                  {
                    Name: 'Currency',
                    Value: 'USD'
                  }
                ]
              },
              Period: 3600,
              Stat: 'Average',
              Unit: 'None'
            },
            ReturnData: false
          }
        ],
        // StartTime: dayjs().startOf('month').toDate(),
        StartTime: new Date('2023-07-01'),
        EndTime: new Date(),
        ScanBy: 'TimestampDescending'
      })
    } catch (error) {
      console.error(error);   
      return {error}   
    }
  }

  @Get('list')
  async getListOfMetrics() {
    return await this.awsService.getMetricsList();
  }
}
