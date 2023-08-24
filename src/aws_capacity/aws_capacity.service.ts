import { Injectable } from '@nestjs/common';
import { MetricsService } from './services/Metrics.service';
import { AWSMetricsFileHandler } from 'src/handlers/AWSMetricsHandler';
import { MetricsXLSXReportService } from './services/MetricsXSLX.service';

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
    console.log(file, " to save metrics");
    console.log('buffer:', new Buffer('hello, world!').toString('base64'))
    // console.log('buffer:', file.buffer.toString('base64'))
    // console.log('buffer:', file.buffer.toString('utf8'))
    console.log('buffer:', file.originalname.toString('utf8'))
    console.log('file:', file)

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
