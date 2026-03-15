// src/app/services/partido-service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PartidoDTO, RegistrarGolRequest, RegistrarTarjetaRequest } from '../models/torneo.model';

export interface EventoPartidoDTO {
  id: number;
  partidoId: number;
  jugadorId?: number;
  jugadorNombre?: string;
  equipoId: number;
  equipoNombre?: string;
  tipo: string;
  minuto: number;
  jugadorAsistenciaId?: number;
  jugadorAsistenciaNombre?: string;
  descripcion?: string;
}

export interface JugadorPartidoDTO {
  id: number;
  partidoId: number;
  jugadorId: number;
  jugadorNombre?: string;
  equipoId?: number;
  presente: boolean;
  carnetVerificado: boolean;
  goles: number;
  asistencias: number;
  tarjetasAmarillas: number;
  tarjetasRojas: number;
  titular: boolean;
  minutoEntrada?: number;
  minutoSalida?: number;
}

export interface RegistrarPenalesRequest {
  penalesLocal: number;
  penalesVisitante: number;
}

@Injectable({
  providedIn: 'root'
})
export class PartidoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/partidos`;

  // ==================== CONSULTAS ====================

  obtenerPartido(id: number): Observable<PartidoDTO> {
    return this.http.get<PartidoDTO>(`${this.apiUrl}/${id}`);
  }

  listarPartidosPorTorneo(torneoId: number): Observable<PartidoDTO[]> {
    return this.http.get<PartidoDTO[]>(`${this.apiUrl}/torneo/${torneoId}`);
  }

  obtenerEventos(partidoId: number): Observable<EventoPartidoDTO[]> {
    return this.http.get<EventoPartidoDTO[]>(`${this.apiUrl}/${partidoId}/eventos`);
  }

  obtenerJugadoresPartido(partidoId: number): Observable<JugadorPartidoDTO[]> {
    return this.http.get<JugadorPartidoDTO[]>(`${this.apiUrl}/${partidoId}/jugadores`);
  }

  // ==================== GESTIÓN DEL PARTIDO ====================

  iniciarPartido(partidoId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${partidoId}/iniciar`, {});
  }

  registrarGol(partidoId: number, request: RegistrarGolRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${partidoId}/gol`, request);
  }

  registrarTarjeta(partidoId: number, request: RegistrarTarjetaRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${partidoId}/tarjeta`, request);
  }

  verificarCarnet(partidoId: number, jugadorId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${partidoId}/verificar-carnet/${jugadorId}`, {});
  }

  finalizarPartido(partidoId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${partidoId}/finalizar`, {});
  }

  // ==================== PENALES ====================

  verificarRequierePenales(partidoId: number): Observable<{ requierePenales: boolean }> {
    return this.http.get<{ requierePenales: boolean }>(`${this.apiUrl}/${partidoId}/requiere-penales`);
  }

  registrarPenales(partidoId: number, request: RegistrarPenalesRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${partidoId}/penales`, request);
  }
}