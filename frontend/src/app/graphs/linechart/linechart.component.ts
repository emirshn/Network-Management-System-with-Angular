import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { forkJoin } from 'rxjs';
import { DeviceService } from 'src/app/services/device.service';

@Component({
  selector: 'app-linechart',
  template: `<svg></svg>`,
  styleUrls: ['./linechart.component.css'],
})
export class LinechartComponent implements OnInit {
  trafficVolumeData: number[] = [];
  averageBandwidthData: number[] = [];
  averageLatencyData: number[] = [];
  connectionList: any[] = [];
  linkList: any[] = [];

  private svg: any;
  private width: number = 800;
  private height: number = 400;
  private margin = { top: 20, right: 20, bottom: 30, left: 50 };
  private xScale: any;
  private yScale: any;
  private line: any;

  constructor(
    private elementRef: ElementRef,
    private deviceService: DeviceService
  ) {}

  ngOnInit(): void {
    this.createChart();
    setInterval(() => {
      this.subscribeToData();
    }, 5000);
  }

  private createChart(): void {
    if (this.elementRef.nativeElement && this.elementRef.nativeElement) {
      this.svg = d3
        .select(this.elementRef.nativeElement)
        .append('svg')
        .attr('width', this.width)
        .attr('height', this.height);
    }
    this.xScale = d3
      .scaleLinear()
      .range([this.margin.left, this.width - this.margin.right]);

    this.yScale = d3
      .scaleLinear()
      .range([this.height - this.margin.bottom, this.margin.top]);

    this.line = d3
      .line()
      .x((d: any, i: number) => this.xScale(i))
      .y((d: any) => this.yScale(d))
      .curve(d3.curveMonotoneX);

    this.svg
      .append('g')
      .attr('transform', `translate(0, ${this.height - this.margin.bottom})`)
      .call(d3.axisBottom(this.xScale));

    this.svg
      .append('g')
      .attr('transform', `translate(${this.margin.left}, 0)`)
      .call(d3.axisLeft(this.yScale));

    const legendSvg = d3
      .select(this.elementRef.nativeElement)
      .append('svg')
      .attr('width', this.width)
      .attr('height', 50);

    const legendData = [
    //   { label: 'Average Traffic', color: 'steelblue' },
      { label: 'Average Bandwidth', color: 'green' },
      { label: 'Average Latency', color: 'red' },
    ];

    const legendGroup = legendSvg
      .append('g')
      .attr('transform', `translate(50, 20)`);

    const legendItem = legendGroup
      .selectAll('.legend-item')
      .data(legendData)
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(${i * 200}, 0)`);

    legendItem
      .append('rect')
      .attr('width', 20)
      .attr('height', 20)
      .attr('fill', (d) => d.color);

    legendItem
      .append('text')
      .attr('x', 30)
      .attr('y', 15)
      .text((d) => d.label);
    this.updateChart;
  }

  private subscribeToData(): void {
    this.deviceService.getLinks().subscribe((data) => {
      let trafficVolume = 0;
      let bandwidthVolume = 0;
      let latencyVolume = 0;
      this.connectionList = data;
      this.connectionList.forEach((link) => {
        trafficVolume += link.traffic;
        bandwidthVolume += link.bandwidth;
        latencyVolume += link.latency;
      });
      this.trafficVolumeData.push(trafficVolume);
      this.averageBandwidthData.push(bandwidthVolume);
      this.averageLatencyData.push(latencyVolume);
    });
    this.updateChart();
  }

  private updateChart(): void {
    this.xScale.domain([0, this.averageBandwidthData.length - 1]);
    this.yScale.domain([0, d3.max(this.averageBandwidthData, (d) => d)]);

    this.svg.selectAll('.line-chart').remove();

    // this.svg
    //   .append('path')
    //   .datum(this.trafficVolumeData)
    //   .attr('class', 'line-chart')
    //   .attr('d', this.line)
    //   .attr('fill', 'none')
    //   .attr('stroke', 'steelblue');

    this.svg
      .append('path')
      .datum(this.averageBandwidthData)
      .attr('class', 'line-chart')
      .attr('d', this.line)
      .attr('fill', 'none')
      .attr('stroke', 'green');

    this.svg
      .append('path')
      .datum(this.averageLatencyData)
      .attr('class', 'line-chart')
      .attr('d', this.line)
      .attr('fill', 'none')
      .attr('stroke', 'red');
  }
}
