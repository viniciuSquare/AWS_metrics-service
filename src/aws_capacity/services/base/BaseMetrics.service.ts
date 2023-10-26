import dayjs, { Dayjs } from "dayjs";

import { AWSMetricsFileHandler } from "../../handlers/AWSMetricsHandler";
import { Metric } from "src/aws_capacity/models/Metric";
import { ToolsKit } from "src/aws_capacity/shared/Tool";

export class AWSMetricsReportBaseService {

  protected metrics: Metric[] = [];
	public days: Date[] = [];

  constructor( protected report: AWSMetricsFileHandler ) {
		const { metrics, days } = report.getMetricsOnValidPeriod();

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

		// const days = Object.keys(metricsGroupedByDay);

		this.days.forEach(day => {
			const formattedDay = day.toDateString().split('T')[0]

			metricsByDayFiltered[formattedDay] = []

			metricsByDayFiltered[formattedDay]
				.push(...metricsGroupedByDay[formattedDay].filter((metric: Metric) => metric.isBusinessHour));
		})

		return metricsByDayFiltered
	}

	get weeks() {
		return this.groupDaysIntoWeeks.map( weeksDates => {
			return weeksDates.map( this.formatDateToBR )
		})
	}

	formatDateToBR(date: Date) {
		const [ year, month, day ] = date.toISOString().split('T')[0].split('-')
		return `${day}/${month}/${year}`
	}

	get groupDaysIntoWeeks() {
		const weeks: Date[][] = [];
		let currentWeek: Date[] = [];
		let previousDate: Date;

		this.days.forEach((dayString, i) => {
			// const [day, month, year] = dayString.split("/");

			// const currentDate = new Date(`${month}/${day}/${year}`);
			const currentDate = dayString;

			if (previousDate && currentDate.getDate() - previousDate.getDate() > 1) {
				weeks.push(currentWeek);
				currentWeek = [];
			}
			currentWeek.push(currentDate);
			previousDate = currentDate;

			i == this.days.length - 1 && weeks.push(currentWeek);
		});

		console.debug(weeks)

		return weeks;
	}

	groupWeekDates(dates: string[]): string[][] {
		const days: Dayjs[] = dates.map((dateString, index) => {
			const [day, month, year] = dateString.split('/')
			const date = dayjs(`${year}-${month}-${day}`);

			return date
		})

		const group: string[][] = [];
		let currentGroup: string[] = [];

		days.forEach((day, index) => {
			if (index === 0 || !day.isSame(dayjs(days[index - 1], 'DD/MM/YY').add(1, 'day'), 'day')) {
				// If it's the first date or the difference between this date and the previous date is not exactly one day
				// Start a new group
				currentGroup = [days[index].format('DD/MM/YYYY')];
				group.push(currentGroup);
			} else {
				// Otherwise, add the date to the current group
				currentGroup.push(days[index].format('DD/MM/YYYY'));
			}
		})
		return group;
	}

}