import { Component } from '@angular/core';
import { DeviceService } from '../services/device.service';
import { forkJoin } from 'rxjs';
import {
  DeviceInfo,
  DeviceType,
  Manufacturer,
  ManufacturerDeviceType,
  Model,
} from '../interfaces/models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.css'],
})
export class StatusComponent {
  deviceList: any[] = [];
  connectionList: any[] = [];
  linkList: any[] = [];
  searchText: string = '';
  filteredDeviceList: any[] = [];

  constructor(private deviceService: DeviceService, private router: Router) {}
  allDeviceInfo: DeviceInfo | undefined;
  deviceTypes: DeviceType[] = [];
  manufacturers: Manufacturer[] = [];
  models: Model[] = [];
  manufacturerDeviceTypes: ManufacturerDeviceType[] = [];

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    if (!token) {
      this.router.navigate(['/auth']);
      return;
    }
    this.fetchData();
    this.updateLinkDataRandomly();
  }

  updateLinkDataRandomly() {
    setInterval(() => {
      this.fetchData();
    }, 5000);
  }

  fetchData(): void {
    const deviceList$ = this.deviceService.getDeviceList();
    const connectionList$ = this.deviceService.getLinks();

    forkJoin([deviceList$, connectionList$]).subscribe(
      ([devices, connections]) => {
        this.deviceList = devices;
        this.filteredDeviceList = this.deviceList;
        this.connectionList = connections;
        this.linkList = this.connectionList.map((link) => ({
          source: link.source,
          target: link.target,
          source_device: this.findDeviceName(link.source),
          target_device: this.findDeviceName(link.target),
          bandwidth: link.bandwidth,
          latency: link.latency,
          traffic: link.traffic,
        }));
      },
      (error: any) => {
        console.error('Error fetching data:', error);
      }
    );

    this.deviceService.getAllDeviceInfo().subscribe((data) => {
      this.allDeviceInfo = data;
      this.manufacturers = this.allDeviceInfo.manufacturers;
      this.models = this.allDeviceInfo.models;
      this.manufacturerDeviceTypes =
        this.allDeviceInfo.manufacturer_device_types;
      this.deviceTypes = this.allDeviceInfo.device_types;
    });
  }
  selectedNode: any;

  activateDevice(device: any) {
    this.selectedNode = device;
    if (this.selectedNode) {
      this.deviceService
        .activateDevice(this.selectedNode.id, "active")
        .subscribe((data) => {
          console.log(data);
          this.selectedNode.status = data.device[9];
          this.fetchData();
        });
    } else {
      console.log('No connected device selected for activation.');
    }
  }
  deactivateDevice(device: any) {
    this.selectedNode = device;
    if (this.selectedNode) {
      this.deviceService
        .activateDevice(this.selectedNode.id, "offline")
        .subscribe((data) => {
          console.log(data);
          this.selectedNode.status = data.device[9];
          this.fetchData();
        });
    } else {
      console.log('No connected device selected for activation.');
    }
  }

  applyFilter() {
    this.filteredDeviceList = this.deviceList.filter((device) => {
      const searchTerms =
        device.name.toLowerCase() +
        device.ip_address.toLowerCase() +
        device.mac_address.toLowerCase() +
        device.manufacturer.toLowerCase() +
        device.model.toLowerCase() +
        device.device_type.toLowerCase();

      return searchTerms.includes(this.searchText.toLowerCase());
    });

    this.currentPage = 1;
  }

  findDeviceName(deviceId: number): string {
    const device = this.deviceList.find((d) => d.id === deviceId);
    return device ? device.name : 'Unknown Device';
  }

  currentPage = 1;
  itemsPerPage = 5;

  downDeviceClass = 'down-device';
  activeDeviceClass = 'active-device';

  get paginatedDeviceList() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredDeviceList.slice(startIndex, endIndex).sort((a, b) => {
      const statusPriority: Record<string, number> = {
        down: 0,
        active: 1,
        offline: 2,
      };

      const priorityA = statusPriority[a.status] || 3;
      const priorityB = statusPriority[b.status] || 3;

      return priorityB - priorityA;
    });
  }

  get pages() {
    const pageCount = Math.ceil(
      this.filteredDeviceList.length / this.itemsPerPage
    );
    return Array(pageCount)
      .fill(0)
      .map((_, index) => index + 1);
  }

  changePage(page: number) {
    this.currentPage = page;
  }
}
