import { Component, EventEmitter, OnInit, Output, ViewChild  } from '@angular/core';
import { PhotoService } from 'src/app/services/photo.service';
import { PositionService } from 'src/app/services/position.service';

import { IonModal } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';

@Component({
  selector: 'app-c-training-check-position',
  templateUrl: './c-training-check-position.component.html',
  styleUrls: ['./c-training-check-position.component.scss'],
})
export class CTrainingCheckPositionComponent  implements OnInit {
  @ViewChild(IonModal)
  modal!: IonModal;
  host_ip!: string | undefined;

  @Output() stepEmitter: EventEmitter<any> = new EventEmitter()

  public pictureTaken: Boolean = false;
  public pictureProcessing: Boolean = false;
  public pictureApproved: Boolean = false;

  constructor(
    public photoService: PhotoService,
    public positionService: PositionService) { }

  async ngOnInit() {

  }

  async getPosition() {
    const imgFile = await this.photoService.getPhoto();

    this.pictureTaken = true;
    this.pictureProcessing = true;

    this.positionService.checkPosition(imgFile, this.host_ip!).subscribe(res => {
      console.log('Status code of response: ' + res.status)
      let body = res.body;

      console.log('Session code: ' + body.sessionCode);
      console.log('Corresponding message: ' + body.message);
      this.pictureProcessing = false;
      this.pictureApproved = true;
    },
    err => {
      console.log(err.message)
      this.pictureProcessing = false;
    })
  }

  setPictureTaken = (value: Boolean) => {
    this.pictureTaken = value;
  }

  setPictureApproved = (value: Boolean) => {
    this.pictureApproved = value;
  }

  public getStatus = () => {
    if (!this.pictureTaken) {
      return 'No picture.';
    }
    else if (this.pictureTaken && this.pictureProcessing) {
      return 'Processing picture.'
    }
    else if (this.pictureTaken && !this.pictureApproved) {
      return 'Wrong position!';
    }
    else {
      return 'Correct position!'
    }
  }

  public emitValue() {
    this.stepEmitter.emit('stream');
  }

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  confirm() {
    this.modal.dismiss(this.host_ip, 'confirm');
  }

  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm') {
      this.host_ip = ev.detail.data
    };
  }
}
