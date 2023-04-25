import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PositionService {

  constructor(private http: HttpClient) { }

  /**
   * * checkPosition
   * 1: Create form data containing the image blob and user id.
   * 2: Return post request so component can listen.
   * TODO: Do something with respone...
   * @param blob 
   */
  checkPosition = (blob: any, host_ip: string) => {
    let formData = new FormData();
    formData.append('file', blob)
    formData.append('user_id', '3')

    return this.http.post<any>('http://' + host_ip + ':80/api/v1/session/verify', formData, {observe: 'response'});
    
    // Bram Terlouw
    // return this.http.post<any>('http://192.168.2.26:80/api/v1/session/verify', formData, {observe: 'response'});

    // Bastiaan van der Bijl
    // return this.http.post<any>('http://192.168.1.140:80/api/v1/session/verify', formData, {observe: 'response'});
  }
}
