import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
  IonIcon, IonCard, IonCardContent, IonBackButton, IonSegment, IonSegmentButton,
  IonLabel, IonChip, IonRefresher, IonRefresherContent, IonSkeletonText, IonToast,
  IonList, IonItem, IonAvatar, IonBadge, IonGrid, IonRow, IonCol, IonSpinner, IonMenuButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  calendarOutline, footballOutline, locationOutline, trophyOutline,
  chevronBackOutline, chevronForwardOutline, filterOutline,
  refreshOutline, timeOutline, shieldOutline, personOutline,
  checkmarkCircleOutline, alertCircleOutline, closeOutline,
  chevronDownCircleOutline, playOutline, statsChartOutline, listOutline
} from 'ionicons/icons';
import { PartidoService } from '../../services/partido-service';
import { TorneoService } from '../../services/torneo-service';
import { StorageService } from '../../services/storage-service';
import { PartidoDTO, TorneoDTO } from '../../models/torneo.model';

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.page.html',
  styleUrls: ['./calendario.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonTitle, IonToolbar,
    IonButtons, IonButton, IonIcon, IonCard, IonCardContent, IonBackButton,
    IonSegment, IonSegmentButton, IonLabel, IonChip, IonRefresher,
    IonRefresherContent, IonSkeletonText, IonToast, IonList, IonItem,
    IonAvatar, IonBadge, IonGrid, IonRow, IonCol, IonSpinner, IonMenuButton
  ]
})
export class CalendarioPage implements OnInit {
  private partidoService = inject(PartidoService);
  private torneoService = inject(TorneoService);
  private storageService = inject(StorageService);
  private router = inject(Router);

  loading = true;
  torneoActivoId: number | null = null;
  torneoNombre = 'Calendario de Partidos';
  
  fechaSeleccionada: Date = new Date();
  mesActual: number = new Date().getMonth();
  anioActual: number = new Date().getFullYear();
  
  diasMes: any[] = [];
  nombresMeses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  partidos: PartidoDTO[] = [];
  partidosDelDia: PartidoDTO[] = [];

  constructor() {
    addIcons({
      calendarOutline, footballOutline, locationOutline, trophyOutline,
      chevronBackOutline, chevronForwardOutline, filterOutline,
      refreshOutline, timeOutline, shieldOutline, personOutline,
      checkmarkCircleOutline, alertCircleOutline, closeOutline,
      chevronDownCircleOutline, playOutline, statsChartOutline, listOutline
    });
  }

  ngOnInit() {
    this.cargarConfiguracion();
  }

  cargarConfiguracion() {
    const id = this.storageService.getItem('torneoActivoId');
    if (id) {
      this.torneoActivoId = +id;
      this.cargarTorneo();
      this.cargarPartidos();
    } else {
      this.generarCalendario();
      this.loading = false;
    }
  }

  cargarTorneo() {
    if (this.torneoActivoId) {
      this.torneoService.obtenerTorneo(this.torneoActivoId).subscribe({
        next: (t) => { this.torneoNombre = t.nombre; },
        error: () => { this.torneoNombre = 'Calendario de Partidos'; }
      });
    }
  }

  cargarPartidos() {
    this.loading = true;
    if (this.torneoActivoId) {
      this.partidoService.listarPartidosPorTorneo(this.torneoActivoId).subscribe({
        next: (data) => {
          this.partidos = data;
          this.generarCalendario();
          this.filtrarPartidosPorDia();
          this.loading = false;
        },
        error: (err) => {
          console.error('Error al cargar partidos:', err);
          this.loading = false;
        }
      });
    } else {
      this.generarCalendario();
      this.loading = false;
    }
  }

  generarCalendario() {
    const primerDia = new Date(this.anioActual, this.mesActual, 1).getDay();
    const ultimoDia = new Date(this.anioActual, this.mesActual + 1, 0).getDate();
    
    this.diasMes = [];
    
    // Ajustar primer día (domingo = 0, lunes = 1... sabado = 6)
    // Queremos que empiece en Lunes (1), Martes (2)...
    // Si queremos que empiece en Lunes:
    let startingDay = primerDia === 0 ? 6 : primerDia - 1;

    // Relleno días mes anterior
    for (let i = 0; i < startingDay; i++) {
      this.diasMes.push({ dia: '', out: true });
    }

    // Días del mes actual
    for (let i = 1; i <= ultimoDia; i++) {
      const fecha = new Date(this.anioActual, this.mesActual, i);
      const tienePartidos = this.partidos.some(p => {
        if (!p.fechaHora) return false;
        const pFecha = new Date(p.fechaHora);
        return !isNaN(pFecha.getTime()) &&
               pFecha.getDate() === i && 
               pFecha.getMonth() === this.mesActual && 
               pFecha.getFullYear() === this.anioActual;
      });
      
      this.diasMes.push({
        dia: i,
        fecha: fecha,
        hoy: this.esHoy(fecha),
        seleccionado: this.esSeleccionado(fecha),
        tienePartidos: tienePartidos
      });
    }
  }

  esHoy(fecha: Date): boolean {
    const hoy = new Date();
    return fecha.getDate() === hoy.getDate() &&
           fecha.getMonth() === hoy.getMonth() &&
           fecha.getFullYear() === hoy.getFullYear();
  }

  esSeleccionado(fecha: Date): boolean {
    return fecha.getDate() === this.fechaSeleccionada.getDate() &&
           fecha.getMonth() === this.fechaSeleccionada.getMonth() &&
           fecha.getFullYear() === this.fechaSeleccionada.getFullYear();
  }

  seleccionarDia(dia: any) {
    if (dia.out) return;
    this.fechaSeleccionada = new Date(this.anioActual, this.mesActual, dia.dia);
    this.diasMes.forEach(d => d.seleccionado = (d.dia === dia.dia));
    this.filtrarPartidosPorDia();
  }

  filtrarPartidosPorDia() {
    this.partidosDelDia = this.partidos.filter(p => {
      if (!p.fechaHora) return false;
      const pFecha = new Date(p.fechaHora);
      return !isNaN(pFecha.getTime()) &&
             pFecha.getDate() === this.fechaSeleccionada.getDate() &&
             pFecha.getMonth() === this.fechaSeleccionada.getMonth() &&
             pFecha.getFullYear() === this.fechaSeleccionada.getFullYear();
    }).sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime());
  }

  mesAnterior() {
    if (this.mesActual === 0) {
      this.mesActual = 11;
      this.anioActual--;
    } else {
      this.mesActual--;
    }
    this.generarCalendario();
  }

  mesSiguiente() {
    if (this.mesActual === 11) {
      this.mesActual = 0;
      this.anioActual++;
    } else {
      this.mesActual++;
    }
    this.generarCalendario();
  }

  verPartido(partido: PartidoDTO) {
    this.router.navigate(['/partidos', partido.id]);
  }

  formatHora(fechaStr: string): string {
    return new Date(fechaStr).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getEstadoColor(estado: string): string {
    const colores: { [key: string]: string } = {
      'PROGRAMADO': 'warning',
      'EN_CURSO': 'success',
      'FINALIZADO': 'medium',
      'SUSPENDIDO': 'danger'
    };
    return colores[estado] || 'medium';
  }

  handleRefresh(event?: any) {
    this.loading = true;
    this.cargarPartidos();
    if (event?.target && typeof event.target.complete === 'function') {
      setTimeout(() => { event.target.complete(); }, 1000);
    }
  }
}
