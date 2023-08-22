import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import * as L from 'leaflet';
import { DeviceService } from '../services/device.service';
import 'leaflet.markercluster';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-leafmap',
  templateUrl: './leafmap.component.html',
  styleUrls: ['./leafmap.component.css'],
})
export class LeafmapComponent {
  private map: L.Map | undefined;
  private centroid: L.LatLngExpression = [
    40.78949666186294, 29.418076998192614,
  ]; //
  private randomPoints: L.LatLngExpression[] = [];

  private initMap(): void {
    this.map = L.map('map', {
      center: this.centroid,
      zoom: 12,
    });

    const tiles = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 18,
        minZoom: 2,
      }
    );

    const centroidIcon = L.icon({
      iconUrl: './assets/marker.png',
      iconSize: [32, 32],
    });

    //L.marker(this.centroid, { icon: centroidIcon }).addTo(this.map);

    this.randomPoints.forEach((point) => {
      L.marker(point).addTo(<any>this.map);
    });

    tiles.addTo(this.map);
  }

  ngOnInit() {
    const token = localStorage.getItem('token');

    if (!token) {
      this.router.navigate(['/auth']);
      return;
    }
    
    this.initMap();
    this.fetch();
  }

  constructor(
    private http: HttpClient,
    private deviceService: DeviceService,
    private router: Router
  ) {}

  fetch() {
    const deviceList$ = this.deviceService.getDeviceList();
    const connectionList$ = this.deviceService.getLinks();
    const deviceLocations$ = this.deviceService.getDeviceLocations();

    forkJoin([deviceList$, connectionList$, deviceLocations$]).subscribe(
      ([devices, connections, locations]) => {
        const geoInfo = locations.geo_info;

        this.randomPoints = locations.geo_info;
        const deviceLocations: number[][] = locations.geo_info || [];

        this.connection_data = {
          devices: devices,
          links: connections,
        };

        for (const node of this.connection_data.devices) {
          const index = this.connection_data.devices.findIndex(
            (n: any) => n.id === node.id
          );

          if (index !== -1) {
            node.location = deviceLocations[index];
          }
        }

        console.log(this.connection_data);
        this.updateMap();
      },

      (error: any) => {
        console.error('Error fetching data:', error);
      }
    );
  }
  private connection_data: any;
  private polylines: L.Polyline[] = [];
  private popups: L.Popup[] = [];
  private coverage_areas: { node: any; circle: any; radius: number }[] = [];
  private markers: L.MarkerClusterGroup = L.markerClusterGroup();

  updateMap() {
    if (this.map) {
      this.markers.clearLayers();

      this.map.eachLayer((layer) => {
        if (!(layer instanceof L.TileLayer)) {
          this.map!.removeLayer(layer);
        }
      });

      const centroidIcon = L.icon({
        iconUrl: './assets/marker.png',
        iconSize: [32, 32],
      });

      this.markers = L.markerClusterGroup();

      //L.marker(this.centroid, { icon: centroidIcon }).addTo(this.markers);

      // this.connection_data.devices.forEach((point: any) => {
      //   L.marker(point.location).addTo(this.markers);
      // });

      this.coverage_areas = [];
      this.connection_data.devices.forEach((node: any) => {
        if (node.id !== 'root') {
          L.marker(node.location).addTo(this.markers);
        }
      });

      this.map.addLayer(this.markers);

      this.connection_data.links.forEach((link: any) => {
        const sourcenode = this.connection_data.devices.find(
          (point: any) => point.id === link.source
        );
        const targetnode = this.connection_data.devices.find(
          (point: any) => point.id === link.target
        );

        const startPoint = sourcenode.location;
        const endPoint = targetnode.location;

        if (endPoint) {
          const polyline = L.polyline([startPoint, endPoint], {
            color: 'blue',
          }).addTo(<any>this.map);
          this.polylines.push(polyline);
        }
      });
    }
  }
}
