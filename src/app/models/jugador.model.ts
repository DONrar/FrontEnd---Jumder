export interface JugadorDTO {
  id?: number;
  nombreCompleto: string;
  cedula: string;
  fechaNacimiento?: string;
  telefono?: string;
  email?: string;
  foto?: string;
  numeroCamiseta?: number;
  posicion?: 'PORTERO' | 'DEFENSA' | 'MEDIOCAMPISTA' | 'DELANTERO';
  equipoId: number;
  equipoNombre?: string;
  carnetPagado?: boolean;
  activo?: boolean;
  verificado?: boolean;
  
  // Estadísticas
  goles?: number;
  asistencias?: number;
  tarjetasAmarillas?: number;
  tarjetasRojas?: number;
  partidosJugados?: number;
}
