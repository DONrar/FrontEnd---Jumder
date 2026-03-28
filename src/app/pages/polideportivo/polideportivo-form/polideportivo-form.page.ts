// src/app/pages/polideportivos/polideportivo-form/polideportivo-form.page.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
  IonIcon, IonList, IonItem, IonLabel, IonInput, IonCard,
  IonCardHeader, IonCardTitle, IonCardContent, IonBackButton, IonToast, IonMenuButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { saveOutline, closeOutline } from 'ionicons/icons';
import { PolideportivoService } from '../../../services/polideportivo-service';
import { PolideportivoDTO } from '../../../models/polideportivo.model';

@Component({
  selector: 'app-polideportivo-form',
  templateUrl: './polideportivo-form.page.html',
  styleUrls: ['./polideportivo-form.page.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, IonContent, IonHeader, IonTitle,
    IonToolbar, IonButtons, IonButton, IonIcon, IonList, IonItem, IonLabel,
    IonInput, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonBackButton, IonToast, IonMenuButton
  ]
})
export class PolideportivoFormPage implements OnInit {
  private fb = inject(FormBuilder);
  private polideportivoService = inject(PolideportivoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  polideportivoForm!: FormGroup;
  isEditMode = false;
  polideportivoId?: number;
  loading = false;

  // Toast
  showToast = false;
  toastMessage = '';
  toastColor = 'success';

  constructor() {
    addIcons({ saveOutline, closeOutline });
    this.initForm();
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.polideportivoId = +id;
      this.cargarPolideportivo();
    }
  }

  initForm() {
    this.polideportivoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      direccion: [''],
      telefono: ['', [Validators.pattern(/^[0-9]{7,10}$/)]],
      email: ['', [Validators.email]],
      ciudad: ['', Validators.required]
    });
  }

  cargarPolideportivo() {
    if (!this.polideportivoId) return;

    this.loading = true;
    this.polideportivoService.obtenerPorId(this.polideportivoId).subscribe({
      next: (poli) => {
        this.polideportivoForm.patchValue({
          nombre: poli.nombre,
          direccion: poli.direccion,
          telefono: poli.telefono,
          email: poli.email,
          ciudad: poli.ciudad
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar polideportivo:', error);
        this.mostrarToast('Error al cargar el polideportivo', 'danger');
        this.loading = false;
        this.router.navigate(['/polideportivos/selector']);
      }
    });
  }

  guardar() {
    if (this.polideportivoForm.invalid) {
      this.polideportivoForm.markAllAsTouched();
      this.mostrarToast('Por favor completa todos los campos requeridos', 'warning');
      return;
    }

    this.loading = true;
    const polideportivoData: PolideportivoDTO = {
      ...this.polideportivoForm.value,
      activo: true,
      id: this.polideportivoId
    };

    const request = this.isEditMode && this.polideportivoId
      ? this.polideportivoService.actualizar(this.polideportivoId, polideportivoData)
      : this.polideportivoService.crear(polideportivoData);

    request.subscribe({
      next: () => {
        this.mostrarToast(
          this.isEditMode ? 'Polideportivo actualizado correctamente' : 'Polideportivo creado correctamente',
          'success'
        );
        setTimeout(() => {
          this.router.navigate(['/polideportivos/selector']);
        }, 1000);
      },
      error: (error) => {
        console.error('Error al guardar:', error);
        this.mostrarToast('Error al guardar el polideportivo', 'danger');
        this.loading = false;
      }
    });
  }

  cancelar() {
    this.router.navigate(['/polideportivos/selector']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.polideportivoForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.polideportivoForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'Este campo es requerido';
    if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
    if (field.errors['email']) return 'Email inválido';
    if (field.errors['pattern']) return 'Formato inválido (7-10 dígitos)';

    return 'Campo inválido';
  }

  mostrarToast(mensaje: string, color: string) {
    this.toastMessage = mensaje;
    this.toastColor = color;
    this.showToast = true;
  }
}
