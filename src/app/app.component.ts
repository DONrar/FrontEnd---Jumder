// src/app/app.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonApp, IonSplitPane, IonMenu, IonContent, IonList, IonListHeader,
  IonNote, IonMenuToggle, IonItem, IonIcon, IonLabel, IonRouterOutlet,
  IonHeader, IonToolbar, IonTitle, IonButton, IonButtons, IonChip,
  IonBadge, AlertController, ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  // Iconos principales
  statsChartOutline, statsChartSharp, trophyOutline, trophySharp,
  peopleOutline, peopleSharp, personOutline, personSharp,
  cartOutline, cartSharp, receiptOutline, receiptSharp,
  cubeOutline, cubeSharp, cashOutline, cashSharp,
  businessOutline, businessSharp, swapHorizontalOutline, swapHorizontal,

  // Nuevos iconos mejorados
  speedometerOutline, speedometer, settingsOutline, settingsSharp,
  cogOutline, cog, helpCircleOutline, helpCircle,
  logOutOutline, logOut, checkmarkCircle, checkmarkCircleOutline,
  shieldOutline, shield, footballOutline, football,
  shirtOutline, shirt, calendarOutline, calendar,
  walletOutline, wallet, analyticsOutline, analytics,
  menuOutline, menu, closeOutline, close,
  notificationsOutline, notifications,
  personCircleOutline, personCircle
} from 'ionicons/icons';

import { StorageService } from './services/storage-service';
import { PolideportivoService } from './services/polideportivo-service';
import { TorneoService } from './services/torneo-service';
import { EquipoService } from './services/equipo-service';
import { JugadorService } from './services/jugador-services';
import { TorneoDTO } from './models/torneo.model';

interface MenuItem {
  title: string;
  url: string;
  icon: string;
  color: string;
  badge?: number;
  badgeColor?: string;
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    CommonModule, RouterLink, RouterLinkActive,
    IonApp, IonSplitPane, IonMenu, IonContent, IonList,
    IonListHeader, IonNote, IonMenuToggle, IonItem, IonIcon,
    IonLabel, IonRouterOutlet, IonHeader, IonToolbar, IonTitle,
    IonButton, IonButtons, IonChip, IonBadge
  ]
})
export class AppComponent implements OnInit {
  private storageService = inject(StorageService);
  private polideportivoService = inject(PolideportivoService);
  private torneoService = inject(TorneoService);
  private equipoService = inject(EquipoService);
  private jugadorService = inject(JugadorService);
  private router = inject(Router);
  private alertController = inject(AlertController);
  private modalController = inject(ModalController);

  // Datos
  polideportivoNombre = 'Gestión Deportiva';
  version = '1.5.0';
  estadisticas: any = null;

  // Páginas organizadas por categorías
  deportesPages: MenuItem[] = [
    {
      title: 'Torneos',
      url: '/torneos',
      icon: 'trophy',
      color: 'warning',
      badge: 0,
      badgeColor: 'warning'
    },
    {
      title: 'Equipos',
      url: '/equipos',
      icon: 'shield',
      color: 'primary',
      badge: 0,
      badgeColor: 'primary'
    },
    {
      title: 'Jugadores',
      url: '/jugadores',
      icon: 'people',
      color: 'success',
      badge: 0,
      badgeColor: 'success'
    },
    {
      title: 'Partidos',
      url: '/partidos',
      icon: 'football',
      color: 'danger',
      badge: 0,
      badgeColor: 'danger'
    },
    {
      title: 'Calendario',
      url: '/calendario',
      icon: 'calendar',
      color: 'tertiary',
      badge: 0,
      badgeColor: 'tertiary'
    }
  ];

  ventasPages: MenuItem[] = [
    {
      title: 'Punto de Venta',
      url: '/ventas/pos',
      icon: 'cash',
      color: 'success',
      badge: 0,
      badgeColor: 'success'
    },
    {
      title: 'Productos',
      url: '/productos',
      icon: 'cube',
      color: 'info',
      badge: 0,
      badgeColor: 'info'
    },
    {
      title: 'Inventario',
      url: '/inventario',
      icon: 'cube',
      color: 'warning',
      badge: 0,
      badgeColor: 'warning'
    },
    {
      title: 'Ventas',
      url: '/ventas',
      icon: 'receipt',
      color: 'primary',
      badge: 0,
      badgeColor: 'primary'
    },
    {
      title: 'Reportes',
      url: '/reportes',
      icon: 'analytics',
      color: 'tertiary',
      badge: 0,
      badgeColor: 'tertiary'
    }
  ];

