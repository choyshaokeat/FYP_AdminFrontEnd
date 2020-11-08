import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})

export class EncrDecrService {

  p_key = {
    login: 'key_login.bbb',
    admin: 'key_admin.bbb',
    mail: 'key_mail.bbb'
  }

  constructor() { }

  encryptObject(type, value) {
    try {
      var key = '';
      if (type == 'login') key = this.p_key.login;
      else if (type == 'admin') key = this.p_key.admin;
      else if (type == 'mail') key = this.p_key.mail;

      var b64 = CryptoJS.AES.encrypt(JSON.stringify(value), key).toString();
      var e64 = CryptoJS.enc.Base64.parse(b64);
      var encrypted = e64.toString(CryptoJS.enc.Hex);
      return encrypted;
    }
    catch (err) {
      // console.error(err);
      return 'Error - encrypt';
    }
  }

  decryptObject(type, value) {
    try {
      var key = '';
      if (type == 'login') key = this.p_key.login;
      else if (type == 'admin') key = this.p_key.admin;
      else if (type == 'mail') key = this.p_key.mail;

      var reb64 = CryptoJS.enc.Hex.parse(value);
      var bytes = reb64.toString(CryptoJS.enc.Base64);
      var decrypt = CryptoJS.AES.decrypt(bytes, key);
      var decrypted = JSON.parse(decrypt.toString(CryptoJS.enc.Utf8));
      return decrypted;
    }
    catch (err) {
      // console.error(err);
      return 'Error - decrypt';
    }

  }
}