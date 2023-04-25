import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabTrainingPage } from './tab_training.page';

import { CTrainingStartComponent } from '../containers/c-training-start/c-training-start.component';
import { CTrainingCheckPositionComponent } from '../containers/c-training-check-position/c-training-check-position.component';
import { CTrainingStreamComponent } from '../containers/c-training-stream/c-training-stream.component';

import { TabTrainingPageRoutingModule } from './tab_training-routing.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    TabTrainingPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [
    TabTrainingPage,
    CTrainingStartComponent,
    CTrainingCheckPositionComponent,
    CTrainingStreamComponent]
})
export class TabTrainingPageModule {}
