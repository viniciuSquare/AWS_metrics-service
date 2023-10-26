import { Instances, MetricService, QuiverProducts } from "@prisma/client";
import { Instance } from "../models/Instance";
import { PrismaService } from "src/prisma/prisma.service";


export class InstanceService {

  private client = new PrismaService();

  // private ec2?        : AWS.EC2;
  private credentials?: {
    accessKeyId: string,
    secretAccessKey: string
  };

  async getInstancesDetailsFromMetadata(product: QuiverProducts, service: MetricService,) {
    try {
      // Query Instances from DB
      const prismaInstances: Instances[] = await this.client.instances.findMany({
        where: {
          AND: {
            product: {
              contains: product
            },
            service: {
              contains: service
            }
  
          }
        }
      })
      
      if (!prismaInstances) {
        throw new Error("There are no instances, can't update report metadata");
      }
      
      return prismaInstances.map(instance => {
        return new Instance().fromPrisma(instance)
      })
    } catch (error) {
      console.error(error);
    }
  }

  private async storeInstance(instance: Instance | undefined) {
    if (instance) {
      try {
        const storedInstances = await this.client.instances.create({
          data: instance
        })

        return storedInstances

      } catch (error) {
        console.error(error)
      }
    }
  }
  
  // * AWS Services
  feedCredentialsFromProduct(product: "PRO" | "PLUS",) {
    this.credentials = {
      accessKeyId: process.env[`${product}_ACCESS_KEY_ID`] ?? "EMPTY",
      secretAccessKey: process.env[`${product}_SECRET_ACCESS_KEY`] ?? "EMPTY"
    }
  }

  private async getInstancesFromEC2() {
    // console.debug(this.credentials);
    // // Instances data 
    // this.ec2 = new EC2({
    //   region: this.instances.region,
    //   credentials: new Credentials(this.credentials)
    // });

    // let ec2InstancesDescriptionPromise = this.ec2.describeInstances().promise();

    // return ec2InstancesDescriptionPromise.then(async instancesDescriptions => {
    //   console.log('Feeding instances\n');

    //   let persistencePromises: any = []

    //   instancesDescriptions.Reservations?.forEach(reservation => {
    //     return this.convertAWSReservationsToInstances(reservation)?.forEach(
    //       instance => {
    //         persistencePromises.push(this.storeInstance(instance))
    //       }
    //     )
    //   });

    //   return persistencePromises ? await Promise.all(persistencePromises) : undefined
    // })
  } 

  // private convertAWSReservationsToInstances(reservations: AWS.EC2.Reservation) {
  //   if (reservations.Instances)
  //     return reservations.Instances?.map(awsInstance => new Instance().fromAWS(awsInstance))

  // }

  // ------------
  // Save to file
  // ------------
  // private saveInstancesToJSONFile() {
  //   const parsedData = JSON.stringify(this.instances, null, 2)
  //   console.debug('Saving JSON file with instances!!\n', parsedData);
  //   fs.writeFile(
  //     `${this.instancesDir}/${this.instances.region}.json`,
  //     parsedData, "utf-8",
  //     (err) => {
  //       err ? console.error(err) : console.log("Data saves successfully!!\n")
  //     }
  //   )
  // }
}