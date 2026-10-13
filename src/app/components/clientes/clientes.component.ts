import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../services/cliente.service';
import { Cliente } from '../../models/cliente.model';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-800">Gestión de Clientes</h2>
          <p class="text-sm text-slate-500">Consulta y registro de clientes para facturación electrónica.</p>
        </div>
        <button (click)="abrirModal()"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
          + Nuevo Cliente
        </button>
      </div>

      <div *ngIf="mensajeExito" class="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm">
        {{ mensajeExito }}
      </div>
      <div *ngIf="mensajeError" class="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm">
        {{ mensajeError }}
      </div>

      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
          <div class="flex items-center gap-3">
            <span class="text-sm font-semibold text-slate-700">Listado de Clientes Registrados</span>
            <span class="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 font-medium">
              {{ clientesFiltrados.length }} clientes
            </span>
          </div>
          <div class="flex items-center gap-2">
            <div class="relative w-full sm:w-64">
              <input type="text" [(ngModel)]="terminoBusqueda" placeholder="Buscar por DNI, RUC o nombre..."
                     class="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              <svg class="w-4 h-4 text-slate-400 absolute left-2.5 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <button (click)="cargarClientes()" class="text-xs px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition font-medium whitespace-nowrap">
              Actualizar
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-slate-600">
            <thead class="bg-slate-100 text-slate-700 text-xs uppercase font-semibold">
              <tr>
                <th class="px-6 py-3">ID</th>
                <th class="px-6 py-3">Tipo Doc</th>
                <th class="px-6 py-3">N° Documento</th>
                <th class="px-6 py-3">Nombre / Razón Social</th>
                <th class="px-6 py-3">Dirección</th>
                <th class="px-6 py-3">Contacto</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              <tr *ngFor="let cliente of clientesPaginados" class="hover:bg-slate-50 transition">
                <td class="px-6 py-4 font-mono text-xs text-slate-400">{{ cliente.idCliente }}</td>
                <td class="px-6 py-4">
                  <span class="px-2 py-0.5 rounded text-xs font-medium"
                        [ngClass]="cliente.tipoDocumento === 'RUC' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'">
                      {{ cliente.tipoDocumento }}
                  </span>
                </td>
                <td class="px-6 py-4 font-mono font-medium text-slate-900">{{ cliente.numeroDocumento }}</td>
                <td class="px-6 py-4 font-medium text-slate-800">{{ cliente.nombre }}</td>
                <td class="px-6 py-4 text-slate-500">{{ cliente.direccion || '-' }}</td>
                <td class="px-6 py-4 text-xs text-slate-500">
                  <div>{{ cliente.correo || '-' }}</div>
                  <div>{{ cliente.telefono || '-' }}</div>
                </td>
              </tr>
              <tr *ngIf="clientesFiltrados.length === 0 && !cargando">
                <td colspan="6" class="px-6 py-8 text-center text-slate-400">
                  {{ terminoBusqueda ? 'No se encontraron clientes para "' + terminoBusqueda + '".' : 'No hay clientes registrados en la base de datos.' }}
                </td>
              </tr>
              <tr *ngIf="cargando">
                <td colspan="6" class="px-6 py-8 text-center text-slate-400">
                  Cargando clientes...
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Paginación de Clientes -->
        <div *ngIf="clientesFiltrados.length > 0" class="p-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 text-xs text-slate-600">
          <div>
            Mostrando
            <span class="font-semibold text-slate-800">{{ (paginaActual - 1) * itemsPorPagina + 1 }}</span>
            a
            <span class="font-semibold text-slate-800">{{ mathMin(paginaActual * itemsPorPagina, clientesFiltrados.length) }}</span>
            de
            <span class="font-semibold text-slate-800">{{ clientesFiltrados.length }}</span> clientes
          </div>
          <div class="flex items-center gap-1.5">
            <button (click)="cambiarPagina(paginaActual - 1)" [disabled]="paginaActual === 1"
                    class="px-3 py-1 border border-slate-300 rounded bg-white hover:bg-slate-100 disabled:opacity-40 font-medium transition">
              Anterior
            </button>
            <span class="px-2 font-semibold text-slate-700">
              {{ paginaActual }} / {{ totalPaginas }}
            </span>
            <button (click)="cambiarPagina(paginaActual + 1)" [disabled]="paginaActual === totalPaginas"
                    class="px-3 py-1 border border-slate-300 rounded bg-white hover:bg-slate-100 disabled:opacity-40 font-medium transition">
              Siguiente
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="mostrarModal" class="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
          <div class="flex justify-between items-center border-b pb-3">
            <h3 class="text-lg font-bold text-slate-800">Registrar Cliente</h3>
            <button (click)="cerrarModal()" class="text-slate-400 hover:text-slate-600 text-lg">&times;</button>
          </div>

          <div class="space-y-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Método de Registro</label>
              <select [(ngModel)]="modoRegistro" class="w-full border border-slate-300 rounded-lg p-2 text-sm">
                <option value="DNI">Consulta Automática DNI (RENIEC)</option>
                <option value="RUC">Consulta Automática RUC (SUNAT)</option>
                <option value="MANUAL">Registro Manual</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-3" *ngIf="modoRegistro === 'MANUAL'">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Tipo Documento</label>
                <select [(ngModel)]="nuevoCliente.tipoDocumento" class="w-full border border-slate-300 rounded-lg p-2 text-sm">
                  <option value="DNI">DNI</option>
                  <option value="RUC">RUC</option>
                  <option value="CARNET_EXTRANJERIA">Carnet de Extranjería</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">N° Documento</label>
                <input [(ngModel)]="nuevoCliente.numeroDocumento" placeholder="Número"
                       class="w-full border border-slate-300 rounded-lg p-2 text-sm" />
              </div>
            </div>

            <div *ngIf="modoRegistro !== 'MANUAL'">
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                {{ modoRegistro === 'DNI' ? 'Número de DNI (8 dígitos)' : 'Número de RUC (11 dígitos)' }}
              </label>
              <input [(ngModel)]="documentoConsulta" [placeholder]="modoRegistro === 'DNI' ? 'Ej: 72345678' : 'Ej: 20123456789'"
                     class="w-full border border-slate-300 rounded-lg p-2 text-sm font-mono" />
            </div>

            <div *ngIf="modoRegistro === 'MANUAL'">
              <label class="block text-xs font-semibold text-slate-700 mb-1">Nombre Completo o Razón Social</label>
              <input [(ngModel)]="nuevoCliente.nombre" placeholder="Nombre"
                     class="w-full border border-slate-300 rounded-lg p-2 text-sm" />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Dirección (Opcional)</label>
              <input [(ngModel)]="nuevoCliente.direccion" placeholder="Av. Principal 123"
                     class="w-full border border-slate-300 rounded-lg p-2 text-sm" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Correo Electrónico</label>
                <input [(ngModel)]="nuevoCliente.correo" placeholder="correo@ejemplo.com" type="email"
                       class="w-full border border-slate-300 rounded-lg p-2 text-sm" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Teléfono</label>
                <input [(ngModel)]="nuevoCliente.telefono" placeholder="987654321"
                       class="w-full border border-slate-300 rounded-lg p-2 text-sm" />
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-3 border-t">
            <button (click)="cerrarModal()" class="px-4 py-2 border rounded-lg text-sm text-slate-600 hover:bg-slate-50">
              Cancelar
            </button>
            <button (click)="guardarCliente()" [disabled]="guardando"
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {{ guardando ? 'Guardando...' : 'Registrar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ClientesComponent implements OnInit {
  private clienteService = inject(ClienteService);
  private cdr = inject(ChangeDetectorRef);

  clientes: Cliente[] = [];
  cargando = false;
  guardando = false;
  mostrarModal = false;
  mensajeExito = '';
  mensajeError = '';
  terminoBusqueda = '';

  get clientesFiltrados(): Cliente[] {
    const q = this.terminoBusqueda.trim().toLowerCase();
    if (!q) return this.clientes;
    return this.clientes.filter(c =>
      (c.nombre && c.nombre.toLowerCase().includes(q)) ||
      (c.numeroDocumento && c.numeroDocumento.toLowerCase().includes(q)) ||
      (c.tipoDocumento && c.tipoDocumento.toLowerCase().includes(q)) ||
      (c.correo && c.correo.toLowerCase().includes(q)) ||
      (c.telefono && c.telefono.toLowerCase().includes(q))
    );
  }

  // Paginación
  paginaActual = 1;
  itemsPorPagina = 5;

  get totalPaginas(): number {
    return Math.ceil(this.clientesFiltrados.length / this.itemsPorPagina) || 1;
  }

  get clientesPaginados(): Cliente[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.clientesFiltrados.slice(inicio, inicio + this.itemsPorPagina);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.cdr.markForCheck();
    }
  }

  mathMin(a: number, b: number): number {
    return Math.min(a, b);
  }

  modoRegistro: 'DNI' | 'RUC' | 'MANUAL' = 'DNI';
  documentoConsulta = '';

  nuevoCliente: Cliente = {
    tipoDocumento: 'DNI',
    numeroDocumento: '',
    nombre: '',
    direccion: '',
    correo: '',
    telefono: ''
  };

  ngOnInit(): void {
    this.cargarClientes();
  }

  cargarClientes(): void {
    this.cargando = true;
    this.cdr.markForCheck();
    this.clienteService.listarTodos().subscribe({
      next: (data) => {
        this.clientes = data || [];
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.cargando = false;
        this.cdr.markForCheck();
      }
    });
  }

  abrirModal(): void {
    this.mostrarModal = true;
    this.mensajeExito = '';
    this.mensajeError = '';
    this.documentoConsulta = '';
    this.nuevoCliente = {
      tipoDocumento: 'DNI',
      numeroDocumento: '',
      nombre: '',
      direccion: '',
      correo: '',
      telefono: ''
    };
    this.cdr.markForCheck();
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.cdr.markForCheck();
  }

  guardarCliente(): void {
    this.guardando = true;
    this.mensajeExito = '';
    this.mensajeError = '';
    this.cdr.markForCheck();

    if (this.modoRegistro === 'DNI') {
      if (!this.documentoConsulta || this.documentoConsulta.length !== 8) {
        this.mensajeError = 'El DNI debe tener 8 dígitos.';
        this.guardando = false;
        this.cdr.markForCheck();
        return;
      }
      this.clienteService.registrarPorDni(this.documentoConsulta, this.nuevoCliente).subscribe({
        next: () => {
          this.mensajeExito = 'Cliente registrado exitosamente desde RENIEC.';
          this.guardando = false;
          this.cerrarModal();
          this.cargarClientes();
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.mensajeError = err.error?.message || 'Error al registrar cliente por DNI.';
          this.guardando = false;
          this.cdr.markForCheck();
        }
      });
    } else if (this.modoRegistro === 'RUC') {
      if (!this.documentoConsulta || this.documentoConsulta.length !== 11) {
        this.mensajeError = 'El RUC debe tener 11 dígitos.';
        this.guardando = false;
        this.cdr.markForCheck();
        return;
      }
      this.clienteService.registrarPorRuc(this.documentoConsulta, this.nuevoCliente).subscribe({
        next: () => {
          this.mensajeExito = 'Cliente registrado exitosamente desde SUNAT.';
          this.guardando = false;
          this.cerrarModal();
          this.cargarClientes();
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.mensajeError = err.error?.message || 'Error al registrar cliente por RUC.';
          this.guardando = false;
          this.cdr.markForCheck();
        }
      });
    } else {
      if (!this.nuevoCliente.nombre || !this.nuevoCliente.numeroDocumento) {
        this.mensajeError = 'Debe completar el nombre y el número de documento.';
        this.guardando = false;
        this.cdr.markForCheck();
        return;
      }
      this.clienteService.registrarManual(this.nuevoCliente).subscribe({
        next: () => {
          this.mensajeExito = 'Cliente registrado manualmente con éxito.';
          this.guardando = false;
          this.cerrarModal();
          this.cargarClientes();
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.mensajeError = err.error?.message || 'Error al registrar cliente.';
          this.guardando = false;
          this.cdr.markForCheck();
        }
      });
    }
  }
}
