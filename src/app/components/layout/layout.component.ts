import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex h-screen bg-slate-50 font-sans">
      <aside class="w-64 bg-slate-900 text-white flex flex-col justify-between">
        <div>
          <div class="p-5 border-b border-slate-800">
            <h1 class="text-lg font-bold tracking-wide text-blue-400">Gases Industriales</h1>
            <p class="text-xs text-slate-400">Sistema de Facturación</p>
          </div>
          <nav class="p-4 space-y-1">
            <a routerLink="/dashboard" routerLinkActive="bg-blue-600 text-white" 
               class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition">
              <span>Inicio</span>
            </a>
            <a routerLink="/clientes" routerLinkActive="bg-blue-600 text-white" 
               class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition">
              <span>Clientes</span>
            </a>
            <a routerLink="/productos" routerLinkActive="bg-blue-600 text-white" 
               class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition">
              <span>Productos y Stock</span>
            </a>
            <a routerLink="/facturas" routerLinkActive="bg-blue-600 text-white" 
               class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition">
              <span>Emitir Factura</span>
            </a>
          </nav>
        </div>
        <div class="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
          Grupo 2 - DAW II
        </div>
      </aside>

      <div class="flex-1 flex flex-col overflow-hidden">
        <header class="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm">
          <span class="text-sm font-medium text-slate-600">Módulo de Facturación Electrónica</span>
          <div class="flex items-center gap-3">
            <span class="inline-block w-2.5 h-2.5 bg-green-500 rounded-full"></span>
            <span class="text-xs text-slate-500">Conectado a Eureka</span>
          </div>
        </header>

        <main class="flex-1 overflow-y-auto p-8 bg-slate-100">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class LayoutComponent {}
