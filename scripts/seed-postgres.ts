import { PrismaClient } from '@prisma/client';
import { SEED_MEDICOS, SEED_PACIENTES, getFechasSeed, BLOQUES_HORARIOS, SALAS } from './seed-data';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando Seed en PostgreSQL ---');

  // Limpieza en cascada ordenada
  console.log('Limpiando tablas existentes...');
  await prisma.cita.deleteMany();
  await prisma.disponibilidad.deleteMany();
  await prisma.horario.deleteMany();
  await prisma.paciente.deleteMany();
  await prisma.medico.deleteMany();

  // 1. Médicos
  console.log('Insertando médicos...');
  const medicosCreados = [];
  for (const m of SEED_MEDICOS) {
    const med = await prisma.medico.create({ data: m });
    medicosCreados.push(med);
  }
  console.log(`✓ ${medicosCreados.length} médicos insertados.`);

  // 2. Pacientes
  console.log('Insertando pacientes...');
  const pacientesCreados = [];
  for (const p of SEED_PACIENTES) {
    const pac = await prisma.paciente.create({ data: p });
    pacientesCreados.push(pac);
  }
  console.log(`✓ ${pacientesCreados.length} pacientes insertados.`);

  // 3. Horarios
  console.log('Generando bloques de horarios...');
  const fechas = getFechasSeed();
  const horariosCreados = [];

  for (const fecha of fechas) {
    for (const bloque of BLOQUES_HORARIOS) {
      const h = await prisma.horario.create({
        data: {
          lugar: 'Pabellón Central - Torre Médica A',
          fecha,
          hora_inicial: bloque.hora_inicial,
          hora_final: bloque.hora_final,
        },
      });
      horariosCreados.push(h);
    }
  }
  console.log(`✓ ${horariosCreados.length} horarios creados (30 min c/u).`);

  // 4. Disponibilidades y Citas
  console.log('Asignando disponibilidades de médicos y salas...');
  let totalDisponibilidades = 0;
  let totalCitas = 0;

  // Asignamos turnos respetando la regla:
  // - Medico i usa Sala i en horario k
  // - Cada horario k tiene a lo sumo 1 médico por sala y 1 sala por médico
  for (let mIdx = 0; mIdx < medicosCreados.length; mIdx++) {
    const medico = medicosCreados[mIdx];
    const sala = SALAS[mIdx % SALAS.length];

    // Asignar 4 horarios por médico en diferentes días/horas
    for (let hStep = 0; hStep < 4; hStep++) {
      const hIdx = (mIdx * 4 + hStep) % horariosCreados.length;
      const horario = horariosCreados[hIdx];

      const disp = await prisma.disponibilidad.create({
        data: {
          id_medico: medico.id,
          id_sala: sala,
          id_horario: horario.id,
          estado: 0,
        },
      });
      totalDisponibilidades++;

      // En algunas disponibilidades creamos una cita de ejemplo
      if (hStep === 0 && mIdx < pacientesCreados.length) {
        const paciente = pacientesCreados[mIdx];
        await prisma.cita.create({
          data: {
            id_paciente: paciente.id,
            id_medico: medico.id,
            id_sala: sala,
            id_horario: horario.id,
            estado: 'programada',
            motivo: `Control de rutina con ${medico.especialidad}`,
          },
        });
        // Actualizamos estado de disponibilidad a 1
        await prisma.disponibilidad.update({
          where: {
            id_medico_id_sala_id_horario: {
              id_medico: medico.id,
              id_sala: sala,
              id_horario: horario.id,
            },
          },
          data: { estado: 1 },
        });
        totalCitas++;
      } else if (hStep === 1 && mIdx === 0) {
        // Una cita atendida de ejemplo
        const paciente = pacientesCreados[5];
        await prisma.cita.create({
          data: {
            id_paciente: paciente.id,
            id_medico: medico.id,
            id_sala: sala,
            id_horario: horario.id,
            estado: 'atendida',
            motivo: 'Evaluación médica prioritaria finalizada',
          },
        });
        await prisma.disponibilidad.update({
          where: {
            id_medico_id_sala_id_horario: {
              id_medico: medico.id,
              id_sala: sala,
              id_horario: horario.id,
            },
          },
          data: { estado: 1 },
        });
        totalCitas++;
      }
    }
  }

  console.log(`✓ ${totalDisponibilidades} disponibilidades generadas.`);
  console.log(`✓ ${totalCitas} citas iniciales registradas.`);
  console.log('--- Seed en PostgreSQL finalizado exitosamente ---');
}

main()
  .catch((e) => {
    console.error('Error al ejecutar seed en PostgreSQL:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
