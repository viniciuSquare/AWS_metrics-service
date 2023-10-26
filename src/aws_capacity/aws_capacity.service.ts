import { Injectable } from '@nestjs/common';
import { AWSMetricsFileHandler } from '../handlers/AWSMetricsHandler';
import { MetricsXLSXReportService } from './services/MetricsXSLX.service';
import { MetricsService } from './services/Metrics.service';

@Injectable()
export class AwsCapacityService {

  async uploadedFileXslxReport(file: any) {
    console.log(file, " to save EXCEL");
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

    console.debug(report.fileName, ' metrics saved successfully');
    return { statusCode: 201 };
  }

}
