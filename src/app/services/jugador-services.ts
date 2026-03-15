import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { JugadorDTO } from '../models/jugador.model';

@Injectable({
  providedIn: 'root'
})
export class JugadorService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/jugadores`;

  listarTodos(): Observable<JugadorDTO[]> {
    return this.http.get<JugadorDTO[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<JugadorDTO> {
    return this.http.get<JugadorDTO>(`${this.apiUrl}/${id}`);
  }

  listarPorEquipo(equipoId: number): Observable<JugadorDTO[]> {
    return this.http.get<JugadorDTO[]>(`${this.apiUrl}/equipo/${equipoId}`);
  }

  listarActivosPorEquipo(equipoId: number): Observable<JugadorDTO[]> {
    return this.http.get<JugadorDTO[]>(`${this.apiUrl}/equipo/${equipoId}/activos`);
  }

  listarPorTorneo(torneoId: number): Observable<JugadorDTO[]> {
    return this.http.get<JugadorDTO[]>(`${this.apiUrl}/torneo/${torneoId}`);
  }

  listarSinPagarPorTorneo(torneoId: number): Observable<JugadorDTO[]> {
    return this.http.get<JugadorDTO[]>(`${this.apiUrl}/torneo/${torneoId}/sin-pagar`);
  }

  buscarPorCedula(cedula: string): Observable<JugadorDTO> {
    return this.http.get<JugadorDTO>(`${this.apiUrl}/cedula/${cedula}`);
  }

  crear(jugador: JugadorDTO): Observable<JugadorDTO> {
    return this.http.post<JugadorDTO>(this.apiUrl, jugador);
  }

  actualizar(id: number, jugador: JugadorDTO): Observable<JugadorDTO> {
    return this.http.put<JugadorDTO>(`${this.apiUrl}/${id}`, jugador);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  pagarCarnet(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/pagar-carnet`, {});
  }

  verificarJugador(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/verificar`, {});
  }

  cambiarEquipo(id: number, equipoId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/cambiar-equipo`, { equipoId });
  }
}
