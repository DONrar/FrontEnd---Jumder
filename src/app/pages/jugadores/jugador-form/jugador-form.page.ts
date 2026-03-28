import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonList, IonItem, IonLabel, IonInput, IonCard, IonSelect, IonCardHeader, IonCardTitle, IonCardContent, IonBackButton, IonToast, IonSelectOption, IonToggle, IonNote, IonMenuButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { saveOutline, closeOutline, person, personCircle, personCircleOutline, idCard, calendar, call, mail, football, people, location, shirt } from 'ionicons/icons';
import { JugadorService } from '../../../services/jugador-services';
import { EquipoService } from '../../../services/equipo-service';
import { JugadorDTO } from '../../../models/jugador.model';
import { EquipoDTO } from '../../../models/equipo.model';

@Component({
  selector: 'app-jugador-form',
  templateUrl: './jugador-form.page.html',
  styleUrls: ['./jugador-form.page.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, IonContent, IonHeader, IonTitle,
    IonToolbar, IonButtons, IonButton, IonIcon, IonList, IonItem, IonLabel,
    IonInput, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonBackButton, IonToast, IonSelect, IonSelectOption, IonToggle, IonNote,
    IonMenuButton
]
})
export class JugadorFormPage implements OnInit {
  private fb = inject(FormBuilder);
  private jugadorService = inject(JugadorService);
  private equipoService = inject(EquipoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  jugadorForm!: FormGroup;
  isEditMode = false;
  jugadorId?: number;
  loading = false;
  equipos: EquipoDTO[] = [];
  equipoIdPreseleccionado?: number;

  posiciones = [
    { value: 'PORTERO', label: 'Portero' },
    { value: 'DEFENSA', label: 'Defensa' },
    { value: 'MEDIOCAMPISTA', label: 'Mediocampista' },
    { value: 'DELANTERO', label: 'Delantero' }
  ];

  showToast = false;
  toastMessage = '';
  toastColor = 'success';

  constructor() {
    addIcons({person,closeOutline,personCircle,personCircleOutline,idCard,calendar,call,mail,football,people,location,shirt,saveOutline});
    this.initForm();
  }

  ngOnInit() {
    this.equipoIdPreseleccionado = this.route.snapshot.queryParams['equipoId']
      ? +this.route.snapshot.queryParams['equipoId']
      : undefined;

    this.cargarEquipos();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.jugadorId = +id;
      this.cargarJugador();
    } else if (this.equipoIdPreseleccionado) {
      this.jugadorForm.patchValue({ equipoId: this.equipoIdPreseleccionado });
    }
  }

  initForm() {
    this.jugadorForm = this.fb.group({
      nombreCompleto: ['', [Validators.required, Validators.minLength(3)]],
      cedula: ['', [Validators.required, Validators.pattern(/^[0-9]{6,10}$/)]],
      fechaNacimiento: [''],
      telefono: ['', [Validators.pattern(/^[0-9]{7,10}$/)]],
      email: ['', [Validators.email]],
      numeroCamiseta: ['', [Validators.min(1), Validators.max(99)]],
      posicion: [''],
      equipoId: [null, Validators.required],
      carnetPagado: [false],
      activo: [true],
      verificado: [false]
    });
  }

  cargarEquipos() {
    this.equipoService.listarTodos().subscribe({
      next: (data) => {
        this.equipos = data.filter(e => e.activo);
      },
      error: (error) => {
        console.error('Error al cargar equipos:', error);
        this.mostrarToast('Error al cargar equipos', 'danger');
      }
    });
  }

  cargarJugador() {
    if (!this.jugadorId) return;

    this.loading = true;
    this.jugadorService.obtenerPorId(this.jugadorId).subscribe({
      next: (jugador) => {
        this.jugadorForm.patchValue({
          nombreCompleto: jugador.nombreCompleto,
          cedula: jugador.cedula,
          fechaNacimiento: jugador.fechaNacimiento,
          telefono: jugador.telefono,
          email: jugador.email,
          numeroCamiseta: jugador.numeroCamiseta,
          posicion: jugador.posicion,
          equipoId: jugador.equipoId,
          carnetPagado: jugador.carnetPagado,
          activo: jugador.activo,
          verificado: jugador.verificado
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar jugador:', error);
        this.mostrarToast('Error al cargar el jugador', 'danger');
        this.loading = false;
        this.router.navigate(['/jugadores']);
      }
    });
  }

  guardar() {
    if (this.jugadorForm.invalid) {
      this.jugadorForm.markAllAsTouched();
      this.mostrarToast('Por favor completa todos los campos requeridos', 'warning');
      return;
    }

    this.loading = true;
    const jugadorData: JugadorDTO = {
      ...this.jugadorForm.value,
      id: this.jugadorId
    };

    const request = this.isEditMode && this.jugadorId
      ? this.jugadorService.actualizar(this.jugadorId, jugadorData)
      : this.jugadorService.crear(jugadorData);

    request.subscribe({
      next: () => {
        this.mostrarToast(
          this.isEditMode ? 'Jugador actualizado correctamente' : 'Jugador registrado correctamente',
          'success'
        );
        setTimeout(() => {
          if (this.equipoIdPreseleccionado) {
            this.router.navigate(['/jugadores'], {
              queryParams: { equipoId: this.equipoIdPreseleccionado }
            });
          } else {
            this.router.navigate(['/jugadores']);
          }
        }, 1000);
      },
      error: (error) => {
        console.error('Error al guardar:', error);
        if (error.error?.message?.includes('cédula')) {
          this.mostrarToast('Ya existe un jugador con esa cédula', 'danger');
        } else {
          this.mostrarToast('Error al guardar el jugador', 'danger');
        }
        this.loading = false;
      }
    });
  }

  cancelar() {
    if (this.equipoIdPreseleccionado) {
      this.router.navigate(['/jugadores'], {
        queryParams: { equipoId: this.equipoIdPreseleccionado }
      });
    } else {
      this.router.navigate(['/jugadores']);
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.jugadorForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.jugadorForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'Este campo es requerido';
    if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
    if (field.errors['pattern']) {
      if (fieldName === 'cedula') return 'Cédula inválida (6-10 dígitos)';
      if (fieldName === 'telefono') return 'Teléfono inválido (7-10 dígitos)';
    }
    if (field.errors['email']) return 'Email inválido';
    if (field.errors['min']) return `Valor mínimo: ${field.errors['min'].min}`;
    if (field.errors['max']) return `Valor máximo: ${field.errors['max'].max}`;

    return 'Campo inválido';
  }

  calcularEdad(): number | null {
    const fechaNac = this.jugadorForm.get('fechaNacimiento')?.value;
    if (!fechaNac) return null;

    const hoy = new Date();
    const nacimiento = new Date(fechaNac);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  }

  mostrarToast(mensaje: string, color: string) {
    this.toastMessage = mensaje;
    this.toastColor = color;
    this.showToast = true;
  }
}
