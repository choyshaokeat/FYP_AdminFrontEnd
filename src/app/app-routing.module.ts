import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { HeaderComponent } from './wrapper/header/header.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { KeyCollectionComponent } from './keyCollection/keyCollection.component';
import { BookingManagerComponent } from './bookingManager/bookingManager.component';
import { RoomAssignationComponent } from './roomAssignation/roomAssignation.component';
import { RoomManagerComponent } from './roomManager/roomManager.component';
import { SettingComponent } from './setting/setting.component';


const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'keyCollection', component: KeyCollectionComponent },
  { path: 'bookingManager', component: BookingManagerComponent },
  { path: 'roomAssignation', component: RoomAssignationComponent },
  { path: 'roomManager', component: RoomManagerComponent },
  { path: 'setting', component: SettingComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
export const RoutingComponents = [
  LoginComponent,
  HeaderComponent,
  DashboardComponent,
  KeyCollectionComponent,
  BookingManagerComponent,
  RoomAssignationComponent,
  RoomManagerComponent,
  SettingComponent
]
