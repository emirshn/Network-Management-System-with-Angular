import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginPageComponent } from './login-page/login-page.component';
import { AdminPageComponent } from './admin-page/admin-page.component';
import { HomeComponent } from './home/home.component';
import { TopologyComponent } from './topology/topology.component';
import { StatusComponent } from './status/status.component';
import { ManageDevicesComponent } from './manage-devices/manage-devices.component';
import { LeafmapComponent } from './leafmap/leafmap.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'topology',
    component: TopologyComponent,
  },
  {
    path: 'status',
    component: StatusComponent,
  },
  {
    path: 'manage',
    component: ManageDevicesComponent,
  },
  {
    path: 'admin',
    component: AdminPageComponent,
  },
  { path: 'auth', component: LoginPageComponent },
  { path: 'map', component: LeafmapComponent },
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
