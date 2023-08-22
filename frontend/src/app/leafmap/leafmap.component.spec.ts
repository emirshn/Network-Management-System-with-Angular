import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LeafmapComponent } from './leafmap.component';
import { DeviceService } from '../services/device.service';
import * as L from 'leaflet';
import { of } from 'rxjs';
import { Router } from '@angular/router';

describe('LeafmapComponent', () => {
  let component: LeafmapComponent;
  let fixture: ComponentFixture<LeafmapComponent>;
  let httpSpy: jasmine.SpyObj<HttpClient>;
  let deviceServiceSpy: jasmine.SpyObj<DeviceService>;

  beforeEach(() => {
    httpSpy = jasmine.createSpyObj('HttpClient', ['get']);
    deviceServiceSpy = jasmine.createSpyObj('DeviceService', [
      'getDeviceList',
      'getLinks',
      'getDeviceLocations',
    ]);

    TestBed.configureTestingModule({
      declarations: [LeafmapComponent],
      imports: [RouterTestingModule],
      providers: [
        { provide: HttpClient, useValue: httpSpy },
        { provide: DeviceService, useValue: deviceServiceSpy },
      ],
    });

    fixture = TestBed.createComponent(LeafmapComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to /auth if token is not present in ngOnInit', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    const routerSpy = spyOn(TestBed.inject(Router), 'navigate');

    component.ngOnInit();

    expect(routerSpy).toHaveBeenCalledWith(['/auth']);
  });

  it('should initialize map and call fetch in ngOnInit', () => {
    spyOn(localStorage, 'getItem').and.returnValue('sample-token');
    const fetchSpy = spyOn(component, 'fetch');

    component.ngOnInit();

    expect(fetchSpy).toHaveBeenCalled();
  });

  // it('should fetch data and update map in fetch', () => {
  //   const deviceList = [{ id: '1' }];
  //   const connectionList = [{ source: '1', target: '2' }];
  //   const deviceLocations = {
  //     geo_info: [
  //       [1, 2],
  //       [3, 4],
  //     ],
  //   };
  //   httpSpy.get.and.returnValues(
  //     of(deviceList),
  //     of(connectionList),
  //     of(deviceLocations)
  //   );

  //   component.fetch();

  //   expect(httpSpy.get.calls.count()).toBe(3);
  //   expect(component['connection_data'].devices).toEqual(deviceList);
  //   expect(component['connection_data'].links).toEqual(connectionList);-
  //   expect(component.randomPoints).toEqual(deviceLocations.geo_info);
  // });

  // More tests for other methods can be added
});
