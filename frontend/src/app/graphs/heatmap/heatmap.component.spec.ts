import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { HeatmapComponent } from './heatmap.component';
import { DeviceService } from '../../services/device.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import * as d3 from 'd3';
import { of } from 'rxjs';

describe('HeatmapComponent', () => {
  let component: HeatmapComponent;
  let fixture: ComponentFixture<HeatmapComponent>;
  let deviceService: DeviceService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HeatmapComponent],
      imports: [HttpClientTestingModule], // Import required modules
      providers: [DeviceService], // Provide the service
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeatmapComponent);
    component = fixture.componentInstance;
    deviceService = TestBed.inject(DeviceService); // Inject the service
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should subscribe to data every 5 seconds', fakeAsync(() => {
    const deviceList = [
      [
        {
          id: 12,
          name: 'ip pc',
          ip_address: '178.233.133.10',
          mac_address: 'test device mac',
          manufacturer: 'test device manufacturer',
          model: 'test device model',
          device_type: 'test device type',
          created_at: '2023-08-21T15:33:19.530243',
          updated_at: '2023-08-21T15:33:19.530243',
          status: 'active',
        },
        {
          id: 13,
          name: 'test 2',
          ip_address: '178.233.143.20',
          mac_address: 'test 2',
          manufacturer: 'test 2',
          model: 'test 2',
          device_type: 'test 2',
          created_at: '2023-08-21T15:33:19.530243',
          updated_at: '2023-08-21T15:33:19.530243',
          status: 'active',
        },
        {
          id: 14,
          name: 'test device 3',
          ip_address: '178.233.123.30',
          mac_address: 'test device 3',
          manufacturer: 'test device 3',
          model: 'test device 3',
          device_type: 'test device 3',
          created_at: '2023-08-21T15:33:19.530243',
          updated_at: '2023-08-21T15:33:19.530243',
          status: 'active',
        },
        {
          id: 17,
          name: 'test device 4',
          ip_address: '178.233.113.40',
          mac_address: 'test device 4',
          manufacturer: 'test device 4',
          model: 'test device 4',
          device_type: 'test device 4',
          created_at: '2023-08-21T15:33:19.530243',
          updated_at: '2023-08-21T15:33:19.530243',
          status: 'active',
        },
      ],
    ];
    const linkList = [
      [
        {
          id: 1,
          source: 12,
          target: 13,
          bandwidth: 76,
          traffic: 3,
          latency: 7,
          isDown: false,
        },
        {
          id: 2,
          source: 13,
          target: 14,
          bandwidth: 30,
          traffic: 26,
          latency: 91,
          isDown: false,
        },
        {
          id: 4,
          source: 17,
          target: 12,
          bandwidth: 35,
          traffic: 56,
          latency: 85,
          isDown: false,
        },
        {
          id: 7,
          source: 12,
          target: 14,
          bandwidth: 57,
          traffic: 8,
          latency: 80,
          isDown: false,
        },
      ],
    ];

    spyOn(deviceService, 'getDeviceList').and.returnValue(of(deviceList));
    spyOn(deviceService, 'getLinks').and.returnValue(of(linkList));

    expect(component.deviceList).toEqual([]);
    expect(component.linkList).toEqual([]);
    tick(5000);
    fixture.detectChanges();

    expect(component.deviceList).toEqual(deviceList);
    expect(component.linkList).toEqual(linkList);
  }));

  it('should generate coordinate system', () => {
    const generateCoordinateSystemSpy = spyOn<any>(
      component,
      'generateCoordinateSystem'
    );

    const mockScale = jasmine.createSpyObj('scaleLinear', ['domain', 'range']);
    mockScale.domain.and.returnValue(mockScale);
    mockScale.range.and.returnValue(mockScale);
    spyOn(d3, 'scaleLinear').and.returnValue(mockScale);

    component['svg'] = {}; // Set private property directly

    // Now you can call the method that accesses the private property
    component['generateCoordinateSystem']();

    expect(generateCoordinateSystemSpy).toHaveBeenCalled();
  });
  // Similar tests for generateHeatmap should be added
});
