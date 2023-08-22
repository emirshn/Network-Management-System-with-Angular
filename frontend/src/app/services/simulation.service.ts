import { Injectable } from '@angular/core';
import { DeviceService } from './device.service';
import { forkJoin } from 'rxjs';
import { DataService } from './data.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable({
  providedIn: 'root',
})
export class TopologySimulationService {
  private deviceList: any[] = [];
  private connectionList: any[] = [];

  constructor(
    private deviceService: DeviceService,
    private dataService: DataService,
    private notificationsService: NotificationsService
  ) {
    this.initializeSimulation();
    this.startSimulation();
  }

  sendDataToService() {
    const devices = this.deviceList;
    const connections = this.connectionList;
    this.dataService.setSharedData(devices, connections);
  }

  deviceList$ = this.deviceService.getDeviceList();
  connectionList$ = this.deviceService.getLinks();

  public initializeSimulation(): void {
    const deviceList$ = this.deviceService.getDeviceList();
    const connectionList$ = this.deviceService.getLinks();
    forkJoin([deviceList$, connectionList$]).subscribe(
      ([devices, connections]) => {
        this.deviceList = devices;
        this.connectionList = connections;
        this.connectionList.forEach((link) => {
          this.deviceService.getDevice(link.source).subscribe(
            (sourceDevice) => {
              link.source = sourceDevice;
            },
            (error) => {
              console.error('Error fetching source device:', error);
            }
          );

          this.deviceService.getDevice(link.target).subscribe(
            (targetDevice) => {
              link.target = targetDevice;
            },
            (error) => {
              console.error('Error fetching target device:', error);
            }
          );
        });
      },
      (error: any) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  private startSimulation(): void {
    this.simulationInterval = setInterval(() => {
      this.initializeSimulation();
      this.sendDataToService();
      this.connectionList.forEach((link) => {
        const randomVariation = Math.random() * 0.2 + 0.9;
        if (
          link.source.status === 'active' &&
          link.target.status === 'active'
        ) {
          link.traffic = Math.ceil(Math.random() * 100);
          link.bandwidth = Math.ceil(Math.random() * 100 * randomVariation);
          link.latency = Math.ceil(Math.random() * 100);

          if (link.traffic > 70) {
            this.notificationsService.addNotification(
              'Traffic threshold passed on link between ' +
                link.source.name +
                ' and ' +
                link.target.name
            );
            this.notificationsService.playNotificationSound();
          }

          if (link.bandwidth > 70) {
            this.notificationsService.addNotification(
              'Bandwidth threshold passed on link between ' +
                link.source.name +
                ' and ' +
                link.target.name
            );
            this.notificationsService.playNotificationSound();
          }
        } else {
          link.traffic = 0;
          link.bandwidth = 0;
          link.latency = 0;
        }
        const randomFailure = Math.random();
        if (
          link.source.status === 'active' &&
          link.target.status === 'active'
        ) {
          if (randomFailure < 0.1) {
            link.isDown = true;
            link.traffic = 0;
            link.bandwidth = 0;
            link.latency = 0;
            this.deviceService.activateLink(link.id, 'down', link).subscribe();
            this.notificationsService.addNotification(
              'Link status between ' +
                link.source.name +
                ' and ' +
                link.target.name +
                ' changed: Down'
            );
            this.notificationsService.playNotificationSound();
          } else {
            link.isDown = false;
            this.deviceService
              .activateLink(link.id, 'active', link)
              .subscribe();

            // this.notificationsService.addNotification(
            //   'Link status between ' +
            //     link.source.name +
            //     ' and ' +
            //     link.target.name +
            //     ' changed: Active'
            // );
          }
        }
      });

      this.deviceList.forEach((node) => {
        const randomFailure = Math.random();
        if (node.status === 'active' || node.status === 'down') {
          if (node.status === 'offline') {
            console.log(31);
          }
          if (randomFailure < 0.1) {
            node.status = 'down';
            this.deviceService.activateDevice(node.id, 'down').subscribe();
            this.notificationsService.addNotification(
              'Device status of ' + node.name + ' changed: Down'
            );
            this.notificationsService.playNotificationSound();
          } else {
            node.status = 'active';
            this.deviceService.activateDevice(node.id, 'active').subscribe();
            // this.notificationsService.addNotification(
            //   'Device status of ' + node.name + ' changed: Active'
            // );
          }
        }
      });
    }, 10000);
  }

  private simulationInterval: any;

  stopSimulation(): void {
    clearInterval(this.simulationInterval);
  }
}
