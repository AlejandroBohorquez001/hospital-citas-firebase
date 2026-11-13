import { prisma } from '@/lib/prisma';
import { IPacienteRepository } from '../interfaces';
import { Paciente, CreatePacienteDTO, UpdatePacienteDTO } from '@/types';

export class PrismaPacienteRepository implements IPacienteRepository {
  async findAll(): Promise<Paciente[]> {
    return prisma.paciente.findMany({
      orderBy: { nombres_completos: 'asc' },
    });
  }

  async findById(id: string): Promise<Paciente | null> {
    return prisma.paciente.findUnique({
      where: { id },
    });
  }

  async create(data: CreatePacienteDTO): Promise<Paciente> {
    return prisma.paciente.create({
      data: {
        nombres_completos: data.nombres_completos.trim(),
        telefono: data.telefono.trim(),
        direccion: data.direccion.trim(),
        genero: data.genero,
      },
    });
  }

  async update(id: string, data: UpdatePacienteDTO): Promise<Paciente> {
    return prisma.paciente.update({
      where: { id },
      data: {
        ...(data.nombres_completos && { nombres_completos: data.nombres_completos.trim() }),
        ...(data.telefono && { telefono: data.telefono.trim() }),
        ...(data.direccion && { direccion: data.direccion.trim() }),
        ...(data.genero && { genero: data.genero }),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.paciente.delete({
      where: { id },
    });
  }
}
