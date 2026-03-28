import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
  IonIcon, IonCard, IonCardContent, IonBackButton, IonSegment, IonSegmentButton,
  IonLabel, IonChip, IonRefresher, IonRefresherContent, IonSkeletonText, IonToast, IonBadge, IonMenuButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  refreshOutline, footballOutline, calendarOutline, locationOutline,
  gridOutline, shieldOutline, radioButtonOn, playOutline, cardOutline, flagOutline, trophy, removeOutline, checkmarkCircle, qrCodeOutline, listOutline, statsChartOutline, closeOutline } from 'ionicons/icons';
import { PartidoService } from '../../../services/partido-service';
import { PartidoDTO } from '../../../models/torneo.model';

interface PartidoGrupo {
  fecha: string;
  partidos: PartidoDTO[];
}

interface FiltroOpcion {
  label: string;
  value: string;
  type: 'fase' | 'grupo';
}

@Component({
  selector: 'app-partidos-list',
  templateUrl: './partidos-list.page.html',
  styleUrls: ['./partidos-list.page.scss'],
  standalone: true,
  imports: [IonBadge,
    CommonModule, FormsModule, IonContent, IonHeader, IonTitle, IonToolbar,
    IonButtons, IonButton, IonIcon, IonCard, IonCardContent, IonBackButton,
    IonSegment, IonSegmentButton, IonLabel, IonChip, IonRefresher,
    IonRefresherContent, IonSkeletonText, IonToast, IonMenuButton
  ]
})
export class PartidosListPage implements OnInit {
  private partidoService = inject(PartidoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  torneoId!: number;
  partidos: PartidoDTO[] = [];
  partidosFiltrados: PartidoDTO[] = [];
  partidosAgrupados: PartidoGrupo[] = [];
  opcionesFiltro: FiltroOpcion[] = [];

  loading = true;
  filtroEstado = 'todos';
  filtroFase = 'todas';

  // Toast
  showToast = false;
  toastMessage = '';
  toastColor = 'success';

  constructor() {
    addIcons({refreshOutline,calendarOutline,locationOutline,shieldOutline,playOutline,footballOutline,cardOutline,flagOutline,trophy,removeOutline,checkmarkCircle,qrCodeOutline,listOutline,statsChartOutline,closeOutline,gridOutline,radioButtonOn});
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('torneoId');
    if (id) {
      this.torneoId = +id;
      this.cargarPartidos();
    } else {
      this.router.navigate(['/torneos']);
    }
  }

  cargarPartidos() {
    this.loading = true;
    this.partidoService.listarPartidosPorTorneo(this.torneoId).subscribe({
      next: (data) => {
        this.partidos = data;
        this.extraerFases();
        this.aplicarFiltros();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar partidos:', error);
        this.mostrarToast('Error al cargar partidos', 'danger');
        this.loading = false;
      }
    });
  }

  extraerFases() {
    const fases = new Set<string>();
    const grupos = new Set<string>();

    this.partidos.forEach(p => {
      if (p.fase) fases.add(p.fase);
      if (p.grupoNombre) grupos.add(p.grupoNombre);
    });

    this.opcionesFiltro = [];

    // Agregar fases
    fases.forEach(f => {
      this.opcionesFiltro.push({
        label: this.getFaseLabel(f),
        value: f,
        type: 'fase'
      });
    });

    // Agregar grupos
    grupos.forEach(g => {
      this.opcionesFiltro.push({
        label: g,
        value: g,
        type: 'grupo'
      });
    });
  }

  aplicarFiltros() {
    let filtrados = [...this.partidos];

    // Filtrar por estado
    if (this.filtroEstado !== 'todos') {
      filtrados = filtrados.filter(p => {
        switch (this.filtroEstado) {
          case 'programados':
            return p.estado === 'PROGRAMADO';
          case 'en_curso':
            return p.estado === 'EN_CURSO';
          case 'finalizados':
            return p.estado === 'FINALIZADO';
          default:
            return true;
        }
      });
    }

    // Filtrar por fase o grupo
    if (this.filtroFase !== 'todas') {
      filtrados = filtrados.filter(p =>
        p.fase === this.filtroFase || p.grupoNombre === this.filtroFase
      );
    }

    this.partidosFiltrados = filtrados;
    this.agruparPorFecha();
  }

  agruparPorFecha() {
    const grupos: { [key: string]: PartidoDTO[] } = {};

    this.partidosFiltrados.forEach(partido => {
      const fecha = this.formatFecha(partido.fechaHora);
      if (!grupos[fecha]) {
        grupos[fecha] = [];
      }
      grupos[fecha].push(partido);
    });

    this.partidosAgrupados = Object.keys(grupos).map(fecha => ({
      fecha,
      partidos: grupos[fecha].sort((a, b) =>
        new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime()
      )
    })).sort((a, b) => {
      // Ordenar fechas
      const fechaA = this.parseFecha(a.partidos[0].fechaHora);
      const fechaB = this.parseFecha(b.partidos[0].fechaHora);
      return fechaA.getTime() - fechaB.getTime();
    });
  }

  parseFecha(fechaStr: string): Date {
    return new Date(fechaStr);
  }

  handleRefresh(event: any) {
    this.partidoService.listarPartidosPorTorneo(this.torneoId).subscribe({
      next: (data) => {
        this.partidos = data;
        this.extraerFases();
        this.aplicarFiltros();
        event.target.complete();
      },
      error: () => {
        event.target.complete();
        this.mostrarToast('Error al refrescar', 'danger');
      }
    });
  }

  verPartido(partido: PartidoDTO) {
    this.router.navigate(['/partidos', partido.id]);
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

  getEstadoLabel(estado: string): string {
    const labels: { [key: string]: string } = {
      'PROGRAMADO': 'Próximo',
      'EN_CURSO': 'EN VIVO',
      'FINALIZADO': 'Finalizado',
      'SUSPENDIDO': 'Suspendido',
      'CANCELADO': 'Cancelado'
    };
    return labels[estado] || estado;
  }

  getFaseLabel(fase: string): string {
    const labels: { [key: string]: string } = {
      'GRUPOS': 'Grupos',
      'OCTAVOS': 'Octavos',
      'CUARTOS': 'Cuartos',
      'SEMIFINAL': 'Semi',
      'TERCER_LUGAR': '3er Lugar',
      'FINAL': 'Final'
    };
    return labels[fase] || fase;
  }

  formatFecha(fechaStr: string): string {
    const fecha = new Date(fechaStr);
    const hoy = new Date();
    const manana = new Date();
    manana.setDate(hoy.getDate() + 1);

    if (fecha.toDateString() === hoy.toDateString()) {
      return 'Hoy';
    } else if (fecha.toDateString() === manana.toDateString()) {
      return 'Mañana';
    }

    return fecha.toLocaleDateString('es-CO', {
      weekday: 'long',
      day: '2-digit',
      month: 'long'
    });
  }

  formatHora(fechaStr: string): string {
    return new Date(fechaStr).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getMensajeVacio(): string {
    switch (this.filtroEstado) {
      case 'programados':
        return 'No hay partidos programados';
      case 'en_curso':
        return 'No hay partidos en curso';
      case 'finalizados':
        return 'No hay partidos finalizados';
      default:
        return 'No hay partidos en este torneo';
    }
  }

  mostrarToast(mensaje: string, color: string) {
    this.toastMessage = mensaje;
    this.toastColor = color;
    this.showToast = true;
  }
}
