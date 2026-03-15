// src/app/models/models.ts
// ============================================================================
// ARCHIVO COMPLETO Y DEFINITIVO - TODAS LAS INTERFACES
// ============================================================================

// ======================== POLIDEPORTIVO ========================
export interface PolideportivoDTO {
  id?: number;
  nombre: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  ciudad?: string;
  departamento?: string;
  descripcion?: string;
  capacidad?: number;
  activo?: boolean;
}

// ======================== TORNEO ========================
export interface TorneoDTO {
  id?: number;
  nombre: string;
  descripcion?: string;
  fechaInicio: string;
  fechaFin?: string;
  estado: string;
  tipo: string;
  numeroEquipos: number;
  jugadoresPorEquipo: number;
  valorCarnet: number;
  valorInscripcionEquipo: number;
  polideportivoId: number;
  polideportivoNombre?: string;

  // Estadísticas calculadas
  equiposInscritos?: number;
  jugadoresRegistrados?: number;
  partidosJugados?: number;
  partidosPendientes?: number;
  totalGoles?: number;
  gruposCreados?: number;

  // Campeón y Subcampeón
  campeonId?: number;
  campeonNombre?: string;
  subcampeonId?: number;
  subcampeonNombre?: string;
}

// ======================== EQUIPO ========================
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

// ======================== JUGADOR DTO ========================
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

// ======================== EQUIPO (Entity para reportes) ========================
export interface Equipo {
  id: number;
  nombre: string;
  logo?: string;
  partidosJugados: number;
  partidosGanados: number;
  partidosEmpatados: number;
  partidosPerdidos: number;
  golesAFavor: number;
  golesEnContra: number;
  puntos: number;
  diferenciaGoles?: number;
}

// ======================== JUGADOR (Entity para reportes) ========================
export interface Jugador {
  id: number;
  nombre: string;
  apellido: string;
  nombreCompleto?: string;
  numeroDocumento: string;
  cedula?: string;
  fechaNacimiento: string;
  telefono?: string;
  goles: number;
  asistencias: number;
  tarjetasAmarillas: number;
  tarjetasRojas: number;
  carnetPagado: boolean;
  equipo?: Equipo;
}

// ======================== GRUPO ========================
export interface GrupoDTO {
  id: number;
  nombre: string;
  torneoId?: number;
  descripcion?: string;
}

// ======================== PARTIDO ========================
export interface PartidoDTO {
  id?: number;
  torneoId: number;
  torneoNombre?: string;
  equipoLocalId: number;
  equipoLocalNombre?: string;
  equipoLocalLogo?: string;
  equipoVisitanteId: number;
  equipoVisitanteNombre?: string;
  equipoVisitanteLogo?: string;
  fechaHora: string;
  estado: string;
  fase?: string;
  golesLocal: number;
  golesVisitante: number;
  canchaId?: number;
  canchaNombre?: string;
  grupoId?: number;
  grupoNombre?: string;
  ganadorId?: number;
  ganadorNombre?: string;
  penalesLocal?: number;
  penalesVisitante?: number;
  observaciones?: string;
}

export interface RegistrarGolRequest {
  jugadorId: number;
  minuto: number;
  jugadorAsistenciaId?: number;
}

export interface RegistrarTarjetaRequest {
  jugadorId: number;
  minuto: number;
  tipoTarjeta: 'AMARILLA' | 'ROJA';
}

// ======================== EVENTO PARTIDO ========================
export interface EventoPartidoDTO {
  id?: number;
  partidoId: number;
  jugadorId?: number;
  jugadorNombre?: string;
  equipoId: number;
  equipoNombre?: string;
  tipo: 'GOL' | 'TARJETA_AMARILLA' | 'TARJETA_ROJA' | 'SUSTITUCION' | 'PENAL_ANOTADO' | 'PENAL_FALLADO' | 'AUTOGOL';
  minuto: number;
  jugadorAsistenciaId?: number;
  jugadorAsistenciaNombre?: string;
  descripcion?: string;
}

