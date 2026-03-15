import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
  IonIcon, IonList, IonItem, IonLabel, IonInput, IonCard, IonSelect,
  IonCardHeader, IonCardTitle, IonCardContent, IonBackButton, IonToast,
  IonSelectOption, IonTextarea, IonToggle, IonSpinner, IonFab, IonFabButton, IonCardSubtitle } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  saveOutline, closeOutline, createOutline, addCircleOutline,
  informationCircleOutline, colorPaletteOutline, ribbonOutline,
  checkmarkDoneOutline, peopleOutline, cashOutline, checkmarkCircleOutline,
  eyeOutline, swapHorizontalOutline, colorFilterOutline, diceOutline,
  arrowBackOutline, arrowForwardOutline, refreshOutline, checkmarkOutline,
  alertCircleOutline, calendarOutline, idCardOutline, callOutline,
  shieldOutline, personCircleOutline, shieldCheckmarkOutline,
  timeOutline, colorWandOutline, chevronDownOutline, create,
  addOutline, save, arrowBack, dice, colorWand, eye, swapHorizontal,
  colorFilter, ribbon, checkmark, refresh, cash, checkmarkCircle,
  informationCircle, calendar, idCard, call, shield, personCircle,
  shieldCheckmark, time, chevronDown, close
} from 'ionicons/icons';
import { EquipoService } from '../../services/equipo-service';
import { TorneoService } from '../../services/torneo-service';
import { JugadorService } from '../../services/jugador-services';
import { EquipoDTO, TorneoDTO, JugadorDTO } from '../../models/torneo.model';

@Component({
  selector: 'app-equipo-form',
  templateUrl: './equipo-form.page.html',
  styleUrls: ['./equipo-form.page.scss'],
  standalone: true,
  imports: [IonCardSubtitle,
    CommonModule, ReactiveFormsModule, IonContent, IonHeader, IonTitle,
    IonToolbar, IonButtons, IonButton, IonIcon, IonList, IonItem, IonLabel,
    IonInput, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonBackButton, IonToast, IonSelect, IonSelectOption, IonTextarea,
    IonToggle, IonSpinner, IonFab, IonFabButton
  ]
})
export class EquipoFormPage implements OnInit {
  private fb = inject(FormBuilder);
  private equipoService = inject(EquipoService);
  private torneoService = inject(TorneoService);
  private jugadorService = inject(JugadorService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  equipoForm!: FormGroup;
  isEditMode = false;
  equipoId?: number;
  loading = false;
  torneos: TorneoDTO[] = [];
  jugadores: JugadorDTO[] = [];
  torneoIdPreseleccionado?: number;

  // Estados nuevos
  currentStep = 0;
  descripcionFocused = false;
  showTorneosDropdown = false;
  showCapitanDropdown = false;
  logoPreview?: string;
  colorPresets = [
    '#16476A', '#3B9797', '#BF092F', '#11998e',
    '#1976d2', '#2E7D32', '#FF9800', '#9C27B0',
    '#E91E63', '#00BCD4', '#FF5722', '#795548'
  ];

  // Signals
  torneosFiltrados = computed(() => {
    return this.torneos.filter(t =>
      ['INSCRIPCIONES_ABIERTAS', 'INSCRIPCIONES_CERRADAS', 'EN_CURSO'].includes(t.estado)
    );
  });

  // Toast
  showToast = false;
  toastMessage = '';
  toastColor = 'success';

  constructor() {
    addIcons({closeOutline,informationCircleOutline,calendarOutline,chevronDownOutline,alertCircleOutline,peopleOutline,checkmarkCircleOutline,createOutline,colorPaletteOutline,colorWandOutline,diceOutline,eyeOutline,shieldOutline,personCircleOutline,swapHorizontalOutline,colorFilterOutline,ribbonOutline,addOutline,idCardOutline,ribbon,callOutline,checkmarkDoneOutline,cashOutline,shieldCheckmarkOutline,arrowBackOutline,arrowForwardOutline,saveOutline,addCircleOutline,refreshOutline,checkmarkOutline,timeOutline,create,save,arrowBack,dice,colorWand,eye,swapHorizontal,colorFilter,checkmark,refresh,cash,checkmarkCircle,informationCircle,calendar,idCard,call,shield,personCircle,shieldCheckmark,time,chevronDown,close});
    this.initForm();
  }

  ngOnInit() {
    this.torneoIdPreseleccionado = this.route.snapshot.queryParams['torneoId']
      ? +this.route.snapshot.queryParams['torneoId']
      : undefined;

    this.cargarTorneos();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.equipoId = +id;
      this.cargarEquipo();
    } else if (this.torneoIdPreseleccionado) {
      this.equipoForm.patchValue({ torneoId: this.torneoIdPreseleccionado });
      this.cargarJugadoresPorTorneo(this.torneoIdPreseleccionado);
    }

    // Cargar logo por defecto
    this.loadDefaultLogo();
  }

