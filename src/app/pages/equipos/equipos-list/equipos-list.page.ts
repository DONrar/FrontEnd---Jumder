import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
  IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonBadge,
  IonSearchbar, IonFab, IonFabButton, IonRefresher, IonRefresherContent,
  IonSkeletonText, IonToast, IonChip, IonLabel, IonBackButton,
  AlertController, ModalController, IonModal, IonSegmentButton, IonMenuButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline, createOutline, trashOutline, trophyOutline, peopleOutline,
  shieldOutline, refreshOutline, cashOutline, checkmarkCircleOutline,
  closeCircleOutline, ribbonOutline, filterOutline, downloadOutline,
  shareOutline, closeOutline, cloudUploadOutline, documentTextOutline,
  shield, checkmark, alertCircle, call, funnel, addCircle,
  checkmarkCircle, closeCircle, footballOutline, add,
  arrowBackOutline, informationCircle } from 'ionicons/icons';
import { EquipoService } from '../../../services/equipo-service';
import { EquipoDTO } from '../../../models/equipo.model';

@Component({
  selector: 'app-equipos-list',
  templateUrl: './equipos-list.page.html',
  styleUrls: ['./equipos-list.page.scss'],
  standalone: true,
  imports: [IonSegmentButton,
    CommonModule, FormsModule, IonContent, IonHeader, IonTitle, IonToolbar,
    IonButtons, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle,
    IonCardContent, IonBadge, IonSearchbar, IonFab, IonFabButton, IonRefresher,
    IonRefresherContent, IonSkeletonText, IonToast, IonChip, IonLabel,
    IonBackButton, IonModal, IonMenuButton
  ]
})
export class EquiposListPage implements OnInit {
  private equipoService = inject(EquipoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private alertController = inject(AlertController);
  private modalController = inject(ModalController);

  // Datos
  equipos: EquipoDTO[] = [];
  equiposFiltrados: EquipoDTO[] = [];
  gruposUnicos: string[] = [];

  // Estados
  loading = true;
  searchText = '';
  segmentValue = 'todos';
  filtroGrupo = 'todos';
  filtroActivo = 'todos';
  filtrosVisibles = false;
  fabOptionsVisible = false;
  showFiltrosModal = false;

  // Datos del torneo
  torneoId?: number;
  torneoNombre?: string;

  // Toast
  showToast = false;
  toastMessage = '';
  toastColor = 'success';

  // Stats
  equiposPagados = 0;
  equiposSinPagar = 0;

  constructor() {
    addIcons({shieldOutline,refreshOutline,addOutline,filterOutline,funnel,checkmarkCircle,closeCircle,checkmark,shield,closeOutline,alertCircle,informationCircle,downloadOutline,shareOutline,add,addCircle,call,createOutline,trashOutline,trophyOutline,peopleOutline,cashOutline,checkmarkCircleOutline,closeCircleOutline,ribbonOutline,cloudUploadOutline,documentTextOutline,footballOutline,arrowBackOutline});
  }

  ngOnInit() {
    this.torneoId = this.route.snapshot.queryParams['torneoId']
      ? +this.route.snapshot.queryParams['torneoId']
      : undefined;
    this.torneoNombre = this.route.snapshot.queryParams['torneoNombre'];

    this.cargarEquipos();
  }

  cargarEquipos() {
    this.loading = true;

    const request = this.torneoId
      ? this.equipoService.listarPorTorneo(this.torneoId)
      : this.equipoService.listarTodos();

    request.subscribe({
      next: (data) => {
        this.equipos = data;
        this.calcularEstadisticas();
        this.extraerGruposUnicos();
        this.aplicarFiltros();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar equipos:', error);
        this.mostrarToast('Error al cargar equipos', 'danger');
        this.loading = false;
      }
    });
  }

  calcularEstadisticas() {
    this.equiposPagados = this.equipos.filter(e => e.inscripcionPagada).length;
    this.equiposSinPagar = this.equipos.filter(e => !e.inscripcionPagada).length;
  }

  extraerGruposUnicos() {
    // Filtrar valores undefined y null, luego obtener valores únicos
    const grupos = this.equipos
      .map(e => e.grupoNombre || 'Sin grupo')
      .filter((grupo): grupo is string => grupo !== null && grupo !== undefined);

    // Obtener valores únicos
    const gruposSet = new Set(grupos);
    this.gruposUnicos = Array.from(gruposSet);
  }

  handleRefresh(event: any) {
    const request = this.torneoId
      ? this.equipoService.listarPorTorneo(this.torneoId)
      : this.equipoService.listarTodos();

    request.subscribe({
      next: (data) => {
        this.equipos = data;
        this.calcularEstadisticas();
        this.extraerGruposUnicos();
        this.aplicarFiltros();
        event.target.complete();
        this.mostrarToast('Lista actualizada', 'success');
      },
      error: (error) => {
        console.error('Error:', error);
        event.target.complete();
        this.mostrarToast('Error al actualizar', 'danger');
      }
    });
  }

  onSearchChange(event: any) {
    this.searchText = event.detail.value || '';
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    let filtrados = [...this.equipos];

    // Filtro por búsqueda
    if (this.searchText.trim()) {
      const search = this.searchText.toLowerCase();
      filtrados = filtrados.filter(e =>
        e.nombre.toLowerCase().includes(search) ||
        e.capitanNombre?.toLowerCase().includes(search) ||
        e.torneoNombre?.toLowerCase().includes(search)
      );
    }

    // Filtro por grupo
    if (this.filtroGrupo !== 'todos') {
      filtrados = filtrados.filter(e =>
        (e.grupoNombre || 'Sin grupo') === this.filtroGrupo
      );
    }

    // Filtro por estado de pago
    switch (this.segmentValue) {
      case 'pagados':
        filtrados = filtrados.filter(e => e.inscripcionPagada);
        break;
      case 'sin-pagar':
        filtrados = filtrados.filter(e => !e.inscripcionPagada);
        break;
    }

    // Filtro por actividad
    switch (this.filtroActivo) {
      case 'activos':
        filtrados = filtrados.filter(e => e.activo);
        break;
      case 'inactivos':
        filtrados = filtrados.filter(e => !e.activo);
        break;
    }

    this.equiposFiltrados = filtrados;
  }

  // Métodos para filtros
  aplicarFiltroGrupo(grupo: string) {
    this.filtroGrupo = grupo;
    this.aplicarFiltros();
  }

  aplicarFiltroSegment(segmento: string) {
    this.segmentValue = segmento;
    this.aplicarFiltros();
  }

  aplicarFiltroActivo(activo: string) {
    this.filtroActivo = activo;
    this.aplicarFiltros();
  }

  limpiarFiltros() {
    this.searchText = '';
    this.segmentValue = 'todos';
    this.filtroGrupo = 'todos';
    this.filtroActivo = 'todos';
    this.aplicarFiltros();
  }

  toggleFiltros() {
    this.filtrosVisibles = !this.filtrosVisibles;
  }

  toggleFabOptions() {
    this.fabOptionsVisible = !this.fabOptionsVisible;
  }

  // Métodos de utilidad
  getGradientColors(equipo: EquipoDTO): string {
    const color1 = equipo.colorPrincipal || '#16476A';
    const color2 = equipo.colorSecundario || '#3B9797';
    return `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
  }

  getEstadoBadgeClass(equipo: EquipoDTO): string {
    if (!equipo.activo) return 'badge-warning';
    if (equipo.inscripcionPagada) return 'badge-success';
    return 'badge-primary';
  }

  getEstadoTexto(equipo: EquipoDTO): string {
    if (!equipo.activo) return 'Inactivo';
    if (equipo.inscripcionPagada) return 'Activo';
    return 'Pendiente';
  }

  getDiferenciaGoles(equipo: EquipoDTO): number {
    const golesAFavor = equipo.golesAFavor || 0;
    const golesEnContra = equipo.golesEnContra || 0;
    return golesAFavor - golesEnContra;
  }

  // Métodos de navegación
  crearEquipo() {
    const queryParams: any = {};
    if (this.torneoId) {
      queryParams.torneoId = this.torneoId;
    }
    if (this.torneoNombre) {
      queryParams.torneoNombre = this.torneoNombre;
    }

    this.router.navigate(['/equipos/nuevo'], { queryParams });
    this.fabOptionsVisible = false;
  }

  verEquipo(equipo: EquipoDTO) {
    const queryParams: any = {};
    if (this.torneoId) {
      queryParams.torneoId = this.torneoId;
    }
    if (this.torneoNombre) {
      queryParams.torneoNombre = this.torneoNombre;
    }

    this.router.navigate(['/equipos', equipo.id], { queryParams });
  }

  verJugadores(equipo: EquipoDTO, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/jugadores'], {
      queryParams: {
        equipoId: equipo.id,
        equipoNombre: equipo.nombre,
        torneoId: this.torneoId
      }
    });
  }

  editarEquipo(equipo: EquipoDTO, event: Event) {
    event.stopPropagation();
    const queryParams: any = {};
    if (this.torneoId) {
      queryParams.torneoId = this.torneoId;
    }
    if (this.torneoNombre) {
      queryParams.torneoNombre = this.torneoNombre;
    }

    this.router.navigate(['/equipos', equipo.id, 'editar'], { queryParams });
  }

  // Métodos de acción
  async eliminarEquipo(equipo: EquipoDTO, event: Event) {
    event.stopPropagation();

    const alert = await this.alertController.create({
      header: '¿Eliminar equipo?',
      message: `¿Estás seguro de eliminar "${equipo.nombre}"? Esta acción no se puede deshacer.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            if (equipo.id) {
              this.equipoService.eliminar(equipo.id).subscribe({
                next: () => {
                  this.mostrarToast('Equipo eliminado exitosamente', 'success');
                  this.cargarEquipos();
                },
                error: (error) => {
                  console.error('Error al eliminar:', error);
                  this.mostrarToast('Error al eliminar equipo', 'danger');
                }
              });
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async pagarInscripcion(equipo: EquipoDTO, event: Event) {
    event.stopPropagation();

    if (!equipo.id) return;

    const confirm = await this.alertController.create({
      header: 'Confirmar Pago',
      message: `¿Marcar la inscripción de "${equipo.nombre}" como pagada?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: () => {
            this.equipoService.pagarInscripcion(equipo.id!).subscribe({
              next: () => {
                this.mostrarToast('Inscripción marcada como pagada', 'success');
                this.cargarEquipos();
              },
              error: (error) => {
                console.error('Error:', error);
                this.mostrarToast('Error al marcar inscripción', 'danger');
              }
            });
          }
        }
      ]
    });

    await confirm.present();
  }

  // Métodos adicionales
  exportarLista() {
    try {
      const csvContent = this.generarCSV();
      this.descargarArchivo(csvContent, 'equipos.csv');
      this.mostrarToast('Lista exportada exitosamente', 'success');
    } catch (error) {
      console.error('Error al exportar:', error);
      this.mostrarToast('Error al exportar lista', 'danger');
    }
  }

  generarCSV(): string {
    const headers = ['Nombre', 'Torneo', 'Capitán', 'Grupo', 'Estado', 'Pago', 'Puntos'];
    const rows = this.equiposFiltrados.map(equipo => [
      equipo.nombre,
      equipo.torneoNombre || 'N/A',
      equipo.capitanNombre || 'N/A',
      equipo.grupoNombre || 'Sin grupo',
      equipo.activo ? 'Activo' : 'Inactivo',
      equipo.inscripcionPagada ? 'Pagado' : 'Pendiente',
      (equipo.puntos || 0).toString()
    ]);

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  }

  descargarArchivo(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async compartirLista() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Lista de Equipos',
          text: `Lista de equipos - Total: ${this.equiposFiltrados.length}`,
          url: window.location.href
        });
      } catch (error) {
        console.error('Error al compartir:', error);
      }
    } else {
      this.mostrarToast('Función de compartir no disponible', 'warning');
    }
  }

  importarEquipos() {
    // Lógica para importar equipos
    this.mostrarToast('Función en desarrollo', 'warning');
    this.fabOptionsVisible = false;
  }

  generarReporte() {
    // Lógica para generar reporte
    this.mostrarToast('Función en desarrollo', 'warning');
    this.fabOptionsVisible = false;
  }

  mostrarFiltrosAvanzados() {
    this.showFiltrosModal = true;
  }

  // Toast helper
  mostrarToast(mensaje: string, color: 'success' | 'danger' | 'warning') {
    this.toastMessage = mensaje;
    this.toastColor = color;
    this.showToast = true;
  }

  // Método para el back button
  volver() {
    if (this.torneoId) {
      this.router.navigate(['/torneos', this.torneoId]);
    } else {
      this.router.navigate(['/torneos']);
    }
  }
}
