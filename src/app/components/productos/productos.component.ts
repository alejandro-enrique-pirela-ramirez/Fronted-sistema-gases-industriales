import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../services/producto.service';
import { Producto } from '../../models/producto.model';

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
        <button (click)="abrirModalCrear()"
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
        <div class="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <span class="text-sm font-semibold text-slate-700">Inventario de Gases</span>
          <button (click)="cargarProductos()" class="text-xs text-blue-600 hover:underline">
            Actualizar
          </button>
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
              <tr *ngFor="let producto of productos" class="hover:bg-slate-50 transition">
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
                <td class="px-6 py-4 text-right space-x-2">
                  <button (click)="abrirModalStock(producto)"
                          class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded transition">
                    Stock
                  </button>
                  <button (click)="eliminarProducto(producto)"
                          class="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-medium rounded transition">
                    Eliminar
                  </button>
                </td>
              </tr>
              <tr *ngIf="productos.length === 0 && !cargando">
                <td colspan="7" class="px-6 py-8 text-center text-slate-400">
                  No hay productos registrados en el inventario.
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
    </div>
  `
})
export class ProductosComponent implements OnInit {
  private productoService = inject(ProductoService);

  productos: Producto[] = [];
  cargando = false;
  guardando = false;
  mensajeExito = '';
  mensajeError = '';

  mostrarModalCrear = false;
  mostrarModalStock = false;
  productoSeleccionado: Producto | null = null;

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
    this.productoService.listar().subscribe({
      next: (data) => {
        this.productos = data || [];
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
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
      },
      error: (err) => {
        this.mensajeError = err.error?.message || 'Error al registrar el producto.';
        this.guardando = false;
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
  }

  cerrarModalStock(): void {
    this.mostrarModalStock = false;
    this.productoSeleccionado = null;
  }

  guardarAjusteStock(): void {
    if (!this.productoSeleccionado?.idProducto || this.cantidadAjuste <= 0) {
      this.mensajeError = 'Indique una cantidad válida.';
      return;
    }

    this.guardando = true;
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
      },
      error: (err) => {
        this.mensajeError = err.error?.message || 'Error al actualizar stock.';
        this.guardando = false;
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
      },
      error: (err) => {
        this.mensajeError = err.error?.message || 'Error al eliminar el producto.';
      }
    });
  }
}
