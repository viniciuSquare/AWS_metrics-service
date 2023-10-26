import { Service } from "src/aws_capacity/models/Service";
import { ServiceDayCost } from "src/aws_capacity/models/ServiceDayCost";

export class BillingReportHandlerService {
  private costs: ServiceDayCost[];
  private services: Service;
  private headerEndLine = 2;
  private indexesToSkip = [0, 1];
  private data: string;

  constructor(data: string) {
    this.data = data.replace(/"/g, '').split("($)").join('');
  }

  async feedMetricsFromFile(product: string) {
    console.log(this.header, this.header.length)
    const data = await Promise.all(
      // FOR EACH SERVICE DESCRIBED ON HEADER
      // SAVE THE TOTAL COST FOR THE DATE
      this.rawContentArray.map(async (csvRow, line) => {
        if (this.indexesToSkip.includes(line)) return // Skip header                
        const metricsFromCSVRow = Array.from({ length: this.header.length - 1 }, async (_, idx) => {
          const headerValidIndex = idx + 1;
          const dateStringFromRow = csvRow.split(',')[0];
          let service = await this.serviceFromIdentifier(this.header[headerValidIndex]);
          // console.log(this.header[headerValidIndex]);

          if (!service) {
            console.log("Creating service", this.header[headerValidIndex]);

            const serviceAux = new Service();
            serviceAux.name = this.header[headerValidIndex];
            service = serviceAux;
          }

          const costRegister = new ServiceDayCost({
            date: new Date(dateStringFromRow),
            cost: Number(Number(csvRow.split(',')[headerValidIndex]).toFixed(2)),
            service: service.name,
            product: product
          }
          );

          return costRegister
        });

        return await Promise.all(metricsFromCSVRow);
      })
    ).then((result) => result.flat().filter(data => !!data))

    this.costs = data

    return this.costs;
  }

  /**
 * First column head is [date,...instances ids]
 * @returns header array  
 */
  get header(): string[] {
    const headerLines = this.rawDataArray.slice(0, 1);
    const header = headerLines[0].split(',')
    
    return header.slice(0, header.length - 1)
  }

  private get rawContentArray() {
    return this.rawDataArray.slice(this.headerEndLine, this.rawDataArray.length);
  }

  private get rawDataArray(): string[] {
    return this.data.split('\n');
  }

  private serviceFromIdentifier(identifier: string) {
    const service = new Service({ name: identifier })

    return service;
  }
}