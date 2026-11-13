import { getFirestoreDB } from '@/lib/firebase-admin';
import { IPacienteRepository } from '../interfaces';
import { Paciente, CreatePacienteDTO, UpdatePacienteDTO } from '@/types';

export class FirestorePacienteRepository implements IPacienteRepository {
  private get collection() {
    return getFirestoreDB().collection('pacientes');
  }

  async findAll(): Promise<Paciente[]> {
    const snapshot = await this.collection.orderBy('nombres_completos', 'asc').get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Paciente, 'id'>),
    }));
  }

  async findById(id: string): Promise<Paciente | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    return {
      id: doc.id,
      ...(doc.data() as Omit<Paciente, 'id'>),
    };
  }

  async create(data: CreatePacienteDTO): Promise<Paciente> {
    const docRef = this.collection.doc();
    const paciente: Paciente = {
      id: docRef.id,
      nombres_completos: data.nombres_completos.trim(),
      telefono: data.telefono.trim(),
      direccion: data.direccion.trim(),
      genero: data.genero,
      created_at: new Date().toISOString(),
    };
    await docRef.set(paciente);
    return paciente;
  }

  async update(id: string, data: UpdatePacienteDTO): Promise<Paciente> {
    const docRef = this.collection.doc(id);
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`Paciente con ID ${id} no encontrado.`);
    }

    const updateData: Record<string, string> = {};
    if (data.nombres_completos) updateData.nombres_completos = data.nombres_completos.trim();
    if (data.telefono) updateData.telefono = data.telefono.trim();
    if (data.direccion) updateData.direccion = data.direccion.trim();
    if (data.genero) updateData.genero = data.genero;

    await docRef.update(updateData);
    return {
      ...existing,
      ...updateData,
    };
  }

  async delete(id: string): Promise<void> {
    await this.collection.doc(id).delete();
  }
}
