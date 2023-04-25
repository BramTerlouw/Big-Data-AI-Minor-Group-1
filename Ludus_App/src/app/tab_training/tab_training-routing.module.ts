import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabTrainingPage } from './tab_training.page';

const routes: Routes = [
  {
    path: '',
    component: TabTrainingPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabTrainingPageRoutingModule {}
