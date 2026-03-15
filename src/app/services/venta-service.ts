// src/app/services/venta.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { VentaDTO, Producto, EntradaInventarioRequest } from '../models/torneo.model';

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/ventas`;

  registrarVenta(venta: VentaDTO): Observable<VentaDTO> {
    return this.http.post<VentaDTO>(this.apiUrl, venta);
  }

  obtenerVenta(id: number): Observable<VentaDTO> {
    return this.http.get<VentaDTO>(`${this.apiUrl}/${id}`);
  }

  listarVentasPorFecha(polideportivoId: number, fechaInicio: string, fechaFin: string): Observable<VentaDTO[]> {
    const params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);
    return this.http.get<VentaDTO[]>(`${this.apiUrl}/polideportivo/${polideportivoId}`, { params });
  }

  registrarEntradaInventario(request: EntradaInventarioRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/inventario/entrada`, request);
  }

  listarProductosBajoStock(polideportivoId: number): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/productos/bajo-stock/${polideportivoId}`);
  }
}
