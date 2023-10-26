export class Service {
  public name: string;

  constructor(data?:{ name: string }) {
    if(data)
      Object.assign(this, data)
  }
}