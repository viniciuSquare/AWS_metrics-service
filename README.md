# AWS Capacity Report handler
This tool must help AWS metrics reports generation to performance analysis. 
With data processed and persisted, database feed Grafana metrics dashboard.


## How does it works?
It reads CSV files with metrics to save to database or create a XLSX sheet so then decisions can be taken from the metrics.

### Runnning locally with NodeJS
With **nodeJS** installed
1. Clone ```.env.exemple``` and set the variables:
   - Case use database, set `DATABASE_URL`;
   - Case use to generate XSLX files:
      - `RAW_DIRNAME`: path to raw CSV files;
      - `TREATED_DIRNAME`: output to processed reports.
   
**To run execute the commands:**
1. To install dependencies `` npm install ``;
2. Case use the database:
   1. `npx prisma generate` to create database client;
   2. `npx prisma migrate dev` to create the database structure;

3. Then run with ``npm run start:dev`` to serve the HTML to handle the CSV files.

<!-- - after set directories to **raw CSV files**, metadata - `MetricsByDashboardName` map and `AWSDetails` to **outputReport**.
   !! Theses paths are hard coded for now !! -->
### Runnning with Docker
Run ``docker composer up`` and it will initialize the database and serve the HTML to handle the CSV files.

I created a image available at [Docker Hub](https://hub.docker.com/repository/docker/viniciusquare/quiver_aws_metrics_service/general).
Project files are at `/usr/app` directory and the API listens to `3000`;

- `docker-compose.yml` service example:
  ```yml
    aws_capacity_service:
      build: ./aws_capacity-service
      container_name: quiver_aws_capacity_service
      command: npm run start:dev
      ports:
        - "3000:3000"
      volumes:
        - ./aws_capacity-service:/usr/app
      environment:
        - DATABASE_URL=mysql://user:password@host:3306/aws_metrics?pool_timeout=0
        - TREATED_DIRNAME=treated
        - RAW_DIRNAME=raw
  ```
---

# Development context
Recently changed from Laravel/Angular dev into DevOps, where most of our infrastructure are on AWS. There is a report used to keep track of our server's instances performance metrics, today this report is done manually.
#### 😮‍💨 Building report manually
AWS CPU and Memory metrics data are extracted from a dashboards as CSV reports, so they are formatted: numbers fixed and business period filtered. Data is pasted into a sheet with instances label as header, when all days of the week are completed, the week report is compiled with day's data.  

## How does it work?
Data from CSV file is treated, filtered by business work time and grouped by day and XLSX workbook is generated, a sheet / day.
   - *Week data processing to be developed*

- Simplistic sequence diagram of data flow. Async methods to return data within these shown methods need to be improved.
![Data flow from raw file reading to XLSX report generation](docs/SequenceDiagram.png)

**Main structures**
| ![Classes diagram](docs/Classes.png) | ![Data structures](docs/DataStructures.png) |
| --- | --- |

| Class | Functionally |
| --- |     ---    |
`Queue` | Read raw files directory to get files queue. |
`AWS File Handler` | Process data from CSV and format into treated data to report generation. |
| `AWS Metrics Controller` | Controls the workflow: **Files on queue** > Get **environment Metadata** > **Process and format CSV** to get metrics data > **Build/update XLSX reports**
| `MetricsXLSXReportService` | Generate the output XLSX from metrics `formattedData`
| `MetricsService` | Handle metrics filters and communicate with database `formattedData`


---

📌 I'm trying to improve tasks/development tracking, also mapping identified **technical debts** to further improvements.