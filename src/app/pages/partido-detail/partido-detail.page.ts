// src/app/pages/partido-detail/partido-detail.page.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
  IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonBackButton, IonSegment, IonSegmentButton, IonLabel, IonList, IonItem,
  IonChip, IonGrid, IonRow, IonCol, IonRefresher, IonRefresherContent,
  IonSkeletonText, IonToast, IonBadge, IonModal, IonSelect, IonSelectOption,
  IonInput, IonAlert, IonAvatar, IonSpinner, IonText
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  refreshOutline, playOutline, footballOutline, cardOutline, flagOutline,
  shieldOutline, calendarOutline, locationOutline, checkmarkCircle,
  qrCodeOutline, listOutline, statsChartOutline, closeOutline, trophy,
  removeOutline, timeOutline, pauseOutline, closeCircleOutline, helpOutline,
  swapHorizontalOutline, ellipseOutline, ribbonOutline
} from 'ionicons/icons';
import { PartidoService, EventoPartidoDTO, JugadorPartidoDTO, RegistrarPenalesRequest } from '../../services/partido-service';
import { JugadorService } from '../../services/jugador-services';
import { PartidoDTO, RegistrarGolRequest, RegistrarTarjetaRequest } from '../../models/torneo.model';
import { JugadorDTO } from '../../models/torneo.model';

interface JugadorPartidoExtendido {
  id?: number;
  nombreCompleto: string;
  cedula?: string;
  fechaNacimiento?: string;
  telefono?: string;
  email?: string;
  foto?: string;
  numeroCamiseta?: number;
  posicion?: string;
  equipoId?: number;
  equipoNombre?: string;
  carnetPagado?: boolean;
  activo?: boolean;
  verificado?: boolean;
  goles?: number;
  asistencias?: number;
  tarjetasAmarillas?: number;
  tarjetasRojas?: number;
  partidosJugados?: number;
  carnetVerificado?: boolean;
  presente?: boolean;
  jugadorPartidoId?: number;
}