  initForm() {
    this.equipoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      descripcion: ['', [Validators.maxLength(500)]],
      colorPrincipal: ['#16476A'],
      colorSecundario: ['#3B9797'],
      torneoId: [null, Validators.required],
      capitanId: [null],
      inscripcionPagada: [false],
      activo: [true]
    });

    // Observar cambios en torneo para cargar jugadores
    this.equipoForm.get('torneoId')?.valueChanges.subscribe(torneoId => {
      if (torneoId) {
        this.cargarJugadoresPorTorneo(torneoId);
        this.currentStep = Math.min(this.currentStep, 3);
      }
    });

    // Observar cambios en colores para actualizar preview
    this.equipoForm.get('colorPrincipal')?.valueChanges.subscribe(() => {
      this.updateColorPreview();
    });

    this.equipoForm.get('colorSecundario')?.valueChanges.subscribe(() => {
      this.updateColorPreview();
    });
  }

  cargarTorneos() {
    this.loading = true;
    this.torneoService.listarTodos().subscribe({
      next: (data) => {
        this.torneos = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar torneos:', error);
        this.mostrarToast('Error al cargar torneos', 'danger');
        this.loading = false;
      }
    });
  }

  cargarJugadoresPorTorneo(torneoId: number) {
    this.jugadorService.listarPorTorneo(torneoId).subscribe({
      next: (data) => {
        this.jugadores = data.filter(j => j.activo).sort((a, b) =>
          a.nombreCompleto.localeCompare(b.nombreCompleto)
        );
      },
      error: (error) => {
        console.error('Error al cargar jugadores:', error);
        this.jugadores = [];
      }
    });
  }

  cargarEquipo() {
    if (!this.equipoId) return;

    this.loading = true;
    this.equipoService.obtenerPorId(this.equipoId).subscribe({
      next: (equipo) => {
        this.equipoForm.patchValue({
          nombre: equipo.nombre,
          descripcion: equipo.descripcion,
          colorPrincipal: equipo.colorPrincipal || '#16476A',
          colorSecundario: equipo.colorSecundario || '#3B9797',
          torneoId: equipo.torneoId,
          capitanId: equipo.capitanId,
          inscripcionPagada: equipo.inscripcionPagada,
          activo: equipo.activo ?? true
        });

        if (equipo.torneoId) {
          this.cargarJugadoresPorTorneo(equipo.torneoId);
        }

        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar equipo:', error);
        this.mostrarToast('Error al cargar el equipo', 'danger');
        this.loading = false;
        this.router.navigate(['/equipos']);
      }
    });
  }

  // Métodos de navegación entre pasos
  nextStep() {
    if (this.currentStep < 3) {
      this.validateStep(this.currentStep);
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  goToStep(step: number) {
    if (step >= 0 && step <= 3) {
      // Validar pasos anteriores antes de saltar
      for (let i = 0; i < step; i++) {
        if (!this.validateStep(i)) {
          this.mostrarToast('Completa el paso actual antes de continuar', 'warning');
          return;
        }
      }
      this.currentStep = step;
    }
  }

  getStepLabel(step: number): string {
    const labels = ['Información', 'Colores', 'Capitán', 'Estado'];
    return labels[step] || '';
  }

  validateStep(step: number): boolean {
    switch (step) {
      case 0:
        const nombreValid = this.equipoForm.get('nombre')?.valid;
        const torneoValid = this.equipoForm.get('torneoId')?.valid;
        if (!nombreValid || !torneoValid) {
          this.mostrarToast('Completa los campos requeridos del paso 1', 'warning');
          return false;
        }
        break;
      case 1:
        // Los colores siempre son válidos
        break;
      case 2:
        // El capitán es opcional
        break;
    }
    return true;
  }

  // Métodos para manejo de colores
  onColorChange(type: 'principal' | 'secundario') {
    this.updateColorPreview();
  }

  setColor(type: 'principal' | 'secundario', color: string) {
    this.equipoForm.patchValue({
      [type === 'principal' ? 'colorPrincipal' : 'colorSecundario']: color
    });
  }

  generateRandomColor(type: 'principal' | 'secundario') {
    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    this.setColor(type, randomColor);
  }

  generateHarmonicColors() {
    // Generar colores armónicos (complementarios o análogos)
    const baseColor = this.equipoForm.get('colorPrincipal')?.value || '#16476A';
    const baseHex = baseColor.replace('#', '');
    const r = parseInt(baseHex.substr(0, 2), 16);
    const g = parseInt(baseHex.substr(2, 2), 16);
    const b = parseInt(baseHex.substr(4, 2), 16);

    // Complementario
    const complementario = `#${(255 - r).toString(16).padStart(2, '0')}${(255 - g).toString(16).padStart(2, '0')}${(255 - b).toString(16).padStart(2, '0')}`;

    this.equipoForm.patchValue({
      colorPrincipal: baseColor,
      colorSecundario: complementario
    });
  }

  swapColors() {
    const principal = this.equipoForm.get('colorPrincipal')?.value;
    const secundario = this.equipoForm.get('colorSecundario')?.value;

    this.equipoForm.patchValue({
      colorPrincipal: secundario,
      colorSecundario: principal
    });
  }

  getGradientPreview(): string {
    const color1 = this.equipoForm.get('colorPrincipal')?.value || '#16476A';
    const color2 = this.equipoForm.get('colorSecundario')?.value || '#3B9797';
    return `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
  }

  // Métodos para el capitán
  getCapitanSeleccionado(): JugadorDTO | undefined {
    const capitanId = this.equipoForm.get('capitanId')?.value;
    return this.jugadores.find(j => j.id === capitanId);
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  navegarARegistroJugadores() {
    const torneoId = this.equipoForm.get('torneoId')?.value;
    if (torneoId) {
      this.router.navigate(['/jugadores/nuevo'], {
        queryParams: { torneoId: torneoId }
      });
    }
  }

  // Métodos del formulario
  onNombreChange(event: any) {
    // Puedes agregar validación en tiempo real aquí
    const nombre = event.detail?.value || '';
    // Ejemplo: check for duplicate names
  }

  loadDefaultLogo() {
    // Puedes cargar un logo por defecto desde assets
    this.logoPreview = 'assets/icon/team-default.png';
  }

  getFormCompletionPercentage(): number {
    const totalFields = 8; // Total de campos en el formulario
    const completedFields = Object.keys(this.equipoForm.controls).reduce((count, key) => {
      const control = this.equipoForm.get(key);
      if (control) {
        if (key === 'capitanId') {
          // El capitán es opcional, siempre cuenta como completado
          return count + 1;
        }
        if (control.valid || (control.disabled && control.value !== null)) {
          return count + 1;
        }
      }
      return count;
    }, 0);

    return Math.round((completedFields / totalFields) * 100);
  }

  // Guardar equipo
  guardar() {
    if (this.equipoForm.invalid) {
      this.equipoForm.markAllAsTouched();
      this.mostrarToast('Por favor completa todos los campos requeridos', 'warning');
      return;
    }

    this.loading = true;
    const equipoData: EquipoDTO = {
      ...this.equipoForm.value,
      id: this.equipoId
    };

    const request = this.isEditMode && this.equipoId
      ? this.equipoService.actualizar(this.equipoId, equipoData)
      : this.equipoService.crear(equipoData);

    request.subscribe({
      next: (response) => {
        const message = this.isEditMode
          ? 'Equipo actualizado correctamente'
          : 'Equipo creado correctamente';

        this.mostrarToast(message, 'success');

        // Animación de éxito antes de navegar
        setTimeout(() => {
          if (this.torneoIdPreseleccionado || equipoData.torneoId) {
            this.router.navigate(['/equipos'], {
              queryParams: { torneoId: this.torneoIdPreseleccionado || equipoData.torneoId },
              queryParamsHandling: 'merge'
            });
          } else {
            this.router.navigate(['/equipos']);
          }
        }, 1500);
      },
      error: (error) => {
        console.error('Error al guardar:', error);
        if (error.error?.message?.includes('nombre')) {
          this.mostrarToast('Ya existe un equipo con ese nombre en este torneo', 'danger');
        } else if (error.status === 409) {
          this.mostrarToast('El nombre del equipo ya está en uso', 'danger');
        } else {
          this.mostrarToast('Error al guardar el equipo', 'danger');
        }
        this.loading = false;
      }
    });
  }

  cancelar() {
    if (this.torneoIdPreseleccionado) {
      this.router.navigate(['/equipos'], {
        queryParams: { torneoId: this.torneoIdPreseleccionado }
      });
    } else {
      this.router.navigate(['/equipos']);
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.equipoForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.equipoForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'Este campo es requerido';
    if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
    if (field.errors['maxlength']) return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;

    return 'Campo inválido';
  }

  mostrarToast(mensaje: string, color: 'success' | 'danger' | 'warning') {
    this.toastMessage = mensaje;
    this.toastColor = color;
    this.showToast = true;
  }

  updateColorPreview() {
    // Puedes actualizar dinámicamente algún preview si es necesario
  }
}
