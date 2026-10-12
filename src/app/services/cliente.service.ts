import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente } from '../models/cliente.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiClientes;

  listarTodos(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/${id}`);
  }

  registrarPorDni(dni: string, dto: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(`${this.apiUrl}/registrar-dni/${dni}`, dto);
  }

  registrarPorRuc(ruc: string, dto: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(`${this.apiUrl}/registrar-ruc/${ruc}`, dto);
  }

  registrarManual(dto: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(`${this.apiUrl}/registrar-manual`, dto);
  }
}
