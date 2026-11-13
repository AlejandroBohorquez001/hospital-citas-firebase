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

export interface IMedicoRepository {
  findAll(): Promise<Medico[]>;
  findById(id: string): Promise<Medico | null>;
  findByEspecialidad(especialidad: string): Promise<Medico[]>;
  create(data: CreateMedicoDTO): Promise<Medico>;
  update(id: string, data: UpdateMedicoDTO): Promise<Medico>;
  delete(id: string): Promise<void>;
}

export interface IPacienteRepository {
  findAll(): Promise<Paciente[]>;
  findById(id: string): Promise<Paciente | null>;
  create(data: CreatePacienteDTO): Promise<Paciente>;
  update(id: string, data: UpdatePacienteDTO): Promise<Paciente>;
  delete(id: string): Promise<void>;
}

export interface IHorarioRepository {
  findAll(): Promise<Horario[]>;
  findById(id: string): Promise<Horario | null>;
  findByFecha(fecha: string): Promise<Horario[]>;
  create(data: CreateHorarioDTO): Promise<Horario>;
  update(id: string, data: UpdateHorarioDTO): Promise<Horario>;
  delete(id: string): Promise<void>;
}

export interface IDisponibilidadRepository {
  findAll(filtro?: FiltroDisponibilidadDTO): Promise<Disponibilidad[]>;
  findLibres(filtro?: FiltroDisponibilidadDTO): Promise<Disponibilidad[]>;
  findById(id_medico: string, id_sala: string, id_horario: string): Promise<Disponibilidad | null>;
  checkConflicto(id_medico: string, id_sala: string, id_horario: string): Promise<{
    conflictoMedico: boolean;
    conflictoSala: boolean;
    conflictoExacto: boolean;
  }>;
  create(data: CreateDisponibilidadDTO): Promise<Disponibilidad>;
  delete(id_medico: string, id_sala: string, id_horario: string): Promise<void>;
}

export interface ICitaRepository {
  findAll(filtro?: FiltroCitaDTO): Promise<Cita[]>;
  findById(id: string): Promise<Cita | null>;
  crearConTransaccion(data: CreateCitaDTO): Promise<Cita>;
  cancelarConTransaccion(id: string): Promise<Cita>;
  marcarAtendida(id: string): Promise<Cita>;
}

export interface IDashboardRepository {
  getMetricas(): Promise<DashboardMetricasDTO>;
}

export interface IRepositoryContainer {
  medicos: IMedicoRepository;
  pacientes: IPacienteRepository;
  horarios: IHorarioRepository;
  disponibilidades: IDisponibilidadRepository;
  citas: ICitaRepository;
  dashboard: IDashboardRepository;
}
