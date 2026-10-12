export interface ItemFactura {
  idProducto: number;
  cantidad: number;
  codigoProducto?: string;
  nombreProducto?: string;
  precioUnitario?: number;
  subtotal?: number;
}

export interface FacturaRequest {
  idCliente: number;
  serie: string;
  items: ItemFactura[];
}

export interface DetalleFacturaResponse {
  idDetalle?: number;
  idProducto: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface FacturaResponse {
  idFactura: number;
  serie: string;
  numero: string;
  fechaEmision: string;
  idCliente: number;
  subtotal: number;
  igv: number;
  total: number;
  estado: string;
  detalles: DetalleFacturaResponse[];
}
