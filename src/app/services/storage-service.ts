import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly POLIDEPORTIVO_KEY = 'polideportivo_seleccionado';
  private readonly USUARIO_KEY = 'usuario_actual';
  private readonly TOKEN_KEY = 'auth_token';
  
  private polideportivoSeleccionado$ = new BehaviorSubject<number | null>(this.getPolideportivoId());

  // ==================== POLIDEPORTIVO ====================
  
  getPolideportivoId(): number | null {
    const stored = localStorage.getItem(this.POLIDEPORTIVO_KEY);
    return stored ? parseInt(stored, 10) : null;
  }

  setPolideportivoId(id: number): void {
    localStorage.setItem(this.POLIDEPORTIVO_KEY, id.toString());
    this.polideportivoSeleccionado$.next(id);
  }

  clearPolideportivoId(): void {
    localStorage.removeItem(this.POLIDEPORTIVO_KEY);
    this.polideportivoSeleccionado$.next(null);
  }

  watchPolideportivoId(): Observable<number | null> {
    return this.polideportivoSeleccionado$.asObservable();
  }

  // ==================== USUARIO/AUTENTICACIÓN ====================
  
  getUsuario(): any {
    const usuarioStr = localStorage.getItem(this.USUARIO_KEY);
    return usuarioStr ? JSON.parse(usuarioStr) : null;
  }

  setUsuario(usuario: any): void {
    localStorage.setItem(this.USUARIO_KEY, JSON.stringify(usuario));
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  // ==================== MÉTODOS GENERALES ====================
  
  clear(): void {
    // Eliminar todas las claves específicas de la aplicación
    localStorage.removeItem(this.POLIDEPORTIVO_KEY);
    localStorage.removeItem(this.USUARIO_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
    
    // También puedes eliminar otras claves específicas si las tienes
    // localStorage.removeItem('otra_clave');
    
    // No usar localStorage.clear() porque borra todo, incluyendo datos de otras aplicaciones
    this.polideportivoSeleccionado$.next(null);
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  setItem(key: string, value: any): void {
    if (typeof value === 'object') {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      localStorage.setItem(key, value);
    }
  }

  getItem(key: string): any {
    const item = localStorage.getItem(key);
    if (item) {
      try {
        return JSON.parse(item);
      } catch {
        return item;
      }
    }
    return null;
  }
}