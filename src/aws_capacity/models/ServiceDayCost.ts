export class ServiceDayCost {
  public cost: number;
  public date: Date;
  public service: string
  public product: string

  constructor(data?: {
    cost: number;
    date: Date;
    service: string;
    product: string;

  }) {
    if(data)
      Object.assign(this, data)
  }

}