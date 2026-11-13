import {
  Medico,
  Paciente,
  Horario,
  Disponibilidad,
  Cita,
  CreateMedicoDTO,
  UpdateMedicoDTO,
  CreatePacienteDTO,
  UpdatePacienteDTO,
  CreateHorarioDTO,
  UpdateHorarioDTO,
  CreateDisponibilidadDTO,
  CreateCitaDTO,
  FiltroDisponibilidadDTO,
  FiltroCitaDTO,
  DashboardMetricasDTO,
} from '@/types';
import {
  IMedicoRepository,
  IPacienteRepository,
  IHorarioRepository,
  IDisponibilidadRepository,
  ICitaRepository,
  IDashboardRepository,
  IRepositoryContainer,
} from '../interfaces';
import { SEED_MEDICOS, SEED_PACIENTES, getFechasSeed, BLOQUES_HORARIOS, SALAS } from '../../../../scripts/seed-data';

interface HospitalStore {
  medicos: Medico[];
  pacientes: Paciente[];
  horarios: Horario[];
  disponibilidades: Disponibilidad[];
  citas: Cita[];
}

declare global {
  // eslint-disable-next-line no-var
  var __hospitalStore: HospitalStore | undefined;
}

function getStore(): HospitalStore {
  if (!globalThis.__hospitalStore) {
    globalThis.__hospitalStore = {
      medicos: [],
      pacientes: [],
      horarios: [],
      disponibilidades: [],
      citas: [],
    };

    // 1. Médicos iniciales
    globalThis.__hospitalStore.medicos = SEED_MEDICOS.map((m, i) => ({
      id: `med-${i + 1}`,
      ...m,
      created_at: new Date().toISOString(),
    }));

    // 2. Pacientes iniciales
    globalThis.__hospitalStore.pacientes = SEED_PACIENTES.map((p, i) => ({
      id: `pac-${i + 1}`,
      ...p,
      created_at: new Date().toISOString(),
    }));

    // 3. Horarios iniciales
    const fechas = getFechasSeed();
    let hCount = 1;
    for (const fecha of fechas) {
      for (const bloque of BLOQUES_HORARIOS) {
        globalThis.__hospitalStore.horarios.push({
          id: `hor-${hCount++}`,
          lugar: 'Pabellón Central - Torre Médica A',
          fecha,
          hora_inicial: bloque.hora_inicial,
          hora_final: bloque.hora_final,
          created_at: new Date().toISOString(),
        });
      }
    }

    // 4. Disponibilidades y Citas iniciales
    let cCount = 1;
    const medicos = globalThis.__hospitalStore.medicos;
    const pacientes = globalThis.__hospitalStore.pacientes;
    const horarios = globalThis.__hospitalStore.horarios;

    for (let mIdx = 0; mIdx < medicos.length; mIdx++) {
      const med = medicos[mIdx];
      const sala = SALAS[mIdx % SALAS.length];

      for (let hStep = 0; hStep < 4; hStep++) {
        const hIdx = (mIdx * 4 + hStep) % horarios.length;
        const hor = horarios[hIdx];

        let estado = 0;

        if (hStep === 0 && mIdx < pacientes.length) {
          estado = 1;
          const pac = pacientes[mIdx];
          globalThis.__hospitalStore.citas.push({
            id: `cita-${cCount++}`,
            id_paciente: pac.id,
            id_medico: med.id,
            id_sala: sala,
            id_horario: hor.id,
            estado: 'programada',
            motivo: `Control de rutina con ${med.especialidad}`,
            fecha_creacion: new Date().toISOString(),
            paciente: pac,
            medico: med,
            horario: hor,
          });
        }

        globalThis.__hospitalStore.disponibilidades.push({
          id_medico: med.id,
          id_sala: sala,
          id_horario: hor.id,
          estado,
          created_at: new Date().toISOString(),
          medico: med,
          horario: hor,
        });
      }
    }
  }

  return globalThis.__hospitalStore;
}

