import { getFirestoreDB } from '@/lib/firebase-admin';
import { ICitaRepository } from '../interfaces';
import { Cita, CreateCitaDTO, FiltroCitaDTO, Paciente, Disponibilidad } from '@/types';

export class FirestoreCitaRepository implements ICitaRepository {
  private get collection() {
    return getFirestoreDB().collection('citas');
  }

  async findAll(filtro?: FiltroCitaDTO): Promise<Cita[]> {
    let query: FirebaseFirestore.Query = this.collection;

    if (filtro?.estado) {
      query = query.where('estado', '==', filtro.estado);
    }
    if (filtro?.id_medico) {
      query = query.where('id_medico', '==', filtro.id_medico);
    }
    if (filtro?.id_paciente) {
      query = query.where('id_paciente', '==', filtro.id_paciente);
    }
    if (filtro?.fecha) {
      query = query.where('horario.fecha', '==', filtro.fecha);
    }

    const snapshot = await query.get();
    const items = snapshot.docs.map((doc) => doc.data() as Cita);

    // Ordenar descendente por fecha y hora
    return items.sort((a, b) => {
      const fechaA = a.horario?.fecha || '';
      const fechaB = b.horario?.fecha || '';
      if (fechaA === fechaB) {
        const horaA = a.horario?.hora_inicial || '';
        const horaB = b.horario?.hora_inicial || '';
        return horaB.localeCompare(horaA);
      }
      return fechaB.localeCompare(fechaA);
    });
  }

  async findById(id: string): Promise<Cita | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    return doc.data() as Cita;
  }

  async crearConTransaccion(data: CreateCitaDTO): Promise<Cita> {
    const db = getFirestoreDB();
    const dispDocId = `${data.id_medico}_${data.id_sala}_${data.id_horario}`;
    const dispRef = db.collection('disponibilidades').doc(dispDocId);
    const pacienteRef = db.collection('pacientes').doc(data.id_paciente);
    const citaRef = this.collection.doc();

    return db.runTransaction(async (transaction) => {
      // 1. Lecturas iniciales de la transacción
      const [dispDoc, pacienteDoc] = await Promise.all([
        transaction.get(dispRef),
        transaction.get(pacienteRef),
      ]);

      if (!dispDoc.exists) {
        throw new Error('La disponibilidad seleccionada no existe en el sistema.');
      }

      const dispData = dispDoc.data() as Disponibilidad;

      if (dispData.estado === 1) {
        throw new Error('La disponibilidad seleccionada ya se encuentra ocupada por otra cita.');
      }

      if (!pacienteDoc.exists) {
        throw new Error('El paciente seleccionado no existe.');
      }

      const pacienteData = { id: pacienteDoc.id, ...pacienteDoc.data() } as Paciente;

      // 2. Escrituras atómicas
      transaction.update(dispRef, {
        estado: 1,
        updatedAt: new Date().toISOString(),
      });

      const nuevaCita: Cita = {
        id: citaRef.id,
        id_paciente: data.id_paciente,
        id_medico: data.id_medico,
        id_sala: data.id_sala,
        id_horario: data.id_horario,
        estado: 'programada',
        motivo: data.motivo.trim(),
        fecha_creacion: new Date().toISOString(),
        paciente: pacienteData,
        medico: dispData.medico,
        horario: dispData.horario,
        disponibilidad: {
          ...dispData,
          estado: 1,
        },
      };

      transaction.set(citaRef, nuevaCita);

      return nuevaCita;
    });
  }

  async cancelarConTransaccion(id: string): Promise<Cita> {
    const db = getFirestoreDB();
    const citaRef = this.collection.doc(id);

    return db.runTransaction(async (transaction) => {
      // Lecturas
      const citaDoc = await transaction.get(citaRef);
      if (!citaDoc.exists) {
        throw new Error('La cita médica no existe.');
      }

      const citaData = citaDoc.data() as Cita;
      if (citaData.estado === 'cancelada') {
        throw new Error('La cita médica ya se encuentra cancelada.');
      }

      const dispDocId = `${citaData.id_medico}_${citaData.id_sala}_${citaData.id_horario}`;
      const dispRef = db.collection('disponibilidades').doc(dispDocId);
      const dispDoc = await transaction.get(dispRef);

      // Escrituras
      transaction.update(citaRef, {
        estado: 'cancelada',
      });

      if (dispDoc.exists) {
        transaction.update(dispRef, {
          estado: 0,
          updatedAt: new Date().toISOString(),
        });
      }

      return {
        ...citaData,
        estado: 'cancelada',
      };
    });
  }

  async marcarAtendida(id: string): Promise<Cita> {
    const citaRef = this.collection.doc(id);
    const doc = await citaRef.get();
    if (!doc.exists) {
      throw new Error('La cita no existe.');
    }
    const data = doc.data() as Cita;
    if (data.estado === 'cancelada') {
      throw new Error('No se puede marcar como atendida una cita cancelada.');
    }

    await citaRef.update({ estado: 'atendida' });
    return {
      ...data,
      estado: 'atendida',
    };
  }
}
