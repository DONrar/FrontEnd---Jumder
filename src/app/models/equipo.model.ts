// src/app/models/equipo.model.ts
export interface EquipoDTO {
  id?: number;
  nombre: string;
  logo?: string;
  descripcion?: string;
  colorPrincipal?: string;
  colorSecundario?: string;
  torneoId: number;
  torneoNombre?: string;
  capitanId?: number;
  capitanNombre?: string;
  grupoId?: number;
  grupoNombre?: string;
  inscripcionPagada?: boolean;
  activo?: boolean;

  // Estadísticas
  partidosJugados?: number;
  partidosGanados?: number;
  partidosEmpatados?: number;
  partidosPerdidos?: number;
  golesAFavor?: number;
  golesEnContra?: number;
  puntos?: number;
  diferenciaGoles?: number;

  // Contadores adicionales
  cantidadJugadores?: number;
}
