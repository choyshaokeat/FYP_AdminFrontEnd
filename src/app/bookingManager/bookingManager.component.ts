import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import { Router, ActivatedRoute, Params } from '@angular/router';

import { ApiFrontEndService } from '../services/api-front-end.service';
import { ApiBackEndService } from '../services/api-back-end.service';
import { DataService } from '../services/data.service';
import { EncrDecrService } from '../services/encdec.service';
import * as moment from 'moment';
//import { resolve } from 'dns';

declare var $: any;

@Component({
  selector: 'app-bookingManager',
  templateUrl: './bookingManager.component.html'
})

export class BookingManagerComponent implements OnInit {

  publicAuth: any;
  bookingPeriodForm = this.fb.group({
    bookingPeriodStart: ['', [
      Validators.required,
    ]],
    bookingPeriodEnd: ['', [
      Validators.required,
    ]],
    bookingPeriodStartTime: ['', [
      Validators.required,
    ]],
    bookingPeriodEndTime: ['', [
      Validators.required,
    ]],
  })
  semConfigurationForm = this.fb.group({
    sem1duration: ['', [
      Validators.required,
    ]],
    sem2duration: ['', [
      Validators.required,
    ]],
    sem3duration: ['', [
      Validators.required,
    ]],
    maxBookingSemester: ['', [
      Validators.required,
    ]],
  })
  bookingDocument: any = [];
  bookingData: any = [];
  updateInfo: any;
  time: any;

  constructor(
    private API: ApiFrontEndService,
    private DataService: DataService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private EncrDecrService: EncrDecrService,
    private fb: FormBuilder
  ) { }

  async ngOnInit() {
    await this.subscribeData();
    await this.getBookingDocument();
    this.getBookingHistory();
    this.generateTimeList();
  }

  async subscribeData() {
    this.DataService.currentAdminInfo.subscribe(data =>
      this.publicAuth = this.EncrDecrService.decryptObject('admin', data)
    );
    if (this.publicAuth == undefined || this.publicAuth == 'guest') {
      this.router.navigate(['/login']);
    }
  }

  async generateTimeList() {
    const items = [];
    for(let i=0; i<=23; i++) {
      items.push(moment( {hour: i} ).format('h:mm A'));
      items.push(moment({ hour: i, minute: 30 }).format('h:mm A'));
    }
    //console.log(items);
    this.time = items;
  }

  async getBookingDocument() {
    this.bookingDocument = await this.API.getBookingDocument(null);
    //this.bookingPeriodForm.controls['bookingPeriodStart'].setValue(this.bookingDocument[0].bookingPeriodStart);
    //this.bookingPeriodForm.controls['bookingPeriodEnd'].setValue(this.bookingDocument[0].bookingPeriodEnd);
    this.semConfigurationForm.controls['sem1duration'].setValue(this.bookingDocument[0].sem1CheckInDate + " to " + this.bookingDocument[0].sem1CheckOutDate);
    this.semConfigurationForm.controls['sem2duration'].setValue(this.bookingDocument[0].sem2CheckInDate + " to " + this.bookingDocument[0].sem2CheckOutDate);
    this.semConfigurationForm.controls['sem3duration'].setValue(this.bookingDocument[0].sem3CheckInDate + " to " + this.bookingDocument[0].sem3CheckOutDate);
    this.semConfigurationForm.controls['maxBookingSemester'].setValue(this.bookingDocument[0].maxBookingSemester);
    //console.log(this.semConfigurationForm);
    //console.log(this.bookingDocument);
  }

  async getBookingHistory() {
    var data;
    this.bookingData = await this.API.getBookingInfo(data = {type: "all"})
    //console.log(this.bookingData);
  }

  async updateBookingPeriod() {
    var data = {
      type: "bookingPeriod",
      bookingPeriodStart: moment(moment(this.bookingPeriodForm.value.bookingPeriodStart).format("YYYY-MM-DD") + " " + this.bookingPeriodForm.value.bookingPeriodStartTime).utc().format("YYYY-MM-DD HH:mm:ss"),
      bookingPeriodEnd: moment(moment(this.bookingPeriodForm.value.bookingPeriodEnd).format("YYYY-MM-DD") + " " + this.bookingPeriodForm.value.bookingPeriodEndTime).utc().format("YYYY-MM-DD HH:mm:ss")
    }
    //console.log(data);
    this.API.updateBookingDocument(data);
    this.getBookingDocument();
    this.bookingPeriodForm.reset();
    this.updateInfo = "booking period";
    $('#updateInfo').modal('show');
  }

  async updateSemConfiguration() {
    var sem1Date = this.semConfigurationForm.value.sem1duration.split(" to ");
    var sem2Date = this.semConfigurationForm.value.sem2duration.split(" to ");
    var sem3Date = this.semConfigurationForm.value.sem3duration.split(" to ");
    var data = {
      type: "checkInOutDate",
      sem1CheckInDate: moment(sem1Date[0]).utc().format("YYYY-MM-DD HH:mm:ss"),
      sem1CheckOutDate: moment(sem1Date[1]).utc().format("YYYY-MM-DD HH:mm:ss"),
      sem2CheckInDate: moment(sem2Date[0]).utc().format("YYYY-MM-DD HH:mm:ss"),
      sem2CheckOutDate: moment(sem2Date[1]).utc().format("YYYY-MM-DD HH:mm:ss"),
      sem3CheckInDate: moment(sem3Date[0]).utc().format("YYYY-MM-DD HH:mm:ss"),
      sem3CheckOutDate: moment(sem3Date[1]).utc().format("YYYY-MM-DD HH:mm:ss"),
      maxBookingSemester: this.semConfigurationForm.value.maxBookingSemester
    }
    this.API.updateBookingDocument(data);
    this.semConfigurationForm.reset();
    this.getBookingDocument();
    this.updateInfo = "semester info";
    $('#updateInfo').modal('show');
  }
}