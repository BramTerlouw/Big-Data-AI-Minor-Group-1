import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'training',
        loadChildren: () => import('../tab_training/tab_training.module').then(m => m.TabTrainingPageModule)
      },
      {
        path: 'personal',
        loadChildren: () => import('../tab_personal/tab_personal.module').then(m => m.TabPersonalPageModule)
      },
      {
        path: '',
        redirectTo: '/tabs/training',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/training',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
