import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
  IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonCardContent, IonBackButton, IonSegment, IonSegmentButton, IonLabel,
  IonList, IonItem, IonBadge, IonChip, IonGrid, IonRow, IonCol,
  IonRefresher, IonRefresherContent, IonSkeletonText, IonToast, IonAvatar,
  IonFab, IonFabButton, IonAlert, IonActionSheet, ActionSheetController,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  calendarOutline, peopleOutline, cashOutline, createOutline, playOutline,
  trophyOutline, footballOutline, listOutline, statsChartOutline,
  refreshOutline, checkmarkCircleOutline, alertCircleOutline, addOutline,
  ellipsisVertical, closeCircleOutline, arrowForwardOutline, gitBranchOutline,
  timeOutline, locationOutline, gridOutline, shieldOutline, personOutline,
  chevronForwardOutline, radioButtonOn, medalOutline } from 'ionicons/icons';
import { TorneoService } from '../../services/torneo-service';
import { EquipoService } from '../../services/equipo-service';
import { PartidoService } from '../../services/partido-service';
import { TorneoDTO, PartidoDTO } from '../../models/torneo.model';
import { EquipoDTO } from '../../models/equipo.model';

interface GrupoDTO {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-torneo-detail',
  templateUrl: './torneo-detail.page.html',
  styleUrls: ['./torneo-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonTitle, IonToolbar,
    IonButtons, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle,
    IonCardSubtitle, IonCardContent, IonBackButton, IonSegment, IonSegmentButton,
    IonLabel, IonList, IonItem, IonBadge, IonChip, IonGrid, IonRow, IonCol,
    IonRefresher, IonRefresherContent, IonSkeletonText, IonToast, IonAvatar,
    IonFab, IonFabButton, IonAlert, IonActionSheet
  ]
})
export class TorneoDetailPage implements OnInit {
  private torneoService = inject(TorneoService);
  private equipoService = inject(EquipoService);
  private partidoService = inject(PartidoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private actionSheetController = inject(ActionSheetController);
  private alertController = inject(AlertController);

  torneoId!: number;
  torneo?: TorneoDTO;
  estadisticas?: TorneoDTO;
  equipos: EquipoDTO[] = [];
  partidos: PartidoDTO[] = [];
  partidosFiltrados: PartidoDTO[] = [];
  tablaPosiciones: EquipoDTO[] = [];
  proximosPartidos: PartidoDTO[] = [];
  ultimosResultados: PartidoDTO[] = [];
  partidosEnVivo: PartidoDTO[] = [];
  grupos: GrupoDTO[] = [];

  loading = true;
  actionLoading = false;
  segmentValue = 'resumen';
  filtroPartidos = 'todos';
  grupoSeleccionado = 'general';

  // Alerts y Action Sheets
  showCancelAlert = false;
  showActionSheet = false;

  cancelAlertButtons = [
    {
      text: 'No, mantener',
      role: 'cancel',
      handler: () => { this.showCancelAlert = false; }
    },
    {
      text: 'Sí, cancelar',
      role: 'destructive',
      handler: () => { this.cancelarTorneo(); }
    }
  ];

  actionSheetButtons: any[] = [];

  // Toast
  showToast = false;
  toastMessage = '';
  toastColor = 'success';

  constructor() {
    addIcons({ellipsisVertical,refreshOutline,trophyOutline,calendarOutline,peopleOutline,personOutline,cashOutline,gitBranchOutline,playOutline,arrowForwardOutline,closeCircleOutline,statsChartOutline,timeOutline,radioButtonOn,footballOutline,chevronForwardOutline,addOutline,shieldOutline,medalOutline,locationOutline,gridOutline,createOutline,listOutline,checkmarkCircleOutline,alertCircleOutline});
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.torneoId = +id;
      this.cargarDatos();
    } else {
      this.router.navigate(['/torneos']);
    }
  }

  // ==================== CARGA DE DATOS ====================

  cargarDatos() {
    this.loading = true;
    this.torneoService.obtenerTorneo(this.torneoId).subscribe({
      next: (data) => {
        this.torneo = data;
        this.cargarEstadisticas();
        this.cargarEquipos();
        this.cargarPartidos();
        this.cargarTablaPosiciones();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar torneo:', error);
        this.mostrarToast('Error al cargar el torneo', 'danger');
        this.loading = false;
      }
    });
  }