// ======================== JUGADOR PARTIDO ========================
export interface JugadorPartidoDTO {
  id?: number;
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

// ======================== CANCHA ========================
export interface CanchaDTO {
  id?: number;
  nombre: string;
  tipo?: 'FUTBOL_5' | 'FUTBOL_7' | 'FUTBOL_8' | 'FUTBOL_11' | 'SINTETICA' | 'NATURAL';
  descripcion?: string;
  activo?: boolean;
  polideportivoId: number;
}

// ======================== USUARIO ========================
export interface UsuarioDTO {
  id?: number;
  email: string;
  nombreCompleto: string;
  cedula?: string;
  telefono?: string;
  rol: 'SUPER_ADMIN' | 'ADMIN_POLIDEPORTIVO' | 'ORGANIZADOR' | 'CAJERO' | 'JUGADOR';
  activo?: boolean;
  polideportivoId?: number;
  polideportivoNombre?: string;
}

// ======================== PRODUCTO ========================
export interface Producto {
  id?: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  costo: number;
  stock: number;
  stockMinimo: number;
  categoria: 'CERVEZA' | 'BEBIDA_ALCOHOLICA' | 'GASEOSA' | 'AGUA' |
              'BEBIDA_ENERGIZANTE' | 'SNACK' | 'COMIDA' | 'CIGARRILLOS' | 'OTROS';
  activo: boolean;
  polideportivoId?: number;
}

// ======================== VENTA ========================
export interface VentaDTO {
  id?: number;
  numeroVenta?: string;
  cajeroNombre: string;
  clienteNombre?: string;
  subtotal: number;
  descuento: number;
  total: number;
  metodoPago: string;
  estado: string;
  pagada: boolean;
  fechaVenta?: string;
  partidoId?: number;
  polideportivoId: number;
  detalles: DetalleVentaDTO[];
}

export interface DetalleVentaDTO {
  productoId: number;
  productoNombre?: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  descuento: number;
  total: number;
}

export interface EntradaInventarioRequest {
  productoId: number;
  cantidad: number;
  costoUnitario: number;
  usuarioId: number;
}

// ======================== REPORTES ========================
export interface ResumenTorneo {
  torneoId: number;
  nombreTorneo: string;
  estado: string;
  totalEquipos: number;
  equiposPagos: number;
  equiposPendientes: number;
  totalJugadores: number;
  jugadoresPagos: number;
  jugadoresPendientes: number;
  totalPartidos: number;
  partidosJugados: number;
  partidosPendientes: number;
  ingresosCarnets: number;
  ingresosInscripciones: number;
  totalIngresos: number;
}

export interface ResumenVentas {
  totalVentas: number;
  ventasCompletadas: number;
  ventasPendientes: number;
  totalIngresos: number;
  ingresosPorMetodoPago: { [key: string]: number };
  productosMasVendidos: { [key: string]: number };
}

// ======================== PAGO ========================
export interface PagoDTO {
  id?: number;
  monto: number;
  metodoPago: 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA' | 'NEQUI' | 'DAVIPLATA';
  concepto: 'CARNET' | 'INSCRIPCION_EQUIPO' | 'MULTA' | 'OTRO';
  descripcion?: string;
  fechaPago?: string;
  jugadorId?: number;
  jugadorNombre?: string;
  equipoId?: number;
  equipoNombre?: string;
  torneoId?: number;
  torneoNombre?: string;
  usuarioId?: number;
  usuarioNombre?: string;
}


/*  */
// src/app/models/menu.model.ts
export interface MenuItem {
  id: string;
  title: string;
  url: string;
  icon: string;
  color: string;
  badge?: number;
  badgeColor?: string;
  description?: string;
}

export interface MenuSection {
  id: string;
  title: string;
  icon: string;
  items: MenuItem[];
  expanded: boolean;
}
