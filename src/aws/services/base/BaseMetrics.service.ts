import dayjs from "dayjs";
import { Metric } from "../../../aws_capacity/models/Metric";
import { ToolsKit } from "../../../aws_capacity/shared/Tool";
import { AWSMetricsFileHandler } from "../../../handlers/AWSMetricsHandler";

export class AWSMetricsReportBaseService {

  protected metrics: Metric[] = [];
  protected days: Date[] = [];

  constructor( protected report: AWSMetricsFileHandler ) {
    const {metrics, days} = report.getMetricsOnValidPeriod()
		this.metrics = metrics; 
		this.days = days;

		console.log(this.metrics.length + " metrics loaded on " + this.report.dashboardDetails?.dashboardName);
  } 

  metricsByTime() {
		const keys = Object.keys(this.metricsByDay());
		const groupedData: { [day: string]: { [key: string]: string | Date | number }[] } = {}

		keys.map((day: string) => {
			const metricsByDay = this.metricsByDay()[day]
			
			const groupByTime = ToolsKit.groupBy('date');
			const metricsGroupedByDay = groupByTime(metricsByDay); // -> 02-01-2023

			groupedData[day] = []

			Object.keys(metricsGroupedByDay).forEach( time => {
				const metricByTime: { [key: string]: Date | string | number } = {};
        
				metricByTime["Date"] = dayjs(time).format('YYYY-MM-DD HH:mm:ss') || time;
				metricsGroupedByDay[time].forEach( (metric: Metric) => {
					metricByTime[metric.instance?.label || "undefined"] = Number(metric.maximumUsage);
				})

				groupedData[day].push(metricByTime);
			})
		});
		
		return groupedData
	}

	metricsByDay(): { [key: string]: any } {
		const groupByDay = ToolsKit.groupBy('day');
		const metricsGroupedByDay = groupByDay(this.metrics);

		const metricsByDayFiltered: { [key: string]: object[] } = {}

		const days = Object.keys(metricsGroupedByDay);

		days.forEach(day => {
			metricsByDayFiltered[day] = []

			metricsByDayFiltered[day]
				.push(...metricsGroupedByDay[day].filter((metric: Metric) => metric.isBusinessHour));
		})
		return metricsByDayFiltered
	}

}