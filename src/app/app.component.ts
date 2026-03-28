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
  statsChartOutline, statsChartSharp, trophyOutline, trophySharp,
  peopleOutline, peopleSharp, personOutline, personSharp,
  cartOutline, cartSharp, receiptOutline, receiptSharp,
  cubeOutline, cubeSharp, cashOutline, cashSharp,
  businessOutline, businessSharp, swapHorizontalOutline, swapHorizontal,
  speedometerOutline, speedometer, settingsOutline, settingsSharp,
  cogOutline, cog, helpCircleOutline, helpCircle,
  logOutOutline, logOut, checkmarkCircle, checkmarkCircleOutline,
  shieldOutline, shield, footballOutline, football,
  shirtOutline, shirt, calendarOutline, calendar,
  walletOutline, wallet, analyticsOutline, analytics,
  menuOutline, menu, closeOutline, close,
  notificationsOutline, notifications,
  personCircleOutline, personCircle,
  trophy, cash, cube, receipt, people,
  statsChart, business
} from 'ionicons/icons';

import { StorageService } from './services/storage-service';
import { PolideportivoService } from './services/polideportivo-service';
import { TorneoService } from './services/torneo-service';
import { EquipoService } from './services/equipo-service';
import { JugadorService } from './services/jugador-services';
import { TorneoDTO } from './models/torneo.model';

interface MenuItem {
  title: string;
  url?: string;
  icon: any;
  color: string;
  badge?: number;
  badgeColor?: string;
  action?: () => void;
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

  polideportivoNombre = 'Gestión Deportiva';
  version = '1.5.0';
  estadisticas: any = null;
  icons = { statsChart, business };

  private torneoActivoId: number | null = null;

  deportesPages: MenuItem[] = [];
  ventasPages: MenuItem[] = [];

  constructor() {
    addIcons({
      statsChartOutline, statsChartSharp, trophyOutline, trophySharp,
      peopleOutline, peopleSharp, personOutline, personSharp,
      cartOutline, cartSharp, receiptOutline, receiptSharp,
      cubeOutline, cubeSharp, cashOutline, cashSharp,
      businessOutline, businessSharp, swapHorizontalOutline, swapHorizontal,
      speedometerOutline, speedometer, settingsOutline, settingsSharp,
      cogOutline, cog, helpCircleOutline, helpCircle,
      logOutOutline, logOut, checkmarkCircle, checkmarkCircleOutline,
      shieldOutline, shield, footballOutline, football,
      shirtOutline, shirt, calendarOutline, calendar,
      walletOutline, wallet, analyticsOutline, analytics,
      menuOutline, menu, closeOutline, close,
      notificationsOutline, notifications,
      personCircleOutline, personCircle,
      trophy, cash, cube, receipt, people
    });
  }

  ngOnInit() {
    this.inicializarMenuItems();
    this.cargarPolideportivoSeleccionado();
    this.cargarEstadisticas();

    this.storageService.watchPolideportivoId().subscribe(id => {
      if (id) {
        this.cargarPolideportivoSeleccionado();
        this.cargarEstadisticas();
      }
    });

    setInterval(() => { this.cargarEstadisticas(); }, 300000);
  }

