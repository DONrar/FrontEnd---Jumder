import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PolideportivoDTO } from '../models/polideportivo.model';

@Injectable({
  providedIn: 'root'
})
export class PolideportivoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/polideportivos`;

  listarTodos(): Observable<PolideportivoDTO[]> {
    return this.http.get<PolideportivoDTO[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<PolideportivoDTO> {
    return this.http.get<PolideportivoDTO>(`${this.apiUrl}/${id}`);
  }

  crear(polideportivo: PolideportivoDTO): Observable<PolideportivoDTO> {
    return this.http.post<PolideportivoDTO>(this.apiUrl, polideportivo);
  }

  actualizar(id: number, polideportivo: PolideportivoDTO): Observable<PolideportivoDTO> {
    return this.http.put<PolideportivoDTO>(`${this.apiUrl}/${id}`, polideportivo);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
