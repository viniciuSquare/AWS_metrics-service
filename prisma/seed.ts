import { QuiverProducts } from "@prisma/client";
import { instances } from "src/aws_capacity/shared/metadata/Instances";
import { metricsByDashboardName } from "src/aws_capacity/shared/metadata/MetricsByDashboardName";
import { PrismaService } from "src/prisma/prisma.service";


const client = new PrismaService()

instances.forEach(async instance => {
    const instanceExists = await client.instances.findFirst({ 
        where: { instanceId: { equals: instance.instanceId } } 
    })
    if(instanceExists) {
        return
    }

    await client.instances.create({
        data: instance
    }).finally( () => console.log("\n", instance.label, " created"));
})

metricsByDashboardName.forEach(async ({ dashboardName, service, resource, product }) => {
    const existingRecord = await client.aWSDashboardDetails.findFirst({
        where: {
            dashboardName
        }
    })

    if (!existingRecord && product && service && resource) {
        // To match Enum class
        const formattedProduct: QuiverProducts = product

        await client.aWSDashboardDetails.create({
            data: {
                dashboardName,
                service,
                resource,
                product: formattedProduct
            }
        }).then(() => {
            console.log(dashboardName, " dashboard saved")
        })
    }
});