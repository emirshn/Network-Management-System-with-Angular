import { Component, ElementRef, ViewChild } from '@angular/core';
import { DeviceService } from '../services/device.service';
import * as d3 from 'd3';
import { forkJoin } from 'rxjs';
import { DataService } from '../services/data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-topology',
  templateUrl: './topology.component.html',
  styleUrls: ['./topology.component.css'],
})
export class TopologyComponent {
  @ViewChild('svgContainer', { static: true }) svgContainer:
    | ElementRef
    | undefined;
  constructor(
    private elementRef: ElementRef,
    private deviceService: DeviceService,
    private dataService: DataService,
    private router: Router
  ) {}
  deviceList: any[] = [];
  connectionList: any[] = [];
  nodes: any[] = [];

  private svg: any;
  private simulation: any;

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    if (!token) {
      this.router.navigate(['/auth']);
      return;
    }
    this.fetchData();
    this.updateLinkDataRandomly();
  }

  currentLoadBalancingIndex: number = 0;
  linkWeights: { [key: string]: number } = {};

  updateLinkDataRandomly() {
    setInterval(() => {
      // this.connectionList.forEach((link) => {
      //   const randomVariation = Math.random() * 0.2 + 0.9;
      //   if (
      //     link.source.status === 'active' &&
      //     link.target.status === 'active'
      //   ) {
      //     link.traffic = Math.ceil(Math.random() * 100);
      //     link.bandwidth = Math.ceil(Math.random() * 100 * randomVariation);
      //     link.latency = Math.ceil(Math.random() * 100);
      //   } else {
      //     link.traffic = 0;
      //     link.bandwidth = 0;
      //     link.latency = 0;
      //   }
      //   const randomFailure = Math.random();
      //   if (
      //     link.source.status === 'active' &&
      //     link.target.status === 'active'
      //   ) {
      //     if (randomFailure < 0.1) {
      //       link.isDown = true;
      //       link.traffic = 0;
      //       link.bandwidth = 0;
      //       link.latency = 0;
      //       this.deviceService.activateLink(link.id, 'down', link).subscribe();
      //     } else {
      //       link.traffic = 1;
      //       link.isDown = false;
      //       this.deviceService.activateLink(link.id, 'active', link).subscribe();
      //     }
      //   }
      // });

      // this.deviceList.forEach((node) => {
      //   const randomFailure = Math.random();
      //   if (node.status === 'active' || node.status === 'down') {
      //     if (randomFailure < 0.1) {
      //       node.status = 'down';
      //       this.deviceService.activateDevice(node.id, 'down').subscribe();
      //     } else {
      //       node.status = 'active';
      //       this.deviceService.activateDevice(node.id, 'active').subscribe();
      //     }
      //   }
      // });
      this.fetchData();

      // this.updateLinkAttributes();
    }, 5000);
  }

  fetch2() {
    const deviceList$ = this.deviceService.getDeviceList();
    const connectionList$ = this.deviceService.getLinks();
    forkJoin([deviceList$, connectionList$]).subscribe(
      ([devices, connections]) => {
        this.deviceList = devices;
        this.connectionList = connections;
      },
      (error: any) => {
        console.error('Error fetching data:', error);
      }
    );
  }
  deviceList2: any[] = [];
  connectionList2: any[] = [];

  updateLinkAttributes() {
    const link = this.svg.selectAll('line').data(this.connectionList);
    link
      .attr('stroke', (d: any) => this.getLinkProperties(d).color)
      .attr('stroke-dasharray', (d: any) => this.getLinkProperties(d).dashStyle)
      .attr('stroke-width', 5);

    link.select('title').text((d: any) => {
      let tooltipText = `ID: ${d.id}`;
      tooltipText += `\nSource: ${d.source.name}`;
      tooltipText += `\nTarget: ${d.target.name}`;
      tooltipText += `\nTraffic: ${d.traffic}`;
      tooltipText += `\nBandwidth: ${d.bandwidth}`;
      tooltipText += `\nLatency: ${d.latency}`;
      tooltipText += `\nStatus: ${d.isDown}`;
      return tooltipText;
    });

    const node = this.svg.selectAll('.node').data(this.deviceList);

    node.select('circle').attr('fill', (d: any) => {
      if (d.status == 'active') {
        return 'lightgreen';
      } else if (d.status == 'offline') {
        return 'grey';
      } else if (d.status == 'down') {
        return 'red';
      } else {
        return 'blue';
      }
    });
  }

  getLinkProperties(d: any): { color: string; dashStyle: string } {
    const sourceNode = this.nodes.find((node) => node.id === d.source.id);
    const targetNode = this.nodes.find((node) => node.id === d.target.id);

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

  private createTopology(): void {
    this.nodes = this.deviceList;
    const links = this.connectionList;

    const width = 700;
    const height = 700;

    if (this.svg) {
      this.svg.selectAll('*').remove();
    } else {
      if (this.svgContainer)
        this.svg = d3
          .select(this.svgContainer.nativeElement)
          .append('svg')
          .attr('width', width)
          .attr('height', height)
          .attr('viewBox', `0 0 ${width} ${height}`)
          .style('position', 'relative')
          .style('left', '0')
          .style('width', '80%')
          .style('height', '80%')
          .attr('style', 'outline: thin solid red;');
    }
    const svgGroup = this.svg.append('g');

    this.simulation = d3
      .forceSimulation(this.nodes)
      .force(
        'link',
        d3
          .forceLink(links)
          .id((d: any) => d.id)
          .distance((d: any) => 200)
      )
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('x', d3.forceX(width / 2).strength(0.1))
      .force('y', d3.forceY(height / 2).strength(0.1));

    const link = svgGroup
      .append('g')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', (d: any) => this.getLinkProperties(d).color)
      .attr('stroke-dasharray', (d: any) => this.getLinkProperties(d).dashStyle)
      .attr('stroke-width', 5);

    link.append('title').text((d: any) => {
      let tooltipText = `ID: ${d.id}`;
      tooltipText += `\nSource: ${d.source.name}`;
      tooltipText += `\nTarget: ${d.target.name}`;
      tooltipText += `\nTraffic: ${d.traffic}`;
      tooltipText += `\nBandwidth: ${d.bandwidth}`;
      tooltipText += `\nLatency: ${d.latency}`;
      tooltipText += `\nStatus: ${d.isDown}`;

      return tooltipText;
    });

    const dragstarted = (event: any, d: any) => {
      if (!event.active) this.simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    };

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
      d.fx = Math.max(0, Math.min(width, event.x));
      d.fy = Math.max(0, Math.min(height, event.y));
    }

    const dragended = (event: any, d: any) => {
      if (!event.active) this.simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    };

    const node = svgGroup
      .selectAll('node')
      .data(this.nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .call(
        d3
          .drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended)
      );

    node
      .append('circle')
      .attr('class', 'node-circle')
      .attr('r', 16)
      .attr('fill', (d: any) => {
        if (d.status == 'active') {
          return 'lightgreen';
        } else if (d.status == 'offline') {
          return 'grey';
        } else if (d.status == 'down') {
          return 'red';
        } else {
          return 'blue';
        }
      });

    node
      .append('text')
      .attr('dx', 12)
      .attr('dy', 4)
      .style('font-size', '20px')
      .text((d: any) => d.name);

    node.append('title').text((d: any) => {
      let tooltipText = `ID: ${d.id}`;
      tooltipText += `\nName: ${d.name}`;
      tooltipText += `\nIP Address: ${d.ip_address}`;
      tooltipText += `\nMAC Address: ${d.mac_address}`;
      tooltipText += `\nDevice Type: ${d.device_type}`;
      tooltipText += `\nManufacturer: ${d.manufacturer}`;
      tooltipText += `\nmodel: ${d.model}`;
      return tooltipText;
    });

    this.simulation.on('tick', () => {
      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);
    });

    node.on('click', (event: any, d: any) => {
      this.selectedNode = d;
    });

    this.nodes.forEach((node) => {
      this.connectedNodeMap[node.id] = links
        .filter(
          (link) => link.source.id === node.id || link.target.id === node.id
        )
        .map((link) =>
          link.source.id === node.id ? link.target.id : link.source.id
        );
    });

    const zoom = d3
      .zoom()
      .scaleExtent([0.5, 1])
      .translateExtent([
        [0, 0],
        [width, height],
      ])
      .filter((event: any) => {
        return event.type !== 'dblclick';
      })
      .on('zoom', (event: any) => {
        svgGroup.attr('transform', event.transform);
      });

    this.svg.on('dblclick', () => {
      svgGroup.transition().call(zoom.transform, d3.zoomIdentity);
    });

    this.svg.call(zoom);
  }

  getConnectedNodes(id: number): any[] {
    let connectedNodesForGivenId: any[] = this.connectedNodeMap[id];
    let connectedNodesNames: any[] = [];

    for (let i = 0; i < connectedNodesForGivenId.length; i++) {
      this.deviceList.forEach((device) => {
        if (device.id == connectedNodesForGivenId[i]) {
          connectedNodesNames.push(device.name);
        }
      });
    }

    return connectedNodesNames;
  }

  connectedNodeMap: { [key: string]: string[] } = {};
  selectedNode: any;
  selectedConnectedNode: string = '';
  connectedNodes: any[] = [];

  activateConnectedDevice(): void {
    console.log(31);
    if (this.selectedNode) {
      this.deviceService
        .activateDevice(this.selectedNode.id, this.selectedNode.status)
        .subscribe((data) => {
          console.log(data);
          this.selectedNode.status = data.device[9];
          this.fetchData();
        });
    } else {
      console.log('No connected device selected for activation.');
    }
  }

  toggleActivation(): void {
    if (this.selectedNode) {
      this.selectedNode.status =
        this.selectedNode.status === 'active' ? 'offline' : 'active';
      this.activateConnectedDevice();
    }
  }

  fetchData(): void {
    const deviceList$ = this.deviceService.getDeviceList();
    const connectionList$ = this.deviceService.getLinks();
    forkJoin([deviceList$, connectionList$]).subscribe(
      ([devices, connections]) => {
        this.deviceList = devices;
        this.connectionList = connections;
        this.createTopology();
      },
      (error: any) => {
        console.error('Error fetching data:', error);
      }
    );
  }
}
