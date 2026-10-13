import { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      {
        path: 'clientes',
        loadComponent: () => import('./components/clientes/clientes.component').then(m => m.ClientesComponent)
      },
      {
        path: 'productos',
        loadComponent: () => import('./components/productos/productos.component').then(m => m.ProductosComponent)
      },
      {
        path: 'facturas',
        loadComponent: () => import('./components/facturas/facturas.component').then(m => m.FacturasComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
