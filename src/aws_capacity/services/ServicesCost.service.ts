import { PrismaClient } from "@prisma/client";
import { ServiceDayCost } from "../models/ServiceDayCost";

export class ServicesCost {
  constructor( private servicesDailyCosts: ServiceDayCost[] ) {

  }
  
  async saveCosts() {
    const client = new PrismaClient();

    return await Promise.all(this.servicesDailyCosts.map( async serviceDayCost => {
      const duplication = await client.serviceDailyCost.findFirst({
        where: {
          date: {
            equals: serviceDayCost.date
          },
          service: {
            equals: serviceDayCost.service,
          },
          product: {
            equals: serviceDayCost.product
          }
        }
      })
      
      if(duplication && ( serviceDayCost.cost == duplication.cost )) {
        return duplication;
      }

      return await client.serviceDailyCost.create({
        data: {
          service: serviceDayCost.service,
          date: serviceDayCost.date,
          cost: serviceDayCost.cost,
          product: serviceDayCost.product,

        }
      })
    }))

  }

}