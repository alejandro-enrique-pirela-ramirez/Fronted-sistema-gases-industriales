import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../services/cliente.service';
import { Cliente } from '../../models/cliente.model';
import { confirmar } from '../../shared/confirm';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Encabezado -->
      <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p class="text-xs font-semibold text-blue-600 uppercase tracking-wider">Gestión comercial</p>
          <h2 class="text-2xl font-bold text-slate-800">Clientes</h2>
          <p class="text-sm text-slate-500">Consulta y registro de clientes para facturación electrónica.</p>
        </div>
        <button (click)="abrirModal()"
                class="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition shadow-sm">
          + Nuevo cliente
        </button>
      </div>

      <!-- Mensajes -->
      <div *ngIf="mensajeExito" class="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm">
        <span>✅</span><span>{{ mensajeExito }}</span>
      </div>
      <div *ngIf="mensajeError" class="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm">
        <span>⚠️</span><span>{{ mensajeError }}</span>
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total clientes</p>
          <p class="text-2xl font-extrabold text-slate-800 mt-2">{{ clientes.length }}</p>
        </div>
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Empresas (RUC)</p>
          <p class="text-2xl font-extrabold text-purple-600 mt-2">{{ totalRuc }}</p>
          <p class="text-[11px] text-slate-400 mt-1">Pueden recibir facturas</p>
        </div>
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Personas (DNI / CE)</p>
          <p class="text-2xl font-extrabold text-blue-600 mt-2">{{ clientes.length - totalRuc }}</p>
          <p class="text-[11px] text-slate-400 mt-1">Solo boletas</p>
        </div>
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Con correo</p>
          <p class="text-2xl font-extrabold text-emerald-600 mt-2">{{ conCorreo }}</p>
          <p class="text-[11px] text-slate-400 mt-1">Listos para envío de PDF</p>
        </div>
      </div>

      <!-- Tabla -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <span class="text-sm font-bold text-slate-800">Listado de clientes</span>
            <span class="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
              {{ clientesFiltrados.length }} resultados
            </span>
          </div>
          <div class="flex items-center gap-2">
            <div class="relative w-full sm:w-72">
              <input type="text" [(ngModel)]="terminoBusqueda" (ngModelChange)="paginaActual = 1"
                     placeholder="Buscar por DNI, RUC, nombre o correo..."
                     class="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
              <svg class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <button (click)="cargarClientes()" [disabled]="cargando"
                    class="text-xs px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg transition font-medium whitespace-nowrap disabled:opacity-50">
              {{ cargando ? 'Cargando...' : 'Actualizar' }}
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full min-w-[900px] table-fixed text-left text-sm text-slate-600">
            <colgroup>
              <col />
              <col style="width: 170px" />
              <col style="width: 210px" />
              <col style="width: 230px" />
              <col style="width: 110px" />
            </colgroup>
            <thead class="bg-slate-50 text-slate-500 text-[11px] uppercase font-semibold tracking-wider">
              <tr>
                <th class="px-4 py-3">Cliente</th>
                <th class="px-4 py-3">Documento</th>
                <th class="px-4 py-3">Dirección</th>
                <th class="px-4 py-3">Contacto</th>
                <th class="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let cliente of clientesPaginados" class="hover:bg-slate-50/70 transition">
                <td class="px-4 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                         [ngClass]="colorAvatar(cliente)">
                      {{ iniciales(cliente.nombre) }}
                    </div>
                    <div class="min-w-0">
                      <p class="font-semibold text-slate-800 truncate">{{ cliente.nombre }}</p>
                      <p class="text-[11px] text-slate-400 font-mono">ID {{ cliente.idCliente }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-4">
                  <span class="inline-block px-2 py-0.5 rounded text-[11px] font-semibold mb-1"
                        [ngClass]="claseTipo(cliente.tipoDocumento)">
                    {{ cliente.tipoDocumento }}
                  </span>
                  <p class="font-mono text-slate-800 font-medium">{{ cliente.numeroDocumento }}</p>
                </td>
                <td class="px-4 py-4 text-slate-500 truncate" [title]="cliente.direccion || ''">{{ cliente.direccion || '—' }}</td>
                <td class="px-4 py-4 text-xs text-slate-500">
                  <p class="truncate">✉️ {{ cliente.correo || '—' }}</p>
                  <p class="truncate mt-1">📞 {{ cliente.telefono || '—' }}</p>
                </td>
                <td class="px-4 py-4">
                  <div class="flex items-center justify-center gap-2">
                    <button (click)="abrirModalEditar(cliente)" title="Editar cliente" aria-label="Editar"
                            class="w-9 h-9 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <button (click)="eliminarCliente(cliente)" title="Eliminar cliente" aria-label="Eliminar"
                            class="w-9 h-9 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="clientesFiltrados.length === 0 && !cargando">
                <td colspan="5" class="px-6 py-12 text-center text-slate-400">
                  {{ terminoBusqueda ? 'No se encontraron clientes para "' + terminoBusqueda + '".' : 'No hay clientes registrados en la base de datos.' }}
                </td>
              </tr>
              <tr *ngIf="cargando">
                <td colspan="5" class="px-6 py-12 text-center text-slate-400">Cargando clientes...</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Paginación -->
        <div *ngIf="clientesFiltrados.length > 0" class="p-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/60 text-xs text-slate-600">
          <div>
            Mostrando
            <span class="font-semibold text-slate-800">{{ (paginaActual - 1) * itemsPorPagina + 1 }}</span> a
            <span class="font-semibold text-slate-800">{{ mathMin(paginaActual * itemsPorPagina, clientesFiltrados.length) }}</span> de
            <span class="font-semibold text-slate-800">{{ clientesFiltrados.length }}</span> clientes
          </div>
          <div class="flex items-center gap-1.5">
            <button (click)="cambiarPagina(paginaActual - 1)" [disabled]="paginaActual === 1"
                    class="px-3 py-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-100 disabled:opacity-40 font-medium transition">
              Anterior
            </button>
            <span class="px-2 font-semibold text-slate-700">{{ paginaActual }} / {{ totalPaginas }}</span>
            <button (click)="cambiarPagina(paginaActual + 1)" [disabled]="paginaActual === totalPaginas"
                    class="px-3 py-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-100 disabled:opacity-40 font-medium transition">
              Siguiente
            </button>
          </div>
        </div>
      </div>

      <!-- Modal -->
      <div *ngIf="mostrarModal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
          <div class="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 class="text-lg font-bold text-slate-800">{{ clienteEditandoId !== null ? 'Editar cliente' : 'Registrar cliente' }}</h3>
              <p class="text-xs text-slate-500">{{ clienteEditandoId !== null ? 'El tipo y número de documento no se pueden cambiar.' : 'Consulta automática o registro manual.' }}</p>
            </div>
            <button (click)="cerrarModal()" class="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
          </div>

          <div *ngIf="mensajeError" class="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">{{ mensajeError }}</div>

          <div class="space-y-3">
            <div *ngIf="clienteEditandoId === null">
              <label class="block text-xs font-semibold text-slate-700 mb-1">Método de registro</label>
              <select [(ngModel)]="modoRegistro" class="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500">
                <option value="DNI">Consulta automática DNI (RENIEC)</option>
                <option value="RUC">Consulta automática RUC (SUNAT)</option>
                <option value="MANUAL">Registro manual</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-3" *ngIf="modoRegistro === 'MANUAL'">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Tipo documento</label>
                <select [(ngModel)]="nuevoCliente.tipoDocumento" [disabled]="clienteEditandoId !== null" class="w-full border border-slate-300 rounded-lg p-2.5 text-sm disabled:bg-slate-100 disabled:text-slate-500">
                  <option value="DNI">DNI</option>
                  <option value="RUC">RUC</option>
                  <option value="CARNET_EXTRANJERIA">Carnet de Extranjería</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">N° documento</label>
                <input [(ngModel)]="nuevoCliente.numeroDocumento" placeholder="Número" [disabled]="clienteEditandoId !== null"
                       class="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-mono disabled:bg-slate-100 disabled:text-slate-500" />
              </div>
            </div>

            <div *ngIf="modoRegistro !== 'MANUAL'">
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                {{ modoRegistro === 'DNI' ? 'Número de DNI (8 dígitos)' : 'Número de RUC (11 dígitos)' }}
              </label>
              <input [(ngModel)]="documentoConsulta" [placeholder]="modoRegistro === 'DNI' ? 'Ej: 72345678' : 'Ej: 20123456789'"
                     class="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-mono" />
            </div>

            <div *ngIf="modoRegistro === 'MANUAL'">
              <label class="block text-xs font-semibold text-slate-700 mb-1">Nombre completo o razón social</label>
              <input [(ngModel)]="nuevoCliente.nombre" placeholder="Nombre"
                     class="w-full border border-slate-300 rounded-lg p-2.5 text-sm" />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Dirección (opcional)</label>
              <input [(ngModel)]="nuevoCliente.direccion" placeholder="Av. Principal 123"
                     class="w-full border border-slate-300 rounded-lg p-2.5 text-sm" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Correo electrónico</label>
                <input [(ngModel)]="nuevoCliente.correo" placeholder="correo@ejemplo.com" type="email"
                       class="w-full border border-slate-300 rounded-lg p-2.5 text-sm" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Teléfono</label>
                <input [(ngModel)]="nuevoCliente.telefono" placeholder="987654321"
                       class="w-full border border-slate-300 rounded-lg p-2.5 text-sm" />
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button (click)="cerrarModal()" class="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
              Cancelar
            </button>
            <button (click)="guardarCliente()" [disabled]="guardando"
                    class="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
              {{ guardando ? 'Guardando...' : (clienteEditandoId !== null ? 'Guardar cambios' : 'Registrar') }}
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

  get totalRuc(): number {
    return this.clientes.filter(c => c.tipoDocumento === 'RUC').length;
  }

  get conCorreo(): number {
    return this.clientes.filter(c => !!c.correo).length;
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

  iniciales(nombre: string): string {
    if (!nombre) return '?';
    const partes = nombre.trim().split(/\s+/);
    return ((partes[0]?.[0] || '') + (partes[1]?.[0] || '')).toUpperCase();
  }

  claseTipo(tipo: string): string {
    if (tipo === 'RUC') return 'bg-purple-100 text-purple-700';
    if (tipo === 'DNI') return 'bg-blue-100 text-blue-700';
    return 'bg-amber-100 text-amber-700';
  }

  colorAvatar(c: Cliente): string {
    const paleta = [
      'bg-blue-100 text-blue-700',
      'bg-emerald-100 text-emerald-700',
      'bg-purple-100 text-purple-700',
      'bg-amber-100 text-amber-700',
      'bg-rose-100 text-rose-700',
      'bg-cyan-100 text-cyan-700'
    ];
    return paleta[(c.idCliente || 0) % paleta.length];
  }

  modoRegistro: 'DNI' | 'RUC' | 'MANUAL' = 'DNI';
  documentoConsulta = '';
  clienteEditandoId: number | null = null;

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
    this.mensajeError = '';
    this.cdr.markForCheck();
    this.clienteService.listarTodos().subscribe({
      next: (data) => {
        this.clientes = data || [];
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.mensajeError = err.status === 401
          ? 'Sesión no autorizada (401). Vuelva a iniciar sesión.'
          : 'No se pudo cargar la lista de clientes.';
        this.cargando = false;
        this.cdr.markForCheck();
      }
    });
  }

  abrirModal(): void {
    this.clienteEditandoId = null;
    this.modoRegistro = 'DNI';
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

  abrirModalEditar(c: Cliente): void {
    this.clienteEditandoId = c.idCliente ?? null;
    this.modoRegistro = 'MANUAL';
    this.documentoConsulta = '';
    this.nuevoCliente = { ...c };
    this.mensajeExito = '';
    this.mensajeError = '';
    this.mostrarModal = true;
    this.cdr.markForCheck();
  }

  private async confirmarYActualizar(): Promise<void> {
    if (!this.nuevoCliente.nombre || !this.nuevoCliente.nombre.trim()) {
      this.mensajeError = 'El nombre es obligatorio.';
      this.cdr.markForCheck();
      return;
    }

    const ok = await confirmar({
      titulo: '¿Guardar cambios?',
      texto: `Se actualizarán los datos de ${this.nuevoCliente.nombre}.`,
      confirmar: 'Sí, guardar',
      peligro: false
    });
    if (!ok) return;

    this.guardando = true;
    this.mensajeExito = '';
    this.mensajeError = '';
    this.cdr.markForCheck();

    this.clienteService.actualizar(this.clienteEditandoId!, this.nuevoCliente).subscribe({
      next: () => {
        this.mensajeExito = 'Cliente actualizado correctamente.';
        this.guardando = false;
        this.cerrarModal();
        this.cargarClientes();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.mensajeError = err.error?.message || 'Error al actualizar el cliente.';
        this.guardando = false;
        this.cdr.markForCheck();
      }
    });
  }

  async eliminarCliente(c: Cliente): Promise<void> {
    if (c.idCliente == null) return;

    const ok = await confirmar({
      titulo: '¿Eliminar cliente?',
      texto: `Se eliminará a ${c.nombre} (${c.tipoDocumento} ${c.numeroDocumento}). Las facturas ya emitidas no se modifican.`,
      confirmar: 'Sí, eliminar',
      peligro: true
    });
    if (!ok) return;

    this.mensajeExito = '';
    this.mensajeError = '';
    this.clienteService.eliminar(c.idCliente).subscribe({
      next: () => {
        this.mensajeExito = 'Cliente eliminado correctamente.';
        this.cargarClientes();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.mensajeError = err.error?.message || 'No se pudo eliminar el cliente.';
        this.cdr.markForCheck();
      }
    });
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.cdr.markForCheck();
  }

  guardarCliente(): void {
    if (this.clienteEditandoId !== null) {
      this.confirmarYActualizar();
      return;
    }

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