@Component({
  selector: 'app-partido-detail',
  templateUrl: './partido-detail.page.html',
  styleUrls: ['./partido-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonTitle, IonToolbar,
    IonButtons, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle,
    IonCardContent, IonBackButton, IonSegment, IonSegmentButton, IonLabel,
    IonList, IonItem, IonChip, IonGrid, IonRow, IonCol, IonRefresher,
    IonRefresherContent, IonSkeletonText, IonToast, IonBadge, IonModal,
    IonSelect, IonSelectOption, IonInput, IonAlert, IonAvatar, IonSpinner, IonText
  ]
})
export class PartidoDetailPage implements OnInit {
  private partidoService = inject(PartidoService);
  private jugadorService = inject(JugadorService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  partidoId!: number;
  partido?: PartidoDTO;
  jugadoresLocal: JugadorPartidoExtendido[] = [];
  jugadoresVisitante: JugadorPartidoExtendido[] = [];
  eventos: EventoPartidoDTO[] = [];
  jugadoresPartido: JugadorPartidoDTO[] = [];

  loading = true;
  actionLoading = false;
  segmentValue = 'alineaciones';

  // Modal Gol
  showGolModal = false;
  golEquipoSeleccionado?: number;
  golJugadorId?: number;
  golMinuto?: number;
  golAsistenciaId?: number | null;
  jugadoresEquipoSeleccionado: JugadorPartidoExtendido[] = [];

  // Modal Tarjeta
  showTarjetaModal = false;
  tarjetaEquipoSeleccionado?: number;
  tarjetaJugadorId?: number;
  tarjetaMinuto?: number;
  tarjetaTipo: 'AMARILLA' | 'ROJA' = 'AMARILLA';
  jugadoresEquipoTarjeta: JugadorPartidoExtendido[] = [];

  // Modal Penales
  showPenalesModal = false;
  penalesLocal: number = 0;
  penalesVisitante: number = 0;

  // Alert Finalizar
  showFinalizarAlert = false;
  finalizarAlertButtons = [
    {
      text: 'Cancelar',
      role: 'cancel',
      handler: () => { this.showFinalizarAlert = false; }
    },
    {
      text: 'Finalizar',
      role: 'confirm',
      handler: () => { this.finalizarPartido(); }
    }
  ];

  // Estadísticas calculadas
  golesLocalPartido = 0;
  golesVisitantePartido = 0;
  tarjetasAmarillasLocal = 0;
  tarjetasAmarillasVisitante = 0;
  tarjetasRojasLocal = 0;
  tarjetasRojasVisitante = 0;

  // Toast
  showToast = false;
  toastMessage = '';
  toastColor = 'success';

  constructor() {
    addIcons({
      refreshOutline, playOutline, footballOutline, cardOutline, flagOutline,
      shieldOutline, calendarOutline, locationOutline, checkmarkCircle,
      qrCodeOutline, listOutline, statsChartOutline, closeOutline, trophy,
      removeOutline, timeOutline, pauseOutline, closeCircleOutline, helpOutline,
      swapHorizontalOutline, ellipseOutline, ribbonOutline
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.partidoId = +id;
      this.cargarDatos();
    } else {
      this.router.navigate(['/torneos']);
    }
  }

  // ==================== CARGA DE DATOS ====================

  cargarDatos() {
    this.loading = true;
    this.partidoService.obtenerPartido(this.partidoId).subscribe({
      next: (data) => {
        this.partido = data;
        this.cargarJugadores();
        this.cargarEventos();
        this.cargarJugadoresPartido();
      },
      error: (error) => {
        console.error('Error al cargar partido:', error);
        this.mostrarToast('Error al cargar el partido', 'danger');
        this.loading = false;
      }
    });
  }

  cargarJugadores() {
    if (!this.partido) return;

    // Cargar jugadores del equipo local
    this.jugadorService.listarPorEquipo(this.partido.equipoLocalId).subscribe({
      next: (data) => {
        this.jugadoresLocal = data.map(j => ({
          ...j,
          carnetVerificado: false,
          presente: false
        }));
        this.actualizarEstadoJugadores();
        this.loading = false;
      },
      error: () => {
        this.jugadoresLocal = [];
        this.loading = false;
      }
    });

    // Cargar jugadores del equipo visitante
    this.jugadorService.listarPorEquipo(this.partido.equipoVisitanteId).subscribe({
      next: (data) => {
        this.jugadoresVisitante = data.map(j => ({
          ...j,
          carnetVerificado: false,
          presente: false
        }));
        this.actualizarEstadoJugadores();
      },
      error: () => {
        this.jugadoresVisitante = [];
      }
    });
  }

  cargarJugadoresPartido() {
    if (!this.partido || this.partido.estado === 'PROGRAMADO') return;

    this.partidoService.obtenerJugadoresPartido(this.partidoId).subscribe({
      next: (data) => {
        this.jugadoresPartido = data;
        this.actualizarEstadoJugadores();
      },
      error: (error) => {
        console.error('Error al cargar jugadores del partido:', error);
      }
    });
  }

  actualizarEstadoJugadores() {
    this.jugadoresPartido.forEach(jp => {
      const jugadorLocal = this.jugadoresLocal.find(j => j.id === jp.jugadorId);
      const jugadorVisitante = this.jugadoresVisitante.find(j => j.id === jp.jugadorId);

      if (jugadorLocal) {
        jugadorLocal.carnetVerificado = jp.carnetVerificado;
        jugadorLocal.presente = jp.presente;
        jugadorLocal.jugadorPartidoId = jp.id;
      }
      if (jugadorVisitante) {
        jugadorVisitante.carnetVerificado = jp.carnetVerificado;
        jugadorVisitante.presente = jp.presente;
        jugadorVisitante.jugadorPartidoId = jp.id;
      }
    });
  }

  cargarEventos() {
    if (!this.partido) return;

    this.partidoService.obtenerEventos(this.partidoId).subscribe({
      next: (data) => {
        this.eventos = data;
        this.calcularEstadisticas();
      },
      error: (error) => {
        console.error('Error al cargar eventos:', error);
        this.eventos = [];
        if (this.partido) {
          this.golesLocalPartido = this.partido.golesLocal;
          this.golesVisitantePartido = this.partido.golesVisitante;
        }
      }
    });
  }

  calcularEstadisticas() {
    if (!this.partido) return;

    this.golesLocalPartido = 0;
    this.golesVisitantePartido = 0;
    this.tarjetasAmarillasLocal = 0;
    this.tarjetasAmarillasVisitante = 0;
    this.tarjetasRojasLocal = 0;
    this.tarjetasRojasVisitante = 0;

    this.eventos.forEach(evento => {
      const esLocal = evento.equipoId === this.partido!.equipoLocalId;

      switch (evento.tipo) {
        case 'GOL':
          if (esLocal) this.golesLocalPartido++;
          else this.golesVisitantePartido++;
          break;
        case 'TARJETA_AMARILLA':
          if (esLocal) this.tarjetasAmarillasLocal++;
          else this.tarjetasAmarillasVisitante++;
          break;
        case 'TARJETA_ROJA':
          if (esLocal) this.tarjetasRojasLocal++;
          else this.tarjetasRojasVisitante++;
          break;
        case 'AUTOGOL':
          if (esLocal) this.golesVisitantePartido++;
          else this.golesLocalPartido++;
          break;
      }
    });

    if (this.eventos.length === 0 && this.partido) {
      this.golesLocalPartido = this.partido.golesLocal;
      this.golesVisitantePartido = this.partido.golesVisitante;
    }
  }

  handleRefresh(event: any) {
    this.cargarDatos();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  onSegmentChange(event: any) {
    this.segmentValue = event.detail.value;
  }

  // ==================== HELPERS PARA PENALES ====================

  esFaseEliminacion(): boolean {
    if (!this.partido?.fase) return false;
    const fasesEliminacion = ['OCTAVOS', 'CUARTOS', 'SEMIFINAL', 'FINAL', 'TERCER_LUGAR'];
    return fasesEliminacion.includes(this.partido.fase);
  }

  estaEmpatado(): boolean {
    if (!this.partido) return false;
    return this.partido.golesLocal === this.partido.golesVisitante;
  }

  tienePenalesRegistrados(): boolean {
    if (!this.partido) return false;
    return this.partido.penalesLocal != null && this.partido.penalesVisitante != null;
  }

  requierePenales(): boolean {
    return this.esFaseEliminacion() && this.estaEmpatado() && !this.tienePenalesRegistrados();
  }

  // ==================== ACCIONES DEL PARTIDO ====================

  iniciarPartido() {
    this.actionLoading = true;
    this.partidoService.iniciarPartido(this.partidoId).subscribe({
      next: () => {
        this.mostrarToast('¡Partido iniciado!', 'success');
        this.cargarDatos();
        this.actionLoading = false;
      },
      error: (error) => {
        console.error('Error al iniciar partido:', error);
        const mensaje = error.error?.error || 'Error al iniciar el partido';
        this.mostrarToast(mensaje, 'danger');
        this.actionLoading = false;
      }
    });
  }

  // ==================== REGISTRAR GOL ====================

  abrirModalGol() {
    this.golEquipoSeleccionado = undefined;
    this.golJugadorId = undefined;
    this.golMinuto = undefined;
    this.golAsistenciaId = null;
    this.jugadoresEquipoSeleccionado = [];
    this.showGolModal = true;
  }

  cerrarModalGol() {
    this.showGolModal = false;
  }

  onEquipoGolChange() {
    if (this.golEquipoSeleccionado === this.partido?.equipoLocalId) {
      this.jugadoresEquipoSeleccionado = this.jugadoresLocal.filter(j => j.carnetVerificado || j.presente);
    } else {
      this.jugadoresEquipoSeleccionado = this.jugadoresVisitante.filter(j => j.carnetVerificado || j.presente);
    }

    // Si no hay jugadores verificados, mostrar todos
    if (this.jugadoresEquipoSeleccionado.length === 0) {
      if (this.golEquipoSeleccionado === this.partido?.equipoLocalId) {
        this.jugadoresEquipoSeleccionado = [...this.jugadoresLocal];
      } else {
        this.jugadoresEquipoSeleccionado = [...this.jugadoresVisitante];
      }
    }

    this.golJugadorId = undefined;
    this.golAsistenciaId = null;
  }

  registrarGol() {
    if (!this.golJugadorId || !this.golMinuto) {
      this.mostrarToast('Completa todos los campos requeridos', 'warning');
      return;
    }

    this.actionLoading = true;
    const request: RegistrarGolRequest = {
      jugadorId: this.golJugadorId,
      minuto: this.golMinuto,
      jugadorAsistenciaId: this.golAsistenciaId || undefined
    };

    this.partidoService.registrarGol(this.partidoId, request).subscribe({
      next: () => {
        this.mostrarToast('¡GOL registrado!', 'success');
        this.showGolModal = false;
        this.actionLoading = false;
        this.cargarDatos();
      },
      error: (error) => {
        console.error('Error al registrar gol:', error);
        const mensaje = error.error?.error || 'Error al registrar el gol';
        this.mostrarToast(mensaje, 'danger');
        this.actionLoading = false;
      }
    });
  }

  // ==================== REGISTRAR TARJETA ====================

  abrirModalTarjeta() {
    this.tarjetaEquipoSeleccionado = undefined;
    this.tarjetaJugadorId = undefined;
    this.tarjetaMinuto = undefined;
    this.tarjetaTipo = 'AMARILLA';
    this.jugadoresEquipoTarjeta = [];
    this.showTarjetaModal = true;
  }

  cerrarModalTarjeta() {
    this.showTarjetaModal = false;
  }

  onEquipoTarjetaChange() {
    if (this.tarjetaEquipoSeleccionado === this.partido?.equipoLocalId) {
      this.jugadoresEquipoTarjeta = this.jugadoresLocal.filter(j => j.carnetVerificado || j.presente);
    } else {
      this.jugadoresEquipoTarjeta = this.jugadoresVisitante.filter(j => j.carnetVerificado || j.presente);
    }

    if (this.jugadoresEquipoTarjeta.length === 0) {
      if (this.tarjetaEquipoSeleccionado === this.partido?.equipoLocalId) {
        this.jugadoresEquipoTarjeta = [...this.jugadoresLocal];
      } else {
        this.jugadoresEquipoTarjeta = [...this.jugadoresVisitante];
      }
    }

    this.tarjetaJugadorId = undefined;
  }

  registrarTarjeta() {
    if (!this.tarjetaJugadorId || !this.tarjetaMinuto || !this.tarjetaTipo) {
      this.mostrarToast('Completa todos los campos requeridos', 'warning');
      return;
    }

    this.actionLoading = true;
    const request: RegistrarTarjetaRequest = {
      jugadorId: this.tarjetaJugadorId,
      minuto: this.tarjetaMinuto,
      tipoTarjeta: this.tarjetaTipo
    };

    this.partidoService.registrarTarjeta(this.partidoId, request).subscribe({
      next: () => {
        this.mostrarToast(`Tarjeta ${this.tarjetaTipo} registrada`, this.tarjetaTipo === 'ROJA' ? 'danger' : 'warning');
        this.showTarjetaModal = false;
        this.actionLoading = false;
        this.cargarDatos();
      },
      error: (error) => {
        console.error('Error al registrar tarjeta:', error);
        const mensaje = error.error?.error || 'Error al registrar la tarjeta';
        this.mostrarToast(mensaje, 'danger');
        this.actionLoading = false;
      }
    });
  }

  // ==================== REGISTRAR PENALES ====================

  abrirModalPenales() {
    this.penalesLocal = 0;
    this.penalesVisitante = 0;
    this.showPenalesModal = true;
  }

  cerrarModalPenales() {
    this.showPenalesModal = false;
  }

  registrarPenales() {
    if (this.penalesLocal === this.penalesVisitante) {
      this.mostrarToast('Los penales no pueden quedar empatados', 'warning');
      return;
    }

    if (this.penalesLocal < 0 || this.penalesVisitante < 0) {
      this.mostrarToast('Los penales no pueden ser negativos', 'warning');
      return;
    }

    this.actionLoading = true;
    const request: RegistrarPenalesRequest = {
      penalesLocal: this.penalesLocal,
      penalesVisitante: this.penalesVisitante
    };

    this.partidoService.registrarPenales(this.partidoId, request).subscribe({
      next: () => {
        const ganador = this.penalesLocal > this.penalesVisitante
          ? this.partido?.equipoLocalNombre
          : this.partido?.equipoVisitanteNombre;
        this.mostrarToast(`¡Penales registrados! Ganador: ${ganador}`, 'success');
        this.showPenalesModal = false;
        this.actionLoading = false;
        this.cargarDatos();
      },
      error: (error) => {
        console.error('Error al registrar penales:', error);
        const mensaje = error.error?.error || 'Error al registrar los penales';
        this.mostrarToast(mensaje, 'danger');
        this.actionLoading = false;
      }
    });
  }

  // ==================== VERIFICAR CARNET ====================

  verificarCarnet(jugadorId: number) {
    this.actionLoading = true;
    this.partidoService.verificarCarnet(this.partidoId, jugadorId).subscribe({
      next: () => {
        this.mostrarToast('Carnet verificado correctamente', 'success');
        const jugadorLocal = this.jugadoresLocal.find(j => j.id === jugadorId);
        const jugadorVisitante = this.jugadoresVisitante.find(j => j.id === jugadorId);
        if (jugadorLocal) {
          jugadorLocal.carnetVerificado = true;
          jugadorLocal.presente = true;
        }
        if (jugadorVisitante) {
          jugadorVisitante.carnetVerificado = true;
          jugadorVisitante.presente = true;
        }
        this.actionLoading = false;
      },
      error: (error) => {
        console.error('Error al verificar carnet:', error);
        const mensaje = error.error?.error || 'El jugador no ha pagado el carnet';
        this.mostrarToast(mensaje, 'danger');
        this.actionLoading = false;
      }
    });
  }

  // ==================== FINALIZAR PARTIDO ====================

  confirmarFinalizar() {
    if (this.requierePenales()) {
      this.mostrarToast('El partido está empatado. Debe registrar los penales primero.', 'warning');
      this.abrirModalPenales();
      return;
    }
    this.showFinalizarAlert = true;
  }

  finalizarPartido() {
    this.actionLoading = true;
    this.partidoService.finalizarPartido(this.partidoId).subscribe({
      next: () => {
        this.mostrarToast('Partido finalizado correctamente', 'success');
        this.showFinalizarAlert = false;
        this.actionLoading = false;
        this.cargarDatos();
      },
      error: (error) => {
        console.error('Error al finalizar partido:', error);
        const mensaje = error.error?.error || 'Error al finalizar el partido';

        if (mensaje.toLowerCase().includes('penales')) {
          this.mostrarToast(mensaje, 'warning');
          this.abrirModalPenales();
        } else {
          this.mostrarToast(mensaje, 'danger');
        }
        this.actionLoading = false;
      }
    });
  }

  // ==================== HELPERS ====================

  getEstadoColor(estado: string): string {
    const colores: { [key: string]: string } = {
      'PROGRAMADO': 'warning',
      'EN_CURSO': 'success',
      'FINALIZADO': 'medium',
      'SUSPENDIDO': 'danger',
      'CANCELADO': 'danger'
    };
    return colores[estado] || 'medium';
  }

  getEstadoIcon(estado: string): string {
    const iconos: { [key: string]: string } = {
      'PROGRAMADO': 'time-outline',
      'EN_CURSO': 'play-outline',
      'FINALIZADO': 'checkmark-circle',
      'SUSPENDIDO': 'pause-outline',
      'CANCELADO': 'close-circle-outline'
    };
    return iconos[estado] || 'help-outline';
  }

  getEstadoLabel(estado: string): string {
    const labels: { [key: string]: string } = {
      'PROGRAMADO': 'Programado',
      'EN_CURSO': 'En Curso',
      'FINALIZADO': 'Finalizado',
      'SUSPENDIDO': 'Suspendido',
      'CANCELADO': 'Cancelado'
    };
    return labels[estado] || estado;
  }

  getFaseLabel(fase: string): string {
    const labels: { [key: string]: string } = {
      'GRUPOS': 'Fase de Grupos',
      'OCTAVOS': 'Octavos de Final',
      'CUARTOS': 'Cuartos de Final',
      'SEMIFINAL': 'Semifinal',
      'TERCER_LUGAR': 'Tercer Lugar',
      'FINAL': 'Final'
    };
    return labels[fase] || fase;
  }

  getEventoIcon(tipo: string): string {
    const iconos: { [key: string]: string } = {
      'GOL': 'football-outline',
      'TARJETA_AMARILLA': 'card-outline',
      'TARJETA_ROJA': 'card-outline',
      'SUSTITUCION': 'swap-horizontal-outline',
      'AUTOGOL': 'football-outline',
      'PENAL_ANOTADO': 'football-outline',
      'PENAL_FALLADO': 'close-circle-outline'
    };
    return iconos[tipo] || 'ellipse-outline';
  }

  getEventoColor(tipo: string): string {
    const colores: { [key: string]: string } = {
      'GOL': 'success',
      'TARJETA_AMARILLA': 'warning',
      'TARJETA_ROJA': 'danger',
      'SUSTITUCION': 'primary',
      'AUTOGOL': 'danger',
      'PENAL_ANOTADO': 'success',
      'PENAL_FALLADO': 'medium'
    };
    return colores[tipo] || 'medium';
  }

  getEventoLabel(tipo: string): string {
    const labels: { [key: string]: string } = {
      'GOL': 'Gol',
      'TARJETA_AMARILLA': 'Tarjeta Amarilla',
      'TARJETA_ROJA': 'Tarjeta Roja',
      'SUSTITUCION': 'Sustitución',
      'AUTOGOL': 'Autogol',
      'PENAL_ANOTADO': 'Penal Anotado',
      'PENAL_FALLADO': 'Penal Fallado'
    };
    return labels[tipo] || tipo;
  }

  formatDateTime(fecha: string): string {
    if (!fecha) return '';
    return new Date(fecha).toLocaleString('es-CO', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  mostrarToast(mensaje: string, color: string) {
    this.toastMessage = mensaje;
    this.toastColor = color;
    this.showToast = true;
  }
}