export class MemoryMedicoRepository implements IMedicoRepository {
  async findAll(): Promise<Medico[]> {
    return [...getStore().medicos].sort((a, b) => a.nombres_completos.localeCompare(b.nombres_completos));
  }
  async findById(id: string): Promise<Medico | null> {
    return getStore().medicos.find((m) => m.id === id) || null;
  }
  async findByEspecialidad(especialidad: string): Promise<Medico[]> {
    return getStore().medicos.filter((m) => m.especialidad === especialidad);
  }
  async create(data: CreateMedicoDTO): Promise<Medico> {
    const nuevo: Medico = {
      id: `med-${Date.now()}`,
      nombres_completos: data.nombres_completos.trim(),
      telefono: data.telefono.trim(),
      direccion: data.direccion.trim(),
      especialidad: data.especialidad.trim(),
      created_at: new Date().toISOString(),
    };
    getStore().medicos.push(nuevo);
    return nuevo;
  }
  async update(id: string, data: UpdateMedicoDTO): Promise<Medico> {
    const store = getStore();
    const index = store.medicos.findIndex((m) => m.id === id);
    if (index === -1) throw new Error('Médico no encontrado');
    store.medicos[index] = { ...store.medicos[index], ...data };
    return store.medicos[index];
  }
  async delete(id: string): Promise<void> {
    const store = getStore();
    store.medicos = store.medicos.filter((m) => m.id !== id);
  }
}

export class MemoryPacienteRepository implements IPacienteRepository {
  async findAll(): Promise<Paciente[]> {
    return [...getStore().pacientes].sort((a, b) => a.nombres_completos.localeCompare(b.nombres_completos));
  }
  async findById(id: string): Promise<Paciente | null> {
    return getStore().pacientes.find((p) => p.id === id) || null;
  }
  async create(data: CreatePacienteDTO): Promise<Paciente> {
    const nuevo: Paciente = {
      id: `pac-${Date.now()}`,
      nombres_completos: data.nombres_completos.trim(),
      telefono: data.telefono.trim(),
      direccion: data.direccion.trim(),
      genero: data.genero,
      created_at: new Date().toISOString(),
    };
    getStore().pacientes.push(nuevo);
    return nuevo;
  }
  async update(id: string, data: UpdatePacienteDTO): Promise<Paciente> {
    const store = getStore();
    const index = store.pacientes.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Paciente no encontrado');
    store.pacientes[index] = { ...store.pacientes[index], ...data };
    return store.pacientes[index];
  }
  async delete(id: string): Promise<void> {
    const store = getStore();
    store.pacientes = store.pacientes.filter((p) => p.id !== id);
  }
}

export class MemoryHorarioRepository implements IHorarioRepository {
  async findAll(): Promise<Horario[]> {
    return [...getStore().horarios].sort((a, b) => {
      if (a.fecha === b.fecha) return a.hora_inicial.localeCompare(b.hora_inicial);
      return a.fecha.localeCompare(b.fecha);
    });
  }
  async findById(id: string): Promise<Horario | null> {
    return getStore().horarios.find((h) => h.id === id) || null;
  }
  async findByFecha(fecha: string): Promise<Horario[]> {
    return getStore().horarios.filter((h) => h.fecha === fecha);
  }
  async create(data: CreateHorarioDTO): Promise<Horario> {
    const nuevo: Horario = {
      id: `hor-${Date.now()}`,
      lugar: data.lugar.trim(),
      fecha: data.fecha.trim(),
      hora_inicial: data.hora_inicial.trim(),
      hora_final: data.hora_final.trim(),
      created_at: new Date().toISOString(),
    };
    getStore().horarios.push(nuevo);
    return nuevo;
  }
  async update(id: string, data: UpdateHorarioDTO): Promise<Horario> {
    const store = getStore();
    const index = store.horarios.findIndex((h) => h.id === id);
    if (index === -1) throw new Error('Horario no encontrado');
    store.horarios[index] = { ...store.horarios[index], ...data };
    return store.horarios[index];
  }
  async delete(id: string): Promise<void> {
    const store = getStore();
    store.horarios = store.horarios.filter((h) => h.id !== id);
  }
}

