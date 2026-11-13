export interface Medico {
  id: string;
  nombres_completos: string;
  telefono: string;
  direccion: string;
  especialidad: string;
  created_at?: Date | string;
}

export interface Paciente {
  id: string;
  nombres_completos: string;
  telefono: string;
  direccion: string;
  genero: string; // "M" | "F" | "Otro"
  created_at?: Date | string;
}

export interface Horario {
  id: string;
  lugar: string;
  fecha: string; // YYYY-MM-DD
  hora_inicial: string; // HH:mm
  hora_final: string; // HH:mm
  created_at?: Date | string;
}

export interface Disponibilidad {
  id_medico: string;
  id_sala: string;
  id_horario: string;
  estado: number; // 0 = libre, 1 = ocupada
  created_at?: Date | string;
  medico?: Medico;
  horario?: Horario;
}

export interface Cita {
  id: string;
  id_paciente: string;
  id_medico: string;
  id_sala: string;
  id_horario: string;
  estado: 'programada' | 'cancelada' | 'atendida';
  motivo: string;
  fecha_creacion?: Date | string;
  paciente?: Paciente;
  medico?: Medico;
  horario?: Horario;
  disponibilidad?: Disponibilidad;
}

// DTOs
export interface CreateMedicoDTO {
  nombres_completos: string;
  telefono: string;
  direccion: string;
  especialidad: string;
}

export interface UpdateMedicoDTO extends Partial<CreateMedicoDTO> {}

export interface CreatePacienteDTO {
  nombres_completos: string;
  telefono: string;
  direccion: string;
  genero: string;
}

export interface UpdatePacienteDTO extends Partial<CreatePacienteDTO> {}

export interface CreateHorarioDTO {
  lugar: string;
  fecha: string;
  hora_inicial: string;
  hora_final: string;
}

export interface UpdateHorarioDTO extends Partial<CreateHorarioDTO> {}

export interface CreateDisponibilidadDTO {
  id_medico: string;
  id_sala: string;
  id_horario: string;
}

export interface CreateCitaDTO {
  id_paciente: string;
  id_medico: string;
  id_sala: string;
  id_horario: string;
  motivo: string;
}

export interface FiltroDisponibilidadDTO {
  id_medico?: string;
  especialidad?: string;
  fecha?: string;
  estado?: number;
}

export interface FiltroCitaDTO {
  fecha?: string;
  estado?: string;
  id_medico?: string;
  id_paciente?: string;
}

export interface DashboardMetricasDTO {
  citas_hoy: number;
  disponibilidades_libres: number;
  citas_por_especialidad: { especialidad: string; total: number }[];
  proximas_citas: Cita[];
  total_medicos: number;
  total_pacientes: number;
}