  cargarEstadisticas() {
    this.torneoService.obtenerEstadisticas(this.torneoId).subscribe({
      next: (data) => {
        this.estadisticas = data;
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
      }
    });
  }

  cargarEquipos() {
    this.equipoService.listarPorTorneo(this.torneoId).subscribe({
      next: (data) => {
        this.equipos = data;
        this.extraerGrupos();
      },
      error: (error) => {
        console.error('Error al cargar equipos:', error);
      }
    });
  }

  cargarPartidos() {
    this.partidoService.listarPartidosPorTorneo(this.torneoId).subscribe({
      next: (data) => {
        this.partidos = data;
        this.filtrarPartidos();
        this.separarPartidos();
      },
      error: (error) => {
        console.error('Error al cargar partidos:', error);
      }
    });
  }

  cargarTablaPosiciones() {
    this.equipoService.obtenerTablaPosiciones(this.torneoId).subscribe({
      next: (data) => {
        this.tablaPosiciones = data;
      },
      error: (error) => {
        console.error('Error al cargar tabla de posiciones:', error);
      }
    });
  }

  extraerGrupos() {
    const gruposMap = new Map<number, GrupoDTO>();
    this.equipos.forEach(equipo => {
      if (equipo.grupoId && equipo.grupoNombre) {
        gruposMap.set(equipo.grupoId, { id: equipo.grupoId, nombre: equipo.grupoNombre });
      }
    });
    this.grupos = Array.from(gruposMap.values());
  }

  separarPartidos() {
    const ahora = new Date();

    // Partidos en vivo
    this.partidosEnVivo = this.partidos
      .filter(p => p.estado === 'EN_CURSO');

    this.proximosPartidos = this.partidos
      .filter(p => p.estado === 'PROGRAMADO')
      .sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime())
      .slice(0, 5);

    this.ultimosResultados = this.partidos
      .filter(p => p.estado === 'FINALIZADO')
      .sort((a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime())
      .slice(0, 5);
  }

  // ==================== FILTROS ====================

  filtrarPartidos() {
    switch (this.filtroPartidos) {
      case 'programados':
        this.partidosFiltrados = this.partidos.filter(p => p.estado === 'PROGRAMADO');
        break;
      case 'finalizados':
        this.partidosFiltrados = this.partidos.filter(p => p.estado === 'FINALIZADO');
        break;
      default:
        this.partidosFiltrados = [...this.partidos];
    }
  }

  onGrupoChange(event: any) {
    this.grupoSeleccionado = event.detail.value;
    if (this.grupoSeleccionado === 'general') {
      this.cargarTablaPosiciones();
    } else {
      this.equipoService.listarPorGrupo(+this.grupoSeleccionado).subscribe({
        next: (data) => {
          this.tablaPosiciones = data.sort((a, b) => (b.puntos || 0) - (a.puntos || 0));
        }
      });
    }
  }

  // ==================== ACCIONES DEL TORNEO ====================

  generarFixture() {
    this.actionLoading = true;
    this.torneoService.generarFixture(this.torneoId).subscribe({
      next: (response) => {
        this.mostrarToast('Fixture generado correctamente', 'success');
        this.cargarDatos();
        this.actionLoading = false;
      },
      error: (error) => {
        console.error('Error al generar fixture:', error);
        const mensaje = error.error?.error || 'Error al generar fixture';
        this.mostrarToast(mensaje, 'danger');
        this.actionLoading = false;
      }
    });
  }

  iniciarTorneo() {
    this.actionLoading = true;
    this.torneoService.iniciarTorneo(this.torneoId).subscribe({
      next: (response) => {
        this.torneo = response;
        this.mostrarToast('Torneo iniciado correctamente', 'success');
        this.actionLoading = false;
      },
      error: (error) => {
        console.error('Error al iniciar torneo:', error);
        const mensaje = error.error?.error || 'Error al iniciar torneo';
        this.mostrarToast(mensaje, 'danger');
        this.actionLoading = false;
      }
    });
  }

  avanzarFase() {
    this.actionLoading = true;
    this.torneoService.avanzarFase(this.torneoId).subscribe({
      next: (response) => {
        this.mostrarToast('Fase avanzada correctamente', 'success');
        this.cargarDatos();
        this.actionLoading = false;
      },
      error: (error) => {
        console.error('Error al avanzar fase:', error);
        const mensaje = error.error?.error || 'Error al avanzar fase';
        this.mostrarToast(mensaje, 'danger');
        this.actionLoading = false;
      }
    });
  }

