import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem,
  IonLabel, IonBadge, IonButton, IonIcon, IonButtons, IonMenuButton,
  IonBackButton, IonSegment, IonSegmentButton, IonCard, IonCardContent,
  IonCardHeader, IonCardTitle, IonSelect, IonSelectOption, IonDatetime,
  IonGrid, IonRow, IonCol, IonProgressBar, IonSpinner, IonNote, IonChip
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  analyticsOutline, trophyOutline, cashOutline, calendarOutline,
  trendingUpOutline, peopleOutline, footballOutline, cartOutline
} from 'ionicons/icons';

import { ReporteService } from '../../services/reporte-service';
import { TorneoService } from '../../services/torneo-service';
import { StorageService } from '../../services/storage-service';
import { ResumenTorneo, ResumenVentas, TorneoDTO } from '../../models/torneo.model';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.page.html',
  styleUrls: ['./reportes.page.scss'],
  standalone: true,
  imports: [IonChip, IonNote, IonSpinner,
    CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle,
    IonContent, IonList, IonItem, IonLabel, IonBadge, IonButton,
    IonIcon, IonButtons, IonMenuButton, IonBackButton, IonSegment,
    IonSegmentButton, IonCard, IonCardContent, IonCardHeader,
    IonCardTitle, IonSelect, IonSelectOption, IonGrid, IonRow, IonCol,
    IonProgressBar
  ]
})
export class ReportesPage implements OnInit {
  private reporteService = inject(ReporteService);
  private torneoService = inject(TorneoService);
  private storageService = inject(StorageService);

  segmento = 'deportivo';
  torneos: TorneoDTO[] = [];
  torneoSeleccionadoId: number | null = null;
  resumenDeportivo: ResumenTorneo | null = null;
  resumenVentas: ResumenVentas | null = null;

  fechaInicio = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];
  fechaFin = new Date().toISOString().split('T')[0];

  loading = false;

  constructor() {
    addIcons({
      analyticsOutline, trophyOutline, cashOutline, calendarOutline,
      trendingUpOutline, peopleOutline, footballOutline, cartOutline
    });
  }

  ngOnInit() {
    this.cargarTorneos();
    this.cargarReporteVentas();
  }

  cargarTorneos() {
    const poliId = this.storageService.getPolideportivoId();
    if (!poliId) return;

    this.torneoService.listarTorneosPorPolideportivo(poliId).subscribe({
      next: (data) => {
        this.torneos = data;
        if (this.torneos.length > 0) {
          const activo = this.torneos.find(t => t.estado === 'ACTIVO') || this.torneos[0];
          this.torneoSeleccionadoId = activo.id!;
          this.cargarReporteDeportivo();
        }
      }
    });
  }

  cargarReporteDeportivo() {
    if (!this.torneoSeleccionadoId) return;
    this.loading = true;
    this.reporteService.obtenerResumenTorneo(this.torneoSeleccionadoId).subscribe({
      next: (data) => {
        this.resumenDeportivo = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  cargarReporteVentas() {
    const poliId = this.storageService.getPolideportivoId();
    if (!poliId) return;

    this.loading = true;
    this.reporteService.obtenerResumenVentas(poliId, this.fechaInicio, this.fechaFin).subscribe({
      next: (data) => {
        this.resumenVentas = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onTorneoChange() {
    this.cargarReporteDeportivo();
  }

  onFechasChange() {
    this.cargarReporteVentas();
  }

  getPorcentajeGoles(goles: number): number {
    if (!this.resumenDeportivo?.totalGoles) return 0;
    return goles / this.resumenDeportivo.totalGoles;
  }
}
