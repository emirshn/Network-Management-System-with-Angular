import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private sharedData: any;

  setSharedData(data: any, data2: any) {
    this.sharedData = {
      devices: data,
      connections: data2,
    };
  }

  getSharedData() {
    return this.sharedData;
  }
}
