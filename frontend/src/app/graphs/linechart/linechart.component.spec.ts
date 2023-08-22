import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { LinechartComponent } from './linechart.component';
import { DeviceService } from 'src/app/services/device.service';
import { of } from 'rxjs';
import * as d3 from 'd3';
import { select as d3select } from 'd3-selection';

describe('LinechartComponent', () => {
  let component: LinechartComponent;
  let fixture: ComponentFixture<LinechartComponent>;
  let deviceService: DeviceService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [LinechartComponent],
      providers: [
        {
          provide: DeviceService,
          useValue: {
            getLinks: () => of([]), // Mock the getLinks method here
          },
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinechartComponent);
    component = fixture.componentInstance;
    deviceService = TestBed.inject(DeviceService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

//   it('should update chart when data is received', () => {
//     const svg = d3select(
//       fixture.debugElement.query(By.css('svg')).nativeElement
//     );
//     const updateChartSpy = spyOn(component, 'updateChart').and.callThrough();

//     // Simulate data change
//     const testData = [
//       {
//         id: 1,
//         traffic: 100,
//         bandwidth: 200,
//         latency: 50,
//       },
//       {
//         id: 2,
//         traffic: 150,
//         bandwidth: 180,
//         latency: 30,
//       },
//     ];
//     spyOn(deviceService, 'getLinks').and.returnValue(of(testData));

//     component.ngOnInit();

//     // Ensure that updateChart was called
//     expect(component.updateChart).toHaveBeenCalled();

//     // Ensure that updateChart was called
//     expect(updateChartSpy).toHaveBeenCalled();

//     // Check that the chart SVG was updated
//     expect(svg.selectAll('.line-chart').size()).toBe(2); // Assuming 2 data points

//     // You can add more specific checks here based on your actual chart content
//     // For example, check the attributes of the chart elements
//   });
});
