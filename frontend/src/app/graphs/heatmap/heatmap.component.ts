import { Component, ElementRef } from '@angular/core';
import * as d3 from 'd3';
import { DeviceService } from '../../services/device.service';

@Component({
  selector: 'app-heatmap',
  templateUrl: './heatmap.component.html',
  styleUrls: ['./heatmap.component.css'],
})
export class HeatmapComponent {
  deviceList: any[] = [];
  deviceIdList: any[] = [];
  linkList: any[] = [];
  linkListList: any[] = [];
  linkBandwidths: any[] = [];
  private svg: any;
  private linkSvg: any;
  constructor(
    private elementRef: ElementRef,
    private deviceService: DeviceService
  ) {}

  ngOnInit(): void {
    setInterval(() => {
      this.subscribeToData();
    }, 5000);
  }

  private subscribeToData(): void {
    this.deviceService.getDeviceList().subscribe((data) => {
      this.deviceList = data;
      this.deviceIdList = [];
      this.deviceList.forEach((device) => {
        this.deviceIdList.push(device.id);
        this.deviceService.getLinks().subscribe((data) => {
          this.linkList = data;
          this.linkListList = [];
          this.linkList.forEach((link) => {
            this.linkListList.push(link.id);
            this.linkBandwidths.push(link.traffic);
          });
          this.generateCoordinateSystem();
          this.generateHeatmap();
        });
      });
    });
  }

  private width: number = 800;
  private height: number = 400;
  private margin = { top: 20, right: 20, bottom: 30, left: 50 };
  private xScale: any;
  private yScale: any;

  generateCoordinateSystem(): void {
    if (this.svg) {
      this.svg.selectAll('*').remove();
    } else {
      if (this.elementRef.nativeElement && this.elementRef.nativeElement) {
        this.svg = d3
          .select(this.elementRef.nativeElement)
          .append('svg')
          .attr('width', this.width)
          .attr('height', this.height);
      }
    }

    this.xScale = d3
      .scaleLinear()
      .domain([Math.min(...this.deviceIdList), Math.max(...this.deviceIdList)]) // Set the domain based on y-axis values
      .range([this.margin.left, this.width - this.margin.right]);

    this.yScale = d3
      .scaleLinear()
      .domain([Math.min(...this.deviceIdList), Math.max(...this.deviceIdList)]) // Set the domain based on y-axis values
      .range([this.height - this.margin.bottom, this.margin.top]);

    this.svg
      .append('g')
      .attr('transform', `translate(0, ${this.height - this.margin.bottom})`)
      .call(d3.axisBottom(this.xScale));

    this.svg
      .append('g')
      .attr('transform', `translate(${this.margin.left}, 0)`)
      .call(d3.axisLeft(this.yScale));

    const links = this.svg
      .selectAll('circle')
      .data(this.linkList)
      .enter()
      .append('circle')
      .attr('cx', (d: { source: any }) => this.xScale(d.source))
      .attr('cy', (d: { target: any }) => this.yScale(d.target))
      .attr('r', 5)
      .attr('fill', (d: any) => this.getLinkProperties(d).color);

    links.append('title').text((d: any) => {
      let tooltipText = `ID: ${d.id}`;
      tooltipText += `\nSource: ${d.source}`;
      tooltipText += `\nTarget: ${d.target}`;
      tooltipText += `\nTraffic: ${d.traffic}`;
      tooltipText += `\nBandwidth: ${d.bandwidth}`;
      tooltipText += `\nLatency: ${d.latency}`;
      tooltipText += `\nStatus: ${d.isDown}`;

      return tooltipText;
    });

    links
      .append('text')
      .attr('dx', 12)
      .attr('dy', 4)
      .style('font-size', '20px')
      .text((d: any) => d.id);
  }

  getLinkProperties(d: any): { color: string; dashStyle: string } {
    const sourceNode = this.deviceList.find((node) => node.id === d.source);
    const targetNode = this.deviceList.find((node) => node.id === d.target);

    if (d.isDown) {
      return { color: 'red', dashStyle: '5,5' };
    }

    if (
      sourceNode &&
      targetNode &&
      sourceNode.status === 'active' &&
      targetNode.status === 'active'
    ) {
      return { color: 'blue', dashStyle: 'none' };
    }

    return { color: '#999', dashStyle: '2,2' };
  }

  generateHeatmap(): void {
    if (this.linkSvg) {
      this.linkSvg.selectAll('*').remove();
    } else {
      if (this.elementRef.nativeElement && this.elementRef.nativeElement) {
        this.linkSvg = d3
          .select(this.elementRef.nativeElement)
          .append('svg')
          .attr('width', this.width)
          .attr('height', this.height);
      }
    }

    this.xScale = d3
      .scaleLinear()
      .domain([Math.min(...this.linkListList), Math.max(...this.linkListList)])
      .range([this.margin.left, this.width - this.margin.right]);

    this.yScale = d3
      .scaleLinear()
      .domain([
        Math.min(...this.linkBandwidths),
        Math.max(...this.linkBandwidths),
      ])
      .range([this.height - this.margin.bottom, this.margin.top]);

    this.linkSvg
      .append('g')
      .attr('transform', `translate(0, ${this.height - this.margin.bottom})`)
      .call(d3.axisBottom(this.xScale));

    this.linkSvg
      .append('g')
      .attr('transform', `translate(${this.margin.left}, 0)`)
      .call(d3.axisLeft(this.yScale));

    const links = this.linkSvg
      .selectAll('circle')
      .data(this.linkList)
      .enter()
      .append('circle')
      .attr('cx', (d: { id: any }) => this.xScale(d.id))
      .attr('cy', (d: { traffic: any }) => this.yScale(d.traffic))
      .attr('r', 5)
      .attr('fill', (d: any) => {
        if (d.traffic > 50) return 'red';
        if (d.traffic == 0) return 'grey';
        return 'lightgreen';
      });

    links.append('title').text((d: any) => {
      let tooltipText = `ID: ${d.id}`;
      tooltipText += `\nSource: ${d.source}`;
      tooltipText += `\nTarget: ${d.target}`;
      tooltipText += `\nTraffic: ${d.traffic}`;
      tooltipText += `\nBandwidth: ${d.bandwidth}`;
      tooltipText += `\nLatency: ${d.latency}`;
      tooltipText += `\nStatus: ${d.isDown}`;
      return tooltipText;
    });

    links
      .append('text')
      .attr('dx', 12)
      .attr('dy', 4)
      .style('font-size', '20px')
      .text((d: any) => d.id);
  }
}
