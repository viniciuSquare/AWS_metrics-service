
import { Injectable } from "@nestjs/common";
import { ToolsKit } from "../../aws_capacity/shared/Tool";

import { AWSMetricsFileHandler } from "../../handlers/AWSMetricsHandler";
import { PrismaService } from "src/prisma/prisma.service";
import { Periods } from "@prisma/client";

import { AWSMetricsReportBaseService } from "../../aws/services/base/BaseMetrics.service";

import { Metric } from "../models/Metric";


@Injectable()
export class MetricsService extends AWSMetricsReportBaseService {
  prisma = new PrismaService();

  constructor(
    report: AWSMetricsFileHandler
  ) {
    super(report);
  }

  async saveMetrics() {
    const promises = this.metrics
      .map(async (metric) => await this.storeMetric(metric));

    if (promises) {
      return await Promise.all(promises)
        .finally(async ()=> {
        await this.saveMetricsPeriod()
      })
    }

    console.error("No promise")
  }

  async storeMetric(metric: Metric) {
    try {
      if (await this.isValid(metric))
        return new Promise(() => null)
      else {
        let storedMetric;
        // Handle instance
        if (metric.instance && !metric.instance.id) { // There's instance label from CSV but not is no persisted
          console.log("Creating instance", metric.instance)
          throw "`instance` is not persisted yet"
        } else if (metric.instance?.id) {
          storedMetric = await this.prisma.metrics.create({
            data: {
              date: metric.date,
              instanceId: metric.instance.id,
              maximumUsage: metric.maximumUsage || 0,
              resource: metric.resource,
              service: metric.service,
              period: metric.period,
              product: metric.product,
            }
          })
        }

        await this.prisma.$disconnect();
        return storedMetric
      }

    } catch (error: any) {
      if (error?.message?.includes("unique constraint")) {
        console.error(" ! ! ! Unique constraint error:", error.message);
        // rollback the transaction and continue
      } else {
        console.error(" ! ! ! Deu ruim", error)
      }
    }
  }

  async isValid(metric: Metric) {
    if (metric.resource && metric.service && metric.date) {
      const where = {
        date: metric.date,
        resource: metric.resource,
        service: metric.service,
        product: metric.product,
        instanceId: metric.instance!.id
      }

      try {
        const duplication = await this.prisma.metrics.findFirst({
          where
        })

        if (duplication) {
          console.log("Duplication ", where, duplication);
          await this.prisma.$disconnect()
          console.error(" ! ! ! Duplicated ", duplication);

          return true
        }
        return false
      } catch (error: any) {
        if (error?.message?.includes("unique constraint")) {
          console.error(" ! ! ! Unique constraint error:", error.message);
          // rollback the transaction and continue
        } else {
          console.error(" ! ! ! Deu ruim 2 - duplication check", error)
          throw error;
        }
      }
    }
    throw new Error(`\nIncomplete data!!\t ${metric.instance?.id} ${metric.maximumUsage} ${metric.resource} ${metric.service} ${metric.date}`)


  }

  async saveMetricsPeriod() {
    const weeks = this.groupDaysIntoWeeks
    console.log(weeks)
    return await Promise.all(weeks.map(async weekDays => {
      const start = weekDays[0];
      const end = weekDays[weekDays.length - 1];
      const label = `Semana ${this.formatDateToBR(start)} - ${this.formatDateToBR(end)}`.replace(/\/2023/g, '')

      console.log(label);

      const weekRegister = await this.prisma.weeksPeriod.findFirst({
        where: {
          start: {
            equals: start
          }
        }
      })

      if (!weekRegister) {
        return await this.prisma.weeksPeriod.create({
          data: {
            label,
            start,
            end,
          }
        })
      } else console.log("Duplicated: " + label);
    }))
  }
}