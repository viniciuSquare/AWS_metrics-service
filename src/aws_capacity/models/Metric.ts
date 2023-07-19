import { Periods, MetricService, MetricResource, QuiverProducts } from "@prisma/client";
import { Instance } from "./Instance";

export class Metric {
  id?: number

  constructor(
    public date: Date,
    public maximumUsage: number,
    public service?: MetricService,
    public resource?: MetricResource,
    public product?: QuiverProducts,
    public instance?: Instance
  ) { }

  get dayOfTheWeek() {
    return this.date.getDay()
  }

  get hour() {
    return this.date.getHours()
  }

  get day() {
    return this.date.toLocaleDateString("pt-BR")
  }

  get isBusinessDay(): boolean {
    const weekendDays = [0, 6];
    return this.dayOfTheWeek ? !weekendDays.includes(this.dayOfTheWeek) : false;
  }

  get isBusinessHour(): boolean {
    const businessHour = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
    return this.hour ? businessHour.includes(this.hour) : false;
  }

  get period(): Periods {
    if ((this.hour == 8) || (this.hour >= 12 && this.hour <= 14))
      return "NORMAL"

    if ((this.hour >= 9 && this.hour <= 11) || (this.hour >= 15 && this.hour <= 17))
      return "PICO"

    return "NOTURNO"
  }
}