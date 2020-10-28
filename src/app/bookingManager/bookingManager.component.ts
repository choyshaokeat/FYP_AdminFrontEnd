import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FileUploader } from 'ng2-file-upload';

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
    bookingPeriod: ['', [
      Validators.required,
    ]],
  })
  bookingDocument: any = [];
  bookingData: any = [];

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
  }

  async subscribeData() {
    this.DataService.currentAdminInfo.subscribe(data =>
      this.publicAuth = this.EncrDecrService.decryptObject('admin', data)
    );
    if (this.publicAuth == undefined || this.publicAuth == 'guest') {
      this.router.navigate(['/login']);
    }
  }

  async getBookingDocument() {
    this.bookingDocument = await this.API.getBookingDocument(null);
    console.log(this.bookingDocument);
  }

  async getBookingHistory() {
    var data;
    this.bookingData = await this.API.getBookingInfo(data = {type: "all"})
    console.log(this.bookingData);
  }

  async updateBookingPeriod() {

  }
}