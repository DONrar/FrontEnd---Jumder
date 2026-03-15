import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ResumenTorneo, ResumenVentas, Equipo, Jugador, Producto } from '../models/torneo.model';

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reportes`;

  obtenerResumenTorneo(torneoId: number): Observable<ResumenTorneo> {
    return this.http.get<ResumenTorneo>(`${this.apiUrl}/torneo/${torneoId}/resumen`);
  }

  obtenerTablaPosiciones(torneoId: number): Observable<Equipo[]> {
    return this.http.get<Equipo[]>(`${this.apiUrl}/torneo/${torneoId}/tabla-posiciones`);
  }

  obtenerTablaGoleadores(torneoId: number): Observable<Jugador[]> {
    return this.http.get<Jugador[]>(`${this.apiUrl}/torneo/${torneoId}/goleadores`);
  }

  obtenerJugadoresSinPagar(torneoId: number): Observable<Jugador[]> {
    return this.http.get<Jugador[]>(`${this.apiUrl}/torneo/${torneoId}/jugadores-sin-pagar`);
  }

  obtenerResumenVentas(polideportivoId: number, fechaInicio: string, fechaFin: string): Observable<ResumenVentas> {
    const params = new HttpParams()
      .set('polideportivoId', polideportivoId.toString())
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);
    return this.http.get<ResumenVentas>(`${this.apiUrl}/ventas/resumen`, { params });
  }

  obtenerProductosBajoStock(polideportivoId: number): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/inventario/bajo-stock/${polideportivoId}`);
  }
}
