// src/app/services/producto.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Producto } from '../models/torneo.model';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/productos`;

  listarTodos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl);
  }

  listarPorPolideportivo(polideportivoId: number): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/polideportivo/${polideportivoId}`);
  }

  listarActivos(polideportivoId: number): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/activos/polideportivo/${polideportivoId}`);
  }

  listarPorCategoria(categoria: string, polideportivoId: number): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/categoria/${categoria}/polideportivo/${polideportivoId}`);
  }

  obtenerPorId(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  crear(producto: Producto): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, producto);
  }

  actualizar(id: number, producto: Producto): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${id}`, producto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
