import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { StatusComponent } from './status.component';
import { DeviceService } from '../services/device.service';
import { of } from 'rxjs';

describe('StatusComponent', () => {
  let component: StatusComponent;
  let fixture: ComponentFixture<StatusComponent>;
  let deviceService: DeviceService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [StatusComponent],
      providers: [
        {
          provide: DeviceService,
          useValue: {
            getDeviceList: () => of([]),
            getLinks: () => of([]),
            activateDevice: (deviceId: number, status: string) =>
              of({
                device: [
                  /* response data here */
                ],
              }),
            getAllDeviceInfo: () =>
              of({
                manufacturers: [],
                models: [],
                manufacturer_device_types: [],
                device_types: [],
              }),
          },
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatusComponent);
    component = fixture.componentInstance;
    deviceService = TestBed.inject(DeviceService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should activate device', () => {
    const deviceId = 12;
    const device = {
      id: 12,
      name: 'ip pc',
      ip_address: '178.233.133.10',
      mac_address: 'test device mac',
      manufacturer: 'test device manufacturer',
      model: 'test device model',
      device_type: 'test device type',
      created_at: '2023-08-21T15:33:19.530243',
      updated_at: '2023-08-21T15:33:19.530243',
      status: 'offline',
    };

    spyOn(deviceService, 'activateDevice').and.returnValue(
      of({ device: ['active'] })
    );
    
    component.activateDevice(device);
    expect(deviceService.activateDevice).toHaveBeenCalledWith(
      deviceId,
      'active'
    );

    expect(device.status).toBe('active');
  });

  // Add more test cases for other scenarios if needed
});
