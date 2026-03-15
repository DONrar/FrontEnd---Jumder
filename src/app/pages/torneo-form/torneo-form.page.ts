// src/app/pages/torneos/torneo-form/torneo-form.page.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonList, IonItem, IonLabel, IonInput, IonTextarea, IonSelect, IonSelectOption, IonDatetime, IonDatetimeButton, IonModal, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonBackButton, IonToast, IonMenuButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { saveOutline, closeOutline, calendarOutline, business, pricetag, documentText, flag, grid, people, person, cash, trophy } from 'ionicons/icons';
import { TorneoService } from '../../services/torneo-service';
import { PolideportivoService } from '../../services/polideportivo-service';
import { StorageService } from '../../services/storage-service';
import { TorneoDTO } from '../../models/torneo.model';
import { PolideportivoDTO } from '../../models/polideportivo.model';

@Component({
  selector: 'app-torneo-form',
  templateUrl: './torneo-form.page.html',
  styleUrls: ['./torneo-form.page.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, IonContent, IonHeader, IonTitle,
    IonToolbar, IonButtons, IonButton, IonIcon, IonList, IonItem, IonLabel,
    IonInput, IonTextarea, IonSelect, IonSelectOption, IonDatetime,
    IonDatetimeButton, IonModal, IonCard, IonCardHeader, IonCardTitle,
    IonCardContent, IonBackButton, IonToast,
    IonMenuButton
]
})
export class TorneoFormPage implements OnInit {
  private fb = inject(FormBuilder);
  private torneoService = inject(TorneoService);
  private polideportivoService = inject(PolideportivoService);
  private storageService = inject(StorageService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  torneoForm!: FormGroup;
  isEditMode = false;
  torneoId?: number;
  loading = false;
  polideportivoId?: number;
  polideportivos: PolideportivoDTO[] = [];

  // Toast
  showToast = false;
  toastMessage = '';
  toastColor = 'success';

  estadosTorneo = [
    { value: 'INSCRIPCIONES_ABIERTAS', label: 'Inscripciones Abiertas' },
    { value: 'INSCRIPCIONES_CERRADAS', label: 'Inscripciones Cerradas' },
    { value: 'EN_CURSO', label: 'En Curso' },
    { value: 'FINALIZADO', label: 'Finalizado' },
    { value: 'CANCELADO', label: 'Cancelado' }
  ];

  tiposTorneo = [
    { value: 'GRUPOS_Y_ELIMINACION', label: 'Grupos + Eliminación' },
    { value: 'ELIMINACION_DIRECTA', label: 'Eliminación Directa' },
    { value: 'TODOS_CONTRA_TODOS', label: 'Todos contra Todos' }
  ];

  constructor() {
    addIcons({
    saveOutline,
    closeOutline,
    calendarOutline,
    business,      // Icono para polideportivo
    pricetag,      // Icono para nombre
    documentText, // Icono para descripción
    grid,          // Icono para tipo
    flag,          // Icono para estado
    people,        // Icono para número de equipos
    person,        // Icono para jugadores por equipo
    cash,          // Icono para valores
    trophy         // Icono para el título
  });
    this.initForm();
  }

  ngOnInit() {
    this.cargarPolideportivos();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.torneoId = +id;
      this.cargarTorneo();
    } else {
      // Si no es edición, usar el polideportivo del storage
      const storedId = this.storageService.getPolideportivoId();
      if (storedId) {
        this.polideportivoId = storedId;
        this.torneoForm.patchValue({ polideportivoId: storedId });
      }
    }
  }

  cargarPolideportivos() {
    this.polideportivoService.listarTodos().subscribe({
      next: (data) => {
        this.polideportivos = data.filter(p => p.activo);
      },
      error: (error) => {
        console.error('Error al cargar polideportivos:', error);
        this.mostrarToast('Error al cargar polideportivos', 'danger');
      }
    });
  }

  initForm() {
    this.torneoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: [''],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      estado: ['INSCRIPCIONES_ABIERTAS', Validators.required],
      tipo: ['GRUPOS_Y_ELIMINACION', Validators.required],
      numeroEquipos: [8, [Validators.required, Validators.min(2), Validators.max(64)]],
      jugadoresPorEquipo: [11, [Validators.required, Validators.min(5), Validators.max(15)]],
      valorCarnet: [0, [Validators.required, Validators.min(0)]],
      valorInscripcionEquipo: [0, [Validators.required, Validators.min(0)]],
      polideportivoId: [null, Validators.required] // AGREGADO
    });
  }

  cargarTorneo() {
    if (!this.torneoId) return;

    this.loading = true;
    this.torneoService.obtenerTorneo(this.torneoId).subscribe({
      next: (torneo) => {
        this.torneoForm.patchValue({
          nombre: torneo.nombre,
          descripcion: torneo.descripcion,
          fechaInicio: torneo.fechaInicio,
          fechaFin: torneo.fechaFin,
          estado: torneo.estado,
          tipo: torneo.tipo,
          numeroEquipos: torneo.numeroEquipos,
          jugadoresPorEquipo: torneo.jugadoresPorEquipo,
          valorCarnet: torneo.valorCarnet,
          valorInscripcionEquipo: torneo.valorInscripcionEquipo
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar torneo:', error);
        this.mostrarToast('Error al cargar el torneo', 'danger');
        this.loading = false;
        this.router.navigate(['/torneos']);
      }
    });
  }

  guardar() {
    if (this.torneoForm.invalid) {
      this.torneoForm.markAllAsTouched();
      this.mostrarToast('Por favor completa todos los campos requeridos', 'warning');
      return;
    }

    this.loading = true;
    const torneoData: TorneoDTO = {
      ...this.torneoForm.value,
      id: this.torneoId
    };

    const request = this.isEditMode && this.torneoId
      ? this.torneoService.actualizarTorneo(this.torneoId, torneoData)
      : this.torneoService.crearTorneo(torneoData);

    request.subscribe({
      next: () => {
        this.mostrarToast(
          this.isEditMode ? 'Torneo actualizado correctamente' : 'Torneo creado correctamente',
          'success'
        );
        setTimeout(() => {
          this.router.navigate(['/torneos']);
        }, 1000);
      },
      error: (error) => {
        console.error('Error al guardar:', error);
        this.mostrarToast('Error al guardar el torneo', 'danger');
        this.loading = false;
      }
    });
  }

  cancelar() {
    this.router.navigate(['/torneos']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.torneoForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.torneoForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'Este campo es requerido';
    if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
    if (field.errors['min']) return `El valor mínimo es ${field.errors['min'].min}`;
    if (field.errors['max']) return `El valor máximo es ${field.errors['max'].max}`;

    return 'Campo inválido';
  }

  mostrarToast(mensaje: string, color: string) {
    this.toastMessage = mensaje;
    this.toastColor = color;
    this.showToast = true;
  }
}
