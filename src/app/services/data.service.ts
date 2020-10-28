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
        this.updateAllRoomData(await await this.API.getRoomInfo(data = { type: "getAllRoom" }));
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
          this.updateAllRoomData(await await this.API.getRoomInfo(data = { type: "getAllRoom" }));
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

}