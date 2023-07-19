import { Injectable } from "@nestjs/common";
import { DashboardMetadata } from "../shared/Types";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class DashboardsService {
  constructor ( private prisma: PrismaService ) {}

  async getMetadataFromReport(dashboardName: string): Promise<DashboardMetadata> {

    console.log('Query dashboard details on report ', dashboardName,'\n')

    const dashboardMetadata = await this.prisma.aWSDashboardDetails.findFirst({
      where: {
        dashboardName
      }
    });

    if(!dashboardMetadata)
      throw console.error(dashboardName, dashboardMetadata);

    return {
      dashboardName: dashboardMetadata.dashboardName,
      product: dashboardMetadata.product,
      service: dashboardMetadata.service,
      resource: dashboardMetadata.resource
    };
  }
}