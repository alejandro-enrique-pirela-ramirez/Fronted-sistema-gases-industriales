import { Component } from '@angular/core';

@Component({
  selector: 'app-productos',
  standalone: true,
  template: `
    <div class="bg-white p-6 rounded-xl border border-slate-200">
      <h2 class="text-xl font-bold text-slate-800">Catálogo de Productos y Stock</h2>
      <p class="text-sm text-slate-500 mt-1">Cargando...</p>
    </div>
  `
})
export class ProductosComponent {}
