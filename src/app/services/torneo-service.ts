import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TorneoDTO } from '../models/torneo.model';

@Injectable({
  providedIn: 'root'
})
export class TorneoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/torneos`;

  // ==================== CRUD BÁSICO ====================

  listarTodos(): Observable<TorneoDTO[]> {
    return this.http.get<TorneoDTO[]>(this.apiUrl);
  }

  obtenerTorneo(id: number): Observable<TorneoDTO> {
    return this.http.get<TorneoDTO>(`${this.apiUrl}/${id}`);
  }

  listarTorneosPorPolideportivo(polideportivoId: number): Observable<TorneoDTO[]> {
    return this.http.get<TorneoDTO[]>(`${this.apiUrl}/polideportivo/${polideportivoId}`);
  }

  crearTorneo(torneo: TorneoDTO): Observable<TorneoDTO> {
    return this.http.post<TorneoDTO>(this.apiUrl, torneo);
  }

  actualizarTorneo(id: number, torneo: TorneoDTO): Observable<TorneoDTO> {
    return this.http.put<TorneoDTO>(`${this.apiUrl}/${id}`, torneo);
  }

  eliminarTorneo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ==================== GESTIÓN DE FIXTURE ====================

  generarFixture(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/generar-fixture`, {});
  }

  // ==================== GESTIÓN DE ESTADO ====================

  iniciarTorneo(id: number): Observable<TorneoDTO> {
    return this.http.post<TorneoDTO>(`${this.apiUrl}/${id}/iniciar`, {});
  }

  cancelarTorneo(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/cancelar`, {});
  }

  avanzarFase(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/avanzar-fase`, {});
  }

  cambiarEstado(id: number, nuevoEstado: string): Observable<TorneoDTO> {
    return this.http.put<TorneoDTO>(`${this.apiUrl}/${id}/estado`, { estado: nuevoEstado });
  }

  // ==================== ESTADÍSTICAS ====================

  obtenerEstadisticas(id: number): Observable<TorneoDTO> {
    return this.http.get<TorneoDTO>(`${this.apiUrl}/${id}/estadisticas`);
  }

  // ==================== MÉTODOS ADICIONALES ====================

  listarPorEstado(estado: string): Observable<TorneoDTO[]> {
    return this.http.get<TorneoDTO[]>(`${this.apiUrl}/estado/${estado}`);
  }

  listarActivos(): Observable<TorneoDTO[]> {
    return this.listarPorEstado('ACTIVO');
  }

  listarFinalizados(): Observable<TorneoDTO[]> {
    return this.listarPorEstado('FINALIZADO');
  }

  listarPendientes(): Observable<TorneoDTO[]> {
    return this.listarPorEstado('PENDIENTE');
  }
}