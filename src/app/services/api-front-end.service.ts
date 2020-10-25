import { Injectable } from '@angular/core';

import { ApiBackEndService } from '../services/api-back-end.service';
import { EncrDecrService } from '../services/encdec.service';

@Injectable({
  providedIn: 'root'
})
export class ApiFrontEndService {

  constructor(
    private ApiBackEndService: ApiBackEndService,
    private EncrDecrService: EncrDecrService
  ) { }

  // Client Info
  public login(user) {
    return new Promise((resolve, reject) => {
      user = this.EncrDecrService.encryptObject('login', user);
      this.ApiBackEndService.login(user).subscribe(
        (res: { status, data }) => {
          res = this.EncrDecrService.decryptObject('login', res);
          if (res.status == 200) {
            if (res.data.length != 0) resolve(res.data)
            else if (res.data.length == 0) reject('Empty data');
          }
          else reject(res.status);
        },
        (err) => {
          reject(err)
        }
      );
    });
  }

  public getAdminInfo(user) {
    return new Promise((resolve, reject) => {
      user = this.EncrDecrService.encryptObject('admin', user);
      this.ApiBackEndService.getAdminInfo(user).subscribe(
        (res: { status, data }) => {
          res = this.EncrDecrService.decryptObject('admin', res);
          if (res.status == 200) {
            resolve(res.data);
          }
          else reject(res.status);
        },
        (err) => {
          reject(err)
        }
      );
    });
  }

  public updateStudentInfo(user) {
    return new Promise((resolve, reject) => {
      user = this.EncrDecrService.encryptObject('admin', user);
      this.ApiBackEndService.updateStudentInfo(user).subscribe(
        (res: { status, data }) => {
          res = this.EncrDecrService.decryptObject('admin', res);
          if (res.status == 200) {
            if (res.data.length != 0) resolve(res.data)
            else if (res.data.length == 0) reject('Empty data');
          }
          else reject(res.status);
        },
        (err) => {
          reject(err)
        }
      );
    });
  }

  public getBookingInfo(data) {
    return new Promise((resolve, reject) => {
      data = this.EncrDecrService.encryptObject('admin', data);
      this.ApiBackEndService.getBookingInfo(data).subscribe(
        (res: { status, data }) => {
          res = this.EncrDecrService.decryptObject('admin', res);
          if (res.status == 200) {
            resolve(res.data)
          }
          else reject(res.status);
        },
        (err) => {
          reject(err)
        }
      );
    });
  }

  public updateBookingInfo(data) {
    return new Promise((resolve, reject) => {
      data = this.EncrDecrService.encryptObject('admin', data);
      this.ApiBackEndService.updateBookingInfo(data).subscribe(
        (res: { status, data }) => {
          res = this.EncrDecrService.decryptObject('admin', res);
          if (res.status == 200) {
            resolve(res.data)
          }
          else reject(res.status);
        },
        (err) => {
          reject(err)
        }
      );
    });
  }

  public getRoomInfo(data) {
    return new Promise((resolve, reject) => {
      data = this.EncrDecrService.encryptObject('admin', data);
      this.ApiBackEndService.getRoomInfo(data).subscribe(
        (res: { status, data }) => {
          res = this.EncrDecrService.decryptObject('admin', res);
          if (res.status == 200) {
            resolve(res.data)
          }
          else reject(res.status);
        },
        (err) => {
          reject(err)
        }
      );
    });
  }

  public updateRoomInfo(data) {
    return new Promise((resolve, reject) => {
      data = this.EncrDecrService.encryptObject('admin', data);
      this.ApiBackEndService.updateRoomInfo(data).subscribe(
        (res: { status, data }) => {
          res = this.EncrDecrService.decryptObject('admin', res);
          if (res.status == 200) {
            resolve(res.data)
          }
          else reject(res.status);
        },
        (err) => {
          reject(err)
        }
      );
    });
  }

}
