import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './modules/home/home.component';
import { AuthGuards } from './guards/auth-guards.service';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    //lady loading
    loadChildren: () =>
      import('./modules/dashboard/dashboard.module').then((m)=>m.DashboardModule),

      canActivate: [AuthGuards] //guarda de rotas

  },
  {
    path: 'products',
    loadChildren: () =>
    import('./modules/products/products.module').then((m)=>m.ProductsModule),
    canActivate: [AuthGuards]
  },
  {
    path: 'categories',
    loadChildren: () =>
    import('./modules/categories/categories.module').then((m)=>m.CategoriesModule),
    canActivate: [AuthGuards]
  },
  {
    path: 'home',
    component: HomeComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    preloadingStrategy: PreloadAllModules
  })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
