export interface Producto {
  idProducto?: number;
  codigoProducto: string;
  nombreProducto: string;
  descripcion?: string;
  unidadMedida: string;
  precio: number;
  stock: number;
  activo: boolean;
}
