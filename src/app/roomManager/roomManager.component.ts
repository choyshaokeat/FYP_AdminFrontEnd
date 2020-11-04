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
  selector: 'app-roomManager',
  templateUrl: './roomManager.component.html',
})
export class RoomManagerComponent implements OnInit {

  publicAuth: any;
  allRoomData: any = [];
  village: any;
  capacity: any;
  villageSelected: any = "";
  genderSelected: any = "";
  capacitySelected: any = "";
  statusSelected: any = "";
  modalData: any;
  addRoomForm = this.fb.group({
    roomNumber: ['', [
      Validators.required,
    ]],
    village: ['', [
      Validators.required,
    ]],
    building: ['', [
      Validators.required,
    ]],
    level: ['', [
      Validators.required,
    ]],
    bed: ['', [
      Validators.required,
    ]],
    capacity: ['', [
      Validators.required,
    ]],
    price: ['', [
      Validators.required,
    ]],
    aircond: ['Yes', [
      // Validators.required,
    ]],
    gender: ['Male', [
      // Validators.required,
    ]],
    status: ['0', [
      // Validators.required,
    ]],
  })
  editRoomForm = this.fb.group({
    roomNumber: ['', [
      Validators.required,
    ]],
    village: ['', [
      Validators.required,
    ]],
    building: ['', [
      Validators.required,
    ]],
    level: ['', [
      Validators.required,
    ]],
    bed: ['', [
      Validators.required,
    ]],
    capacity: ['', [
      Validators.required,
    ]],
    price: ['', [
      Validators.required,
    ]],
    aircond: ['Yes', [
      // Validators.required,
    ]],
    gender: ['Male', [
      // Validators.required,
    ]],
    status: ['0', [
      // Validators.required,
    ]],
  })

  constructor(
    private API: ApiFrontEndService,
    private DataService: DataService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private EncrDecrService: EncrDecrService,
    private fb: FormBuilder
  ) { }

  async ngOnInit() {
    this.spinner.show();
    await this.subscribeData();
    await this.getAllRoomData();
    await this.getVillage();
    await this.getCapacity();
    this.spinner.hide();
  }

  async subscribeData() {
    this.DataService.currentAdminInfo.subscribe(data =>
      this.publicAuth = this.EncrDecrService.decryptObject('admin', data)
    );
    if (this.publicAuth == undefined || this.publicAuth == 'guest') {
      this.router.navigate(['/login']);
    }
  }

  async getAllRoomData() {
    this.DataService.syncData("room");
    this.DataService.currentAllRoomData.subscribe(
      data => {this.allRoomData = data;}
    );
  }

  async getVillage() {
    var data = {
      type: "getAllVillage",
    }
    this.village = await this.API.getRoomInfo(data);
  }

  async getCapacity() {
    var data = {
      type: "getAllRoomCapacity",
    }
    this.capacity = await this.API.getRoomInfo(data);
  }

  async getRoomData() {
    var data = {
      type: "filterAllRoom",
      village: this.villageSelected,
      gender: this.genderSelected,
      capacity: this.capacitySelected,
      status: this.statusSelected
    }
    this.allRoomData = await this.API.getRoomInfo(data);
    //console.log(this.allRoomData);
  }

  setVillage(village) {
    this.villageSelected = village;
  }

  setGender(gender) {
    this.genderSelected = gender;
  }

  setCapacity(capacity) {
    this.capacitySelected = capacity;
  }

  setStatus(status) {
    this.statusSelected = status;
  }

  setRadioButtonValue(type, value){
    if (type == "aircond") {
      this.addRoomForm.controls['aircond'].setValue(value);
    } else if (type == "gender") {
      this.addRoomForm.controls['gender'].setValue(value);
    } else if (type == "status") {
      this.addRoomForm.controls['status'].setValue(value);
    }
  }

  editRadioButtonValue(type, value){
    if (type == "aircond") {
      this.editRoomForm.controls['aircond'].setValue(value);
    } else if (type == "gender") {
      this.editRoomForm.controls['gender'].setValue(value);
    } else if (type == "status") {
      this.editRoomForm.controls['status'].setValue(value);
    }
    console.log(this.editRoomForm.value)
  }

  async editRoom() {
    try {
      this.editRoomForm.value.type = "editRoom";
      console.log(this.editRoomForm.value);
      await this.API.updateRoomInfo(this.editRoomForm.value)
      $('#editRoomModal').modal('hide');
      $('#editRoomSucessfullyModal').modal('show');
      this.editRoomForm.reset();
      this.DataService.syncData("room");
    }
    catch (err) {
      console.log('err', err);
    }
  }

  async deleteRoom() {
    try {
      this.editRoomForm.value.type = "deleteRoom";
      console.log(this.editRoomForm.value);
      await this.API.updateRoomInfo(this.editRoomForm.value)
      $('#modalDeleteRoom').modal('hide');
      $('#deleteRoomSucessfullyModal').modal('show');
      this.editRoomForm.reset();
      this.DataService.syncData("room");
      await this.getVillage();
      await this.getCapacity();
    }
    catch (err) {
      console.log('err', err);
    }
  }

  fillFormData(data) {
    this.editRoomForm.controls['roomNumber'].setValue(data.roomNumber);
    this.editRoomForm.controls['village'].setValue(data.village);
    this.editRoomForm.controls['building'].setValue(data.block);
    this.editRoomForm.controls['level'].setValue(data.level);
    this.editRoomForm.controls['bed'].setValue(data.bed);
    this.editRoomForm.controls['capacity'].setValue(data.capacity);
    this.editRoomForm.controls['price'].setValue(data.price);
    this.editRoomForm.controls['aircond'].setValue(data.aircond);
    this.editRoomForm.controls['gender'].setValue(data.genderAllowed);
    this.editRoomForm.controls['status'].setValue(data.status);
    $('#editRoomModal').modal('show');
    console.log(this.editRoomForm)
  }

  async addRoom() {
    this.addRoomForm.value.type = "checkRoomAvailability";
    var check:any = await this.API.getRoomInfo(this.addRoomForm.value);
    console.log(check);
    if (check.length == 0) {
      try {
        this.addRoomForm.value.type = "addRoom";
        console.log(this.addRoomForm.value);
        await this.API.updateRoomInfo(this.addRoomForm.value)
        $('#addRoomModal').modal('hide');
        $('#addRoomSucessfullyModal').modal('show');
        this.addRoomForm.reset();
        this.DataService.syncData("room");
        await this.getVillage();
        await this.getCapacity();
      }
      catch (err) {
        console.log('err', err);
        $('#addRoomModal').modal('hide');
        $('#roomAlreadyAvailableModal').modal('show');
      }
    } else {
      $('#addRoomModal').modal('hide');
      $('#roomAlreadyAvailableModal').modal('show');
      //this.addRoomForm.reset();
    }
  }

  async modalEvent(type) {
    if (type == 'addRoomModal') {
      $('#addRoomModal').modal('show');
    } else if (type == 'editRoomModal') {
      $('#editRoomModal').modal('show');
    } else if (type == 'deleteRoom') {
      $('#editRoomModal').modal('hide');
      $('#modalDeleteRoom').modal('show');
    } 
  }
}
