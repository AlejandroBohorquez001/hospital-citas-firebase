import { prisma } from '@/lib/prisma';
import { IMedicoRepository } from '../interfaces';
import { Medico, CreateMedicoDTO, UpdateMedicoDTO } from '@/types';

export class PrismaMedicoRepository implements IMedicoRepository {
  async findAll(): Promise<Medico[]> {
    return prisma.medico.findMany({
      orderBy: { nombres_completos: 'asc' },
    });
  }

  async findById(id: string): Promise<Medico | null> {
    return prisma.medico.findUnique({
      where: { id },
    });
  }

  async findByEspecialidad(especialidad: string): Promise<Medico[]> {
    return prisma.medico.findMany({
      where: { especialidad },
      orderBy: { nombres_completos: 'asc' },
    });
  }

  async create(data: CreateMedicoDTO): Promise<Medico> {
    return prisma.medico.create({
      data: {
        nombres_completos: data.nombres_completos.trim(),
        telefono: data.telefono.trim(),
        direccion: data.direccion.trim(),
        especialidad: data.especialidad.trim(),
      },
    });
  }

  async update(id: string, data: UpdateMedicoDTO): Promise<Medico> {
    return prisma.medico.update({
      where: { id },
      data: {
        ...(data.nombres_completos && { nombres_completos: data.nombres_completos.trim() }),
        ...(data.telefono && { telefono: data.telefono.trim() }),
        ...(data.direccion && { direccion: data.direccion.trim() }),
        ...(data.especialidad && { especialidad: data.especialidad.trim() }),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.medico.delete({
      where: { id },
    });
  }
}