  confirmarCancelar() {
    this.showCancelAlert = true;
  }

  cancelarTorneo() {
    this.actionLoading = true;
    this.torneoService.cancelarTorneo(this.torneoId).subscribe({
      next: (response) => {
        this.mostrarToast('Torneo cancelado', 'warning');
        this.cargarDatos();
        this.actionLoading = false;
        this.showCancelAlert = false;
      },
      error: (error) => {
        console.error('Error al cancelar torneo:', error);
        const mensaje = error.error?.error || 'Error al cancelar torneo';
        this.mostrarToast(mensaje, 'danger');
        this.actionLoading = false;
      }
    });
  }

  // ==================== VALIDACIONES DE ESTADO ====================

  puedeAvanzarFase(): boolean {
    if (!this.torneo) return false;
    const estadosAvanzables = ['EN_CURSO', 'FASE_GRUPOS', 'OCTAVOS', 'CUARTOS', 'SEMIFINALES'];
    return estadosAvanzables.includes(this.torneo.estado);
  }

  puedeCancelar(): boolean {
    if (!this.torneo) return false;
    const estadosNoCancelables = ['FINALIZADO', 'CANCELADO'];
    return !estadosNoCancelables.includes(this.torneo.estado);
  }

  // ==================== NAVEGACIÓN ====================

