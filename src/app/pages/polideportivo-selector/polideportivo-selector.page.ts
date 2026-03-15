import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem,
  IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonIcon, IonButton, IonButtons, IonBadge, IonRefresher,
  IonRefresherContent, IonSkeletonText, IonToast
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  businessOutline, locationOutline, callOutline, mailOutline,
  checkmarkCircleOutline, addOutline, createOutline, refreshOutline } from 'ionicons/icons';
import { PolideportivoService } from '../../services/polideportivo-service';
import { StorageService } from '../../services/storage-service';
import { PolideportivoDTO } from '../../models/polideportivo.model';

@Component({
  selector: 'app-polideportivo-selector',
  templateUrl: './polideportivo-selector.page.html',
  styleUrls: ['./polideportivo-selector.page.scss'],
  standalone: true,
  imports: [
    CommonModule, IonContent, IonHeader, IonTitle, IonToolbar, IonList,
    IonItem, IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonIcon, IonButton, IonButtons, IonBadge, IonRefresher,
    IonRefresherContent, IonSkeletonText, IonToast
  ]
})
export class PolideportivoSelectorPage implements OnInit {
  private polideportivoService = inject(PolideportivoService);
  private storageService = inject(StorageService);
  private router = inject(Router);

  polideportivos: PolideportivoDTO[] = [];
  polideportivoSeleccionadoId?: number;
  loading = true;

  // Toast
  showToast = false;
  toastMessage = '';
  toastColor = 'success';

  constructor() {
    addIcons({refreshOutline,addOutline,businessOutline,createOutline,locationOutline,callOutline,mailOutline,checkmarkCircleOutline});
  }

  ngOnInit() {
    this.polideportivoSeleccionadoId = this.storageService.getPolideportivoId() || undefined;
    this.cargarPolideportivos();
  }

  cargarPolideportivos() {
    this.loading = true;
    this.polideportivoService.listarTodos().subscribe({
      next: (data) => {
        this.polideportivos = data.filter(p => p.activo);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar polideportivos:', error);
        this.mostrarToast('Error al cargar polideportivos', 'danger');
        this.loading = false;
      }
    });
  }

  seleccionarPolideportivo(polideportivo: PolideportivoDTO) {
    if (polideportivo.id) {
      this.storageService.setPolideportivoId(polideportivo.id);
      this.polideportivoSeleccionadoId = polideportivo.id;
      this.mostrarToast(`${polideportivo.nombre} seleccionado`, 'success');

      // Redirigir al dashboard después de 1 segundo
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 1000);
    }
  }

  editarPolideportivo(polideportivo: PolideportivoDTO, event: Event) {
    event.stopPropagation();
    if (polideportivo.id) {
      this.router.navigate(['/polideportivos', polideportivo.id, 'editar']);
    }
  }

  handleRefresh(event: any) {
    this.polideportivoService.listarTodos().subscribe({
      next: (data) => {
        this.polideportivos = data.filter(p => p.activo);
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

  crearPolideportivo() {
    this.router.navigate(['/polideportivos/nuevo']);
  }

  mostrarToast(mensaje: string, color: string) {
    this.toastMessage = mensaje;
    this.toastColor = color;
    this.showToast = true;
  }
}
