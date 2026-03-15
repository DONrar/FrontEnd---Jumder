// src/app/pages/torneos/torneos-list/torneos-list.page.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
  IonIcon, IonFab, IonFabButton, IonList, IonItem, IonLabel, IonBadge,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonRefresher, IonRefresherContent, IonSearchbar, IonSegment, IonSegmentButton,
  IonGrid, IonRow, IonCol, IonChip, IonSkeletonText, IonAlert, IonToast,
  IonMenuButton, IonSpinner, ActionSheetController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline, trophyOutline, calendarOutline, peopleOutline, cashOutline,
  checkmarkCircleOutline, timeOutline, closeCircleOutline, searchOutline,
  filterOutline, refreshOutline, createOutline, trashOutline, playOutline,
  gitBranchOutline, arrowForwardOutline, ellipsisVertical, stopCircleOutline
} from 'ionicons/icons';
import { TorneoService } from '../../services/torneo-service';
import { StorageService } from '../../services/storage-service';
import { TorneoDTO } from '../../models/torneo.model';

@Component({
  selector: 'app-torneos-list',
  templateUrl: './torneos-list.page.html',
  styleUrls: ['./torneos-list.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonTitle, IonToolbar,
    IonButtons, IonButton, IonIcon, IonFab, IonFabButton, IonList, IonItem,
    IonLabel, IonBadge, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
    IonCardContent, IonRefresher, IonRefresherContent, IonSearchbar, IonSegment,
    IonSegmentButton, IonGrid, IonRow, IonCol, IonChip, IonSkeletonText,
    IonAlert, IonToast, IonMenuButton, IonSpinner
  ]
})
export class TorneosListPage implements OnInit {
  private torneoService = inject(TorneoService);
  private storageService = inject(StorageService);
  private router = inject(Router);
  private actionSheetController = inject(ActionSheetController);

  torneos: TorneoDTO[] = [];
  torneosFiltrados: TorneoDTO[] = [];
  loading = true;
  actionLoading = false;
  searchText = '';
  segmentValue = 'todos';
  polideportivoId!: number;

  // Alert
  showDeleteAlert = false;
  torneoToDelete?: TorneoDTO;

  // Toast
  showToast = false;
  toastMessage = '';
  toastColor = 'success';

  constructor() {
    addIcons({
      addOutline, trophyOutline, calendarOutline, peopleOutline, cashOutline,
      checkmarkCircleOutline, timeOutline, closeCircleOutline, searchOutline,
      filterOutline, refreshOutline, createOutline, trashOutline, playOutline,
      gitBranchOutline, arrowForwardOutline, ellipsisVertical, stopCircleOutline
    });
  }

  ngOnInit() {
    const id = this.storageService.getPolideportivoId();
    if (id !== null && id !== undefined) {
      this.polideportivoId = id;
      this.cargarTorneos();
    } else {
      this.router.navigate(['/polideportivos/selector']);
    }
  }

  alertButtons = [
    {
      text: 'Cancelar',
      role: 'cancel',
      handler: () => { this.showDeleteAlert = false; }
    },
    {
      text: 'Eliminar',
      role: 'destructive',
      handler: () => { this.eliminarTorneo(); }
    }
  ];

  cargarTorneos() {
    if (!this.polideportivoId) return;

    this.loading = true;
    this.torneoService.listarTorneosPorPolideportivo(this.polideportivoId).subscribe({
      next: (data) => {
        this.torneos = data;
        this.aplicarFiltros();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar torneos:', error);
        this.mostrarToast('Error al cargar torneos', 'danger');
        this.loading = false;
      }
    });
  }

  handleRefresh(event: any) {
    this.torneoService.listarTorneosPorPolideportivo(this.polideportivoId).subscribe({
      next: (data) => {
        this.torneos = data;
        this.aplicarFiltros();
        event.target.complete();
        this.mostrarToast('Torneos actualizados', 'success');
      },
      error: (error) => {
        console.error('Error al refrescar:', error);
        event.target.complete();
        this.mostrarToast('Error al refrescar', 'danger');
      }
    });
  }

  onSearchChange(event: any) {
    this.searchText = event.detail.value || '';
    this.aplicarFiltros();
  }

  onSegmentChange(event: any) {
    this.segmentValue = event.detail.value;
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    let filtrados = [...this.torneos];

    if (this.searchText.trim()) {
      const search = this.searchText.toLowerCase();
      filtrados = filtrados.filter(t =>
        t.nombre.toLowerCase().includes(search) ||
        t.descripcion?.toLowerCase().includes(search)
      );
    }

    if (this.segmentValue !== 'todos') {
      filtrados = filtrados.filter(t => {
        switch (this.segmentValue) {
          case 'activos':
            return ['EN_CURSO', 'FASE_GRUPOS', 'OCTAVOS', 'CUARTOS', 'SEMIFINALES', 'FINAL'].includes(t.estado);
          case 'inscripciones':
            return ['INSCRIPCIONES_ABIERTAS', 'INSCRIPCIONES_CERRADAS'].includes(t.estado);
          case 'finalizados':
            return t.estado === 'FINALIZADO';
          default:
            return true;
        }
      });
    }

    this.torneosFiltrados = filtrados;
  }

  // ==================== NAVEGACIÓN ====================

  verDetalle(torneo: TorneoDTO) {
    this.router.navigate(['/torneos', torneo.id]);
  }

  crearTorneo() {
    this.router.navigate(['/torneos/nuevo']);
  }

  editarTorneo(torneo: TorneoDTO, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/torneos', torneo.id, 'editar']);
  }

  // ==================== ACCIONES ====================

