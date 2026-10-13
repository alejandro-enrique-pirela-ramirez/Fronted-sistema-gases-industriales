import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ClienteService } from '../../services/cliente.service';
import { ProductoService } from '../../services/producto.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="space-y-6">
      <div>
        <h2 class="text-2xl font-bold text-slate-800">Panel de Control</h2>
        <p class="text-sm text-slate-500">Resumen general del sistema de facturación y stock de gases industriales.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Clientes</p>
            <p class="text-3xl font-extrabold text-slate-800 mt-2">{{ totalClientes }}</p>
            <a routerLink="/clientes" class="text-xs text-blue-600 font-medium hover:underline mt-2 inline-block">Ver listado &rarr;</a>
          </div>
          <div class="p-3 bg-blue-50 text-blue-600 rounded-lg text-xl">👥</div>
        </div>

        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Productos en Catálogo</p>
            <p class="text-3xl font-extrabold text-slate-800 mt-2">{{ totalProductos }}</p>
            <a routerLink="/productos" class="text-xs text-blue-600 font-medium hover:underline mt-2 inline-block">Ver catálogo &rarr;</a>
          </div>
          <div class="p-3 bg-emerald-50 text-emerald-600 rounded-lg text-xl">📦</div>
        </div>

        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Facturación</p>
            <p class="text-3xl font-extrabold text-slate-800 mt-2">SUNAT</p>
            <a routerLink="/facturas" class="text-xs text-blue-600 font-medium hover:underline mt-2 inline-block">Emitir factura &rarr;</a>
          </div>
          <div class="p-3 bg-purple-50 text-purple-600 rounded-lg text-xl">🧾</div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 class="text-base font-semibold text-slate-800 mb-3">Acciones Rápidas</h3>
        <div class="flex flex-wrap gap-3">
          <a routerLink="/clientes" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
            Registrar Cliente
          </a>
          <a routerLink="/productos" class="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 transition">
            Control de Stock
          </a>
          <a routerLink="/facturas" class="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
            Nueva Factura Electrónica
          </a>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private clienteService = inject(ClienteService);
  private productoService = inject(ProductoService);

  totalClientes = 0;
  totalProductos = 0;

  ngOnInit(): void {
    this.clienteService.listarTodos().subscribe({
      next: (data) => this.totalClientes = data ? data.length : 0,
      error: () => this.totalClientes = 0
    });

    this.productoService.listar().subscribe({
      next: (data) => this.totalProductos = data ? data.length : 0,
      error: () => this.totalProductos = 0
    });
  }
}
