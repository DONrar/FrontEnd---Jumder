// src/app/pages/ventas/ventas-pos/ventas-pos.page.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
  IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList,
  IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonBadge,
  IonSearchbar, IonGrid, IonRow, IonCol, IonChip, IonFab, IonFabButton,
  IonModal, IonToast, IonAlert, IonSegment, IonSegmentButton, IonSkeletonText
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  cartOutline, addOutline, removeOutline, trashOutline, cashOutline,
  cardOutline, searchOutline, closeOutline, checkmarkOutline, receiptOutline,
  cubeOutline, pricetagOutline, checkmarkCircleOutline, refreshOutline
} from 'ionicons/icons';
import { VentaService } from '../..//services/venta-service';
import { ProductoService } from '../../services/producto-service';
import { StorageService } from '../../services/storage-service';
import { VentaDTO, DetalleVentaDTO, Producto } from '../../models/torneo.model';

interface ProductoCarrito extends Producto {
  cantidadCarrito: number;
  subtotalCarrito: number;
}

@Component({
  selector: 'app-ventas-pos',
  templateUrl: './ventas-pos.page.html',
  styleUrls: ['./ventas-pos.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonTitle, IonToolbar,
    IonButtons, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle,
    IonCardContent, IonList, IonItem, IonLabel, IonInput, IonSelect,
    IonSelectOption, IonBadge, IonSearchbar, IonGrid, IonRow, IonCol,
    IonChip, IonFab, IonFabButton, IonModal, IonToast, IonAlert,
    IonSegment, IonSegmentButton, IonSkeletonText
  ]
})
export class VentasPosPage implements OnInit {
  private ventaService = inject(VentaService);
  private productoService = inject(ProductoService);
  private storageService = inject(StorageService);
  private router = inject(Router);

  productosDisponibles: Producto[] = [];
  productosFiltrados: Producto[] = [];
  carrito: ProductoCarrito[] = [];

  searchText = '';
  categoriaFilter = 'TODOS';

  // Venta
  clienteNombre = '';
  metodoPago: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' = 'EFECTIVO';
  descuento = 0;
  partidoId?: number;

  // Modales
  showFinalizarModal = false;
  showConfirmModal = false;

  // Toast
  showToast = false;
  toastMessage = '';
  toastColor = 'success';

  // Loading
  procesandoVenta = false;
  loadingProductos = true;

  usuarioId = 1; // TODO: Obtener del contexto/storage
  polideportivoId?: number;

