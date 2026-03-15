// src/app/pages/dashboard/dashboard.page.ts
import { Component, OnInit, inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
  IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList,
  IonItem, IonLabel, IonBadge, IonSegment, IonSegmentButton, IonGrid,
  IonRow, IonCol, IonRefresher, IonRefresherContent, IonSelect,
  IonSelectOption, IonDatetime, IonModal, IonSkeletonText, IonToast
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  statsChartOutline, trophyOutline, cashOutline, cartOutline,
  peopleOutline, footballOutline, calendarOutline, refreshOutline,
  downloadOutline, filterOutline, alertCircleOutline, checkmarkCircleOutline
} from 'ionicons/icons';
import { ReporteService } from '../../services/reporte-service';
import { TorneoService } from '../../services/torneo-service';
import { ResumenTorneo, ResumenVentas } from '../../models/torneo.model';
import { TorneoDTO } from '../../models/torneo.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonTitle, IonToolbar,
    IonButtons, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle,
    IonCardContent, IonList, IonItem, IonLabel, IonBadge, IonSegment,
    IonSegmentButton, IonGrid, IonRow, IonCol, IonRefresher,
    IonRefresherContent, IonSelect, IonSelectOption, IonDatetime,
    IonModal, IonSkeletonText, IonToast
  ]
})
export class DashboardPage implements OnInit {
  private reporteService = inject(ReporteService);
  private torneoService = inject(TorneoService);

  loading = true;
  segmentValue = 'general';
  polideportivoId = 1;

  // Torneos
  torneos: TorneoDTO[] = [];
  torneoSeleccionado?: number;
  resumenTorneo?: ResumenTorneo;

  // Ventas
  resumenVentas?: ResumenVentas;
  fechaInicio: string;
  fechaFin: string;

  // Toast
  showToast = false;
  toastMessage = '';
  toastColor = 'success';

  // Datos para gráficos
  ventasPorMetodo: { name: string; value: number }[] = [];
  productosMasVendidos: { name: string; value: number }[] = [];

  constructor() {
    addIcons({
      statsChartOutline, trophyOutline, cashOutline, cartOutline,
      peopleOutline, footballOutline, calendarOutline, refreshOutline,
      downloadOutline, filterOutline, alertCircleOutline, checkmarkCircleOutline
    });

    // Inicializar fechas (último mes)
    const hoy = new Date();
    this.fechaFin = hoy.toISOString();
    const hace30Dias = new Date(hoy);
    hace30Dias.setDate(hace30Dias.getDate() - 30);
    this.fechaInicio = hace30Dias.toISOString();
  }

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.loading = true;
    this.cargarTorneos();
  }

  cargarTorneos() {
    this.torneoService.listarTorneosPorPolideportivo(this.polideportivoId).subscribe({
      next: (data) => {
        this.torneos = data;
        if (data.length > 0 && !this.torneoSeleccionado) {
          this.torneoSeleccionado = data[0].id;
          this.cargarResumenTorneo();
        } else {
          this.cargarResumenVentas();
        }
      },
      error: (error) => {
        console.error('Error al cargar torneos:', error);
        this.loading = false;
        this.mostrarToast('Error al cargar torneos', 'danger');
      }
    });
  }

  cargarResumenTorneo() {
    if (!this.torneoSeleccionado) return;

    this.reporteService.obtenerResumenTorneo(this.torneoSeleccionado).subscribe({
      next: (data) => {
        this.resumenTorneo = data;
        this.cargarResumenVentas();
      },
      error: (error) => {
        console.error('Error al cargar resumen torneo:', error);
        this.cargarResumenVentas();
      }
    });
  }

  get torneosActivos(): number {
  return this.torneos.filter(t => t.estado === 'EN_CURSO').length;
}


  cargarResumenVentas() {
    this.reporteService.obtenerResumenVentas(
      this.polideportivoId,
      this.fechaInicio,
      this.fechaFin
    ).subscribe({
      next: (data) => {
        this.resumenVentas = data;
        this.prepararDatosGraficos();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar resumen ventas:', error);
        this.loading = false;
        this.mostrarToast('Error al cargar datos de ventas', 'danger');
      }
    });
  }

  prepararDatosGraficos() {
    if (!this.resumenVentas) return;

    // Ventas por método de pago
    this.ventasPorMetodo = Object.entries(this.resumenVentas.ingresosPorMetodoPago || {}).map(
      ([name, value]) => ({
        name: this.getMetodoPagoLabel(name),
        value: value
      })
    );

    // Productos más vendidos
    this.productosMasVendidos = Object.entries(this.resumenVentas.productosMasVendidos || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));
  }

  handleRefresh(event: any) {
    this.cargarDatos();
    setTimeout(() => {
      event.target.complete();
      this.mostrarToast('Datos actualizados', 'success');
    }, 1000);
  }

  onSegmentChange(event: any) {
    this.segmentValue = event.detail.value;
  }

  onTorneoChange(event: any) {
    this.torneoSeleccionado = event.detail.value;
    this.cargarResumenTorneo();
  }

  onFechaChange() {
    this.cargarResumenVentas();
  }

  getMetodoPagoLabel(metodo: string): string {
    const labels: { [key: string]: string } = {
      'EFECTIVO': 'Efectivo',
      'TARJETA': 'Tarjeta',
      'TRANSFERENCIA': 'Transferencia'
    };
    return labels[metodo] || metodo;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  }

  formatDate(fecha: string): string {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  getPercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  }

  exportarReporte() {
    // TODO: Implementar exportación a PDF/Excel
    this.mostrarToast('Función de exportación en desarrollo', 'warning');
  }

  mostrarToast(mensaje: string, color: string) {
    this.toastMessage = mensaje;
    this.toastColor = color;
    this.showToast = true;
  }
}
