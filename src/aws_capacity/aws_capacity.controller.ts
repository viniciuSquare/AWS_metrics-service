
import { Controller, Get, Body, Post, Query, Render, UploadedFile } from '@nestjs/common';

import { MetricsXLSXReportService } from './services/MetricsXSLX.service';
import { MetricsService } from './services/Metrics.service';
import { metricsByDashboardName } from './shared/metadata/MetricsByDashboardName';
import { AWSMetricsFileHandler } from './handlers/AWSMetricsHandler';
import { AwsCapacityService } from './aws_capacity.service';

/**
 * Controller to handle awsReport requests
 * @class AWSReportController
 */
@Controller('/')
export class AwsCapacityController {
  // /**
  //  * Constructor
  //  * @param awsReportService awsReport Service to handle requests
  //  */
  constructor(private readonly service: AwsCapacityService) { }
  
  @Get()
  @Render('index')
  root() {
    return {
      dashboards: metricsByDashboardName
    }
  }

  /**
   * Route to update a ticket from awsReport
   * @param id Ticket ID
   * @param updateawsReportDto Ticket data to update
   * @returns Updated ticket
   */
  @Post('/handle-files')
  async handleUploadedFile(
    @UploadedFile() file: Array<Express.Multer.File>,
    @Query('command') command: string
  ) {
    console.debug(file)
    console.debug(command)

    if ( command == 'save-metrics' ) {
      console.log(command, file);
      
      return await this.service.persistUploadedFileMetrics(file);

    } else if ( command == 'get-excel' ) {
      console.log(command, file) 
      return await this.service.uploadedFileXslxReport(file);
    } else {
      throw new Error('Invalid command');
    }
  }

  async uploadedFileXslxReport(file: any) {
    const report = new AWSMetricsFileHandler(
      file.name,
      'upload',
      file.data,
    );
    const service = new MetricsXLSXReportService(report);
    service.processMetricsIntoDailySheets();
    return {
      statusCode: 204,
      message: service.getReportWeekFormula(),
    };
  }

  async persistUploadedFileMetrics(file: any) {
    const report = new AWSMetricsFileHandler(
      file.name,
      'upload',
      file.data,
    );
    await new MetricsService(report).saveMetrics();
    console.log(report.fileName, ' metrics saved successfully');
    return { statusCode: 201 };
  }
}
