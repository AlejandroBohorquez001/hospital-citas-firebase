import { prisma } from '@/lib/prisma';
import { IDisponibilidadRepository } from '../interfaces';
import { Disponibilidad, CreateDisponibilidadDTO, FiltroDisponibilidadDTO } from '@/types';

export class PrismaDisponibilidadRepository implements IDisponibilidadRepository {
  async findAll(filtro?: FiltroDisponibilidadDTO): Promise<Disponibilidad[]> {
    return prisma.disponibilidad.findMany({
      where: {
        ...(filtro?.id_medico && { id_medico: filtro.id_medico }),
        ...(filtro?.estado !== undefined && { estado: filtro.estado }),
        ...(filtro?.especialidad && {
          medico: {
            especialidad: filtro.especialidad,
          },
        }),
        ...(filtro?.fecha && {
          horario: {
            fecha: filtro.fecha,
          },
        }),
      },
      include: {
        medico: true,
        horario: true,
      },
      orderBy: [
        { horario: { fecha: 'asc' } },
        { horario: { hora_inicial: 'asc' } },
      ],
    }) as unknown as Promise<Disponibilidad[]>;
  }

  async findLibres(filtro?: FiltroDisponibilidadDTO): Promise<Disponibilidad[]> {
    return this.findAll({
      ...filtro,
      estado: 0,
    });
  }

  async findById(
    id_medico: string,
    id_sala: string,
    id_horario: string
  ): Promise<Disponibilidad | null> {
    return prisma.disponibilidad.findUnique({
      where: {
        id_medico_id_sala_id_horario: {
          id_medico,
          id_sala,
          id_horario,
        },
      },
      include: {
        medico: true,
        horario: true,
      },
    }) as unknown as Promise<Disponibilidad | null>;
  }

  async checkConflicto(
    id_medico: string,
    id_sala: string,
    id_horario: string
  ): Promise<{
    conflictoMedico: boolean;
    conflictoSala: boolean;
    conflictoExacto: boolean;
  }> {
    const [medicoEnHorario, salaEnHorario, exacto] = await Promise.all([
      prisma.disponibilidad.findFirst({
        where: { id_medico, id_horario },
      }),
      prisma.disponibilidad.findFirst({
        where: { id_sala, id_horario },
      }),
      prisma.disponibilidad.findUnique({
        where: {
          id_medico_id_sala_id_horario: {
            id_medico,
            id_sala,
            id_horario,
          },
        },
      }),
    ]);

    return {
      conflictoMedico: !!medicoEnHorario,
      conflictoSala: !!salaEnHorario,
      conflictoExacto: !!exacto,
    };
  }

  async create(data: CreateDisponibilidadDTO): Promise<Disponibilidad> {
    const conflictos = await this.checkConflicto(
      data.id_medico,
      data.id_sala,
      data.id_horario
    );

    if (conflictos.conflictoExacto) {
      throw new Error('Esta disponibilidad ya existe registrada.');
    }
    if (conflictos.conflictoMedico) {
      throw new Error('El médico ya tiene asignada una disponibilidad en este horario.');
    }
    if (conflictos.conflictoSala) {
      throw new Error('La sala ya se encuentra asignada a otro médico en este horario.');
    }

    return prisma.disponibilidad.create({
      data: {
        id_medico: data.id_medico,
        id_sala: data.id_sala.trim(),
        id_horario: data.id_horario,
        estado: 0,
      },
      include: {
        medico: true,
        horario: true,
      },
    }) as unknown as Promise<Disponibilidad>;
  }

  async delete(
    id_medico: string,
    id_sala: string,
    id_horario: string
  ): Promise<void> {
    // Si tiene citas activas asociadas, validar
    const citaActiva = await prisma.cita.findFirst({
      where: {
        id_medico,
        id_sala,
        id_horario,
        estado: 'programada',
      },
    });

    if (citaActiva) {
      throw new Error('No se puede eliminar la disponibilidad porque tiene una cita programada activa.');
    }

    await prisma.disponibilidad.delete({
      where: {
        id_medico_id_sala_id_horario: {
          id_medico,
          id_sala,
          id_horario,
        },
      },
    });
  }
}
