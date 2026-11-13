import { getFirestoreDB } from '../src/lib/firebase-admin';
import { SEED_MEDICOS, SEED_PACIENTES, getFechasSeed, BLOQUES_HORARIOS, SALAS } from './seed-data';
import { Medico, Paciente, Horario, Disponibilidad, Cita } from '../src/types';

async function limpiarColeccion(collectionName: string) {
  const db = getFirestoreDB();
  const snapshot = await db.collection(collectionName).get();
  const batch = db.batch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
}

async function main() {
  console.log('--- Iniciando Seed en Firebase Firestore ---');
  const db = getFirestoreDB();

  console.log('Limpiando colecciones existentes...');
  await limpiarColeccion('citas');
  await limpiarColeccion('disponibilidades');
  await limpiarColeccion('horarios');
  await limpiarColeccion('pacientes');
  await limpiarColeccion('medicos');

  // 1. Médicos
  console.log('Insertando médicos...');
  const medicosCreados: Medico[] = [];
  for (const m of SEED_MEDICOS) {
    const docRef = db.collection('medicos').doc();
    const medico: Medico = {
      id: docRef.id,
      ...m,
      created_at: new Date().toISOString(),
    };
    await docRef.set(medico);
    medicosCreados.push(medico);
  }
  console.log(`✓ ${medicosCreados.length} médicos insertados en Firestore.`);

  // 2. Pacientes
  console.log('Insertando pacientes...');
  const pacientesCreados: Paciente[] = [];
  for (const p of SEED_PACIENTES) {
    const docRef = db.collection('pacientes').doc();
    const paciente: Paciente = {
      id: docRef.id,
      ...p,
      created_at: new Date().toISOString(),
    };
    await docRef.set(paciente);
    pacientesCreados.push(paciente);
  }
  console.log(`✓ ${pacientesCreados.length} pacientes insertados en Firestore.`);

  // 3. Horarios
  console.log('Insertando horarios...');
  const fechas = getFechasSeed();
  const horariosCreados: Horario[] = [];

  for (const fecha of fechas) {
    for (const bloque of BLOQUES_HORARIOS) {
      const docRef = db.collection('horarios').doc();
      const horario: Horario = {
        id: docRef.id,
        lugar: 'Pabellón Central - Torre Médica A',
        fecha,
        hora_inicial: bloque.hora_inicial,
        hora_final: bloque.hora_final,
        created_at: new Date().toISOString(),
      };
      await docRef.set(horario);
      horariosCreados.push(horario);
    }
  }
  console.log(`✓ ${horariosCreados.length} horarios creados en Firestore.`);

  // 4. Disponibilidades y Citas
  console.log('Generando disponibilidades desnormalizadas...');
  let totalDisponibilidades = 0;
  let totalCitas = 0;

  for (let mIdx = 0; mIdx < medicosCreados.length; mIdx++) {
    const medico = medicosCreados[mIdx];
    const sala = SALAS[mIdx % SALAS.length];

    for (let hStep = 0; hStep < 4; hStep++) {
      const hIdx = (mIdx * 4 + hStep) % horariosCreados.length;
      const horario = horariosCreados[hIdx];
      const docId = `${medico.id}_${sala}_${horario.id}`;

      let estadoInicial = 0;
      let citaEjemplo: Cita | null = null;

      if (hStep === 0 && mIdx < pacientesCreados.length) {
        estadoInicial = 1;
        const paciente = pacientesCreados[mIdx];
        const citaRef = db.collection('citas').doc();
        citaEjemplo = {
          id: citaRef.id,
          id_paciente: paciente.id,
          id_medico: medico.id,
          id_sala: sala,
          id_horario: horario.id,
          estado: 'programada',
          motivo: `Control de rutina con ${medico.especialidad}`,
          fecha_creacion: new Date().toISOString(),
          paciente,
          medico,
          horario,
        };
      } else if (hStep === 1 && mIdx === 0) {
        estadoInicial = 1;
        const paciente = pacientesCreados[5];
        const citaRef = db.collection('citas').doc();
        citaEjemplo = {
          id: citaRef.id,
          id_paciente: paciente.id,
          id_medico: medico.id,
          id_sala: sala,
          id_horario: horario.id,
          estado: 'atendida',
          motivo: 'Evaluación médica prioritaria finalizada',
          fecha_creacion: new Date().toISOString(),
          paciente,
          medico,
          horario,
        };
      }

      const disponibilidad: Disponibilidad = {
        id_medico: medico.id,
        id_sala: sala,
        id_horario: horario.id,
        estado: estadoInicial,
        created_at: new Date().toISOString(),
        medico,
        horario,
      };

      await db.collection('disponibilidades').doc(docId).set(disponibilidad);
      totalDisponibilidades++;

      if (citaEjemplo) {
        citaEjemplo.disponibilidad = disponibilidad;
        await db.collection('citas').doc(citaEjemplo.id).set(citaEjemplo);
        totalCitas++;
      }
    }
  }

  console.log(`✓ ${totalDisponibilidades} disponibilidades generadas.`);
  console.log(`✓ ${totalCitas} citas iniciales registradas.`);
  console.log('--- Seed en Firestore finalizado exitosamente ---');
}

main().catch((e) => {
  console.error('Error al ejecutar seed en Firestore:', e);
  process.exit(1);
});