  constructor() {
    addIcons({
      cartOutline, receiptOutline, cubeOutline, searchOutline, removeOutline,
      addOutline, trashOutline, checkmarkOutline, closeOutline,
      checkmarkCircleOutline, cashOutline, cardOutline, pricetagOutline,
      refreshOutline
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

    this.loadingProductos = true;
    this.productoService.listarActivos(this.polideportivoId).subscribe({
      next: (data) => {
        this.productosDisponibles = data;
        this.productosFiltrados = [...data];
        this.loadingProductos = false;
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.mostrarToast('Error al cargar productos', 'danger');
        this.loadingProductos = false;
      }
    });
  }

  // ==================== BÚSQUEDA Y FILTROS ====================
  onSearchChange(event: any) {
    this.searchText = event.detail.value || '';
    this.aplicarFiltros();
  }

  onCategoriaChange(event: any) {
    this.categoriaFilter = event.detail.value;
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    let filtrados = [...this.productosDisponibles];

    // Filtro por búsqueda
    if (this.searchText.trim()) {
      const search = this.searchText.toLowerCase();
      filtrados = filtrados.filter(p =>
        p.nombre.toLowerCase().includes(search) ||
        p.descripcion?.toLowerCase().includes(search)
      );
    }

    // Filtro por categoría
    if (this.categoriaFilter !== 'TODOS') {
      filtrados = filtrados.filter(p => p.categoria === this.categoriaFilter);
    }

    // Solo productos activos con stock
    filtrados = filtrados.filter(p => p.activo && p.stock > 0);

    this.productosFiltrados = filtrados;
  }

  getCategorias(): string[] {
    const categorias = new Set(this.productosDisponibles.map(p => p.categoria));
    return ['TODOS', ...Array.from(categorias)];
  }

  // Helper para mostrar nombres amigables de categorías
  getNombreCategoria(categoria: string): string {
    const nombres: { [key: string]: string } = {
      'CERVEZA': 'Cerveza',
      'BEBIDA_ALCOHOLICA': 'Bebida Alcohólica',
      'GASEOSA': 'Gaseosa',
      'AGUA': 'Agua',
      'BEBIDA_ENERGIZANTE': 'Energizante',
      'SNACK': 'Snack',
      'COMIDA': 'Comida',
      'CIGARRILLOS': 'Cigarrillos',
      'OTROS': 'Otros',
      'TODOS': 'Todos'
    };
    return nombres[categoria] || categoria;
  }

  // ==================== CARRITO ====================
  agregarAlCarrito(producto: Producto) {
    const existente = this.carrito.find(p => p.id === producto.id);

    if (existente) {
      if (existente.cantidadCarrito < producto.stock) {
        existente.cantidadCarrito++;
        existente.subtotalCarrito = existente.cantidadCarrito * existente.precio;
        this.mostrarToast(`${producto.nombre} x${existente.cantidadCarrito}`, 'success');
      } else {
        this.mostrarToast('Stock insuficiente', 'warning');
      }
    } else {
      this.carrito.push({
        ...producto,
        cantidadCarrito: 1,
        subtotalCarrito: producto.precio
      });
      this.mostrarToast(`${producto.nombre} agregado al carrito`, 'success');
    }
  }

  aumentarCantidad(item: ProductoCarrito) {
    if (item.cantidadCarrito < item.stock) {
      item.cantidadCarrito++;
      item.subtotalCarrito = item.cantidadCarrito * item.precio;
    } else {
      this.mostrarToast('Stock máximo alcanzado', 'warning');
    }
  }

  disminuirCantidad(item: ProductoCarrito) {
    if (item.cantidadCarrito > 1) {
      item.cantidadCarrito--;
      item.subtotalCarrito = item.cantidadCarrito * item.precio;
    }
  }

  eliminarDelCarrito(item: ProductoCarrito) {
    const index = this.carrito.findIndex(p => p.id === item.id);
    if (index > -1) {
      this.carrito.splice(index, 1);
      this.mostrarToast('Producto eliminado', 'primary');
    }
  }

  vaciarCarrito() {
    this.carrito = [];
    this.mostrarToast('Carrito vaciado', 'primary');
  }

  // ==================== CÁLCULOS ====================
  calcularSubtotal(): number {
    return this.carrito.reduce((sum, item) => sum + item.subtotalCarrito, 0);
  }

  calcularTotal(): number {
    return this.calcularSubtotal() - this.descuento;
  }

  getTotalItems(): number {
    return this.carrito.reduce((sum, item) => sum + item.cantidadCarrito, 0);
  }

  // ==================== FINALIZAR VENTA ====================
  abrirModalFinalizar() {
    if (this.carrito.length === 0) {
      this.mostrarToast('El carrito está vacío', 'warning');
      return;
    }
    this.showFinalizarModal = true;
  }

  finalizarVenta() {
    if (this.procesandoVenta || !this.polideportivoId) return;

    this.procesandoVenta = true;

    const detalles: DetalleVentaDTO[] = this.carrito.map(item => ({
      productoId: item.id!,  // ✅ Non-null assertion porque sabemos que existe
      cantidad: item.cantidadCarrito,
      precioUnitario: item.precio,
      subtotal: item.subtotalCarrito,
      descuento: 0,
      total: item.subtotalCarrito
    }));

    const venta: VentaDTO = {
      cajeroNombre: this.usuarioId.toString(),
      clienteNombre: this.clienteNombre || 'Cliente General',
      subtotal: this.calcularSubtotal(),
      descuento: this.descuento,
      total: this.calcularTotal(),
      metodoPago: this.metodoPago,
      estado: 'COMPLETADA',
      pagada: true,
      polideportivoId: this.polideportivoId,
      detalles: detalles,
      partidoId: this.partidoId
    };

    this.ventaService.registrarVenta(venta).subscribe({
      next: (response) => {
        this.mostrarToast('¡Venta registrada exitosamente!', 'success');
        this.showFinalizarModal = false;
        this.showConfirmModal = true;
        this.procesandoVenta = false;

        // Recargar productos para actualizar stock desde el servidor
        this.cargarProductos();

        // Limpiar formulario
        setTimeout(() => {
          this.limpiarVenta();
        }, 2000);
      },
      error: (error) => {
        console.error('Error al registrar venta:', error);
        this.mostrarToast('Error al registrar la venta', 'danger');
        this.procesandoVenta = false;
      }
    });
  }

  limpiarVenta() {
    this.carrito = [];
    this.clienteNombre = '';
    this.descuento = 0;
    this.metodoPago = 'EFECTIVO';
    this.partidoId = undefined;
    this.showConfirmModal = false;
  }

  verHistorialVentas() {
    this.router.navigate(['/ventas/historial']);
  }

  // ==================== UTILIDADES ====================
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  }

  getStockColor(producto: Producto): string {
    if (producto.stock <= producto.stockMinimo) return 'danger';
    if (producto.stock <= producto.stockMinimo * 2) return 'warning';
    return 'success';
  }

  mostrarToast(mensaje: string, color: string) {
    this.toastMessage = mensaje;
    this.toastColor = color;
    this.showToast = true;
  }
}
