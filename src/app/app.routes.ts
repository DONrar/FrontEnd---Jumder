// src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  // ==================== ROOT ====================
  {
    path: '',
    redirectTo: 'polideportivos/selector',
    pathMatch: 'full'
  },

  // ==================== POLIDEPORTIVOS ====================
  {
    path: 'polideportivos',
    children: [
      {
        path: 'selector',
        loadComponent: () => import('./pages/polideportivo/polideportivo-selector/polideportivo-selector.page').then(m => m.PolideportivoSelectorPage)
      },
      {
        path: 'nuevo',
        loadComponent: () => import('./pages/polideportivo/polideportivo-form/polideportivo-form.page').then(m => m.PolideportivoFormPage)
      },
      {
        path: ':id/editar',
        loadComponent: () => import('./pages/polideportivo/polideportivo-form/polideportivo-form.page').then(m => m.PolideportivoFormPage)
      }
    ]
  },

  // ==================== DASHBOARD ====================
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage)
  },

  // ==================== TORNEOS ====================
  {
    path: 'torneos',
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/torneos/torneos-list/torneos-list.page').then(m => m.TorneosListPage)
      },
      {
        path: 'nuevo',
        loadComponent: () => import('./pages/torneos/torneo-form/torneo-form.page').then(m => m.TorneoFormPage)
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/torneos/torneo-detail/torneo-detail.page').then(m => m.TorneoDetailPage)
      },
      {
        path: ':id/editar',
        loadComponent: () => import('./pages/torneos/torneo-form/torneo-form.page').then(m => m.TorneoFormPage)
      },
      {
        path: ':torneoId/partidos',
        loadComponent: () => import('./pages/partidos/partidos-list/partidos-list.page').then(m => m.PartidosListPage)
      }
    ]
  },

  // ==================== CALENDARIO ====================
  {
    path: 'calendario',
    loadComponent: () => import('./pages/calendario/calendario.page').then(m => m.CalendarioPage)
  },

  // ==================== PARTIDOS ====================
  {
    path: 'partidos/:id',
    loadComponent: () => import('./pages/partidos/partido-detail/partido-detail.page').then(m => m.PartidoDetailPage)
  },

  // ==================== JUGADORES ====================
  {
    path: 'jugadores',
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/jugadores/jugadores-list/jugadores-list.page').then(m => m.JugadoresListPage)
      },
      {
        path: 'nuevo',
        loadComponent: () => import('./pages/jugadores/jugador-form/jugador-form.page').then(m => m.JugadorFormPage)
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/jugadores/jugador-detail/jugador-detail.page').then(m => m.JugadorDetailPage)
      },
      {
        path: ':id/editar',
        loadComponent: () => import('./pages/jugadores/jugador-form/jugador-form.page').then(m => m.JugadorFormPage)
      }   
    ]
  },

  // ==================== VENTAS ====================
  {
    path: 'ventas',
    children: [
      {
        path: '',
        redirectTo: 'pos',
        pathMatch: 'full'
      },
      {
        path: 'pos',
        loadComponent: () => import('./pages/ventas-pos/ventas-pos.page').then(m => m.VentasPosPage)
      }
    ]
  },

  // ==================== PRODUCTOS ====================
  {
    path: 'productos',
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/productos/productos-list/productos-list.page').then(m => m.ProductosListPage)
      },
      {
        path: 'nuevo',
        loadComponent: () => import('./pages/productos/producto-form/producto-form.page').then(m => m.ProductoFormPage)
      },
      {
        path: ':id/editar',
        loadComponent: () => import('./pages/productos/producto-form/producto-form.page').then(m => m.ProductoFormPage)
      }
    ]
  },
  {
    path: 'inventario',
    loadComponent: () => import('./pages/inventario/inventario.page').then(m => m.InventarioPage)
  },
  {
    path: 'reportes',
    loadComponent: () => import('./pages/reportes/reportes.page').then(m => m.ReportesPage)
  },
  // ==================== EQUIPOS ====================
  {
    path: 'equipos',
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/equipos/equipos-list/equipos-list.page').then(m => m.EquiposListPage)
      },
      {
        path: 'nuevo',
        loadComponent: () => import('./pages/equipos/equipo-form/equipo-form.page').then(m => m.EquipoFormPage)
      }, 
      {
        path: ':id',
        loadComponent: () => import('./pages/equipos/equipo-detail/equipo-detail.page').then(m => m.EquipoDetailPage)
      },
      {
        path: ':id/editar',
        loadComponent: () => import('./pages/equipos/equipo-form/equipo-form.page').then(m => m.EquipoFormPage)
      }
    ]
  },

  // ==================== WILDCARD (DEBE IR AL FINAL) ====================
  {
    path: '**',
    redirectTo: 'dashboard'
  },

];
