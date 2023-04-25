import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabPersonalPage } from './tab_personal.page';

const routes: Routes = [
  {
    path: '',
    component: TabPersonalPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabPersonalRoutingModule {}
