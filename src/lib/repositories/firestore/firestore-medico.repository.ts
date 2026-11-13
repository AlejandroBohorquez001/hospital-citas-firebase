import { getFirestoreDB } from '@/lib/firebase-admin';
import { IMedicoRepository } from '../interfaces';
import { Medico, CreateMedicoDTO, UpdateMedicoDTO } from '@/types';

export class FirestoreMedicoRepository implements IMedicoRepository {
  private get collection() {
    return getFirestoreDB().collection('medicos');
  }

  async findAll(): Promise<Medico[]> {
    const snapshot = await this.collection.orderBy('nombres_completos', 'asc').get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Medico, 'id'>),
    }));
  }

  async findById(id: string): Promise<Medico | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    return {
      id: doc.id,
      ...(doc.data() as Omit<Medico, 'id'>),
    };
  }

  async findByEspecialidad(especialidad: string): Promise<Medico[]> {
    const snapshot = await this.collection
      .where('especialidad', '==', especialidad)
      .orderBy('nombres_completos', 'asc')
      .get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Medico, 'id'>),
    }));
  }

  async create(data: CreateMedicoDTO): Promise<Medico> {
    const docRef = this.collection.doc();
    const medico: Medico = {
      id: docRef.id,
      nombres_completos: data.nombres_completos.trim(),
      telefono: data.telefono.trim(),
      direccion: data.direccion.trim(),
      especialidad: data.especialidad.trim(),
      created_at: new Date().toISOString(),
    };
    await docRef.set(medico);
    return medico;
  }

  async update(id: string, data: UpdateMedicoDTO): Promise<Medico> {
    const docRef = this.collection.doc(id);
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`Médico con ID ${id} no encontrado.`);
    }

    const updateData: Record<string, string> = {};
    if (data.nombres_completos) updateData.nombres_completos = data.nombres_completos.trim();
    if (data.telefono) updateData.telefono = data.telefono.trim();
    if (data.direccion) updateData.direccion = data.direccion.trim();
    if (data.especialidad) updateData.especialidad = data.especialidad.trim();

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
