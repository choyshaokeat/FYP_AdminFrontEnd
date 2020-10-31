import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ApiFrontEndService } from './api-front-end.service';
import { EncrDecrService } from './encdec.service';
import { SocketioService } from './socketio.service';
import * as moment from 'moment';
//import { resolve } from 'dns';


@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(
    private router: Router,
    private API: ApiFrontEndService,
    private EncrDecrService: EncrDecrService,
    private socketService: SocketioService,
  ) { }

  /* async socketIO(type, data) {
    if (type == 'emit') {
      console.log(data.merchantID);
      let syncData = {
        merchantID: data.merchantID,
        multipleModule: true,
        syncModule: ['cs_module', 'kt_module'],
      }
      this.socketService.emit('syncMerchant', syncData)
    } else if (type == 'listen') {
      this.socketService.listen('broadcastData').subscribe((data) => {
        this.updateBrodcastData(data);
        console.log(data);
      })
      this.socketService.listen('syncServer').subscribe((data) => {
        console.log(data);
      })
    }
  } */

  async callAll() {
    return new Promise<any>(async (resolve, reject) => {
      try {
        //console.log('callAll');
        //await this.socketIO('listen', undefined);
        var data = await this.API.getAdminInfo(this.publicAuth);
        //console.log(data);
        this.updateAdminInfo(await this.EncrDecrService.encryptObject('admin', data[0]));
        this.updateActiveBookingHistory(await this.API.getBookingInfo(data = { type: "activeBookingHistory" }));
        this.updateAllRoomData(await this.API.getRoomInfo(data = { type: "getAllRoom" }));
        this.updateBookingRateChartData(await this.API.getChartData(data = { type: "bookingRateChart" }));
        var date = await this.API.getBookingDocument(null);
        var data1 = {
          type: "semBookChart",
          sem1CheckInDate: moment(date[0].sem1CheckInDate).utc().format("YYYY-MM-DD HH:mm:ss"),
          sem2CheckInDate: moment(date[0].sem2CheckInDate).utc().format("YYYY-MM-DD HH:mm:ss"),
          sem3CheckInDate: moment(date[0].sem3CheckInDate).utc().format("YYYY-MM-DD HH:mm:ss"),
          sem1CheckOutDate: moment(date[0].sem1CheckOutDate).utc().format("YYYY-MM-DD HH:mm:ss"),
          sem2CheckOutDate: moment(date[0].sem2CheckOutDate).utc().format("YYYY-MM-DD HH:mm:ss"),
          sem3CheckOutDate: moment(date[0].sem3CheckOutDate).utc().format("YYYY-MM-DD HH:mm:ss"),
        }
        this.updateSemBookChartData( await this.API.getChartData(data1));
        this.updateVillageOccupancyChartData(await this.calculateRoomOccupancy());
        resolve('ok');
      }
      catch (err) {
        console.error(err);
        reject(err);
      }
    });
  }

  async syncData(module) {
    return new Promise<any>(async (resolve, reject) => {
      try {
        if (module == "info") {
          var data = await this.API.getAdminInfo(this.publicAuth);
          //console.log(data);
          this.updateAdminInfo(await this.EncrDecrService.encryptObject('admin', data[0]));
          this.updateActiveBookingHistory(await this.API.getBookingInfo(data = { type: "activeBookingHistory" }));
        } else if (module = "room") {
          this.updateAllRoomData(await this.API.getRoomInfo(data = { type: "getAllRoom" }));
        } else if (module = "chart") {
          this.updateBookingRateChartData(await this.API.getChartData(data = { type: "bookingRateChart" }));
          var date = await this.API.getBookingDocument(null);
          var data1 = {
            type: "semBookChart",
            sem1CheckInDate: moment(date[0].sem1CheckInDate).utc().format("YYYY-MM-DD HH:mm:ss"),
            sem2CheckInDate: moment(date[0].sem2CheckInDate).utc().format("YYYY-MM-DD HH:mm:ss"),
            sem3CheckInDate: moment(date[0].sem3CheckInDate).utc().format("YYYY-MM-DD HH:mm:ss"),
            sem1CheckOutDate: moment(date[0].sem1CheckOutDate).utc().format("YYYY-MM-DD HH:mm:ss"),
            sem2CheckOutDate: moment(date[0].sem2CheckOutDate).utc().format("YYYY-MM-DD HH:mm:ss"),
            sem3CheckOutDate: moment(date[0].sem3CheckOutDate).utc().format("YYYY-MM-DD HH:mm:ss"),
          }
          this.updateSemBookChartData(await this.API.getChartData(data1));
          this.updateVillageOccupancyChartData(await this.calculateRoomOccupancy());
        }
        resolve('ok');
      }
      catch (err) {
        console.error(err);
        reject(err);
      }
    });
  }

  // SocketIO
  /* private brodcastData = new BehaviorSubject('');
  currentBrodcastData = this.brodcastData.asObservable();
  updateBrodcastData(value) {
    this.brodcastData.next(value);
  } */


  async calculateRoomOccupancy() {
    var data = {
      type: "getAllVillage",
    }
    var village: any = await this.API.getRoomInfo(data);
    //console.log(village);
    let result = [];

    for (let j=0; j<=3; j++){
      var object = [];
      for(let i of village) {
        let a = {
          type: "villageOccupancyChart",
          village: i.village,
          status: j
        }
        var res = await this.API.getChartData(a);
        //console.log(i);
        //console.log(res[0].count);
        object.push(res[0].count);
      }
      //console.log(object);
      result.push(object);
    }
    //console.log(result);
    return(result);
  }

  // Service Aunthenticator
  public publicAuth: any;

  // Admin Info
  private adminInfo = new BehaviorSubject('');
  currentAdminInfo = this.adminInfo.asObservable();
  updateAdminInfo(value) {
    this.adminInfo.next(value);
    this.publicAuth = this.EncrDecrService.decryptObject('admin', value);
    localStorage.setItem('auth', value);
    //console.log(this.publicAuth);
  }

  public reset() {
    this.updateAdminInfo(this.EncrDecrService.encryptObject('admin', 'guest'));
    localStorage.clear();
    sessionStorage.clear();
  }

  //booking
  private activeBookingHistory = new BehaviorSubject('');
  currentActiveBookingHistory = this.activeBookingHistory.asObservable();
  updateActiveBookingHistory(value) {
    this.activeBookingHistory.next(value);
    //console.log(value);
  }

  //room
  private allRoomData = new BehaviorSubject('');
  currentAllRoomData = this.allRoomData.asObservable();
  updateAllRoomData(value) {
    this.allRoomData.next(value);
    //console.log(value);
  }

  //chart
  private bookingRateChartData = new BehaviorSubject('');
  currentBookingRateChartData = this.bookingRateChartData.asObservable();
  updateBookingRateChartData(value) {
    this.bookingRateChartData.next(value);
    //console.log(value);
  }

  private semBookChartData = new BehaviorSubject('');
  currentSemBookChartData = this.semBookChartData.asObservable();
  updateSemBookChartData(value) {
    this.semBookChartData.next(value);
    //console.log(value);
  }

  private villageOccupancyChartData = new BehaviorSubject('');
  currentVillageOccupancyChartData = this.villageOccupancyChartData.asObservable();
  updateVillageOccupancyChartData(value) {
    this.villageOccupancyChartData.next(value);
    //console.log(value);
  }

}