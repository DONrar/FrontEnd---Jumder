import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
  IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonBadge,
  IonSearchbar, IonFab, IonFabButton, IonRefresher, IonRefresherContent,
  IonSkeletonText, IonToast, IonChip, IonLabel, IonBackButton,
  AlertController, ModalController, IonModal, IonFooter } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline, createOutline, trashOutline, personOutline,
  shirtOutline, cardOutline, checkmarkCircleOutline, closeCircleOutline,
  searchOutline, refreshOutline, footballOutline, trophyOutline,
  cashOutline, shieldCheckmarkOutline, peopleOutline, filterOutline,
  downloadOutline, shareOutline, closeOutline, cloudUploadOutline,
  documentTextOutline, add, addCircle, checkmark, alertCircle,
  checkmarkCircle, closeCircle, ribbonOutline, calendarOutline,
  shieldOutline, people, person, cash, shieldCheckmark, warning,
  funnel, idCardOutline, personAdd, football, peopleCircle, personAddOutline } from 'ionicons/icons';
import { JugadorService } from '../../services/jugador-services';
import { EquipoService } from '../../services/equipo-service';
import { JugadorDTO } from '../../models/jugador.model';
import { EquipoDTO } from '../../models/equipo.model';

// Extender la interfaz para incluir el flag de capitán
interface JugadorConCapitán extends JugadorDTO {
  esCapitan?: boolean;
}

