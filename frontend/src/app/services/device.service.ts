import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DeviceInfo } from '../interfaces/models'; // Import the DeviceInfo interface

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  private baseUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  getDeviceList(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/devices`);
  }

  getDeviceLocations(): Observable<any> {
    return this.http.get<any[]>(`${this.baseUrl}/device-locations`);
  }

  getDevice(deviceId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/devices/${deviceId}`);
  }

  getAllDeviceInfo(): Observable<DeviceInfo> {
    return this.http.get<DeviceInfo>(`${this.baseUrl}/all_device_info`);
  }

  getLinks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/links`);
  }

  updateDevice(deviceId: number, updatedDevice: any): Observable<any> {
    return this.http.put<any>(
      `${this.baseUrl}/update_device/${deviceId}`,
      updatedDevice
    );
  }

  addDevice(newDevice: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/add_device`, newDevice);
  }

  addLink(newLink: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/add_link`, newLink);
  }

  deleteDevice(deviceId: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/delete_device/${deviceId}`);
  }

  activateDevice(deviceId: number, status: string): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/activate_device/${deviceId}/${status}`
    );
  }

  activateLink(
    linkId: number,
    status: string,
    updatedLink: any
  ): Observable<any> {
    let newLink = {
      bandwidth: updatedLink.bandwidth,
      id: updatedLink.id,
      index: updatedLink.index,
      isDown: updatedLink.isDown,
      latency: updatedLink.latency,
      source: updatedLink.source.id,
      target: updatedLink.target.id,
      traffic: updatedLink.traffic,
    };

    return this.http.put<any>(
      `${this.baseUrl}/activate_link/${linkId}/${status}`,
      newLink
    );
  }
}
