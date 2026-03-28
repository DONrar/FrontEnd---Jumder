// src/app/pages/equipos/equipo-detail/equipo-detail.page.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, LoadingController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';

import { EquipoService } from '../../../services/equipo-service';
import { JugadorService } from '../../../services/jugador-services';
import { PartidoService } from '../../../services/partido-service';

import { EquipoDTO } from '../../../models/equipo.model';
import { JugadorDTO } from '../../../models/jugador.model';
import { PartidoDTO } from '../../../models/torneo.model';

@Component({
  selector: 'app-equipo-detail',
  templateUrl: './equipo-detail.page.html',
  styleUrls: ['./equipo-detail.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class EquipoDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private equipoService = inject(EquipoService);
  private jugadorService = inject(JugadorService);
  private partidoService = inject(PartidoService);
  private toastController = inject(ToastController);
  private loadingController = inject(LoadingController);

  equipoId!: number;
  equipo: EquipoDTO | null = null;
  jugadores: JugadorDTO[] = [];
  partidos: PartidoDTO[] = [];

  loading = true;
  segmentValue = 'resumen';

  // Partidos
  proximosPartidos: PartidoDTO[] = [];
  ultimosResultados: PartidoDTO[] = [];

  constructor() { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.equipoId = +id;
      this.cargarDatos();
    } else {
      this.router.navigate(['/dashboard']);
    }

    // Check if there is a tab in queryParams (e.g., from tournament)
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.segmentValue = params['tab'];
      }
    });
  }

  handleRefresh(event: any) {
    this.cargarDatos(event);
  }

  async cargarDatos(event?: any) {
    if (!event) this.loading = true;

    try {
      this.equipoService.obtenerPorId(this.equipoId).subscribe({
        next: (equipo) => {
          this.equipo = equipo;
          this.cargarJugadores();
          if (equipo.torneoId) {
            this.cargarPartidos(equipo.torneoId);
          }
          if (event) event.target.complete();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar equipo:', error);
          this.mostrarToast('Error al cargar la información del equipo', 'danger');
          if (event) event.target.complete();
          this.loading = false;
        }
      });
    } catch (e) {
      if (event) event.target.complete();
      this.loading = false;
    }
  }

  cargarJugadores() {
    this.jugadorService.listarPorEquipo(this.equipoId).subscribe({
      next: (data) => {
        this.jugadores = data;
      },
      error: (error) => {
        console.error('Error al cargar jugadores:', error);
      }
    });
  }

  cargarPartidos(torneoId: number) {
    this.partidoService.listarPartidosPorTorneo(torneoId).subscribe({
      next: (data) => {
        // Filtrar solo los partidos donde juegue este equipo
        const partidosEquipo = data.filter(p => p.equipoLocalId === this.equipoId || p.equipoVisitanteId === this.equipoId);
        this.partidos = partidosEquipo;
        this.separarPartidos();
      },
      error: (error) => {
        console.error('Error al cargar partidos:', error);
      }
    });
  }

  separarPartidos() {
    const ahora = new Date().getTime();

    this.proximosPartidos = this.partidos
      .filter(p => ['PROGRAMADO', 'EN_CURSO'].includes(p.estado))
      .sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime());

    this.ultimosResultados = this.partidos
      .filter(p => ['FINALIZADO', 'CANCELADO'].includes(p.estado))
      .sort((a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime()); // Descendente
  }

  onSegmentChange(event: any) {
    this.segmentValue = event.detail.value;
  }

  verJugador(jugador: JugadorDTO) {
    this.router.navigate(['/jugadores', jugador.id]);
  }

  verPartido(partido: PartidoDTO) {
    this.router.navigate(['/partidos', partido.id]);
  }

  editarEquipo() {
    if (this.equipo) {
      this.router.navigate(['/equipos', this.equipo.id, 'editar']);
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    try {
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      };
      return new Date(dateString).toLocaleDateString('es-CO', options);
    } catch (e) {
      return dateString;
    }
  }

  getEstadoPartidoLabel(estado: string): string {
    const estados: { [key: string]: string } = {
      'PROGRAMADO': 'Programado',
      'EN_CURSO': 'En Curso',
      'FINALIZADO': 'Finalizado',
      'CANCELADO': 'Cancelado',
      'APLAZADO': 'Aplazado'
    };
    return estados[estado] || estado;
  }

  getEstadoPartidoColor(estado: string): string {
    const colores: { [key: string]: string } = {
      'PROGRAMADO': 'medium',
      'EN_CURSO': 'success',
      'FINALIZADO': 'primary',
      'CANCELADO': 'danger',
      'APLAZADO': 'warning'
    };
    return colores[estado] || 'medium';
  }

  getPosicionLabel(pos: string): string {
    const posiciones: { [key: string]: string } = {
      'PORTERO': 'POR',
      'DEFENSA': 'DEF',
      'MEDIOCAMPISTA': 'MED',
      'DELANTERO': 'DEL'
    };
    return posiciones[pos] || pos;
  }

  async mostrarToast(mensaje: string, color: string = 'dark') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      color: color,
      position: 'bottom'
    });
    await toast.present();
  }
}
