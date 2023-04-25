import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';


@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  constructor() {
  }


  /**
   * * getPhoto
   * 1: Takes photo.
   * 2: Calls function to convert to blob
   * 3: returns blob
   */
  public async getPhoto() {
    const capturedPhoto = await Camera.getPhoto(
      {
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        quality: 100
      }
    );

    const blob = await this.convertBase64ToBlob(capturedPhoto.base64String!, 'image/jpeg');
    return blob
  }

  convertBase64ToBlob(base64: string, type: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type });
      resolve(blob);
    });
  }
}
