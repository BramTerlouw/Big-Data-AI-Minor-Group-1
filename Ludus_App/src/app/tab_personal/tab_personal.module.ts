import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabPersonalPage } from './tab_personal.page';

import { TabPersonalRoutingModule } from './tab_personal-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    TabPersonalRoutingModule
  ],
  declarations: [TabPersonalPage]
})
export class TabPersonalPageModule {}
