// src/app/pages/productos/producto-form/producto-form.page.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
  IonIcon, IonList, IonItem, IonLabel, IonInput, IonCard, IonSelect,
  IonCardHeader, IonCardTitle, IonCardContent, IonBackButton, IonToast,
  IonSelectOption, IonTextarea, IonMenuButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { saveOutline, closeOutline } from 'ionicons/icons';
import { ProductoService } from '../../../services/producto-service';
import { StorageService } from '../../../services/storage-service';
import { Producto } from '../../../models/torneo.model';

@Component({
  selector: 'app-producto-form',
  templateUrl: './producto-form.page.html',
  styleUrls: ['./producto-form.page.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, IonContent, IonHeader, IonTitle,
    IonToolbar, IonButtons, IonButton, IonIcon, IonList, IonItem, IonLabel,
    IonInput, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonBackButton, IonToast, IonSelect, IonSelectOption, IonTextarea, IonMenuButton
  ]
})
export class ProductoFormPage implements OnInit {
  private fb = inject(FormBuilder);
  private productoService = inject(ProductoService);
  private storageService = inject(StorageService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  productoForm!: FormGroup;
  isEditMode = false;
  productoId?: number;
  loading = false;
  polideportivoId?: number;

  categorias = [
    'CERVEZA',
    'BEBIDA_ALCOHOLICA',
    'GASEOSA',
    'AGUA',
    'BEBIDA_ENERGIZANTE',
    'SNACK',
    'COMIDA',
    'CIGARRILLOS',
    'OTROS'
  ];

  // Toast
  showToast = false;
  toastMessage = '';
  toastColor = 'success';

  constructor() {
    addIcons({ saveOutline, closeOutline });
    this.initForm();
  }

  ngOnInit() {
    this.polideportivoId = this.storageService.getPolideportivoId() || undefined;

    if (!this.polideportivoId) {
      this.router.navigate(['/polideportivos/selector']);
      return;
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.productoId = +id;
      this.cargarProducto();
    }
  }

  initForm() {
    this.productoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: [''],
      precio: [0, [Validators.required, Validators.min(0)]],
      costo: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      stockMinimo: [5, [Validators.required, Validators.min(1)]],
      categoria: ['OTROS', Validators.required],
      activo: [true]
    });
  }

  cargarProducto() {
    if (!this.productoId) return;

    this.loading = true;
    this.productoService.obtenerPorId(this.productoId).subscribe({
      next: (producto) => {
        this.productoForm.patchValue({
          nombre: producto.nombre,
          descripcion: producto.descripcion,
          precio: producto.precio,
          costo: producto.costo,
          stock: producto.stock,
          stockMinimo: producto.stockMinimo,
          categoria: producto.categoria,
          activo: producto.activo
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar producto:', error);
        this.mostrarToast('Error al cargar el producto', 'danger');
        this.loading = false;
        this.router.navigate(['/productos']);
      }
    });
  }

  guardar() {
    if (this.productoForm.invalid) {
      this.productoForm.markAllAsTouched();
      this.mostrarToast('Por favor completa todos los campos requeridos', 'warning');
      return;
    }

    if (!this.polideportivoId) {
      this.mostrarToast('Error: No hay polideportivo seleccionado', 'danger');
      return;
    }

    this.loading = true;
    const productoData: Producto = {
      ...this.productoForm.value,
      polideportivoId: this.polideportivoId,
      id: this.productoId
    };

    const request = this.isEditMode && this.productoId
      ? this.productoService.actualizar(this.productoId, productoData)
      : this.productoService.crear(productoData);

    request.subscribe({
      next: () => {
        this.mostrarToast(
          this.isEditMode ? 'Producto actualizado correctamente' : 'Producto creado correctamente',
          'success'
        );
        setTimeout(() => {
          this.router.navigate(['/productos']);
        }, 1000);
      },
      error: (error) => {
        console.error('Error al guardar:', error);
        this.mostrarToast('Error al guardar el producto', 'danger');
        this.loading = false;
      }
    });
  }

  cancelar() {
    this.router.navigate(['/productos']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.productoForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.productoForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'Este campo es requerido';
    if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
    if (field.errors['min']) return `Valor mínimo: ${field.errors['min'].min}`;

    return 'Campo inválido';
  }

  calcularMargen(): number {
    const precio = this.productoForm.get('precio')?.value || 0;
    const costo = this.productoForm.get('costo')?.value || 0;
    if (costo === 0) return 0;
    return ((precio - costo) / costo) * 100;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  }

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
      'OTROS': 'Otros'
    };
    return nombres[categoria] || categoria;
  }

  mostrarToast(mensaje: string, color: string) {
    this.toastMessage = mensaje;
    this.toastColor = color;
    this.showToast = true;
  }
}
