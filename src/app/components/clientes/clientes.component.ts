import { Component } from '@angular/core';

@Component({
  selector: 'app-clientes',
  standalone: true,
  template: `
    <div class="bg-white p-6 rounded-xl border border-slate-200">
      <h2 class="text-xl font-bold text-slate-800">Módulo de Clientes</h2>
      <p class="text-sm text-slate-500 mt-1">Cargando...</p>
    </div>
  `
})
export class ClientesComponent {}