  constructor() {
    addIcons({
      // Iconos principales
      statsChartOutline, statsChartSharp, trophyOutline, trophySharp,
      peopleOutline, peopleSharp, personOutline, personSharp,
      cartOutline, cartSharp, receiptOutline, receiptSharp,
      cubeOutline, cubeSharp, cashOutline, cashSharp,
      businessOutline, businessSharp, swapHorizontalOutline, swapHorizontal,

      // Iconos mejorados
      speedometerOutline, speedometer, settingsOutline, settingsSharp,
      cogOutline, cog, helpCircleOutline, helpCircle,
      logOutOutline, logOut, checkmarkCircle, checkmarkCircleOutline,
      shieldOutline, shield, footballOutline, football,
      shirtOutline, shirt, calendarOutline, calendar,
      walletOutline, wallet, analyticsOutline, analytics,
      menuOutline, menu, closeOutline, close,
      notificationsOutline, notifications,
      personCircleOutline, personCircle
    });
  }

  ngOnInit() {
    this.cargarPolideportivoSeleccionado();
    this.cargarEstadisticas();

    // Escuchar cambios en el polideportivo
    this.storageService.watchPolideportivoId().subscribe(id => {
      if (id) {
        this.cargarPolideportivoSeleccionado();
        this.cargarEstadisticas();
      }
    });

    // Actualizar estadísticas cada 5 minutos
    setInterval(() => {
      this.cargarEstadisticas();
    }, 300000); // 5 minutos
  }

  cargarPolideportivoSeleccionado() {
    const id = this.storageService.getPolideportivoId();
    if (id) {
      this.polideportivoService.obtenerPorId(id).subscribe({
        next: (poli) => {
          this.polideportivoNombre = poli.nombre;
        },
        error: () => {
          this.polideportivoNombre = 'Gestión Deportiva';
        }
      });
    }
  }

  async cargarEstadisticas() {
    try {
      const polideportivoId = this.storageService.getPolideportivoId();

      if (polideportivoId) {
        // Cargar torneos activos - CORREGIDO: usar listarTorneosPorPolideportivo
        this.torneoService.listarTorneosPorPolideportivo(polideportivoId).subscribe({
          next: (torneos: TorneoDTO[]) => {
            const torneosActivos = torneos.filter((t: TorneoDTO) => t.estado === 'ACTIVO').length;
            this.deportesPages[0].badge = torneosActivos;
          }
        });

        // Cargar equipos
        this.equipoService.listarTodos().subscribe({
          next: (equipos) => {
            this.deportesPages[1].badge = equipos.length;
          }
        });

        // Cargar jugadores
        this.jugadorService.listarTodos().subscribe({
          next: (jugadores) => {
            this.deportesPages[2].badge = jugadores.length;
          }
        });
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  }

  cambiarPolideportivo() {
    this.router.navigate(['/polideportivos/selector']);
  }

  async abrirAyuda() {
    const modal = await this.modalController.create({
      component: 'HelpModalComponent', // Deberías crear este componente
      componentProps: {
        title: 'Centro de Ayuda',
        content: 'Aquí puedes encontrar ayuda sobre el sistema.'
      }
    });
    return await modal.present();
  }

  async cerrarSesion() {
    const alert = await this.alertController.create({
      header: '¿Cerrar sesión?',
      message: '¿Estás seguro de que quieres cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Cerrar sesión',
          handler: () => {
            // Lógica para cerrar sesión
            this.storageService.clear();
            this.router.navigate(['/login']);
          }
        }
      ]
    });
    await alert.present();
  }

  getOnlineStatus(): string {
    return navigator.onLine ? 'En línea' : 'Sin conexión';
  }
}
