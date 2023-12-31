import fs from "fs";
import XLSX from 'xlsx'
import dayjs, { Dayjs } from "dayjs";

import { MetricsService } from "./Metrics.service";
import { AWSMetricsFileHandler } from "../handlers/AWSMetricsHandler";
import { Metric } from "../models/Metric";
import { PROOutputReport } from "../models/ProOutputReport";
import { PlusOutputReport } from "../models/PlusOutputReport";
import { AWSMetricsReportBaseService } from "./base/BaseMetrics.service";

export class MetricsXLSXReportService extends AWSMetricsReportBaseService {
	public srcCodeBaseDir = __dirname.split('/').splice(0, __dirname.split('/').length - 1).join('/');
	private processedReportPath: string;
	private outputModelPath: string;

	public workbook: XLSX.WorkBook;
	private workbookOptions: XLSX.WritingOptions = {
		bookType: 'xlsx',
		bookSST: true,
		type: 'binary',
		cellDates: true,
		cellStyles: true
	};

	public metrics: Metric[] = [];

	private resource: string;
	private product: string;
	private service: string;

	constructor(report: AWSMetricsFileHandler) {
		super(report);
		this.workbook = XLSX.utils.book_new();

		this.checkStructureIntegrity();

		// * Get metadata from file to feed paths
		const { resource, service, product } = this.report.dashboardDetails!;
		[this.resource, this.service, this.product] = [resource!, service!, product!];

		this.processedReportPath = `${this.srcCodeBaseDir}/${process.env.TREATED_DIRNAME}`;
		this.outputModelPath = `${this.processedReportPath}/Model/${this.product} ${this.service}/Model - ${this.product} - ${this.service}.xlsx`
	}

	async checkStructureIntegrity() {
		const sourceDirPathList = await fs.readdirSync(this.srcCodeBaseDir, 'utf-8');

		if (!this.isStructureCreated(sourceDirPathList)) {
			// TODO -> HANDLE DIRS CREATION
			console.log("!!!!!! CREATE BASE STRUCTURE !!!!!!\n\n");
		}
	}

	isStructureCreated = (sourceDirPathList: string[]) => {
		return (sourceDirPathList.filter(dir => (dir == 'raw' || dir == 'treated')))
	}

	// ------------------------------> <------------------------------

	setWorkbook(workbook: XLSX.WorkBook) {
		this.workbook = workbook;
	}

	// public generateOutputReport() {
	// 	// * Process metrics into daily sheets
	// 	// this.processMetricsIntoDailySheets();

	// 	// * Read model from structure
	// 	const modelWorkbook = XLSX.readFile(this.outputModelPath, { ...this.workbookOptions, cellFormula: true, cellStyles: true });
	// 	this.processMetricsIntoDailySheets();


	// 	const modelWorksheet = modelWorkbook.Sheets['DayModel'];

	// 	// * Set ranges to copy data
	// 	let productReportInstance: PROOutputReport | PlusOutputReport;

	// 	if (this.product == 'PRO')
	// 		productReportInstance = new PROOutputReport();
	// 	else
	// 		productReportInstance = new PlusOutputReport();

	// 	// * GET SOURCE RANGE
	// 	const { sourceRange } = productReportInstance.outputReportProperties[this.service.toLowerCase() as 'application' | 'database'];
	// 	const { resourceMetricsRanges } = productReportInstance.outputReportProperties[this.service.toLowerCase() as 'application' | 'database'];

	// 	/**
	// 	 * For each day metrics sheet
	// 	 * 	copy data to model
	// 	 * */
	// 	this.workbook.SheetNames.map(sheetName => {
	// 		const sheetWithData = this.workbook.Sheets[sheetName];

	// 		const updatedSheet = this.copyRanges(
	// 			sourceRange, sheetWithData,
	// 			resourceMetricsRanges[this.resource as "cpu" | "memory"].dataOutputRanges, modelWorksheet
	// 		)


