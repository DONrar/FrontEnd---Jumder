// src/app/services/equipo.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { EquipoDTO } from '../models/equipo.model';

@Injectable({
  providedIn: 'root'
})
export class EquipoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/equipos`;

  listarTodos(): Observable<EquipoDTO[]> {
    return this.http.get<EquipoDTO[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<EquipoDTO> {
    return this.http.get<EquipoDTO>(`${this.apiUrl}/${id}`);
  }

  listarPorTorneo(torneoId: number): Observable<EquipoDTO[]> {
    return this.http.get<EquipoDTO[]>(`${this.apiUrl}/torneo/${torneoId}`);
  }

  listarActivosPorTorneo(torneoId: number): Observable<EquipoDTO[]> {
    return this.http.get<EquipoDTO[]>(`${this.apiUrl}/torneo/${torneoId}/activos`);
  }

  listarPagadosPorTorneo(torneoId: number): Observable<EquipoDTO[]> {
    return this.http.get<EquipoDTO[]>(`${this.apiUrl}/torneo/${torneoId}/pagos`);
  }

  listarSinPagarPorTorneo(torneoId: number): Observable<EquipoDTO[]> {
    return this.http.get<EquipoDTO[]>(`${this.apiUrl}/torneo/${torneoId}/sin-pagar`);
  }

  obtenerTablaPosiciones(torneoId: number): Observable<EquipoDTO[]> {
    return this.http.get<EquipoDTO[]>(`${this.apiUrl}/torneo/${torneoId}/tabla`);
  }

  listarPorGrupo(grupoId: number): Observable<EquipoDTO[]> {
    return this.http.get<EquipoDTO[]>(`${this.apiUrl}/grupo/${grupoId}`);
  }

  crear(equipo: EquipoDTO): Observable<EquipoDTO> {
    return this.http.post<EquipoDTO>(this.apiUrl, equipo);
  }

  actualizar(id: number, equipo: EquipoDTO): Observable<EquipoDTO> {
    return this.http.put<EquipoDTO>(`${this.apiUrl}/${id}`, equipo);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  pagarInscripcion(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/pagar-inscripcion`, {});
  }
}