@Component({
  selector: 'app-jugadores-list',
  templateUrl: './jugadores-list.page.html',
  styleUrls: ['./jugadores-list.page.scss'],
  standalone: true,
  imports: [IonFooter,
    CommonModule, FormsModule, IonContent, IonHeader, IonTitle, IonToolbar,
    IonButtons, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle,
    IonCardContent, IonBadge, IonSearchbar, IonFab, IonFabButton, IonRefresher,
    IonRefresherContent, IonSkeletonText, IonToast, IonChip, IonLabel,
    IonBackButton, IonModal
  ]
})
export class JugadoresListPage implements OnInit {
  private jugadorService = inject(JugadorService);
  private equipoService = inject(EquipoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private alertController = inject(AlertController);
  private modalController = inject(ModalController);

  // Datos
  equipos: EquipoDTO[] = [];
  jugadores: JugadorConCapitán[] = [];
  jugadoresFiltrados: JugadorConCapitán[] = [];
  posicionesUnicas: string[] = ['PORTERO', 'DEFENSA', 'MEDIOCAMPISTA', 'DELANTERO'];

  // Estados
  loading = true;
  searchText = '';
  filtroPosicion = 'todos';
  filtroEstado = 'todos';
  filtroPago = 'todos';
  filtroVerificado = 'todos';
  filtroCapitan = 'todos';
  filtrosVisibles = false;
  showFiltrosModal = false;

  // Datos de contexto
  equipoId?: number;
  torneoId?: number;
  equipoNombre?: string;

  // Toast
  showToast = false;
  toastMessage = '';
  toastColor: 'success' | 'danger' | 'warning' = 'success';

  // Stats
  jugadoresPagados = 0;
  jugadoresSinPagar = 0;
  jugadoresVerificados = 0;
  jugadoresCapitanes = 0;

  // Mapa para rápido acceso a capitanes por equipo
  private mapaCapitanes = new Map<number, number>();

  constructor() {
    addIcons({peopleOutline,refreshOutline,personAddOutline,filterOutline,funnel,checkmarkCircle,closeCircle,cash,alertCircle,shieldCheckmark,warning,person,people,personOutline,addOutline,closeOutline,downloadOutline,personAdd,add,createOutline,trashOutline,shirtOutline,cardOutline,checkmarkCircleOutline,closeCircleOutline,searchOutline,footballOutline,trophyOutline,cashOutline,shieldCheckmarkOutline,shareOutline,cloudUploadOutline,documentTextOutline,addCircle,checkmark,ribbonOutline,calendarOutline,shieldOutline,idCardOutline,football,peopleCircle});
  }

  ngOnInit() {
    this.equipoId = this.route.snapshot.queryParams['equipoId']
      ? +this.route.snapshot.queryParams['equipoId']
      : undefined;
    this.torneoId = this.route.snapshot.queryParams['torneoId']
      ? +this.route.snapshot.queryParams['torneoId']
      : undefined;
    this.equipoNombre = this.route.snapshot.queryParams['equipoNombre'];

    this.cargarDatos();
  }

  async cargarDatos() {
    this.loading = true;

    try {
      await this.cargarEquipos();
      await this.cargarJugadoresData();
    } catch (error: any) {
      console.error('Error al cargar datos:', error);
      this.mostrarToast('Error al cargar datos', 'danger');
      this.loading = false;
    }
  }

  private async cargarEquipos(): Promise<void> {
    try {
      let equiposPromise;

      if (this.equipoId) {
        // Si estamos en vista de equipo, cargar solo ese equipo
        equiposPromise = lastValueFrom(this.equipoService.obtenerPorId(this.equipoId));
      } else if (this.torneoId) {
        // Si estamos en vista de torneo, cargar equipos del torneo
        equiposPromise = lastValueFrom(this.equipoService.listarPorTorneo(this.torneoId));
      } else {
        // Si estamos en vista global, cargar todos los equipos
        equiposPromise = lastValueFrom(this.equipoService.listarTodos());
      }

      const equipos = await equiposPromise;

      // Normalizamos a array
      this.equipos = Array.isArray(equipos) ? equipos : [equipos];

      // Construir mapa de capitanes (equipoId -> capitanId)
      this.mapaCapitanes.clear();
      this.equipos.forEach((equipo: EquipoDTO) => {
        if (equipo.id && equipo.capitanId) {
          this.mapaCapitanes.set(equipo.id, equipo.capitanId);
        }
      });
    } catch (error: any) {
      console.error('Error al cargar equipos:', error);
      throw error;
    }
  }

  private async cargarJugadoresData(): Promise<void> {
    try {
      let jugadoresPromise;

      if (this.equipoId) {
        jugadoresPromise = lastValueFrom(this.jugadorService.listarPorEquipo(this.equipoId));
      } else if (this.torneoId) {
        jugadoresPromise = lastValueFrom(this.jugadorService.listarPorTorneo(this.torneoId));
      } else {
        jugadoresPromise = lastValueFrom(this.jugadorService.listarTodos());
      }

      const jugadores = await jugadoresPromise;

      // Procesar jugadores y marcar capitanes
      this.procesarJugadoresConCapitanes(jugadores);
      this.calcularEstadisticas();
      this.aplicarFiltros();
      this.loading = false;
    } catch (error: any) {
      console.error('Error al cargar jugadores:', error);
      this.mostrarToast('Error al cargar jugadores', 'danger');
      this.loading = false;
      throw error;
    }
  }

  private procesarJugadoresConCapitanes(jugadores: JugadorDTO[]): void {
    this.jugadores = jugadores.map(jugador => {
      // Determinar si el jugador es capitán de su equipo
      const capitanId = jugador.equipoId ? this.mapaCapitanes.get(jugador.equipoId) : undefined;
      const esCapitan = jugador.id !== undefined && capitanId !== undefined && jugador.id === capitanId;

      return {
        ...jugador,
        esCapitan: esCapitan || false
      };
    });
  }

  // Método público para recargar desde botón
  cargarJugadores() {
    this.cargarDatos();
  }

  private calcularEstadisticas() {
    this.jugadoresPagados = this.jugadores.filter(j => j.carnetPagado).length;
    this.jugadoresSinPagar = this.jugadores.filter(j => !j.carnetPagado).length;
    this.jugadoresVerificados = this.jugadores.filter(j => j.verificado).length;
    this.jugadoresCapitanes = this.jugadores.filter(j => j.esCapitan).length;
  }

  async handleRefresh(event: any) {
    try {
      await this.cargarEquipos();
      await this.cargarJugadoresData();
      event.target.complete();
      this.mostrarToast('Datos actualizados', 'success');
    } catch (error: any) {
      console.error('Error al actualizar:', error);
      event.target.complete();
      this.mostrarToast('Error al actualizar', 'danger');
    }
  }

  onSearchChange(event: any) {
    this.searchText = event.detail.value || '';
    this.aplicarFiltros();
  }


  aplicarFiltros() {
    let filtrados = [...this.jugadores];

    // Filtro por búsqueda
    if (this.searchText.trim()) {
      const search = this.searchText.toLowerCase();
      filtrados = filtrados.filter(j =>
        j.nombreCompleto.toLowerCase().includes(search) ||
        j.cedula.toLowerCase().includes(search) ||
        j.equipoNombre?.toLowerCase().includes(search)
      );
    }

    // Filtro por posición
    if (this.filtroPosicion !== 'todos') {
      filtrados = filtrados.filter(j => j.posicion === this.filtroPosicion);
    }

    // Filtro por estado
    switch (this.filtroEstado) {
      case 'activos':
        filtrados = filtrados.filter(j => j.activo);
        break;
      case 'inactivos':
        filtrados = filtrados.filter(j => !j.activo);
        break;
    }

    // Filtro por pago
    switch (this.filtroPago) {
      case 'pagados':
        filtrados = filtrados.filter(j => j.carnetPagado);
        break;
      case 'sin-pagar':
        filtrados = filtrados.filter(j => !j.carnetPagado);
        break;
    }

    // Filtro por verificación
    switch (this.filtroVerificado) {
      case 'verificados':
        filtrados = filtrados.filter(j => j.verificado);
        break;
      case 'no-verificados':
        filtrados = filtrados.filter(j => !j.verificado);
        break;
    }

    // Filtro por capitán
    switch (this.filtroCapitan) {
      case 'capitanes':
        filtrados = filtrados.filter(j => j.esCapitan);
        break;
      case 'no-capitanes':
        filtrados = filtrados.filter(j => !j.esCapitan);
        break;
    }

    this.jugadoresFiltrados = filtrados;
  }

  // Métodos para filtros
  aplicarFiltroPosicion(posicion: string) {
    this.filtroPosicion = posicion;
    this.aplicarFiltros();
  }

  aplicarFiltroEstado(estado: string) {
    this.filtroEstado = estado;
    this.aplicarFiltros();
  }

  aplicarFiltroPago(pago: string) {
    this.filtroPago = pago;
    this.aplicarFiltros();
  }

  aplicarFiltroVerificado(verificado: string) {
    this.filtroVerificado = verificado;
    this.aplicarFiltros();
  }

  aplicarFiltroCapitan(capitan: string) {
    this.filtroCapitan = capitan;
    this.aplicarFiltros();
  }

  limpiarFiltros() {
    this.searchText = '';
    this.filtroPosicion = 'todos';
    this.filtroEstado = 'todos';
    this.filtroPago = 'todos';
    this.filtroVerificado = 'todos';
    this.filtroCapitan = 'todos';
    this.aplicarFiltros();
  }

  toggleFiltros() {
    this.filtrosVisibles = !this.filtrosVisibles;
  }

  // Métodos de utilidad
  getGradientByPosition(posicion?: string, esCapitan?: boolean): string {
    // Si es capitán, usar un gradiente especial dorado
    if (esCapitan) {
      return 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)';
    }

    // Si no es capitán, usar el gradiente por posición
    switch (posicion) {
      case 'PORTERO':
        return 'linear-gradient(135deg, #FF9800 0%, #FF5722 100%)';
      case 'DEFENSA':
        return 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)';
      case 'MEDIOCAMPISTA':
        return 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)';
      case 'DELANTERO':
        return 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)';
      default:
        return 'linear-gradient(135deg, #16476A 0%, #3B9797 100%)';
    }
  }

  getPosicionColor(posicion?: string): string {
    switch (posicion) {
      case 'PORTERO': return 'warning';
      case 'DEFENSA': return 'primary';
      case 'MEDIOCAMPISTA': return 'success';
      case 'DELANTERO': return 'danger';
      default: return 'medium';
    }
  }

  getPosicionColorClass(posicion?: string): string {
    const color = this.getPosicionColor(posicion);
    return `posicion-${color}`;
  }

  getPosicionIcon(posicion?: string): string {
    switch (posicion) {
      case 'PORTERO': return 'shield-outline';
      case 'DEFENSA': return 'shield-half-outline';
      case 'MEDIOCAMPISTA': return 'swap-horizontal-outline';
      case 'DELANTERO': return 'football-outline';
      default: return 'help-circle-outline';
    }
  }

  getPosicionNombre(posicion?: string): string {
    switch (posicion) {
      case 'PORTERO': return 'Portero';
      case 'DEFENSA': return 'Defensa';
      case 'MEDIOCAMPISTA': return 'Mediocampista';
      case 'DELANTERO': return 'Delantero';
      default: return 'Sin posición';
    }
  }

  calcularEdad(fechaNacimiento?: string): number | null {
    if (!fechaNacimiento) return null;
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  }

  tieneEstadisticas(jugador: JugadorConCapitán): boolean {
    return (jugador.goles || 0) > 0 ||
           (jugador.asistencias || 0) > 0 ||
           (jugador.tarjetasAmarillas || 0) > 0 ||
           (jugador.tarjetasRojas || 0) > 0;
  }

  // Métodos de navegación
 // En el método crearJugador, elimina la línea que cierra el FAB:
