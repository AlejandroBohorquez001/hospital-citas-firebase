import { getFirestoreDB } from '@/lib/firebase-admin';
import { IHorarioRepository } from '../interfaces';
import { Horario, CreateHorarioDTO, UpdateHorarioDTO } from '@/types';

export class FirestoreHorarioRepository implements IHorarioRepository {
  private get collection() {
    return getFirestoreDB().collection('horarios');
  }

  async findAll(): Promise<Horario[]> {
    const snapshot = await this.collection.orderBy('fecha', 'asc').get();
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Horario, 'id'>),
    }));
    return items.sort((a, b) => {
      if (a.fecha === b.fecha) {
        return a.hora_inicial.localeCompare(b.hora_inicial);
      }
      return a.fecha.localeCompare(b.fecha);
    });
  }

  async findById(id: string): Promise<Horario | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    return {
      id: doc.id,
      ...(doc.data() as Omit<Horario, 'id'>),
    };
  }

  async findByFecha(fecha: string): Promise<Horario[]> {
    const snapshot = await this.collection
      .where('fecha', '==', fecha)
      .get();
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Horario, 'id'>),
    }));
    return items.sort((a, b) => a.hora_inicial.localeCompare(b.hora_inicial));
  }

  async create(data: CreateHorarioDTO): Promise<Horario> {
    const docRef = this.collection.doc();
    const horario: Horario = {
      id: docRef.id,
      lugar: data.lugar.trim(),
      fecha: data.fecha.trim(),
      hora_inicial: data.hora_inicial.trim(),
      hora_final: data.hora_final.trim(),
      created_at: new Date().toISOString(),
    };
    await docRef.set(horario);
    return horario;
  }

  async update(id: string, data: UpdateHorarioDTO): Promise<Horario> {
    const docRef = this.collection.doc(id);
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`Horario con ID ${id} no encontrado.`);
    }

    const updateData: Record<string, string> = {};
    if (data.lugar) updateData.lugar = data.lugar.trim();
    if (data.fecha) updateData.fecha = data.fecha.trim();
    if (data.hora_inicial) updateData.hora_inicial = data.hora_inicial.trim();
    if (data.hora_final) updateData.hora_final = data.hora_final.trim();

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
