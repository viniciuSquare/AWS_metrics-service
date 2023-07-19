# AWS Capacity Report handler
This tool must help AWS metrics reports generation to performance analysis.

## Running the project
### Runnning locally
With **nodeJS** installed, execute the commands:
- To install dependencies `` npm install ``
- Then run with `` npm run serve `` to serve the HTML to handle the CSV files.
<!-- - after set directories to **raw CSV files**, metadata - `MetricsByDashboardName` map and `AWSDetails` to **outputReport**.
   !! Theses paths are hard coded for now !! -->
### Runnning with Docker
Run ``docker composer up`` and it will initialize the database and serve the HTML to handle the CSV files.

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