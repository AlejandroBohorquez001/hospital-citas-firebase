import { prisma } from '@/lib/prisma';
import { IHorarioRepository } from '../interfaces';
import { Horario, CreateHorarioDTO, UpdateHorarioDTO } from '@/types';

export class PrismaHorarioRepository implements IHorarioRepository {
  async findAll(): Promise<Horario[]> {
    return prisma.horario.findMany({
      orderBy: [{ fecha: 'asc' }, { hora_inicial: 'asc' }],
    });
  }

  async findById(id: string): Promise<Horario | null> {
    return prisma.horario.findUnique({
      where: { id },
    });
  }

  async findByFecha(fecha: string): Promise<Horario[]> {
    return prisma.horario.findMany({
      where: { fecha },
      orderBy: { hora_inicial: 'asc' },
    });
  }

  async create(data: CreateHorarioDTO): Promise<Horario> {
    return prisma.horario.create({
      data: {
        lugar: data.lugar.trim(),
        fecha: data.fecha.trim(),
        hora_inicial: data.hora_inicial.trim(),
        hora_final: data.hora_final.trim(),
      },
    });
  }

  async update(id: string, data: UpdateHorarioDTO): Promise<Horario> {
    return prisma.horario.update({
      where: { id },
      data: {
        ...(data.lugar && { lugar: data.lugar.trim() }),
        ...(data.fecha && { fecha: data.fecha.trim() }),
        ...(data.hora_inicial && { hora_inicial: data.hora_inicial.trim() }),
        ...(data.hora_final && { hora_final: data.hora_final.trim() }),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.horario.delete({
      where: { id },
    });
  }
}
