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
  selector: 'app-roomAssignation',
  templateUrl: './roomAssignation.component.html',
})

export class RoomAssignationComponent implements OnInit {

  publicAuth: any;
  village: any;
  building: any;
  room: any;
  showBuilding: any;
  showRoom: any;
  showBookingDetails: any = false;
  selectedVillage: any;
  selectedBuilding: any;
  selectedRoom: any = [];
  availableRoomCapacity: any;
  showFilterButton: any = false;
  selectedRoomCapacity: any;
  numberOfSemester = 1;
  minNumberOfSemester: any = 1;
  maxNumberOfSemester: any = 3;
  totalFees: any;
  studentInfo: any = [];
  studentSearchForm = this.fb.group({
    studentID: ['', [
      Validators.required,
    ]],
  })
  showStudentInfo: any = false;

  constructor(
    private API: ApiFrontEndService,
    private DataService: DataService,
    private EncrDecrService: EncrDecrService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder
  ) { }

  async ngOnInit() {
    await this.subscribeData();
  }

  async subscribeData() {
    this.DataService.currentAdminInfo.subscribe(data =>
      this.publicAuth = this.EncrDecrService.decryptObject('admin', data)
    );
    console.log(this.publicAuth);
    if (this.publicAuth == undefined || this.publicAuth == 'guest') {
      this.router.navigate(['/login']);
    }
  }

  async getVillage() {
    var data = {
      type: "getVillage",
      gender: this.studentInfo[0].studentGender
    }
    this.village = await this.API.getRoomInfo(data);
    console.log(this.village);
  }

  async getBuilding(village) {
    var data = {
      type: "getBuilding",
      village: village,
      gender: this.studentInfo[0].studentGender
    }
    this.building = await this.API.getRoomInfo(data);
    this.showRoom = false;
    this.showBuilding = true;
    this.selectedVillage = village;
    console.log(this.village);
  }

  async getRoom(building) {
    var data = {
      type: "getRoom",
      village: this.selectedVillage,
      block: building,
      gender: this.studentInfo[0].studentGender
    }
    this.room = await this.API.getRoomInfo(data);
    this.showRoom = true;
    this.selectedBuilding = building;
    console.log(this.room);
  }

  async getRoomCapacity() {
    var data = {
      type: "getRoomCapacity",
      village: this.selectedVillage,
      block: this.selectedBuilding,
      gender: this.studentInfo[0].studentGender
    }
    this.availableRoomCapacity = await this.API.getRoomInfo(data);
  }

  async selectRoom(selectedRoom) {
    this.selectedRoom = selectedRoom;
    this.showBookingDetails = true;
    this.calculateFees();
  }

  selectRoomCapacity(capacity) {
    this.showFilterButton = true;
    this.selectedRoomCapacity = capacity;
  }

  async filterRoom() {
    var data = {
      type: "filterRoom",
      village: this.selectedVillage,
      block: this.selectedBuilding,
      capacity: this.selectedRoomCapacity,
      gender: this.studentInfo[0].studentGender
    }
    this.room = await this.API.getRoomInfo(data);
    $('#filterRoom').modal('hide');
  }

  async resetFilter() {
    var data = {
      type: "getRoom",
      village: this.selectedVillage,
      block: this.selectedBuilding,
      gender: this.studentInfo[0].studentGender
    }
    this.room = await this.API.getRoomInfo(data);
    $('#filterRoom').modal('hide');
  }

  async checkRoomAvailability() {
    var data = {
      type: "checkRoomAvailability",
      roomNumber: this.selectedRoom.roomNumber,
      bed: this.selectedRoom.bed,
    }
    var result = await this.API.getRoomInfo(data);
    console.log(result);
    if (result[0].status == 0) {
      return true;
    } else {
      return false;
    }
  }

  addQuantity() {
    if (this.numberOfSemester < this.maxNumberOfSemester) {
      this.numberOfSemester += 1;
      this.calculateFees();
    }
  }

  deleteQuantity() {
    if (this.numberOfSemester > this.minNumberOfSemester) {
      this.numberOfSemester -= 1;
      this.calculateFees();
    }
  }

  calculateFees() {
    this.totalFees = this.selectedRoom.price*this.numberOfSemester;
  }

  async submit() {
    var availability = await this.checkRoomAvailability()
    if (availability == true) {
      var data1 = {
        type: "updateRoomInfo",
        roomNumber: this.selectedRoom.roomNumber,
        bed: this.selectedRoom.bed,
        studentID: this.studentInfo[0].studentID
      }
      await this.API.updateStudentInfo(data1);

      var data2 = {
        type: "updateRoomInfo",
        roomNumber: this.selectedRoom.roomNumber,
        bed: this.selectedRoom.bed
      }
      await this.API.updateRoomInfo(data2);

      var data4 = {
        type: "updateCurrentCapacity",
        roomNumber: this.selectedRoom.roomNumber,
      }
      await this.API.updateRoomInfo(data4);

      var data3 = {
        type: "createBookingHistory",
        studentID: this.studentInfo[0].studentID,
        roomNumber: this.selectedRoom.roomNumber,
        village: this.selectedRoom.village,
        block: this.selectedRoom.block,
        level: this.selectedRoom.level,
        bed: this.selectedRoom.bed,
        aircond: this.selectedRoom.aircond,
        fees: this.selectedRoom.price*this.numberOfSemester,
        status: "Booked",
        checkInDate: moment().utc().format("YYYY-MM-DD HH:mm:ss"),
        checkOutDate: moment().utc().format("YYYY-MM-DD HH:mm:ss"),
        numberOfSemester: this.numberOfSemester 
      }
      await this.API.updateBookingInfo(data3);
      this.DataService.callAll();

      $('#bookSucessfully').modal('show');
        await this.sleep(5000).then(() => { $('#bookSucessfully').modal('hide'); });
        this.resetAll();
      //console.log("Done")
    } else {
      $('#roomOccupied').modal('show');
      this.resetFilter();
      this.clearCart();
    }
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  clearCart() {
    this.showBookingDetails = false;
    this.selectedRoom = null;
  }

  async searchStudent() {
    this.studentInfo = await this.API.getStudentInfo(this.studentSearchForm.value);
    this.showStudentInfo = true;
    if (this.studentInfo.length == 1) {
      await this.getVillage();
    }
  }

  resetAll() {
    this.studentSearchForm.reset();
    this.showStudentInfo = false;
    this.clearCart();
    this.showRoom = false;
    this.showBuilding = false;
  }

  async modalEvent(type) {
    if (type == 'filterRoom') {
      $('#filterRoom').modal('show');
    }
  }
}

