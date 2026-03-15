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
        loadComponent: () => import('./pages/polideportivo-selector/polideportivo-selector.page').then(m => m.PolideportivoSelectorPage)
      },
      {
        path: 'nuevo',
        loadComponent: () => import('./pages/polideportivo-form/polideportivo-form.page').then(m => m.PolideportivoFormPage)
      },
      {
        path: ':id/editar',
        loadComponent: () => import('./pages/polideportivo-form/polideportivo-form.page').then(m => m.PolideportivoFormPage)
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
        loadComponent: () => import('./pages/torneos-list/torneos-list.page').then(m => m.TorneosListPage)
      },
      {
        path: 'nuevo',
        loadComponent: () => import('./pages/torneo-form/torneo-form.page').then(m => m.TorneoFormPage)
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/torneo-detail/torneo-detail.page').then(m => m.TorneoDetailPage)
      },
      {
        path: ':id/editar',
        loadComponent: () => import('./pages/torneo-form/torneo-form.page').then(m => m.TorneoFormPage)
      },
      {
        path: ':torneoId/partidos',
        loadComponent: () => import('./pages/partidos-list/partidos-list.page').then(m => m.PartidosListPage)
      }
    ]
  },

  // ==================== PARTIDOS ====================
  {
    path: 'partidos/:id',
    loadComponent: () => import('./pages/partido-detail/partido-detail.page').then(m => m.PartidoDetailPage)
  },

  // ==================== JUGADORES ====================
  {
    path: 'jugadores',
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/jugadores-list/jugadores-list.page').then(m => m.JugadoresListPage)
      },
      {
        path: 'nuevo',
        loadComponent: () => import('./pages/jugador-form/jugador-form.page').then(m => m.JugadorFormPage)
      },
      {
        path: ':id/editar',
        loadComponent: () => import('./pages/jugador-form/jugador-form.page').then(m => m.JugadorFormPage)
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
        loadComponent: () => import('./pages/productos-list/productos-list.page').then(m => m.ProductosListPage)
      },
      {
        path: 'nuevo',
        loadComponent: () => import('./pages/producto-form/producto-form.page').then(m => m.ProductoFormPage)
      },
      {
        path: ':id/editar',
        loadComponent: () => import('./pages/producto-form/producto-form.page').then(m => m.ProductoFormPage)
      }
    ]
  },

  // ==================== EQUIPOS ====================
  {
    path: 'equipos',
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/equipos-list/equipos-list.page').then(m => m.EquiposListPage)
      },
      {
        path: 'nuevo',
        loadComponent: () => import('./pages/equipo-form/equipo-form.page').then(m => m.EquipoFormPage)
      }, 
      {
        path: ':id/editar',
        loadComponent: () => import('./pages/equipo-form/equipo-form.page').then(m => m.EquipoFormPage)
      }
    ]
  },

  // ==================== WILDCARD (DEBE IR AL FINAL) ====================
  {
    path: '**',
    redirectTo: 'dashboard'
  },

];
