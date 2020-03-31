import { Injectable } from '@angular/core';
import { Plugins } from '@capacitor/core';

const { Storage } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private scans: string[] = [];
  public apiEndpoint: string;
  public isOffline: boolean;
  constructor() { }

  public async loadScans() {
    const data = (await Storage.get({ key: 'scans' })).value;
    if (data != null) {
      this.scans = JSON.parse(data);
    }
  }
  public getScans() {
    return this.scans;
  }
  public addScan(scan: string) {
    this.scans.push(scan);
    Storage.set({ key: 'scans', value: JSON.stringify(this.scans)});
  }
}
