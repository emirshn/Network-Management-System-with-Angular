// models.ts

export interface DeviceType {
    id: number;
    name: string;
  }
  
  export interface Manufacturer {
    id: number;
    name: string;
  }
  
  export interface Model {
    id: number;
    manufacturer_id: number;
    device_type_id: number;
    model_name: string;
  }
  
  export interface ManufacturerDeviceType {
    manufacturer_id: number;
    device_type_id: number;
  }
  
  export interface DeviceInfo {
    manufacturers: Manufacturer[];
    models: Model[];
    manufacturer_device_types: ManufacturerDeviceType[];
    device_types: DeviceType[];
  }
  