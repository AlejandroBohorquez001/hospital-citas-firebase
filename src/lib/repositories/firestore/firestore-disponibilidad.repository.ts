import { getFirestoreDB } from '@/lib/firebase-admin';
import { IDisponibilidadRepository } from '../interfaces';
import {
  Disponibilidad,
  CreateDisponibilidadDTO,
  FiltroDisponibilidadDTO,
  Medico,
  Horario,
} from '@/types';

export class FirestoreDisponibilidadRepository implements IDisponibilidadRepository {
  private get collection() {
    return getFirestoreDB().collection('disponibilidades');
  }

  private makeDocId(id_medico: string, id_sala: string, id_horario: string): string {
    return `${id_medico}_${id_sala}_${id_horario}`;
  }

  async findAll(filtro?: FiltroDisponibilidadDTO): Promise<Disponibilidad[]> {
    let query: FirebaseFirestore.Query = this.collection;

    if (filtro?.estado !== undefined) {
      query = query.where('estado', '==', filtro.estado);
    }
    if (filtro?.id_medico) {
      query = query.where('id_medico', '==', filtro.id_medico);
    }
    if (filtro?.especialidad) {
      query = query.where('medico.especialidad', '==', filtro.especialidad);
    }
    if (filtro?.fecha) {
      query = query.where('horario.fecha', '==', filtro.fecha);
    }

    const snapshot = await query.get();
    const items = snapshot.docs.map((doc) => doc.data() as Disponibilidad);

    // Ordenar por fecha y hora inicial
    return items.sort((a, b) => {
      const fechaA = a.horario?.fecha || '';
      const fechaB = b.horario?.fecha || '';
      if (fechaA === fechaB) {
        const horaA = a.horario?.hora_inicial || '';
        const horaB = b.horario?.hora_inicial || '';
        return horaA.localeCompare(horaB);
      }
      return fechaA.localeCompare(fechaB);
    });
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
    const docId = this.makeDocId(id_medico, id_sala, id_horario);
    const doc = await this.collection.doc(docId).get();
    if (!doc.exists) return null;
    return doc.data() as Disponibilidad;
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
    const docId = this.makeDocId(id_medico, id_sala, id_horario);

    const [exactoDoc, medicoDocs, salaDocs] = await Promise.all([
      this.collection.doc(docId).get(),
      this.collection
        .where('id_medico', '==', id_medico)
        .where('id_horario', '==', id_horario)
        .limit(1)
        .get(),
      this.collection
        .where('id_sala', '==', id_sala)
        .where('id_horario', '==', id_horario)
        .limit(1)
        .get(),
    ]);

    return {
      conflictoExacto: exactoDoc.exists,
      conflictoMedico: !medicoDocs.empty,
      conflictoSala: !salaDocs.empty,
    };
  }

  async create(data: CreateDisponibilidadDTO): Promise<Disponibilidad> {
    const db = getFirestoreDB();
    const docId = this.makeDocId(data.id_medico, data.id_sala, data.id_horario);

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

    // Obtener los datos desnormalizados del médico y del horario
    const [medicoDoc, horarioDoc] = await Promise.all([
      db.collection('medicos').doc(data.id_medico).get(),
      db.collection('horarios').doc(data.id_horario).get(),
    ]);

    if (!medicoDoc.exists) {
      throw new Error('El médico especificado no existe.');
    }
    if (!horarioDoc.exists) {
      throw new Error('El horario especificado no existe.');
    }

    const medicoData = { id: medicoDoc.id, ...medicoDoc.data() } as Medico;
    const horarioData = { id: horarioDoc.id, ...horarioDoc.data() } as Horario;

    const disponibilidad: Disponibilidad = {
      id_medico: data.id_medico,
      id_sala: data.id_sala.trim(),
      id_horario: data.id_horario,
      estado: 0,
      created_at: new Date().toISOString(),
      medico: medicoData,
      horario: horarioData,
    };

    await this.collection.doc(docId).set(disponibilidad);
    return disponibilidad;
  }

  async delete(
    id_medico: string,
    id_sala: string,
    id_horario: string
  ): Promise<void> {
    const db = getFirestoreDB();
    const docId = this.makeDocId(id_medico, id_sala, id_horario);

    // Verificar si hay citas activas
    const citasActivas = await db
      .collection('citas')
      .where('id_medico', '==', id_medico)
      .where('id_sala', '==', id_sala)
      .where('id_horario', '==', id_horario)
      .where('estado', '==', 'programada')
      .limit(1)
      .get();

    if (!citasActivas.empty) {
      throw new Error('No se puede eliminar la disponibilidad porque tiene una cita programada activa.');
    }

    await this.collection.doc(docId).delete();
  }
}