export class MemoryDisponibilidadRepository implements IDisponibilidadRepository {
  async findAll(filtro?: FiltroDisponibilidadDTO): Promise<Disponibilidad[]> {
    return getStore().disponibilidades.filter((d) => {
      if (filtro?.id_medico && d.id_medico !== filtro.id_medico) return false;
      if (filtro?.estado !== undefined && d.estado !== filtro.estado) return false;
      if (filtro?.especialidad && d.medico?.especialidad !== filtro.especialidad) return false;
      if (filtro?.fecha && d.horario?.fecha !== filtro.fecha) return false;
      return true;
    });
  }
  async findLibres(filtro?: FiltroDisponibilidadDTO): Promise<Disponibilidad[]> {
    return this.findAll({ ...filtro, estado: 0 });
  }
  async findById(id_medico: string, id_sala: string, id_horario: string): Promise<Disponibilidad | null> {
    return getStore().disponibilidades.find(
      (d) => d.id_medico === id_medico && d.id_sala === id_sala && d.id_horario === id_horario
    ) || null;
  }
  async checkConflicto(id_medico: string, id_sala: string, id_horario: string) {
    const store = getStore();
    const exacto = store.disponibilidades.some(
      (d) => d.id_medico === id_medico && d.id_sala === id_sala && d.id_horario === id_horario
    );
    const medicoEnHorario = store.disponibilidades.some(
      (d) => d.id_medico === id_medico && d.id_horario === id_horario
    );
    const salaEnHorario = store.disponibilidades.some(
      (d) => d.id_sala === id_sala && d.id_horario === id_horario
    );
    return {
      conflictoExacto: exacto,
      conflictoMedico: medicoEnHorario,
      conflictoSala: salaEnHorario,
    };
  }
  async create(data: CreateDisponibilidadDTO): Promise<Disponibilidad> {
    const store = getStore();
    const conflictos = await this.checkConflicto(data.id_medico, data.id_sala, data.id_horario);
    if (conflictos.conflictoExacto) throw new Error('Esta disponibilidad ya existe registrada.');
    if (conflictos.conflictoMedico) throw new Error('El médico ya tiene asignada una disponibilidad en este horario.');
    if (conflictos.conflictoSala) throw new Error('La sala ya se encuentra asignada a otro médico en este horario.');

    const med = store.medicos.find((m) => m.id === data.id_medico);
    const hor = store.horarios.find((h) => h.id === data.id_horario);
    if (!med) throw new Error('Médico no encontrado');
    if (!hor) throw new Error('Horario no encontrado');

    const nueva: Disponibilidad = {
      id_medico: data.id_medico,
      id_sala: data.id_sala.trim(),
      id_horario: data.id_horario,
      estado: 0,
      created_at: new Date().toISOString(),
      medico: med,
      horario: hor,
    };
    store.disponibilidades.push(nueva);
    return nueva;
  }
  async delete(id_medico: string, id_sala: string, id_horario: string): Promise<void> {
    const store = getStore();
    store.disponibilidades = store.disponibilidades.filter(
      (d) => !(d.id_medico === id_medico && d.id_sala === id_sala && d.id_horario === id_horario)
    );
  }
}

