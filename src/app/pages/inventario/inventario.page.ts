import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem,
  IonLabel, IonBadge, IonButton, IonIcon, IonButtons, IonMenuButton,
  IonBackButton, IonSearchbar, IonSegment, IonSegmentButton,
  IonCard, IonCardContent, IonChip, IonProgressBar, ModalController,
  IonRefresher, IonRefresherContent, IonFab, IonFabButton, IonNote, IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  cubeOutline, alertCircleOutline, addOutline, refreshOutline,
  searchOutline, arrowUpOutline, statsChartOutline
} from 'ionicons/icons';

import { ProductoService } from '../../services/producto-service';
import { VentaService } from '../../services/venta-service';
import { StorageService } from '../../services/storage-service';
import { Producto } from '../../models/torneo.model';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.page.html',
  styleUrls: ['./inventario.page.scss'],
  standalone: true,
  imports: [IonSpinner,
    CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle,
    IonContent, IonList, IonItem, IonLabel, IonBadge, IonButton,
    IonIcon, IonButtons, IonMenuButton, IonBackButton, IonSearchbar,
    IonSegment, IonSegmentButton, IonCard, IonCardContent, IonChip,
    IonProgressBar, IonRefresher, IonRefresherContent, IonFab,
    IonFabButton, IonNote
  ]
})
export class InventarioPage implements OnInit {
  private productoService = inject(ProductoService);
  private ventaService = inject(VentaService);
  private storageService = inject(StorageService);
  private modalController = inject(ModalController);

  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  productosBajoStock: Producto[] = [];

  loading = false;
  filtro = 'todos';
  terminoBusqueda = '';

  constructor() {
    addIcons({
      cubeOutline, alertCircleOutline, addOutline, refreshOutline,
      searchOutline, arrowUpOutline, statsChartOutline
    });
  }

  ngOnInit() {
    this.cargarDatos();
  }

  async cargarDatos() {
    this.loading = true;
    const poliId = this.storageService.getPolideportivoId();
    if (!poliId) return;

    try {
      // Cargar todos los productos
      this.productoService.listarPorPolideportivo(poliId).subscribe({
        next: (data) => {
          this.productos = data;
          this.aplicarFiltros();
          this.loading = false;
        },
        error: (err) => {
          console.error('Error al cargar productos:', err);
          this.loading = false;
        }
      });

      // Cargar bajo stock para alertas
      this.ventaService.listarProductosBajoStock(poliId).subscribe({
        next: (data) => {
          this.productosBajoStock = data;
        }
      });
    } catch (error) {
      console.error('Error general:', error);
      this.loading = false;
    }
  }

  handleRefresh(event: any) {
    this.cargarDatos().then(() => {
      event.target.complete();
    });
  }

  aplicarFiltros() {
    let resultado = [...this.productos];

    // Filtro por segmento
    if (this.filtro === 'bajo_stock') {
      resultado = resultado.filter(p => p.stock <= p.stockMinimo);
    }

    // Filtro por búsqueda
    if (this.terminoBusqueda) {
      const term = this.terminoBusqueda.toLowerCase();
      resultado = resultado.filter(p =>
        p.nombre.toLowerCase().includes(term) ||
        p.categoria?.toLowerCase().includes(term)
      );
    }

    this.productosFiltrados = resultado;
  }

  onSearch(event: any) {
    this.terminoBusqueda = event.detail.value;
    this.aplicarFiltros();
  }

  getStockColor(producto: Producto): string {
    if (producto.stock === 0) return 'danger';
    if (producto.stock <= producto.stockMinimo) return 'warning';
    return 'success';
  }

  getStockLabel(producto: Producto): string {
    if (producto.stock === 0) return 'Agotado';
    if (producto.stock <= producto.stockMinimo) return 'Stock Bajo';
    return 'Disponible';
  }

  async registrarEntrada() {
    // Aquí se abriría un modal para registrar entrada
    console.log('Abrir modal de entrada');
  }
}
