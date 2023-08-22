import { Component, SimpleChanges } from '@angular/core';
import { DeviceService } from '../services/device.service';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { forkJoin } from 'rxjs';
import {
  DeviceType,
  Manufacturer,
  Model,
  ManufacturerDeviceType,
  DeviceInfo,
} from '../interfaces/models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manage-devices',
  templateUrl: './manage-devices.component.html',
  styleUrls: ['./manage-devices.component.css'],
})
export class ManageDevicesComponent {
  currentDatetime = new Date();
  formattedDatetime = this.currentDatetime.toISOString();

  deviceList: any[] = [];
  connectionList: any[] = [];
  linkList: any[] = [];

  updateForm: FormGroup = this.fb.group({
    id: [''],
    name: [''],
    ip: [''],
    mac: [''],
    manufacturer: [''],
    model: [''],
    device_type: [''],
    created_at: [''],
    updated_at: [''],
  });

  addForm: FormGroup = this.fb.group({
    name: [''],
    ip: [''],
    mac: [''],
    manufacturer: [''],
    model: [''],
    device_type: [''],
    created_at: [''],
    updated_at: [''],
  });

  linkForm: FormGroup = this.fb.group({
    sourceDevice: [''],
    targetDevice: [''],
    bandwidth: [''],
    latency: [''],
  });

  showUpdateForm: boolean = false;
  showAddForm: boolean = false;
  showLinkForm: boolean = false;

  selectedDevice: any = {}; // Store the selected device for update