export class MemoryCitaRepository implements ICitaRepository {
  async findAll(filtro?: FiltroCitaDTO): Promise<Cita[]> {
    return [...getStore().citas]
      .filter((c) => {
        if (filtro?.estado && c.estado !== filtro.estado) return false;
        if (filtro?.id_medico && c.id_medico !== filtro.id_medico) return false;
        if (filtro?.id_paciente && c.id_paciente !== filtro.id_paciente) return false;
        if (filtro?.fecha && c.horario?.fecha !== filtro.fecha) return false;
        return true;
      })
      .sort((a, b) => {
        const fA = a.horario?.fecha || '';
        const fB = b.horario?.fecha || '';
        return fB.localeCompare(fA);
      });
  }
  async findById(id: string): Promise<Cita | null> {
    return getStore().citas.find((c) => c.id === id) || null;
  }
  async crearConTransaccion(data: CreateCitaDTO): Promise<Cita> {
    const store = getStore();
    const dispIndex = store.disponibilidades.findIndex(
      (d) => d.id_medico === data.id_medico && d.id_sala === data.id_sala && d.id_horario === data.id_horario
    );
    if (dispIndex === -1) throw new Error('La disponibilidad seleccionada no existe en el sistema.');
    if (store.disponibilidades[dispIndex].estado === 1) {
      throw new Error('La disponibilidad seleccionada ya se encuentra ocupada por otra cita.');
    }

    const pac = store.pacientes.find((p) => p.id === data.id_paciente);
    if (!pac) throw new Error('El paciente especificado no existe.');

    // Bloqueo atómico de la disponibilidad
    store.disponibilidades[dispIndex].estado = 1;

    const nuevaCita: Cita = {
      id: `cita-${Date.now()}`,
      id_paciente: data.id_paciente,
      id_medico: data.id_medico,
      id_sala: data.id_sala,
      id_horario: data.id_horario,
      estado: 'programada',
      motivo: data.motivo.trim(),
      fecha_creacion: new Date().toISOString(),
      paciente: pac,
      medico: store.disponibilidades[dispIndex].medico,
      horario: store.disponibilidades[dispIndex].horario,
      disponibilidad: { ...store.disponibilidades[dispIndex] },
    };

    store.citas.unshift(nuevaCita);
    return nuevaCita;
  }
  async cancelarConTransaccion(id: string): Promise<Cita> {
    const store = getStore();
    const citaIndex = store.citas.findIndex((c) => c.id === id);
    if (citaIndex === -1) throw new Error('La cita médica no existe.');
    if (store.citas[citaIndex].estado === 'cancelada') throw new Error('La cita médica ya se encuentra cancelada.');

    store.citas[citaIndex].estado = 'cancelada';

    // Liberar disponibilidad
    const c = store.citas[citaIndex];
    const dispIndex = store.disponibilidades.findIndex(
      (d) => d.id_medico === c.id_medico && d.id_sala === c.id_sala && d.id_horario === c.id_horario
    );
    if (dispIndex !== -1) {
      store.disponibilidades[dispIndex].estado = 0;
    }

    return store.citas[citaIndex];
  }
  async marcarAtendida(id: string): Promise<Cita> {
    const store = getStore();
    const citaIndex = store.citas.findIndex((c) => c.id === id);
    if (citaIndex === -1) throw new Error('La cita no existe.');
    store.citas[citaIndex].estado = 'atendida';
    return store.citas[citaIndex];
  }
}

export class MemoryDashboardRepository implements IDashboardRepository {
  async getMetricas(): Promise<DashboardMetricasDTO> {
    const store = getStore();
    const today = new Date().toISOString().split('T')[0];
    const citasHoy = store.citas.filter((c) => c.horario?.fecha === today && c.estado !== 'cancelada').length;
    const dispLibres = store.disponibilidades.filter((d) => d.estado === 0).length;

    const conteoEsp: Record<string, number> = {};
    for (const c of store.citas) {
      if (c.estado !== 'cancelada') {
        const esp = c.medico?.especialidad || 'General';
        conteoEsp[esp] = (conteoEsp[esp] || 0) + 1;
      }
    }

    const citasPorEspecialidad = Object.entries(conteoEsp).map(([especialidad, total]) => ({
      especialidad,
      total,
    }));

    return {
      citas_hoy: citasHoy,
      disponibilidades_libres: dispLibres,
      citas_por_especialidad: citasPorEspecialidad,
      proximas_citas: store.citas.filter((c) => c.estado === 'programada').slice(0, 5),
      total_medicos: store.medicos.length,
      total_pacientes: store.pacientes.length,
    };
  }
}

export const createMemoryContainer = (): IRepositoryContainer => ({
  medicos: new MemoryMedicoRepository(),
  pacientes: new MemoryPacienteRepository(),
  horarios: new MemoryHorarioRepository(),
  disponibilidades: new MemoryDisponibilidadRepository(),
  citas: new MemoryCitaRepository(),
  dashboard: new MemoryDashboardRepository(),
});
