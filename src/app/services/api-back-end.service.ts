import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class ApiBackEndService {
  socketPoint: any;
  socketEndPoint: any;
  constructor(private http: HttpClient) {
    this.socketPoint = environment.SOCKET_POINT;
    this.socketEndPoint = environment.SOCKET_ENDPOINT;
  }

  getFrontEndURL() {
    return this.socketPoint;
  }

  getBackEndURL() {
    return this.socketEndPoint;
  }

  // Client Info
  login(data) {
    return this.http.post(`${this.getBackEndURL()}/admin/login`, { data }, httpOptions);
  }

  getAdminInfo(data) {
    return this.http.post(`${this.getBackEndURL()}/admin/getAdminInfo`, { data }, httpOptions);
  }

  getStudentInfo(data) {
    return this.http.post(`${this.getBackEndURL()}/admin/getStudentInfo`, { data }, httpOptions);
  }

  updateStudentInfo(data) {
    return this.http.post(`${this.getBackEndURL()}/admin/updateStudentInfo`, { data }, httpOptions);
  }

  getBookingInfo(data) {
    return this.http.post(`${this.getBackEndURL()}/admin/getBookingInfo`, { data }, httpOptions);
  }

  updateBookingInfo(data) {
    return this.http.post(`${this.getBackEndURL()}/admin/updateBookingInfo`, { data }, httpOptions);
  }

  //Room
  getRoomInfo(data) {
    return this.http.post(`${this.getBackEndURL()}/admin/getRoomInfo`, { data }, httpOptions);
  }

  updateRoomInfo(data) {
    return this.http.post(`${this.getBackEndURL()}/admin/updateRoomInfo`, { data }, httpOptions);
  }

  getBookingDocument(data) {
    return this.http.post(`${this.getBackEndURL()}/admin/getBookingDocument`, { data }, httpOptions);
  }

  updateBookingDocument(data) {
    return this.http.post(`${this.getBackEndURL()}/admin/updateBookingDocument`, { data }, httpOptions);
  }

  getChartData(data) {
    return this.http.post(`${this.getBackEndURL()}/admin/getChartData`, { data }, httpOptions);
  }

  //Email
  sendEmail(data) {
    return this.http.post(`${this.getBackEndURL()}/agent/mail`, { data }, httpOptions);
  }
}
