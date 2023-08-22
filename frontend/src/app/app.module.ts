import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { AdminPageComponent } from './admin-page/admin-page.component';
import { LoadingSpinnerComponent } from './shared/loading-spinner/loading-spinner.component';
import { HeaderComponent } from './header/header.component';
import { ManageDevicesComponent } from './manage-devices/manage-devices.component';
import { HomeComponent } from './home/home.component';
import { TopologyComponent } from './topology/topology.component';
import { StatusComponent } from './status/status.component';
import { TopologySimulationService } from './services/simulation.service'; 
import { LinechartComponent } from './graphs/linechart/linechart.component';
import { HeatmapComponent } from './graphs/heatmap/heatmap.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LeafmapComponent } from './leafmap/leafmap.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginPageComponent,
    AdminPageComponent,
    LoadingSpinnerComponent,
    HeaderComponent,
    ManageDevicesComponent,
    HomeComponent,
    TopologyComponent,
    StatusComponent,
    LinechartComponent,
    HeatmapComponent,
    NotificationsComponent,
    LeafmapComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule
  ],
  providers: [TopologySimulationService],
  bootstrap: [AppComponent],
})
export class AppModule {}
