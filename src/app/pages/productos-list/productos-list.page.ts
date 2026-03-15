// src/app/pages/productos/productos-list/productos-list.page.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
  IonIcon, IonList, IonItem, IonLabel, IonCard, IonCardHeader,
  IonCardTitle, IonCardContent, IonBadge, IonSearchbar, IonFab,
  IonFabButton, IonRefresher, IonRefresherContent, IonSkeletonText,
  IonToast, IonAlert, IonSegment, IonSegmentButton, IonGrid, IonRow,
  IonCol, IonChip, AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline, createOutline, trashOutline, cubeOutline, pricetagOutline,
  refreshOutline, searchOutline, warningOutline
} from 'ionicons/icons';
import { ProductoService } from '../../services/producto-service';
import { StorageService } from '../../services/storage-service';
import { Producto } from '../../models/torneo.model';

@Component({
  selector: 'app-productos-list',
  templateUrl: './productos-list.page.html',
  styleUrls: ['./productos-list.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonTitle, IonToolbar,
    IonButtons, IonButton, IonIcon, IonList, IonItem, IonLabel, IonCard,
    IonCardHeader, IonCardTitle, IonCardContent, IonBadge, IonSearchbar,
    IonFab, IonFabButton, IonRefresher, IonRefresherContent, IonSkeletonText,
    IonToast, IonAlert, IonSegment, IonSegmentButton, IonGrid, IonRow,
    IonCol, IonChip
  ]
})
export class ProductosListPage implements OnInit {
  private productoService = inject(ProductoService);
  private storageService = inject(StorageService);
  private router = inject(Router);
  private alertController = inject(AlertController);

  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  loading = true;
  searchText = '';
  segmentValue = 'todos';
  polideportivoId?: number;

  // Toast
  showToast = false;
  toastMessage = '';
  toastColor = 'success';

  constructor() {
    addIcons({
      addOutline, createOutline, trashOutline, cubeOutline, pricetagOutline,
      refreshOutline, searchOutline, warningOutline
    });
  }

  ngOnInit() {
    this.polideportivoId = this.storageService.getPolideportivoId() || undefined;
    if (this.polideportivoId) {
      this.cargarProductos();
    } else {
      this.router.navigate(['/polideportivos/selector']);
    }
  }

  cargarProductos() {
    if (!this.polideportivoId) return;

    this.loading = true;
    this.productoService.listarPorPolideportivo(this.polideportivoId).subscribe({
      next: (data) => {
        this.productos = data;
        this.aplicarFiltros();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.mostrarToast('Error al cargar productos', 'danger');
        this.loading = false;
      }
    });
  }

  handleRefresh(event: any) {
    if (!this.polideportivoId) {
      event.target.complete();
      return;
    }

    this.productoService.listarPorPolideportivo(this.polideportivoId).subscribe({
      next: (data) => {
        this.productos = data;
        this.aplicarFiltros();
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

  onSearchChange(event: any) {
    this.searchText = event.detail.value || '';
    this.aplicarFiltros();
  }

  onSegmentChange(event: any) {
    this.segmentValue = event.detail.value;
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    let filtrados = [...this.productos];

    // Filtro por búsqueda
    if (this.searchText.trim()) {
      const search = this.searchText.toLowerCase();
      filtrados = filtrados.filter(p =>
        p.nombre.toLowerCase().includes(search) ||
        p.descripcion?.toLowerCase().includes(search) ||
        p.categoria?.toLowerCase().includes(search)
      );
    }

    // Filtro por segmento
    switch (this.segmentValue) {
      case 'activos':
        filtrados = filtrados.filter(p => p.activo);
        break;
      case 'inactivos':
        filtrados = filtrados.filter(p => !p.activo);
        break;
      case 'bajo-stock':
        filtrados = filtrados.filter(p => p.stock <= p.stockMinimo);
        break;
    }

    this.productosFiltrados = filtrados;
  }

  crearProducto() {
    this.router.navigate(['/productos/nuevo']);
  }

  editarProducto(producto: Producto) {
    this.router.navigate(['/productos', producto.id, 'editar']);
  }

  async eliminarProducto(producto: Producto) {
    const alert = await this.alertController.create({
      header: '¿Eliminar producto?',
      message: `¿Estás seguro de eliminar "${producto.nombre}"? Esta acción desactivará el producto.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            if (producto.id) {
              this.productoService.eliminar(producto.id).subscribe({
                next: () => {
                  this.mostrarToast('Producto eliminado', 'success');
                  this.cargarProductos();
                },
                error: (error) => {
                  console.error('Error al eliminar:', error);
                  this.mostrarToast('Error al eliminar producto', 'danger');
                }
              });
            }
          }
        }
      ]
    });

    await alert.present();
  }

  getCategorias(): string[] {
    const categorias = new Set(this.productos.map(p => p.categoria));
    return Array.from(categorias);
  }

  getStockColor(producto: Producto): string {
    if (producto.stock <= producto.stockMinimo) return 'danger';
    if (producto.stock <= producto.stockMinimo * 2) return 'warning';
    return 'success';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  }

  mostrarToast(mensaje: string, color: string) {
    this.toastMessage = mensaje;
    this.toastColor = color;
    this.showToast = true;
  }
}
