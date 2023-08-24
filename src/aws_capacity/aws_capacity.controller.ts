
import { Controller, Get, Body, Post, Query, Render, Req, UploadedFile, UseInterceptors, Res } from '@nestjs/common';

import { metricsByDashboardName } from './shared/metadata/MetricsByDashboardName';
import { AwsCapacityService } from './aws_capacity.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { BillingReportHandlerService } from 'src/handlers/BillingReportHandler';
import { ServicesCost } from './services/ServicesCost.service';

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
  constructor(
    private readonly service: AwsCapacityService,
  ) { }

  @Get()
  @Render('index')
  function() {
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
  @UseInterceptors(FileInterceptor('file'))
  async handleUploadedFile(
    @UploadedFile() file: Array<Express.Multer.File>,
    @Query('command') command: string
  ) {
    console.debug(file)
    console.debug(command)

    if (command == 'save-metrics') {
      return this.service.persistUploadedFileMetrics(file);
    } else if (command == 'get-excel') {
      return this.service.uploadedFileXslxReport(file);
    } else {
      throw new Error('Invalid command');
    }
  }


  @Post('budget')
  @UseInterceptors(FileInterceptor('file'))
  async processBudget(
    @UploadedFile() file: Express.Multer.File,
    @Query('product') product: string
  ) {
    if(!product)
      return "Product must be set"

    product = product.toUpperCase();

    const billingReport = new BillingReportHandlerService(file.buffer.toString('utf-8'));

    const servicesCosts = await billingReport.feedMetricsFromFile(product);

    // console.log(servicesCosts)
    return new ServicesCost(servicesCosts).saveCosts()
  }

}
