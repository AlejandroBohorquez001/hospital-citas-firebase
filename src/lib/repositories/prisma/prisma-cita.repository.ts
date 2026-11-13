import { prisma } from '@/lib/prisma';
import { ICitaRepository } from '../interfaces';
import { Cita, CreateCitaDTO, FiltroCitaDTO } from '@/types';

export class PrismaCitaRepository implements ICitaRepository {
  async findAll(filtro?: FiltroCitaDTO): Promise<Cita[]> {
    return prisma.cita.findMany({
      where: {
        ...(filtro?.estado && { estado: filtro.estado }),
        ...(filtro?.id_medico && { id_medico: filtro.id_medico }),
        ...(filtro?.id_paciente && { id_paciente: filtro.id_paciente }),
        ...(filtro?.fecha && {
          horario: {
            fecha: filtro.fecha,
          },
        }),
      },
      include: {
        paciente: true,
        medico: true,
        horario: true,
        disponibilidad: true,
      },
      orderBy: [
        { horario: { fecha: 'desc' } },
        { horario: { hora_inicial: 'desc' } },
      ],
    }) as unknown as Promise<Cita[]>;
  }

  async findById(id: string): Promise<Cita | null> {
    return prisma.cita.findUnique({
      where: { id },
      include: {
        paciente: true,
        medico: true,
        horario: true,
        disponibilidad: true,
      },
    }) as unknown as Promise<Cita | null>;
  }

  async crearConTransaccion(data: CreateCitaDTO): Promise<Cita> {
    return prisma.$transaction(async (tx) => {
      // 1. Verificar la disponibilidad
      const disp = await tx.disponibilidad.findUnique({
        where: {
          id_medico_id_sala_id_horario: {
            id_medico: data.id_medico,
            id_sala: data.id_sala,
            id_horario: data.id_horario,
          },
        },
      });

      if (!disp) {
        throw new Error('La disponibilidad seleccionada no existe en el sistema.');
      }

      if (disp.estado === 1) {
        throw new Error('La disponibilidad seleccionada ya se encuentra ocupada por otra cita.');
      }

      // 2. Marcar la disponibilidad como ocupada (estado = 1)
      await tx.disponibilidad.update({
        where: {
          id_medico_id_sala_id_horario: {
            id_medico: data.id_medico,
            id_sala: data.id_sala,
            id_horario: data.id_horario,
          },
        },
        data: {
          estado: 1,
        },
      });

      // 3. Crear el registro de la cita
      const nuevaCita = await tx.cita.create({
        data: {
          id_paciente: data.id_paciente,
          id_medico: data.id_medico,
          id_sala: data.id_sala,
          id_horario: data.id_horario,
          estado: 'programada',
          motivo: data.motivo.trim(),
        },
        include: {
          paciente: true,
          medico: true,
          horario: true,
          disponibilidad: true,
        },
      });

      return nuevaCita as unknown as Cita;
    });
  }

  async cancelarConTransaccion(id: string): Promise<Cita> {
    return prisma.$transaction(async (tx) => {
      // 1. Obtener la cita
      const cita = await tx.cita.findUnique({
        where: { id },
      });

      if (!cita) {
        throw new Error('La cita médica no existe.');
      }

      if (cita.estado === 'cancelada') {
        throw new Error('La cita médica ya se encuentra cancelada.');
      }

      // 2. Actualizar el estado de la cita a 'cancelada'
      const citaCancelada = await tx.cita.update({
        where: { id },
        data: {
          estado: 'cancelada',
        },
        include: {
          paciente: true,
          medico: true,
          horario: true,
          disponibilidad: true,
        },
      });

      // 3. Devolver la disponibilidad a libre (estado = 0)
      await tx.disponibilidad.update({
        where: {
          id_medico_id_sala_id_horario: {
            id_medico: cita.id_medico,
            id_sala: cita.id_sala,
            id_horario: cita.id_horario,
          },
        },
        data: {
          estado: 0,
        },
      });

      return citaCancelada as unknown as Cita;
    });
  }

  async marcarAtendida(id: string): Promise<Cita> {
    const cita = await prisma.cita.findUnique({ where: { id } });
    if (!cita) {
      throw new Error('La cita no existe.');
    }
    if (cita.estado === 'cancelada') {
      throw new Error('No se puede marcar como atendida una cita cancelada.');
    }

    return prisma.cita.update({
      where: { id },
      data: {
        estado: 'atendida',
      },
      include: {
        paciente: true,
        medico: true,
        horario: true,
      },
    }) as unknown as Promise<Cita>;
  }
}