  async mostrarAcciones(torneo: TorneoDTO, event: Event) {
    event.stopPropagation();

    const buttons: any[] = [
      {
        text: 'Ver Detalle',
        icon: 'eye-outline',
        handler: () => { this.verDetalle(torneo); }
      },
      {
        text: 'Editar',
        icon: 'create-outline',
        handler: () => { this.router.navigate(['/torneos', torneo.id, 'editar']); }
      }
    ];

    // Acciones según estado
    if (torneo.estado === 'INSCRIPCIONES_ABIERTAS') {
      buttons.push({
        text: 'Generar Fixture',
        icon: 'git-branch-outline',
        handler: () => { this.generarFixture(torneo); }
      });
    }

    if (torneo.estado === 'INSCRIPCIONES_CERRADAS') {
      buttons.push({
        text: 'Iniciar Torneo',
        icon: 'play-outline',
        handler: () => { this.iniciarTorneo(torneo); }
      });
    }

    if (['EN_CURSO', 'FASE_GRUPOS', 'OCTAVOS', 'CUARTOS', 'SEMIFINALES'].includes(torneo.estado)) {
      buttons.push({
        text: 'Avanzar Fase',
        icon: 'arrow-forward-outline',
        handler: () => { this.avanzarFase(torneo); }
      });
    }

    if (!['FINALIZADO', 'CANCELADO'].includes(torneo.estado)) {
      buttons.push({
        text: 'Cancelar Torneo',
        icon: 'stop-circle-outline',
        role: 'destructive',
        handler: () => { this.cancelarTorneo(torneo); }
      });
    }

    buttons.push({
      text: 'Eliminar',
      icon: 'trash-outline',
      role: 'destructive',
      handler: () => { this.confirmarEliminar(torneo); }
    });

    buttons.push({
      text: 'Cerrar',
      icon: 'close-outline',
      role: 'cancel'
    });

    const actionSheet = await this.actionSheetController.create({
      header: torneo.nombre,
      buttons: buttons
    });
    await actionSheet.present();
  }

  generarFixture(torneo: TorneoDTO) {
    if (!torneo.id) return;

    this.actionLoading = true;
    this.torneoService.generarFixture(torneo.id).subscribe({
      next: () => {
        this.mostrarToast('Fixture generado correctamente', 'success');
        this.cargarTorneos();
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

  iniciarTorneo(torneo: TorneoDTO) {
    if (!torneo.id) return;

    this.actionLoading = true;
    this.torneoService.iniciarTorneo(torneo.id).subscribe({
      next: () => {
        this.mostrarToast('Torneo iniciado correctamente', 'success');
        this.cargarTorneos();
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

  avanzarFase(torneo: TorneoDTO) {
    if (!torneo.id) return;

    this.actionLoading = true;
    this.torneoService.avanzarFase(torneo.id).subscribe({
      next: () => {
        this.mostrarToast('Fase avanzada correctamente', 'success');
        this.cargarTorneos();
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

  cancelarTorneo(torneo: TorneoDTO) {
    if (!torneo.id) return;

    this.actionLoading = true;
    this.torneoService.cancelarTorneo(torneo.id).subscribe({
      next: () => {
        this.mostrarToast('Torneo cancelado', 'warning');
        this.cargarTorneos();
        this.actionLoading = false;
      },
      error: (error) => {
        console.error('Error al cancelar torneo:', error);
        const mensaje = error.error?.error || 'Error al cancelar torneo';
        this.mostrarToast(mensaje, 'danger');
        this.actionLoading = false;
      }
    });
  }

  confirmarEliminar(torneo: TorneoDTO) {
    this.torneoToDelete = torneo;
    this.showDeleteAlert = true;
  }

  eliminarTorneo() {
    if (!this.torneoToDelete?.id) return;

    this.torneoService.eliminarTorneo(this.torneoToDelete.id).subscribe({
      next: () => {
        this.mostrarToast('Torneo eliminado correctamente', 'success');
        this.cargarTorneos();
        this.showDeleteAlert = false;
        this.torneoToDelete = undefined;
      },
      error: (error) => {
        console.error('Error al eliminar:', error);
        const mensaje = error.error?.error || 'Error al eliminar torneo';
        this.mostrarToast(mensaje, 'danger');
        this.showDeleteAlert = false;
      }
    });
  }

  // ==================== HELPERS ====================

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

  getEstadoLabel(estado: string): string {
    const labels: { [key: string]: string } = {
      'INSCRIPCIONES_ABIERTAS': 'Inscripciones',
      'INSCRIPCIONES_CERRADAS': 'Cerrado',
      'EN_CURSO': 'En Curso',
      'FASE_GRUPOS': 'Grupos',
      'OCTAVOS': 'Octavos',
      'CUARTOS': 'Cuartos',
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

  getAccionPrincipal(estado: string): { texto: string, icono: string, color: string } | null {
    const acciones: { [key: string]: { texto: string, icono: string, color: string } } = {
      'INSCRIPCIONES_ABIERTAS': { texto: 'Generar Fixture', icono: 'git-branch-outline', color: 'primary' },
      'INSCRIPCIONES_CERRADAS': { texto: 'Iniciar', icono: 'play-outline', color: 'success' },
      'EN_CURSO': { texto: 'Avanzar', icono: 'arrow-forward-outline', color: 'tertiary' },
      'FASE_GRUPOS': { texto: 'Avanzar', icono: 'arrow-forward-outline', color: 'tertiary' }
    };
    return acciones[estado] || null;
  }

  formatDate(fecha: string): string {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  mostrarToast(mensaje: string, color: string) {
    this.toastMessage = mensaje;
    this.toastColor = color;
    this.showToast = true;
  }
}
