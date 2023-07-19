import { OutputMetricsReportProps, OutputReport } from "./OutputReport";

import * as PLUS_DB_CPU_WidgetJson from '../shared/metadata/PLUS/PLUS_DB_CPU.json'
import * as PLUS_DB_MEM_WidgetJson from '../shared/metadata/PLUS/PLUS_DB_MEM.json'
import * as PLUS_APP_CPU_WidgetJson from '../shared/metadata/PLUS/PLUS_APP_CPU.json'
import * as PLUS_APP_MEM_WidgetJson from '../shared/metadata/PLUS/PLUS_APP_MEM.json'

export class PlusOutputReport extends OutputReport {
  // private awsService: AWSService;
  private awsCredentials = {
    accessKeyId: process.env.PLUS_ACCESS_KEY_ID ? process.env.PLUS_ACCESS_KEY_ID : "EMPTY",
    secretAccessKey: process.env.PLUS_SECRET_ACCESS_KEY ? process.env.PLUS_SECRET_ACCESS_KEY : "EMPTY"
  }

  weeksReportSheetRange = [['A1:O12']]

  constructor() {
    super("PLUS");
    // this.awsService = new AWSService(this.awsCredentials);
  }

  private DBCPUSample = `=IFERROR(AVERAGE('01-02-2023'!C17;'02-02-2023'!C17;'03-02-2023'!C17);"-")`;
  private DBMemorySample = `=IFERROR(AVERAGE('01-02-2023'!C39;'02-02-2023'!C39;'03-02-2023'!C39);"-")`;

  private AppCPUSample = `=IFERROR(AVERAGE('01-02-2023'!C17;'02-02-2023'!C17;'03-02-2023'!C17);"-")`;
  private AppMemorySample = `=IFERROR(AVERAGE('01-02-2023'!I17;'02-02-2023'!I17;'03-02-2023'!I17);"-")`;

  outputReportProperties: OutputMetricsReportProps = {
    application: {
      sourceRange: 'A2:E13',
      resourceMetricsRanges: {
        cpu: {
          dataOutputRanges: 'B4:F15',
          weekMetricsStartRange: 'C17:F20',
          weekFormulaSample: this.DBCPUSample,
        },
        memory: {
          dataOutputRanges: 'H4:L15',
          weekMetricsStartRange: 'I17:L20',
          weekFormulaSample: this.DBMemorySample,
        },
      },
      instancesQuantity: 4
    },
    database: {
      sourceRange: 'A2:G13',
      resourceMetricsRanges: {
        cpu: {
          dataOutputRanges: 'B4:H15',
          weekMetricsStartRange: 'C17:H20',
          weekFormulaSample: this.AppCPUSample,
        },
        memory: {
          dataOutputRanges: 'B26:H37',
          weekMetricsStartRange: 'C39:H41',
          weekFormulaSample: this.AppMemorySample,
        },
      },
      instancesQuantity: 6
    }
  }

  // * AWS Service params to query CloudWatch - TODO
  /**
   * service:
   *  resource
   *    MetricWidget
   *    MetricDataQueries
   *  * Handle period -> Start and End 
   * */
  static metadataProps = {
    database: {
      memory: {
        MetricWidget: JSON.stringify(PLUS_DB_MEM_WidgetJson) 
      },
      cpu: {
        MetricWidget: JSON.stringify(PLUS_DB_CPU_WidgetJson)
      }
    },
    application: {
      memory: {
        MetricWidget: JSON.stringify(PLUS_APP_MEM_WidgetJson)
      },
      cpu: {
        MetricWidget: JSON.stringify(PLUS_APP_CPU_WidgetJson)
      }
    }
  }
}