	// 	})

	// 	// console.log(modelWorkbook.Sheets['DayModel']['C4']);
	// 	this.saveWorkbook(this.outputModelPath.replace('.xlsx', ' - test.xlsx'), modelWorkbook);
	// }

	public processMetricsIntoDailySheets(path = this.processedReportPath) {
		const metricsService = new MetricsService(this.report);

		const metricsByTime = this.metricsByTime();

		const metricsDays = Object.keys(metricsByTime);

		// * Create worksheets from metrics by day
		metricsDays.map(day => {
			const metricByDay = metricsByTime
			const worksheet = this.creteWorksheet(metricByDay[day])

			// Rename day to sheet name
			const sheetName = day.replace('/', '-').replace('/', '-')
			// Add sheet to workbook
			XLSX.utils.book_append_sheet(this.workbook, worksheet, sheetName);
		})

		path = `${path}/${this.product} - ${this.service} - ${this.resource}.xlsx`;

		// * Save workbook into file
		this.saveWorkbook(path);
	}

	creteWorksheet(jsonData: object[]) {
		// this.createWorkbookIndexes(jsonData);
		// console.log("Json Data", jsonData);

		const worksheet = XLSX.utils.json_to_sheet(jsonData);
		// console.log("Worksheet ->", worksheet)

		return worksheet
	}

	saveWorkbook(path = this.processedReportPath, workbook = this.workbook, options = this.workbookOptions) {
		XLSX.writeFileXLSX(
			workbook,
			`${path}`, // path,
			options
		);
		console.log("Day metrics into workbook ", path, "\n");
	}

	getReportWeekFormula() {
		const productReportInstance: PROOutputReport | PlusOutputReport = this.product == 'PRO' ? new PROOutputReport() : new PlusOutputReport();
		const groupedDays = this.groupDaysIntoWeeks.map( dates => {
			return dates.map(date => date.toISOString())
		} );

		const reportWeekFormula = productReportInstance.getWeekMetricsFormulaBy(groupedDays);
		
		const formulaSelector: 'application_cpu' | 'application_memory' | 'database_cpu' | 'database_memory' = `${this.report.metricsService!.toLowerCase() as 'application' | 'database'}_${this.report.metricsResource!.toLowerCase() as 'cpu' | 'memory'}` as 'application_cpu' | 'application_memory' | 'database_cpu' | 'database_memory';

		return reportWeekFormula.map(formulas => { return { [`${this.product} - ${formulaSelector}`]: formulas[formulaSelector] } });
	}

	/***
	 * Copy data from source range to destination range
	 * @return updatedSheet: XLSX.WorkSheet
	*/
	copyRanges(
		sourceRange: string,
		sourceSheet: XLSX.WorkSheet,
		destinationRange: string,
		destinationSheet: XLSX.WorkSheet
	) {
		// get the range in the source sheet
		const decodedSourceRange = XLSX.utils.decode_range(sourceRange);
		// const sourceSheet = workbook.Sheets[sourceSheetName];

		// get the range in the destination sheet
		const decodedDestinationRange = XLSX.utils.decode_range(destinationRange);
		// const destinationSheet = workbook.Sheets[destinationSheetName];

		// copy the data from the source range to the destination range
		for (let i = decodedSourceRange.s.r; i <= decodedSourceRange.e.r; i++) {
			for (let j = decodedSourceRange.s.c; j <= decodedSourceRange.e.c; j++) {

				const sourceCell = XLSX.utils.encode_cell({ r: i, c: j });

				const destinationCell = XLSX.utils.encode_cell({
					r: i - decodedSourceRange.s.r + decodedDestinationRange.s.r,
					c: j - decodedSourceRange.s.c + decodedDestinationRange.s.c,
				});

				destinationSheet[destinationCell] = { ...sourceSheet[sourceCell] };
			}
		}

		return destinationSheet;
	}
}