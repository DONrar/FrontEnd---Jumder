// src/app/pages/jugadores/jugador-detail/jugador-detail.page.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';

import { JugadorService } from '../../../services/jugador-services';
import { JugadorDTO } from '../../../models/jugador.model';

@Component({
  selector: 'app-jugador-detail',
  templateUrl: './jugador-detail.page.html',
  styleUrls: ['./jugador-detail.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class JugadorDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private jugadorService = inject(JugadorService);
  private toastController = inject(ToastController);

  jugadorId!: number;
  jugador: JugadorDTO | null = null;
  loading = true;

  constructor() { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.jugadorId = +id;
      this.cargarJugador();
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  handleRefresh(event: any) {
    this.cargarJugador(event);
  }

  cargarJugador(event?: any) {
    if (!event) this.loading = true;

    this.jugadorService.obtenerPorId(this.jugadorId).subscribe({
      next: (jugador) => {
        this.jugador = jugador;
        if (event) event.target.complete();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar jugador:', error);
        this.mostrarToast('Error al cargar la información del jugador', 'danger');
        if (event) event.target.complete();
        this.loading = false;
      }
    });
  }

  editarJugador() {
    if (this.jugador) {
      this.router.navigate(['/jugadores', this.jugador.id, 'editar']);
    }
  }

  verEquipo() {
    if (this.jugador && this.jugador.equipoId) {
      this.router.navigate(['/equipos', this.jugador.equipoId]);
    }
  }

  calcularEdad(fechaNacimiento: string | undefined): number | null {
    if (!fechaNacimiento) return null;
    const diff = Date.now() - new Date(fechaNacimiento).getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970);
  }

  getPosicionLabel(pos: string | undefined): string {
    if (!pos) return 'Sin Posición';
    const posiciones: { [key: string]: string } = {
      'PORTERO': 'Portero (POR)',
      'DEFENSA': 'Defensa (DEF)',
      'MEDIOCAMPISTA': 'Mediocampista (MED)',
      'DELANTERO': 'Delantero (DEL)'
    };
    return posiciones[pos] || pos;
  }

  getPosicionColor(pos: string | undefined): string {
    if (!pos) return 'medium';
    const colores: { [key: string]: string } = {
      'PORTERO': 'warning',
      'DEFENSA': 'primary',
      'MEDIOCAMPISTA': 'success',
      'DELANTERO': 'danger'
    };
    return colores[pos] || 'medium';
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
