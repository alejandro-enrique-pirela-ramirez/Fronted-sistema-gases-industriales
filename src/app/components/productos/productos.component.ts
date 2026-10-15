import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../services/producto.service';
import { AuthService } from '../../services/auth.service';
import { Producto, MovimientoStock } from '../../models/producto.model';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-800">Catálogo de Productos y Stock</h2>
          <p class="text-sm text-slate-500">Administración de gases industriales, precios y control de inventario.</p>
        </div>
        <button *ngIf="authService.isAdmin()" (click)="abrirModalCrear()"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
          + Nuevo Producto
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
            <span class="text-sm font-semibold text-slate-700">Inventario de Gases</span>
            <span class="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 font-medium">
              {{ productosFiltrados.length }} productos
            </span>
          </div>
          <div class="flex items-center gap-2">
            <div class="relative w-full sm:w-64">
              <input type="text" [(ngModel)]="terminoBusqueda" placeholder="Buscar por código o nombre..."
                     class="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              <svg class="w-4 h-4 text-slate-400 absolute left-2.5 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <button (click)="cargarProductos()" class="text-xs px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition font-medium whitespace-nowrap">
              Actualizar
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-slate-600">
            <thead class="bg-slate-100 text-slate-700 text-xs uppercase font-semibold">
              <tr>
                <th class="px-6 py-3">Código</th>
                <th class="px-6 py-3">Nombre del Producto</th>
                <th class="px-6 py-3">Unidad</th>
                <th class="px-6 py-3">Precio Unitario</th>
                <th class="px-6 py-3">Stock Actual</th>
                <th class="px-6 py-3">Estado</th>
                <th class="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              <tr *ngFor="let producto of productosPaginados" class="hover:bg-slate-50 transition">
                <td class="px-6 py-4 font-mono font-medium text-slate-900">{{ producto.codigoProducto }}</td>
                <td class="px-6 py-4 font-medium text-slate-800">
                  {{ producto.nombreProducto }}
                  <span *ngIf="producto.descripcion" class="block text-xs text-slate-400 font-normal">
                    {{ producto.descripcion }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span class="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                    {{ producto.unidadMedida }}
                  </span>
                </td>
                <td class="px-6 py-4 font-mono font-medium text-slate-900">
                  S/ {{ producto.precio | number:'1.2-2' }}
                </td>
                <td class="px-6 py-4">
                  <span class="font-mono font-bold"
                        [ngClass]="producto.stock > 10 ? 'text-slate-800' : 'text-rose-600'">
                    {{ producto.stock }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                        [ngClass]="producto.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'">
                    {{ producto.activo ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                  <button (click)="abrirModalMovimientos(producto)"
                          class="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium rounded transition">
                    Historial
                  </button>
                  <button *ngIf="authService.isAdmin()" (click)="abrirModalStock(producto)"
                          class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded transition">
                    Stock
                  </button>
                  <button *ngIf="authService.isAdmin()" (click)="eliminarProducto(producto)"
                          class="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-medium rounded transition">
                    Eliminar
                  </button>
                </td>
              </tr>
              <tr *ngIf="productosFiltrados.length === 0 && !cargando">
                <td colspan="7" class="px-6 py-8 text-center text-slate-400">
                  {{ terminoBusqueda ? 'No se encontraron gases con el término "' + terminoBusqueda + '".' : 'No hay productos registrados en el inventario.' }}
                </td>
              </tr>
              <tr *ngIf="cargando">
                <td colspan="7" class="px-6 py-8 text-center text-slate-400">
                  Cargando catálogo...
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Paginación de Stock -->
        <div *ngIf="productosFiltrados.length > 0" class="p-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 text-xs text-slate-600">
          <div>
            Mostrando
            <span class="font-semibold text-slate-800">{{ (paginaActual - 1) * itemsPorPagina + 1 }}</span>
            a
            <span class="font-semibold text-slate-800">{{ mathMin(paginaActual * itemsPorPagina, productosFiltrados.length) }}</span>
            de
            <span class="font-semibold text-slate-800">{{ productosFiltrados.length }}</span> productos
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

      <div *ngIf="mostrarModalCrear" class="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
          <div class="flex justify-between items-center border-b pb-3">
            <h3 class="text-lg font-bold text-slate-800">Registrar Producto de Gas</h3>
            <button (click)="cerrarModalCrear()" class="text-slate-400 hover:text-slate-600 text-lg">&times;</button>
          </div>

          <div class="space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Código</label>
                <input [(ngModel)]="nuevoProducto.codigoProducto" placeholder="Ej: OX-IND-01"
                       class="w-full border border-slate-300 rounded-lg p-2 text-sm font-mono" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Unidad de Medida</label>
                <select [(ngModel)]="nuevoProducto.unidadMedida" class="w-full border border-slate-300 rounded-lg p-2 text-sm">
                  <option value="BALON">BALON</option>
                  <option value="M3">M3</option>
                  <option value="LITRO">LITRO</option>
                  <option value="UNIDAD">UNIDAD</option>
                  <option value="KG">KG</option>
                  <option value="CAJA">CAJA</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Nombre del Producto</label>
              <input [(ngModel)]="nuevoProducto.nombreProducto" placeholder="Ej: Oxígeno Industrial 6m3"
                     class="w-full border border-slate-300 rounded-lg p-2 text-sm" />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Descripción</label>
              <input [(ngModel)]="nuevoProducto.descripcion" placeholder="Detalle o pureza del gas"
                     class="w-full border border-slate-300 rounded-lg p-2 text-sm" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Precio Unitario (S/)</label>
                <input type="number" [(ngModel)]="nuevoProducto.precio" placeholder="0.00"
                       class="w-full border border-slate-300 rounded-lg p-2 text-sm font-mono" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Stock Inicial</label>
                <input type="number" [(ngModel)]="nuevoProducto.stock" placeholder="0"
                       class="w-full border border-slate-300 rounded-lg p-2 text-sm font-mono" />
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-3 border-t">
            <button (click)="cerrarModalCrear()" class="px-4 py-2 border rounded-lg text-sm text-slate-600 hover:bg-slate-50">
              Cancelar
            </button>
            <button (click)="guardarProducto()" [disabled]="guardando"
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {{ guardando ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="mostrarModalStock && productoSeleccionado" class="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4">
          <div class="flex justify-between items-center border-b pb-3">
            <h3 class="text-lg font-bold text-slate-800">Ajustar Stock</h3>
            <button (click)="cerrarModalStock()" class="text-slate-400 hover:text-slate-600 text-lg">&times;</button>
          </div>

          <div>
            <p class="text-sm font-medium text-slate-800">{{ productoSeleccionado.nombreProducto }}</p>
            <p class="text-xs text-slate-500 font-mono">Stock actual: {{ productoSeleccionado.stock }} {{ productoSeleccionado.unidadMedida }}</p>
          </div>

          <div class="space-y-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Operación</label>
              <select [(ngModel)]="tipoAjuste" class="w-full border border-slate-300 rounded-lg p-2 text-sm">
                <option value="INGRESAR">Ingresar Stock (+)</option>
                <option value="DESCONTAR">Descontar Stock (-)</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Cantidad</label>
              <input type="number" [(ngModel)]="cantidadAjuste" min="1"
                     class="w-full border border-slate-300 rounded-lg p-2 text-sm font-mono" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Motivo / Referencia</label>
              <input [(ngModel)]="referenciaAjuste" placeholder="Ej: Compra proveedor / Merma"
                     class="w-full border border-slate-300 rounded-lg p-2 text-sm" />
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-3 border-t">
            <button (click)="cerrarModalStock()" class="px-4 py-2 border rounded-lg text-sm text-slate-600 hover:bg-slate-50">
              Cancelar
            </button>
            <button (click)="guardarAjusteStock()" [disabled]="guardando"
                    class="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 disabled:opacity-50">
              {{ guardando ? 'Aplicando...' : 'Aplicar' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Historial de Movimientos de Stock -->
      <div *ngIf="mostrarModalMovimientos" class="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 space-y-4">
          <div class="flex justify-between items-center border-b pb-3">
            <div>
              <h3 class="text-base font-bold text-slate-800">Historial de Movimientos de Stock</h3>
              <p class="text-xs text-slate-500 font-mono mt-0.5" *ngIf="productoSeleccionado">
                {{ productoSeleccionado.codigoProducto }} — {{ productoSeleccionado.nombreProducto }}
              </p>
            </div>
            <button (click)="cerrarModalMovimientos()" class="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
          </div>

          <div *ngIf="cargandoMovimientos" class="py-8 text-center text-slate-500 text-xs">
            Cargando historial de movimientos...
          </div>

          <div *ngIf="!cargandoMovimientos" class="overflow-x-auto max-h-72 overflow-y-auto">
            <table class="w-full text-left text-xs text-slate-600">
              <thead class="bg-slate-100 text-slate-700 uppercase font-semibold sticky top-0">
                <tr>
                  <th class="px-3 py-2">Fecha</th>
                  <th class="px-3 py-2">Tipo</th>
                  <th class="px-3 py-2">Cantidad</th>
                  <th class="px-3 py-2">Stock Ant.</th>
                  <th class="px-3 py-2">Stock Nvo.</th>
                  <th class="px-3 py-2">Referencia</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr *ngFor="let m of movimientos" class="hover:bg-slate-50">
                  <td class="px-3 py-2 font-mono text-slate-700">{{ m.fecha | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td class="px-3 py-2">
                    <span class="px-2 py-0.5 rounded text-[11px] font-semibold"
                          [ngClass]="m.tipo === 'INGRESAR' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'">
                      {{ m.tipo }}
                    </span>
                  </td>
                  <td class="px-3 py-2 font-bold font-mono">{{ m.cantidad }}</td>
                  <td class="px-3 py-2 font-mono text-slate-500">{{ m.stockAnterior }}</td>
                  <td class="px-3 py-2 font-mono font-bold text-slate-800">{{ m.stockNuevo }}</td>
                  <td class="px-3 py-2 text-slate-600">{{ m.referencia || '-' }}</td>
                </tr>
                <tr *ngIf="movimientos.length === 0">
                  <td colspan="6" class="px-3 py-6 text-center text-slate-400">
                    No se han registrado movimientos de stock para este producto.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="flex justify-end pt-3 border-t">
            <button (click)="cerrarModalMovimientos()" class="px-4 py-2 border rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProductosComponent implements OnInit {
  private productoService = inject(ProductoService);
  public authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  productos: Producto[] = [];
  cargando = false;
  guardando = false;
  mensajeExito = '';
  mensajeError = '';
  terminoBusqueda = '';

  get productosFiltrados(): Producto[] {
    const q = this.terminoBusqueda.trim().toLowerCase();
    if (!q) return this.productos;
    return this.productos.filter(p =>
      (p.codigoProducto && p.codigoProducto.toLowerCase().includes(q)) ||
      (p.nombreProducto && p.nombreProducto.toLowerCase().includes(q)) ||
      (p.unidadMedida && p.unidadMedida.toLowerCase().includes(q)) ||
      (p.descripcion && p.descripcion.toLowerCase().includes(q))
    );
  }

  mostrarModalCrear = false;
  mostrarModalStock = false;
  mostrarModalMovimientos = false;
  cargandoMovimientos = false;
  productoSeleccionado: Producto | null = null;
  movimientos: MovimientoStock[] = [];

  // Paginación
  paginaActual = 1;
  itemsPorPagina = 5;

  get totalPaginas(): number {
    return Math.ceil(this.productosFiltrados.length / this.itemsPorPagina) || 1;
  }

  get productosPaginados(): Producto[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.productosFiltrados.slice(inicio, inicio + this.itemsPorPagina);
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

  tipoAjuste: 'INGRESAR' | 'DESCONTAR' = 'INGRESAR';
  cantidadAjuste = 1;
  referenciaAjuste = '';

  nuevoProducto: Producto = {
    codigoProducto: '',
    nombreProducto: '',
    descripcion: '',
    unidadMedida: 'BALON',
    precio: 0,
    stock: 0,
    activo: true
  };

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.cargando = true;
    this.cdr.markForCheck();
    this.productoService.listar().subscribe({
      next: (data) => {
        this.productos = data || [];
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.cargando = false;
        this.cdr.markForCheck();
      }
    });
  }

  abrirModalCrear(): void {
    this.mostrarModalCrear = true;
    this.mensajeExito = '';
    this.mensajeError = '';
    this.nuevoProducto = {
      codigoProducto: '',
      nombreProducto: '',
      descripcion: '',
      unidadMedida: 'BALON',
      precio: 0,
      stock: 0,
      activo: true
    };
  }

  cerrarModalCrear(): void {
    this.mostrarModalCrear = false;
  }

  guardarProducto(): void {
    if (!this.nuevoProducto.codigoProducto || !this.nuevoProducto.nombreProducto || this.nuevoProducto.precio <= 0) {
      this.mensajeError = 'Complete el código, nombre y un precio mayor a 0.';
      return;
    }

    this.guardando = true;
    this.mensajeExito = '';
    this.mensajeError = '';

    this.productoService.registrar(this.nuevoProducto).subscribe({
      next: () => {
        this.mensajeExito = 'Producto registrado exitosamente en el inventario.';
        this.guardando = false;
        this.cerrarModalCrear();
        this.cargarProductos();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.mensajeError = err.error?.message || 'Error al registrar el producto.';
        this.guardando = false;
        this.cdr.markForCheck();
      }
    });
  }

  abrirModalStock(producto: Producto): void {
    this.productoSeleccionado = producto;
    this.tipoAjuste = 'INGRESAR';
    this.cantidadAjuste = 1;
    this.referenciaAjuste = '';
    this.mostrarModalStock = true;
    this.mensajeExito = '';
    this.mensajeError = '';
    this.cdr.markForCheck();
  }

  cerrarModalStock(): void {
    this.mostrarModalStock = false;
    this.productoSeleccionado = null;
    this.cdr.markForCheck();
  }

  guardarAjusteStock(): void {
    if (!this.productoSeleccionado?.idProducto || this.cantidadAjuste <= 0) {
      this.mensajeError = 'Indique una cantidad válida.';
      return;
    }

    this.guardando = true;
    this.cdr.markForCheck();
    const id = this.productoSeleccionado.idProducto;
    const obs = this.tipoAjuste === 'INGRESAR'
      ? this.productoService.ingresarStock(id, this.cantidadAjuste, this.referenciaAjuste)
      : this.productoService.descontarStock(id, this.cantidadAjuste, this.referenciaAjuste);

    obs.subscribe({
      next: () => {
        this.mensajeExito = `Stock actualizado correctamente (${this.tipoAjuste}).`;
        this.guardando = false;
        this.cerrarModalStock();
        this.cargarProductos();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.mensajeError = err.error?.message || 'Error al actualizar stock.';
        this.guardando = false;
        this.cdr.markForCheck();
      }
    });
  }

  eliminarProducto(producto: Producto): void {
    if (!producto.idProducto) return;
    if (!confirm(`¿Desea eliminar el producto ${producto.nombreProducto}?`)) return;

    this.productoService.eliminar(producto.idProducto).subscribe({
      next: () => {
        this.mensajeExito = 'Producto eliminado del catálogo.';
        this.cargarProductos();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.mensajeError = err.error?.message || 'Error al eliminar el producto.';
        this.cdr.markForCheck();
      }
    });
  }

  abrirModalMovimientos(producto: Producto): void {
    this.productoSeleccionado = producto;
    this.mostrarModalMovimientos = true;
    this.cargandoMovimientos = true;
    this.movimientos = [];
    this.cdr.markForCheck();

    if (producto.idProducto) {
      this.productoService.obtenerMovimientos(producto.idProducto).subscribe({
        next: (data) => {
          this.movimientos = data || [];
          this.cargandoMovimientos = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.cargandoMovimientos = false;
          this.cdr.markForCheck();
        }
      });
    } else {
      this.cargandoMovimientos = false;
      this.cdr.markForCheck();
    }
  }

  cerrarModalMovimientos(): void {
    this.mostrarModalMovimientos = false;
    this.productoSeleccionado = null;
    this.movimientos = [];
    this.cdr.markForCheck();
  }
}