  handleRefresh(event: any) {
    this.cargarDatos();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  onSegmentChange(event: any) {
    this.segmentValue = event.detail.value;
  }

  editarTorneo() {
    this.router.navigate(['/torneos', this.torneoId, 'editar']);
  }

  verEquipos() {
    this.router.navigate(['/torneos', this.torneoId, 'equipos']);
  }

  verEquipo(equipo: EquipoDTO) {
    this.router.navigate(['/equipos', equipo.id]);
  }

  agregarEquipo() {
    this.router.navigate(['/torneos', this.torneoId, 'equipos', 'nuevo']);
  }

  verPartido(partido: PartidoDTO) {
    this.router.navigate(['/partidos', partido.id]);
  }

  verTodosPartidos() {
    this.segmentValue = 'partidos';
    this.filtroPartidos = 'todos';
    this.filtrarPartidos();
  }

  verPartidosFinalizados() {
    this.segmentValue = 'partidos';
    this.filtroPartidos = 'finalizados';
    this.filtrarPartidos();
  }

  verPartidosProgramados() {
    this.segmentValue = 'partidos';
    this.filtroPartidos = 'programados';
    this.filtrarPartidos();
  }

  // ==================== ACTION SHEETS ====================

  async mostrarOpcionesTorneo() {
    const buttons: any[] = [
      {
        text: 'Editar Torneo',
        icon: 'create-outline',
        handler: () => { this.editarTorneo(); }
      },
      {
        text: 'Gestionar Equipos',
        icon: 'people-outline',
        handler: () => { this.verEquipos(); }
      }
    ];

    if (this.torneo?.estado === 'INSCRIPCIONES_ABIERTAS') {
      buttons.push({
        text: 'Generar Fixture',
        icon: 'git-branch-outline',
        handler: () => { this.generarFixture(); }
      });
    }

    if (this.torneo?.estado === 'INSCRIPCIONES_CERRADAS') {
      buttons.push({
        text: 'Iniciar Torneo',
        icon: 'play-outline',
        handler: () => { this.iniciarTorneo(); }
      });
    }

    if (this.puedeAvanzarFase()) {
      buttons.push({
        text: 'Avanzar Fase',
        icon: 'arrow-forward-outline',
        handler: () => { this.avanzarFase(); }
      });
    }

    if (this.puedeCancelar()) {
      buttons.push({
        text: 'Cancelar Torneo',
        icon: 'close-circle-outline',
        role: 'destructive',
        handler: () => { this.confirmarCancelar(); }
      });
    }

    buttons.push({
      text: 'Cerrar',
      icon: 'close-outline',
      role: 'cancel'
    });

    this.actionSheetButtons = buttons;
    this.showActionSheet = true;
  }

  async mostrarAccionesRapidas() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Acciones Rápidas',
      buttons: [
        {
          text: 'Agregar Equipo',
          icon: 'people-outline',
          handler: () => { this.agregarEquipo(); }
        },
        {
          text: 'Ver Partidos',
          icon: 'football-outline',
          handler: () => { this.segmentValue = 'partidos'; }
        },
        {
          text: 'Ver Posiciones',
          icon: 'trophy-outline',
          handler: () => { this.segmentValue = 'posiciones'; }
        },
        {
          text: 'Cancelar',
          icon: 'close-outline',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  // ==================== HELPERS DE FORMATO ====================

  getEstadoColor(estado: string): string {
    const colores: { [key: string]: string } = {
      'INSCRIPCIONES_ABIERTAS': 'primary',
      'INSCRIPCIONES_CERRADAS': 'warning',
      'EN_CURSO': 'success',
      'FASE_GRUPOS': 'success',
      'OCTAVOS': 'tertiary',
      'CUARTOS': 'tertiary',
      'SEMIFINALES': 'tertiary',
      'FINAL': 'secondary',
      'FINALIZADO': 'medium',
      'CANCELADO': 'danger'
    };
    return colores[estado] || 'medium';
  }

  getEstadoIcon(estado: string): string {
    const iconos: { [key: string]: string } = {
      'INSCRIPCIONES_ABIERTAS': 'create-outline',
      'INSCRIPCIONES_CERRADAS': 'lock-closed-outline',
      'EN_CURSO': 'play-outline',
      'FASE_GRUPOS': 'grid-outline',
      'OCTAVOS': 'git-branch-outline',
      'CUARTOS': 'git-branch-outline',
      'SEMIFINALES': 'git-branch-outline',
      'FINAL': 'trophy-outline',
      'FINALIZADO': 'checkmark-circle-outline',
      'CANCELADO': 'close-circle-outline'
    };
    return iconos[estado] || 'help-outline';
  }

  getEstadoLabel(estado: string): string {
    const labels: { [key: string]: string } = {
      'INSCRIPCIONES_ABIERTAS': 'Inscripciones Abiertas',
      'INSCRIPCIONES_CERRADAS': 'Inscripciones Cerradas',
      'EN_CURSO': 'En Curso',
      'FASE_GRUPOS': 'Fase de Grupos',
      'OCTAVOS': 'Octavos de Final',
      'CUARTOS': 'Cuartos de Final',
      'SEMIFINALES': 'Semifinales',
      'FINAL': 'Final',
      'FINALIZADO': 'Finalizado',
      'CANCELADO': 'Cancelado'
    };
    return labels[estado] || estado;
  }

  getTipoLabel(tipo: string): string {
    const labels: { [key: string]: string } = {
      'GRUPOS_Y_ELIMINACION': 'Grupos + Eliminación',
      'ELIMINACION_DIRECTA': 'Eliminación Directa',
      'TODOS_CONTRA_TODOS': 'Todos vs Todos',
      'COPA': 'Copa'
    };
    return labels[tipo] || tipo;
  }

  getEstadoPartidoColor(estado: string): string {
    const colores: { [key: string]: string } = {
      'PROGRAMADO': 'warning',
      'EN_CURSO': 'success',
      'FINALIZADO': 'medium',
      'SUSPENDIDO': 'danger',
      'POSPUESTO': 'tertiary',
      'CANCELADO': 'danger'
    };
    return colores[estado] || 'medium';
  }

  getEstadoPartidoLabel(estado: string): string {
    const labels: { [key: string]: string } = {
      'PROGRAMADO': 'Programado',
      'EN_CURSO': 'En Juego',
      'FINALIZADO': 'Finalizado',
      'SUSPENDIDO': 'Suspendido',
      'POSPUESTO': 'Pospuesto',
      'CANCELADO': 'Cancelado'
    };
    return labels[estado] || estado;
  }

  getFaseLabel(fase: string): string {
    const labels: { [key: string]: string } = {
      'GRUPOS': 'Fase de Grupos',
      'OCTAVOS': 'Octavos',
      'CUARTOS': 'Cuartos',
      'SEMIFINAL': 'Semifinal',
      'TERCER_LUGAR': 'Tercer Lugar',
      'FINAL': 'Final'
    };
    return labels[fase] || fase;
  }

  formatDate(fecha: string): string {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  formatDateTime(fecha: string): string {
    if (!fecha) return '';
    return new Date(fecha).toLocaleString('es-CO', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(value: number): string {
    if (!value) return '$0';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  }

  mostrarToast(mensaje: string, color: string) {
    this.toastMessage = mensaje;
    this.toastColor = color;
    this.showToast = true;
  }
}
