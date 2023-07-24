# Diagrams

## Serving interface to process files
``` mermaid
  graph LR
  Server
  
  subgraph Serving_To_Process
    Server -->|GET | ProcessUploadedFile[Process Uploaded File]
    Server -->|GET | ProcessLocalFiles[Process Local Files]
    Server -->|POST| UplodaFile[ Uploda File]
  end
```
## Classes

``` mermaid
  classDiagram
  
  class AWSMetricsController {
    - awsInstances?: AWSDetails
    - metricDetails?: MetricDetails
    + processQueue(): Promise<AWSMetricsFileHandler[]>
    - getFilesOnQueue(): Promise<AWSMetricsFileHandler[]>
    + processRawData(awsRawReportHandler: AWSMetricsFileHandler, contentInputType, dataBuffer: Buffer): Promise<AWSMetricsFileHandler>
    - feedDashboardMetadata(awsReportHandler: AWSMetricsFileHandler): Promise<AWSDetails | undefined>
    - feedInstanceDetailsMetadata(): Promise<void>
  }

```

``` mermaid
  sequenceDiagram
      participant User
      participant Script
      participant AWSMetricsController
      participant Queue
      participant AWSMetricsFileHandler
      
      User->>Script: run `npm run start`
      Script->>AWSMetricsController: Invoke processQueue()
      AWSMetricsController->>Queue: Invoke filesToProcess()
      Queue->>AWSMetricsController: Return files
      AWSMetricsController->>+AWSMetricsFileHandler: Create AWSMetricsFileHandler instance to process file data
      AWSMetricsController->>AWSMetricsFileHandler: Invoke feedRawData()
      AWSMetricsFileHandler->>+AWSMetricsFileHandler: Process raw data
      AWSMetricsFileHandler->>AWSMetricsController: Return AWSMetricsFileHandler instance
      AWSMetricsController->>AWSMetricsFileHandler: Set instances details
      AWSMetricsController->>AWSMetricsFileHandler: Invoke feedMetricsFromFile()
      AWSMetricsFileHandler->>AWSMetricsController: Return AWSMetricsFileHandler instances

      AWSMetricsController->>Script: Return AWSMetricsFileHandler instances

```