  constructor(
    private deviceService: DeviceService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.addForm = this.fb.group({
      name: ['', Validators.required],
      ip: [
        '',
        [
          Validators.required,
          Validators.pattern('^\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}$'),
        ],
      ],
      mac: [
        '',
        [
          Validators.required,
          Validators.pattern(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/),
        ],
      ],
      manufacturer: ['', Validators.required],
      model: ['', Validators.required],
      device_type: ['', Validators.required],
      created_at: [''],
      updated_at: [''],
    });
    this.linkForm = this.fb.group({
      sourceDevice: ['', Validators.required],
      targetDevice: ['', Validators.required],
      bandwidth: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    if (!token) {
      this.router.navigate(['/auth']);
      return;
    }
    this.fetchData();
  }

  allDeviceInfo: DeviceInfo | undefined;
  deviceTypes: DeviceType[] = [];
  manufacturers: Manufacturer[] = [];
  models: Model[] = [];
  manufacturerDeviceTypes: ManufacturerDeviceType[] = [];

  filteredManufacturers: Manufacturer[] = [];
  filteredModels: Model[] = [];

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

  searchText: string = '';
  filteredDeviceList: any[] = [];

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

    // After filtering, reset the current page to 1
    this.currentPage = 1;
  }

  onDeviceTypeChange(): void {
    const selectedDeviceTypeId = this.addForm.value.device_type.id;

    this.filteredManufacturers = this.manufacturerDeviceTypes
      .filter((mdt) => mdt.device_type_id == selectedDeviceTypeId)
      .map((mdt) => this.findManufacturerById(mdt.manufacturer_id));

    this.filteredModels = this.models.filter(
      (model) => model.device_type_id == selectedDeviceTypeId
    );
  }

  onManufacturerChange(): void {
    const selectedManufacturerId = this.addForm.value.manufacturer.id;
    const selectedDeviceTypeId = this.addForm.value.device_type.id;

    this.filteredModels = this.models
      .filter((model) => model.manufacturer_id == selectedManufacturerId)
      .filter((model) => model.device_type_id == selectedDeviceTypeId);
  }

  findManufacturerById(manufacturerId: number): any {
    return this.manufacturers.find(
      (manufacturer) => manufacturer.id === manufacturerId
    );
  }

  findDeviceName(deviceId: number): string {
    const device = this.deviceList.find((d) => d.id === deviceId);
    return device ? device.name : 'Unknown Device';
  }

  userHasUpdatePermission(device: any): boolean {
    // Implement your role-based access logic to determine if the user can update
    // For example, check if the user has "admin" role
    return true;
  }

  userHasAddPermission(): boolean {
    // Implement your role-based access logic to determine if the user can add
    // For example, check if the user has "admin" role
    return true;
  }

  openUpdateForm(device: any): void {
    this.showUpdateForm = true;
    this.selectedDevice = { ...device };
    if (this.updateForm)
      this.updateForm.patchValue({
        id: this.selectedDevice.id,
        name: this.selectedDevice.name,
        ip: this.selectedDevice.ip_address,
        mac: this.selectedDevice.mac_address,
        manufacturer: this.selectedDevice.manufacturer,
        model: this.selectedDevice.model,
        device_type: this.selectedDevice.device_type,
        created_at: this.selectedDevice.created_at,
        updated_at: this.formattedDatetime,
      });
  }

  updateDevice(): void {
    const newDevice = {
      id: this.updateForm.value.id,
      name: this.updateForm.value.name,
      ip_address: this.updateForm.value.ip,
      mac_address: this.updateForm.value.mac,
      manufacturer: this.updateForm.value.manufacturer,
      model: this.updateForm.value.model,
      device_type: this.updateForm.value.device_type,
      created_at: this.updateForm.value.created_at,
      updated_at: this.formattedDatetime,
    };

    console.log(this.updateForm.value);
    this.deviceService.updateDevice(newDevice.id, newDevice).subscribe(
      (response) => {
        console.log('Device updated successfully:', response);
        this.showUpdateForm = false;
        this.fetchData(); // Fetch updated device list
      },
      (error) => {
        console.error('Error updating device:', error);
        // Handle error as needed
      }
    );
    this.showUpdateForm = false;
    this.fetchData();
  }

  addDevice(): void {
    const newDevice = {
      id: 1,
      name: this.addForm.value.name,
      ip_address: this.addForm.value.ip,
      mac_address: this.addForm.value.mac,
      manufacturer: this.addForm.value.manufacturer.name,
      model: this.addForm.value.model.model_name,
      device_type: this.addForm.value.device_type.name,
      created_at: this.formattedDatetime,
      updated_at: this.formattedDatetime,
      status: 'offline',
    };

    this.deviceService.addDevice(newDevice).subscribe(
      (response) => {
        console.log('Device added successfully:', response);
        this.showAddForm = false;
        this.fetchData();
      },
      (error) => {
        console.error('Error adding device:', error);
      }
    );
    this.showAddForm = false;
    this.fetchData();
  }

  deleteDevice(deviceId: any) {
    console.log(deviceId);
    this.deviceService.deleteDevice(deviceId).subscribe(
      (response) => {
        console.log('Device deleted successfully:', response);
        this.fetchData();
      },
      (error) => {
        console.error('Error deleting device:', error);
      }
    );
    this.showAddForm = false;
    this.fetchData();
  }

  createLink() {
    const newLink = {
      id: 1,
      source: this.linkForm.value.sourceDevice,
      target: this.linkForm.value.targetDevice,
      bandwidth: this.linkForm.value.bandwidth,
      latency: 1,
      traffic: 1,
    };

    this.deviceService.addLink(newLink).subscribe(
      (response) => {
        console.log('Device added successfully:', response);
        this.showAddForm = false;
        this.fetchData();
      },
      (error) => {
        console.error('Error adding device:', error);
      }
    );
    this.showAddForm = false;
    this.fetchData();
  }

  currentPage = 1;
  itemsPerPage = 3;

  get paginatedDeviceList() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredDeviceList.slice(startIndex, endIndex);
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

  getAvailableTargetDevices(deviceId: number) {
    return this.deviceList.filter((device) => device.id !== deviceId);
  }

  selectedSourceDeviceId: number | null = null;
  selectedTargetDeviceId: number | null = null;

  onDeviceSelectionChange(event: Event, selectionType: 'source' | 'target') {
    const selectedDeviceId = (event.target as HTMLSelectElement).value;
    if (selectionType === 'source') {
      this.selectedSourceDeviceId = +selectedDeviceId;
      this.linkForm.patchValue({ targetDevice: null });
    } else if (selectionType === 'target') {
      this.selectedTargetDeviceId = +selectedDeviceId;
    }
  }
}
