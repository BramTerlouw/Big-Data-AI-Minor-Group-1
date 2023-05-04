import { Component } from '@angular/core';

@Component({
  selector: 'app-tab_training',
  templateUrl: 'tab_training.page.html',
  styleUrls: ['tab_training.page.scss']
})
export class TabTrainingPage {
  public step: 'start' | 'check' | 'stream' = 'stream';

  constructor() {}

  public changeStep = (newStep: 'start' | 'check' | 'stream') => {
    this.step = newStep;
  }

}