crearJugador() {
  const queryParams: any = {};
  if (this.equipoId) {
    queryParams.equipoId = this.equipoId;
  }
  if (this.torneoId) {
    queryParams.torneoId = this.torneoId;
  }
  if (this.equipoNombre) {
    queryParams.equipoNombre = this.equipoNombre;
  }

  this.router.navigate(['/jugadores/nuevo'], { queryParams });
  // this.fabOptionsVisible = false; // ← Eliminar esta línea
}

  verJugador(jugador: JugadorConCapitán) {
    const queryParams: any = {};
    if (this.equipoId) {
      queryParams.equipoId = this.equipoId;
    }
    if (this.torneoId) {
      queryParams.torneoId = this.torneoId;
    }

    this.router.navigate(['/jugadores', jugador.id], { queryParams });
  }

  editarJugador(jugador: JugadorConCapitán, event: Event) {
    event.stopPropagation();
    const queryParams: any = {};
    if (this.equipoId) {
      queryParams.equipoId = this.equipoId;
    }
    if (this.torneoId) {
      queryParams.torneoId = this.torneoId;
    }

    this.router.navigate(['/jugadores', jugador.id, 'editar'], { queryParams });
  }

  // Métodos de acción
  async eliminarJugador(jugador: JugadorConCapitán, event: Event) {
    event.stopPropagation();

    const alert = await this.alertController.create({
      header: '¿Eliminar jugador?',
      message: `¿Estás seguro de eliminar a "${jugador.nombreCompleto}"? Esta acción no se puede deshacer.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            if (jugador.id) {
              try {
                await lastValueFrom(this.jugadorService.eliminar(jugador.id));
                this.mostrarToast('Jugador eliminado exitosamente', 'success');
                await this.cargarDatos();
              } catch (error: any) {
                console.error('Error al eliminar:', error);
                this.mostrarToast('Error al eliminar jugador', 'danger');
              }
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async pagarCarnet(jugador: JugadorConCapitán, event: Event) {
    event.stopPropagation();

    if (!jugador.id) return;

    const confirm = await this.alertController.create({
      header: 'Confirmar Pago',
      message: `¿Marcar el carnet de "${jugador.nombreCompleto}" como pagado?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: async () => {
            try {
              await lastValueFrom(this.jugadorService.pagarCarnet(jugador.id!));
              this.mostrarToast('Carnet marcado como pagado', 'success');
              await this.cargarDatos();
            } catch (error: any) {
              console.error('Error:', error);
              this.mostrarToast('Error al marcar carnet', 'danger');
            }
          }
        }
      ]
    });

    await confirm.present();
  }

  async verificarJugador(jugador: JugadorConCapitán, event: Event) {
    event.stopPropagation();

    if (!jugador.id) return;

    const confirm = await this.alertController.create({
      header: 'Verificar Jugador',
      message: `¿Verificar a "${jugador.nombreCompleto}"? Esta acción confirma que toda su documentación está en orden.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Verificar',
          handler: async () => {
            try {
              await lastValueFrom(this.jugadorService.verificarJugador(jugador.id!));
              this.mostrarToast('Jugador verificado exitosamente', 'success');
              await this.cargarDatos();
            } catch (error: any) {
              console.error('Error:', error);
              this.mostrarToast('Error al verificar jugador', 'danger');
            }
          }
        }
      ]
    });

    await confirm.present();
  }

  // Métodos adicionales
  exportarLista() {
    try {
      const csvContent = this.generarCSV();
      this.descargarArchivo(csvContent, 'jugadores.csv');
      this.mostrarToast('Lista exportada exitosamente', 'success');
    } catch (error: any) {
      console.error('Error al exportar:', error);
      this.mostrarToast('Error al exportar lista', 'danger');
    }
  }

  generarCSV(): string {
    const headers = ['Nombre', 'Cédula', 'Equipo', 'Posición', 'Dorsal', 'Capitan', 'Estado', 'Pago', 'Verificado', 'Goles', 'Asistencias'];
    const rows = this.jugadoresFiltrados.map(jugador => [
      jugador.nombreCompleto,
      jugador.cedula,
      jugador.equipoNombre || 'N/A',
      this.getPosicionNombre(jugador.posicion),
      jugador.numeroCamiseta?.toString() || 'N/A',
      jugador.esCapitan ? 'Sí' : 'No',
      jugador.activo ? 'Activo' : 'Inactivo',
      jugador.carnetPagado ? 'Pagado' : 'Pendiente',
      jugador.verificado ? 'Sí' : 'No',
      (jugador.goles || 0).toString(),
      (jugador.asistencias || 0).toString()
    ]);

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  }

  descargarArchivo(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  mostrarFiltrosAvanzados() {
    this.showFiltrosModal = true;
  }

  // Toast helper
  mostrarToast(mensaje: string, color: 'success' | 'danger' | 'warning') {
    this.toastMessage = mensaje;
    this.toastColor = color;
    this.showToast = true;
  }
}