  private inicializarMenuItems() {
    this.deportesPages = [
      {
        title: 'Torneos',
        url: '/torneos',
        icon: trophy,
        color: 'warning',
        badge: 0,
        badgeColor: 'warning'
      },
      {
        title: 'Equipos',
        url: '/equipos',
        icon: shield,
        color: 'primary',
        badge: 0,
        badgeColor: 'primary'
      },
      {
        title: 'Jugadores',
        url: '/jugadores',
        icon: people,
        color: 'success',
        badge: 0,
        badgeColor: 'success'
      },
      {
        title: 'Partidos',
        icon: football,
        color: 'danger',
        badge: 0,
        badgeColor: 'danger',
        action: () => this.navegarAPartidos()
      },
      {
        title: 'Calendario',
        url: '/calendario',
        icon: calendar,
        color: 'tertiary',
        badge: 0,
        badgeColor: 'tertiary'
      }
    ];

    this.ventasPages = [
      { title: 'Punto de Venta', url: '/ventas/pos', icon: cash, color: 'success', badge: 0, badgeColor: 'success' },
      { title: 'Productos', url: '/productos', icon: cube, color: 'info', badge: 0, badgeColor: 'info' },
      { title: 'Inventario', url: '/inventario', icon: cube, color: 'warning', badge: 0, badgeColor: 'warning' },
      { title: 'Reportes', url: '/reportes', icon: analytics, color: 'tertiary', badge: 0, badgeColor: 'tertiary' }
    ];
  }

  navegarAPartidos() {
    const id = this.torneoActivoId || this.storageService.getItem('torneoActivoId');
    if (id) {
      this.router.navigate(['/torneos', id, 'partidos']);
    } else {
      this.router.navigate(['/torneos']);
    }
  }

  setTorneoActivo(torneoId: number) {
    this.torneoActivoId = torneoId;
    this.storageService.setItem('torneoActivoId', torneoId.toString());
  }

  cargarPolideportivoSeleccionado() {
    const id = this.storageService.getPolideportivoId();

    const torneoGuardado = this.storageService.getItem('torneoActivoId');
    if (torneoGuardado) {
      this.torneoActivoId = +torneoGuardado;
    }

    if (id) {
      this.polideportivoService.obtenerPorId(id).subscribe({
        next: (poli) => { this.polideportivoNombre = poli.nombre; },
        error: () => { this.polideportivoNombre = 'Gestión Deportiva'; }
      });
    }
  }

  async cargarEstadisticas() {
    try {
      const polideportivoId = this.storageService.getPolideportivoId();

      if (polideportivoId) {
        this.torneoService.listarTorneosPorPolideportivo(polideportivoId).subscribe({
          next: (torneos: TorneoDTO[]) => {
            const torneosActivos = torneos.filter((t: TorneoDTO) => t.estado === 'ACTIVO');
            this.deportesPages[0].badge = torneosActivos.length;

            if (torneosActivos.length > 0 && !this.torneoActivoId) {
              const primerTorneoId = torneosActivos[0].id;
              if (primerTorneoId !== undefined) {
                this.torneoActivoId = primerTorneoId;
                this.storageService.setItem('torneoActivoId', primerTorneoId.toString());
              }
            }
          }
        });

        this.equipoService.listarTodos().subscribe({
          next: (equipos) => { this.deportesPages[1].badge = equipos.length; }
        });

        this.jugadorService.listarTodos().subscribe({
          next: (jugadores) => { this.deportesPages[2].badge = jugadores.length; }
        });
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  }

  onMenuItemClick(item: MenuItem) {
    if (item.action) {
      item.action();
    } else if (item.url) {
      this.router.navigate([item.url]);
    }
  }

  cambiarPolideportivo() {
    this.router.navigate(['/polideportivos/selector']);
  }

  async abrirAyuda() {
    const modal = await this.modalController.create({
      component: 'HelpModalComponent',
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
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Cerrar sesión',
          handler: () => {
            this.storageService.clear();
            this.torneoActivoId = null;
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

  isItemActive(item: MenuItem): boolean {
    const url = this.router.url;

    // Caso especial: Partidos es una subruta de Torneos
    if (item.title === 'Partidos') {
      return url.includes('/partidos');
    }

    if (item.title === 'Torneos') {
      // Activo si es /torneos pero NO si es /partidos
      return url.startsWith('/torneos') && !url.includes('/partidos');
    }

    if (item.url) {
      if (item.url === '/dashboard') {
        return url === '/dashboard' || url === '/';
      }
      return url.startsWith(item.url);
    }

    return false;
  }
}