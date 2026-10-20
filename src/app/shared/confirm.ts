import Swal from 'sweetalert2';

export interface ConfirmOptions {
  titulo: string;
  texto?: string;
  confirmar?: string;
  cancelar?: string;
  /** true = botón rojo (acciones destructivas); false = botón azul */
  peligro?: boolean;
}

/** Muestra un diálogo de confirmación y devuelve true si el usuario acepta. */
export async function confirmar(o: ConfirmOptions): Promise<boolean> {
  const peligro = o.peligro !== false;

  const resultado = await Swal.fire({
    title: o.titulo,
    text: o.texto,
    icon: peligro ? 'warning' : 'question',
    showCancelButton: true,
    confirmButtonText: o.confirmar ?? 'Sí, continuar',
    cancelButtonText: o.cancelar ?? 'Cancelar',
    reverseButtons: true,
    focusCancel: true,
    buttonsStyling: false,
    customClass: {
      popup: 'rounded-2xl',
      title: 'text-lg font-bold text-slate-800',
      htmlContainer: 'text-sm text-slate-500',
      actions: 'gap-2',
      confirmButton: peligro
        ? 'px-5 py-2 rounded-lg bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700'
        : 'px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700',
      cancelButton: 'px-5 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50'
    }
  });

  return resultado.isConfirmed;
}
