import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FacturaService } from '../../services/factura.service';
import { ClienteService } from '../../services/cliente.service';
import { ProductoService } from '../../services/producto.service';
import { Cliente } from '../../models/cliente.model';
import { Producto } from '../../models/producto.model';
import { FacturaRequest, ItemFactura, FacturaResponse } from '../../models/factura.model';

@Component({
  selector: 'app-facturas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-800">Emisión y Gestión de Facturas</h2>
          <p class="text-sm text-slate-500">Comprobantes electrónicos, encolado asíncrono y despacho SUNAT.</p>
        </div>
      </div>

      <!-- Selector de Pestañas -->
      <div class="flex border-b border-slate-200 gap-6 text-sm">
        <button (click)="cambiarTab('INDIVIDUAL')"
                [ngClass]="tabActiva === 'INDIVIDUAL' ? 'border-b-2 border-blue-600 text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-700'"
                class="pb-3 transition">
          Emisión Individual
        </button>
        <button (click)="cambiarTab('LOTE')"
                [ngClass]="tabActiva === 'LOTE' ? 'border-b-2 border-blue-600 text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-700'"
                class="pb-3 transition">
          Emisión en Lote (Prueba RabbitMQ)
        </button>
        <button (click)="cambiarTab('HISTORIAL')"
                [ngClass]="tabActiva === 'HISTORIAL' ? 'border-b-2 border-blue-600 text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-700'"
                class="pb-3 transition">
          Historial de Facturas
        </button>
      </div>

      <div *ngIf="mensajeExito" class="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm">
        {{ mensajeExito }}
      </div>
      <div *ngIf="mensajeError" class="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm">
        {{ mensajeError }}
      </div>

      <!-- PESTAÑA 1: EMISIÓN INDIVIDUAL -->
      <div *ngIf="tabActiva === 'INDIVIDUAL'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 class="text-base font-bold text-slate-800 border-b pb-2">1. Datos del Comprobante y Cliente</h3>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Serie</label>
                <input [(ngModel)]="serie" class="w-full border border-slate-300 rounded-lg p-2 text-sm font-mono font-bold" />
              </div>

              <div class="sm:col-span-2">
                <label class="block text-xs font-semibold text-slate-700 mb-1">Cliente Receptor</label>
                <select [(ngModel)]="idClienteSeleccionado" class="w-full border border-slate-300 rounded-lg p-2 text-sm">
                  <option [ngValue]="null">-- Seleccione un cliente --</option>
                  <option *ngFor="let c of clientes" [ngValue]="c.idCliente">
                    {{ c.tipoDocumento }}: {{ c.numeroDocumento }} - {{ c.nombre }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 class="text-base font-bold text-slate-800 border-b pb-2">2. Agregar Productos de Gas</h3>

            <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div class="sm:col-span-2">
                <label class="block text-xs font-semibold text-slate-700 mb-1">Producto</label>
                <select [(ngModel)]="idProductoSeleccionado" class="w-full border border-slate-300 rounded-lg p-2 text-sm">
                  <option [ngValue]="null">-- Seleccione gas --</option>
                  <option *ngFor="let p of productos" [ngValue]="p.idProducto">
                    {{ p.codigoProducto }} - {{ p.nombreProducto }} (S/ {{ p.precio }} | Stock: {{ p.stock }})
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Cantidad</label>
                <input type="number" [(ngModel)]="cantidadAgregar" min="1"
                       class="w-full border border-slate-300 rounded-lg p-2 text-sm font-mono" />
              </div>

              <div>
                <button (click)="agregarItem()"
                        class="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-medium transition">
                  + Agregar
                </button>
              </div>
            </div>

            <div class="overflow-x-auto mt-4 border border-slate-100 rounded-lg">
              <table class="w-full text-left text-xs text-slate-600">
                <thead class="bg-slate-50 text-slate-700 uppercase font-semibold">
                  <tr>
                    <th class="px-4 py-2.5">Código</th>
                    <th class="px-4 py-2.5">Descripción</th>
                    <th class="px-4 py-2.5 text-center">Cant</th>
                    <th class="px-4 py-2.5 text-right">P. Unit</th>
                    <th class="px-4 py-2.5 text-right">Subtotal</th>
                    <th class="px-4 py-2.5 text-center"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr *ngFor="let it of items; let idx = index" class="hover:bg-slate-50">
                    <td class="px-4 py-2 font-mono">{{ it.codigoProducto }}</td>
                    <td class="px-4 py-2 font-medium text-slate-800">{{ it.nombreProducto }}</td>
                    <td class="px-4 py-2 text-center font-bold font-mono">{{ it.cantidad }}</td>
                    <td class="px-4 py-2 text-right font-mono">S/ {{ it.precioUnitario | number:'1.2-2' }}</td>
                    <td class="px-4 py-2 text-right font-mono font-semibold text-slate-900">S/ {{ it.subtotal | number:'1.2-2' }}</td>
                    <td class="px-4 py-2 text-center">
                      <button (click)="removerItem(idx)" class="text-rose-500 hover:text-rose-700 font-bold">&times;</button>
                    </td>
                  </tr>
                  <tr *ngIf="items.length === 0">
                    <td colspan="6" class="px-4 py-6 text-center text-slate-400">
                      No se han agregado gases al comprobante.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 class="text-base font-bold text-slate-800 border-b pb-2">Resumen de Factura</h3>

            <div class="space-y-2 text-sm text-slate-600">
              <div class="flex justify-between">
                <span>Subtotal (Op. Gravada):</span>
                <span class="font-mono font-medium">S/ {{ totalBase | number:'1.2-2' }}</span>
              </div>
              <div class="flex justify-between">
                <span>I.G.V. (18%):</span>
                <span class="font-mono font-medium">S/ {{ totalIgv | number:'1.2-2' }}</span>
              </div>
              <div class="flex justify-between text-base font-bold text-slate-900 pt-3 border-t">
                <span>Total a Pagar:</span>
                <span class="font-mono text-emerald-600">S/ {{ totalPagar | number:'1.2-2' }}</span>
              </div>
            </div>

            <button (click)="emitirFactura()" [disabled]="emitiendo || items.length === 0 || !idClienteSeleccionado"
                    class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm transition shadow-sm disabled:opacity-50">
              {{ emitiendo ? 'Emitiendo comprobante...' : 'Emitir Factura Electrónica' }}
            </button>

            <p class="text-xs text-slate-400 text-center">
              El comprobante electrónico será procesado conforme a normativa SUNAT.
            </p>
          </div>
        </div>
      </div>

      <!-- PESTAÑA 2: EMISIÓN EN LOTE (RABBITMQ) -->
      <div *ngIf="tabActiva === 'LOTE'" class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5 max-w-2xl">
        <div>
          <h3 class="text-base font-bold text-slate-800">Emisión Masiva por Lote</h3>
          <p class="text-xs text-slate-500">Prueba de carga y procesamiento asíncrono con encolamiento en RabbitMQ.</p>
        </div>

        <div class="space-y-4 text-sm">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Cliente Receptor</label>
              <select [(ngModel)]="idClienteLote" class="w-full border border-slate-300 rounded-lg p-2 text-sm">
                <option [ngValue]="null">-- Seleccione cliente --</option>
                <option *ngFor="let c of clientes" [ngValue]="c.idCliente">
                  {{ c.tipoDocumento }}: {{ c.nombre }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Producto de Gas</label>
              <select [(ngModel)]="idProductoLote" class="w-full border border-slate-300 rounded-lg p-2 text-sm">
                <option [ngValue]="null">-- Seleccione gas --</option>
                <option *ngFor="let p of productos" [ngValue]="p.idProducto">
                  {{ p.nombreProducto }} (S/ {{ p.precio }})
                </option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Serie</label>
              <input [(ngModel)]="serieLote" class="w-full border border-slate-300 rounded-lg p-2 text-sm font-mono font-bold" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Cant. por Factura</label>
              <input type="number" [(ngModel)]="cantidadPorFacturaLote" min="1" class="w-full border border-slate-300 rounded-lg p-2 text-sm font-mono" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Total Facturas en Lote</label>
              <select [(ngModel)]="totalFacturasLote" class="w-full border border-slate-300 rounded-lg p-2 text-sm font-semibold">
                <option [ngValue]="5">5 Facturas</option>
                <option [ngValue]="10">10 Facturas</option>
                <option [ngValue]="20">20 Facturas</option>
                <option [ngValue]="50">50 Facturas (Estrés)</option>
              </select>
            </div>
          </div>

          <div class="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
            Se generará un lote de <strong>{{ totalFacturasLote }} comprobantes</strong> y se enviará en una sola transacción a <strong>POST /api/facturas/lote</strong> para que RabbitMQ los procese secuencialmente.
          </div>

          <button (click)="emitirLote()" [disabled]="emitiendoLote || !idClienteLote || !idProductoLote"
                  class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50">
            {{ emitiendoLote ? 'Encolando lote masivo...' : 'Generar y Encolar Lote' }}
          </button>
        </div>
      </div>

      <!-- PESTAÑA 3: HISTORIAL DE FACTURAS -->
      <div *ngIf="tabActiva === 'HISTORIAL'" class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <div>
            <h3 class="text-base font-bold text-slate-800">Historial de Comprobantes Emitidos</h3>
            <p class="text-xs text-slate-500">Consulta de facturas emitidas por cliente o por estado y reenvío de correo.</p>
          </div>

          <div class="flex items-center gap-2">
            <select [(ngModel)]="filtroTipoHistorial" (change)="cargarHistorial()" class="border border-slate-300 rounded-lg p-1.5 text-xs">
              <option value="CLIENTE">Por Cliente</option>
              <option value="ESTADO">Por Estado</option>
            </select>

            <select *ngIf="filtroTipoHistorial === 'CLIENTE'" [(ngModel)]="idClienteFiltro" (change)="cargarHistorial()" class="border border-slate-300 rounded-lg p-1.5 text-xs max-w-xs">
              <option [ngValue]="null">-- Seleccione cliente --</option>
              <option *ngFor="let c of clientes" [ngValue]="c.idCliente">
                {{ c.nombre }}
              </option>
            </select>

            <select *ngIf="filtroTipoHistorial === 'ESTADO'" [(ngModel)]="estadoFiltro" (change)="cargarHistorial()" class="border border-slate-300 rounded-lg p-1.5 text-xs">
              <option value="EMITIDO">EMITIDO</option>
              <option value="PENDIENTE">PENDIENTE</option>
              <option value="ANULADO">ANULADO</option>
            </select>

            <button (click)="cargarHistorial()" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium">
              Consultar
            </button>
          </div>
        </div>

        <div *ngIf="cargandoHistorial" class="py-8 text-center text-slate-400 text-xs">
          Consultando comprobantes...
        </div>

        <div *ngIf="!cargandoHistorial" class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-600">
            <thead class="bg-slate-100 text-slate-700 uppercase font-semibold">
              <tr>
                <th class="px-4 py-2.5">ID</th>
                <th class="px-4 py-2.5">Serie / Número</th>
                <th class="px-4 py-2.5">Fecha Emisión</th>
                <th class="px-4 py-2.5 text-right">Subtotal</th>
                <th class="px-4 py-2.5 text-right">Total</th>
                <th class="px-4 py-2.5 text-center">Estado</th>
                <th class="px-4 py-2.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let f of facturasHistorial" class="hover:bg-slate-50">
                <td class="px-4 py-3 font-mono text-slate-400">{{ f.idFactura }}</td>
                <td class="px-4 py-3 font-mono font-bold text-slate-800">{{ f.serie }}-{{ f.numero || f.idFactura }}</td>
                <td class="px-4 py-3 font-mono text-slate-600">{{ f.fechaEmision | date:'dd/MM/yyyy HH:mm' }}</td>
                <td class="px-4 py-3 text-right font-mono">S/ {{ f.subtotal | number:'1.2-2' }}</td>
                <td class="px-4 py-3 text-right font-mono font-bold text-emerald-600">S/ {{ f.total | number:'1.2-2' }}</td>
                <td class="px-4 py-3 text-center">
                  <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-700">
                    {{ f.estado }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right">
                  <button (click)="abrirModalEnvio(f)"
                          class="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs font-medium transition">
                    Enviar Correo
                  </button>
                </td>
              </tr>
              <tr *ngIf="facturasHistorial.length === 0">
                <td colspan="7" class="px-4 py-8 text-center text-slate-400">
                  No se encontraron comprobantes para el filtro seleccionado.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal Enviar Factura por Correo (Ms-envio) -->
      <div *ngIf="mostrarModalEnvio" class="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4">
          <div class="flex justify-between items-center border-b pb-3">
            <h3 class="text-base font-bold text-slate-800">Enviar Factura por Correo</h3>
            <button (click)="cerrarModalEnvio()" class="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
          </div>

          <div class="space-y-3">
            <p class="text-xs text-slate-500">
              Se despachará la factura <strong>#{{ facturaSeleccionada?.idFactura }}</strong> al correo del cliente mediante el microservicio <strong>Ms-envio</strong>.
            </p>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Correo Electrónico</label>
              <input type="email" [(ngModel)]="correoDestino" placeholder="cliente@empresa.com"
                     class="w-full border border-slate-300 rounded-lg p-2 text-sm" />
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-3 border-t">
            <button (click)="cerrarModalEnvio()" class="px-4 py-2 border rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50">
              Cancelar
            </button>
            <button (click)="enviarCorreoFactura()" [disabled]="enviandoCorreo || !correoDestino"
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50">
              {{ enviandoCorreo ? 'Despachando...' : 'Despachar Correo' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class FacturasComponent implements OnInit {
  private facturaService = inject(FacturaService);
  private clienteService = inject(ClienteService);
  private productoService = inject(ProductoService);
  private cdr = inject(ChangeDetectorRef);

  tabActiva: 'INDIVIDUAL' | 'LOTE' | 'HISTORIAL' = 'INDIVIDUAL';

  clientes: Cliente[] = [];
  productos: Producto[] = [];

  serie = 'F001';
  idClienteSeleccionado: number | null = null;
  idProductoSeleccionado: number | null = null;
  cantidadAgregar = 1;

  items: ItemFactura[] = [];

  emitiendo = false;
  mensajeExito = '';
  mensajeError = '';

  // Emisión por lote (RabbitMQ)
  idClienteLote: number | null = null;
  idProductoLote: number | null = null;
  serieLote = 'F001';
  cantidadPorFacturaLote = 2;
  totalFacturasLote = 10;
  emitiendoLote = false;

  // Historial de Facturas
  facturasHistorial: FacturaResponse[] = [];
  cargandoHistorial = false;
  filtroTipoHistorial: 'CLIENTE' | 'ESTADO' = 'CLIENTE';
  idClienteFiltro: number | null = null;
  estadoFiltro = 'EMITIDO';

  // Modal Enviar Correo (Ms-envio)
  mostrarModalEnvio = false;
  facturaSeleccionada: FacturaResponse | null = null;
  correoDestino = '';
  enviandoCorreo = false;

  get totalPagar(): number {
    return this.items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  }

  get totalBase(): number {
    return this.totalPagar / 1.18;
  }

  get totalIgv(): number {
    return this.totalPagar - this.totalBase;
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cambiarTab(tab: 'INDIVIDUAL' | 'LOTE' | 'HISTORIAL'): void {
    this.tabActiva = tab;
    this.mensajeExito = '';
    this.mensajeError = '';
    if (tab === 'HISTORIAL') {
      this.cargarHistorial();
    }
    this.cdr.markForCheck();
  }

  cargarDatos(): void {
    this.clienteService.listarTodos().subscribe({
      next: (data) => {
        this.clientes = data || [];
        if (this.clientes.length > 0 && !this.idClienteLote) {
          this.idClienteLote = this.clientes[0].idCliente || null;
          this.idClienteFiltro = this.clientes[0].idCliente || null;
        }
        this.cdr.markForCheck();
      }
    });

    this.productoService.listar().subscribe({
      next: (data) => {
        this.productos = (data || []).filter(p => p.activo);
        if (this.productos.length > 0 && !this.idProductoLote) {
          this.idProductoLote = this.productos[0].idProducto || null;
        }
        this.cdr.markForCheck();
      }
    });
  }

  agregarItem(): void {
    if (!this.idProductoSeleccionado || this.cantidadAgregar <= 0) {
      this.mensajeError = 'Seleccione un producto y una cantidad válida.';
      this.cdr.markForCheck();
      return;
    }

    const prod = this.productos.find(p => p.idProducto === this.idProductoSeleccionado);
    if (!prod) return;

    if (this.cantidadAgregar > prod.stock) {
      this.mensajeError = `Stock insuficiente. Disponible: ${prod.stock} ${prod.unidadMedida}`;
      this.cdr.markForCheck();
      return;
    }

    const subtotal = prod.precio * this.cantidadAgregar;

    this.items.push({
      idProducto: prod.idProducto!,
      cantidad: this.cantidadAgregar,
      codigoProducto: prod.codigoProducto,
      nombreProducto: prod.nombreProducto,
      precioUnitario: prod.precio,
      subtotal: subtotal
    });

    this.idProductoSeleccionado = null;
    this.cantidadAgregar = 1;
    this.mensajeError = '';
    this.cdr.markForCheck();
  }

  removerItem(index: number): void {
    this.items.splice(index, 1);
    this.cdr.markForCheck();
  }

  emitirFactura(): void {
    if (!this.idClienteSeleccionado) {
      this.mensajeError = 'Debe seleccionar un cliente.';
      this.cdr.markForCheck();
      return;
    }

    if (this.items.length === 0) {
      this.mensajeError = 'Debe agregar al menos un producto a la factura.';
      this.cdr.markForCheck();
      return;
    }

    this.emitiendo = true;
    this.mensajeExito = '';
    this.mensajeError = '';
    this.cdr.markForCheck();

    const payload: FacturaRequest = {
      idCliente: this.idClienteSeleccionado,
      serie: this.serie,
      items: this.items.map(item => ({
        idProducto: item.idProducto,
        cantidad: item.cantidad
      }))
    };

    this.facturaService.emitir(payload).subscribe({
      next: (res) => {
        this.mensajeExito = `Factura emitida exitosamente. Mensaje: ${res.mensaje || 'En proceso'}`;
        this.emitiendo = false;
        this.items = [];
        this.idClienteSeleccionado = null;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.mensajeError = err.error?.message || 'No se pudo conectar con el microservicio de facturación (puerto 8099).';
        this.emitiendo = false;
        this.cdr.markForCheck();
      }
    });
  }

  emitirLote(): void {
    if (!this.idClienteLote || !this.idProductoLote) {
      this.mensajeError = 'Seleccione un cliente y un producto para el lote.';
      this.cdr.markForCheck();
      return;
    }

    this.emitiendoLote = true;
    this.mensajeExito = '';
    this.mensajeError = '';
    this.cdr.markForCheck();

    const loteRequests: FacturaRequest[] = [];
    for (let i = 0; i < this.totalFacturasLote; i++) {
      loteRequests.push({
        idCliente: this.idClienteLote,
        serie: this.serieLote,
        items: [{
          idProducto: this.idProductoLote,
          cantidad: this.cantidadPorFacturaLote
        }]
      });
    }

    this.facturaService.emitirLote(loteRequests).subscribe({
      next: (res) => {
        this.mensajeExito = `Lote de ${res.encolados || this.totalFacturasLote} facturas encolado exitosamente en RabbitMQ. ${res.mensaje || ''}`;
        this.emitiendoLote = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.mensajeError = err.error?.message || 'No se pudo enviar el lote al microservicio de facturación (puerto 8099).';
        this.emitiendoLote = false;
        this.cdr.markForCheck();
      }
    });
  }

  cargarHistorial(): void {
    this.cargandoHistorial = true;
    this.facturasHistorial = [];
    this.cdr.markForCheck();

    const obs = this.filtroTipoHistorial === 'CLIENTE' && this.idClienteFiltro
      ? this.facturaService.listarPorCliente(this.idClienteFiltro)
      : this.facturaService.listarPorEstado(this.estadoFiltro);

    obs.subscribe({
      next: (data) => {
        this.facturasHistorial = data || [];
        this.cargandoHistorial = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.facturasHistorial = [];
        this.cargandoHistorial = false;
        this.cdr.markForCheck();
      }
    });
  }

  abrirModalEnvio(factura: FacturaResponse): void {
    this.facturaSeleccionada = factura;
    const cliente = this.clientes.find(c => c.idCliente === factura.idCliente);
    this.correoDestino = cliente?.correo || '';
    this.mostrarModalEnvio = true;
    this.cdr.markForCheck();
  }

  cerrarModalEnvio(): void {
    this.mostrarModalEnvio = false;
    this.facturaSeleccionada = null;
    this.correoDestino = '';
    this.cdr.markForCheck();
  }

  enviarCorreoFactura(): void {
    if (!this.facturaSeleccionada?.idFactura || !this.correoDestino) {
      this.mensajeError = 'Indique un correo válido.';
      this.cdr.markForCheck();
      return;
    }

    this.enviandoCorreo = true;
    this.cdr.markForCheck();

    this.facturaService.enviarPorCorreo(this.facturaSeleccionada.idFactura, this.correoDestino).subscribe({
      next: () => {
        this.mensajeExito = `Factura #${this.facturaSeleccionada?.idFactura} despachada correctamente al correo ${this.correoDestino} (vía Ms-envio).`;
        this.enviandoCorreo = false;
        this.cerrarModalEnvio();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.mensajeError = err.error?.message || 'No se pudo conectar con el microservicio de envíos (puerto 8100).';
        this.enviandoCorreo = false;
        this.cdr.markForCheck();
      }
    });
  }
}
