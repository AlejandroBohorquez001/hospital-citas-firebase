import { getFirestoreDB } from '@/lib/firebase-admin';
import { IDashboardRepository } from '../interfaces';
import { DashboardMetricasDTO, Cita } from '@/types';

export class FirestoreDashboardRepository implements IDashboardRepository {
  async getMetricas(): Promise<DashboardMetricasDTO> {
    const db = getFirestoreDB();
    const today = new Date().toISOString().split('T')[0];

    const [medicosSnap, pacientesSnap, dispLibresSnap, citasSnap] = await Promise.all([
      db.collection('medicos').count().get(),
      db.collection('pacientes').count().get(),
      db.collection('disponibilidades').where('estado', '==', 0).count().get(),
      db.collection('citas').get(),
    ]);

    const todasLasCitas = citasSnap.docs.map((doc) => doc.data() as Cita);

    let citasHoy = 0;
    const conteoEsp: Record<string, number> = {};
    const programadas: Cita[] = [];

    for (const cita of todasLasCitas) {
      if (cita.estado !== 'cancelada') {
        if (cita.horario?.fecha === today) {
          citasHoy++;
        }
        const esp = cita.medico?.especialidad || 'General';
        conteoEsp[esp] = (conteoEsp[esp] || 0) + 1;
      }

      if (cita.estado === 'programada') {
        programadas.push(cita);
      }
    }

    // Ordenar próximas citas
    programadas.sort((a, b) => {
      const fechaA = a.horario?.fecha || '';
      const fechaB = b.horario?.fecha || '';
      if (fechaA === fechaB) {
        return (a.horario?.hora_inicial || '').localeCompare(b.horario?.hora_inicial || '');
      }
      return fechaA.localeCompare(fechaB);
    });

    const citasPorEspecialidad = Object.entries(conteoEsp).map(
      ([especialidad, total]) => ({ especialidad, total })
    );

    return {
      citas_hoy: citasHoy,
      disponibilidades_libres: dispLibresSnap.data().count,
      citas_por_especialidad: citasPorEspecialidad,
      proximas_citas: programadas.slice(0, 5),
      total_medicos: medicosSnap.data().count,
      total_pacientes: pacientesSnap.data().count,
    };
  }
}
