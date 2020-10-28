import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { ApiFrontEndService } from '../services/api-front-end.service';
import { DataService } from '../services/data.service';
import { EncrDecrService } from '../services/encdec.service';
import * as moment from 'moment'

declare var $: any;

@Component({
  selector: 'app-keyManager',
  templateUrl: './keyManager.component.html',
})
export class keyManagerComponent implements OnInit {

  publicAuth: any;
  studentBookingRecord: any;
  studentSearchForm = this.fb.group({
    studentID: ['', [
      Validators.required,
    ]],
  })
  selectedStudent: any;

  constructor(
    private API: ApiFrontEndService,
    private DataService: DataService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private EncrDecrService: EncrDecrService,
    private fb: FormBuilder
  ) { }

  async ngOnInit() {
    this.subscribeData();
  }

  async subscribeData() {
    this.DataService.currentAdminInfo.subscribe(data =>
      this.publicAuth = this.EncrDecrService.decryptObject('admin', data)
    );
    if (this.publicAuth == undefined || this.publicAuth == 'guest') {
      this.router.navigate(['/login']);
    } else {
      this.DataService.currentActiveBookingHistory.subscribe(
        data => {this.studentBookingRecord = data;}
      );
    }
  }

  resetAll() {
    this.studentSearchForm.reset();
    this.DataService.callAll();
    this.DataService.currentActiveBookingHistory.subscribe(
      data => {this.studentBookingRecord = data;}
    );
  }

  async searchStudent() {
    this.studentSearchForm.value.type = "filterActiveBookingHistory";
    this.studentBookingRecord = await this.API.getBookingInfo(this.studentSearchForm.value);
    console.log(this.studentBookingRecord);
  }

  async checkIn() {
    var data = {
      type: "checkIn",
      studentID: this.selectedStudent.studentID,
      roomNumber: this.selectedStudent.roomNumber,
      checkInDate: moment().format("YYYY-MM-DD HH:mm:ss"),
    }
    await this.API.updateBookingInfo(data);
    this.DataService.callAll();
    this.studentSearchForm.reset();
    $('#modalCheckIn').modal('hide');
  }

  async checkOut() {
    var data = {
      type: "checkOut",
      studentID: this.selectedStudent.studentID,
      roomNumber: this.selectedStudent.roomNumber,
      checkOutDate: moment().format("YYYY-MM-DD HH:mm:ss"),
    }
    await this.API.updateBookingInfo(data);

    var data1 = {
      type: "deleteRoomInfo",
      bookingStatus: 0,
      studentID: this.selectedStudent.studentID,
    }
    await this.API.updateStudentInfo(data1);

    var data2 = {
      type: "updateRoomInfo",
      roomNumber: this.selectedStudent.roomNumber,
      bed: this.selectedStudent.bed,
      status: 0
    }
    await this.API.updateRoomInfo(data2);

    var data4 = {
      type: "addCurrentCapacity",
      roomNumber: this.selectedStudent.roomNumber,
    }
    await this.API.updateRoomInfo(data4);

    this.DataService.callAll();
    this.studentSearchForm.reset();
    $('#modalCheckOut').modal('hide');
  }

  modalEvent(type, data) {
    if (type == "modalCheckOut") {
      $('#modalCheckOut').modal('show');
    } else if (type == "modalCheckIn") {
      $('#modalCheckIn').modal('show');
    }
    this.selectedStudent = data;
  }
}
