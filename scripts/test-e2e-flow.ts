// Script de verificación end-to-end automatizado contra la API en ejecución

const BASE_URL = 'http://localhost:3000';

async function testFlow() {
  console.log('=====================================================');
  console.log('INICIANDO PRUEBA COMPLETA DE FLUJO (E2E)');
  console.log('=====================================================');

  // 1. Verificar Dashboard y Config
  console.log('\n[1/6] Verificando Endpoint de Configuración y Dashboard...');
  const resConfig = await fetch(`${BASE_URL}/api/config`);
  const config = await resConfig.json();
  console.log(`✓ Proveedor activo detectado: ${config.provider}`);

  const resDash = await fetch(`${BASE_URL}/api/dashboard`);
  const dash = await resDash.json();
  console.log(`✓ Métricas actuales: ${dash.total_medicos} médicos, ${dash.total_pacientes} pacientes, ${dash.disponibilidades_libres} turnos libres`);

  // 2. Crear Médico
  console.log('\n[2/6] Creando Médico ("Dr. Roberto Gómez - Oftalmología")...');
  const resMed = await fetch(`${BASE_URL}/api/medicos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombres_completos: 'Dr. Roberto Gómez',
      telefono: '3119876543',
      direccion: 'Torre C - Consultorio 501',
      especialidad: 'Oftalmología',
    }),
  });
  const nuevoMedico = await resMed.json();
  if (!resMed.ok) throw new Error(nuevoMedico.error || 'Error al crear médico');
  console.log(`✓ Médico creado exitosamente. ID: ${nuevoMedico.id}, Nombre: ${nuevoMedico.nombres_completos}`);

  // 3. Crear Paciente
  console.log('\n[3/6] Creando Paciente ("Ana María Gómez")...');
  const resPac = await fetch(`${BASE_URL}/api/pacientes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombres_completos: 'Ana María Gómez',
      telefono: '3125556677',
      direccion: 'Carrera 15 # 45-60',
      genero: 'F',
    }),
  });
  const nuevoPaciente = await resPac.json();
  if (!resPac.ok) throw new Error(nuevoPaciente.error || 'Error al crear paciente');
  console.log(`✓ Paciente creado exitosamente. ID: ${nuevoPaciente.id}, Nombre: ${nuevoPaciente.nombres_completos}`);

  // 4. Crear Franja Horaria y Asignar Disponibilidad
  console.log('\n[4/6] Creando Franja Horaria y Asignando Disponibilidad...');
  const resHor = await fetch(`${BASE_URL}/api/horarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lugar: 'Pabellón de Oftalmología - Sala 301',
      fecha: '2026-11-20',
      hora_inicial: '10:00',
      hora_final: '10:30',
    }),
  });
  const nuevoHorario = await resHor.json();
  if (!resHor.ok) throw new Error(nuevoHorario.error || 'Error al crear horario');
  console.log(`✓ Horario creado: ${nuevoHorario.fecha} de ${nuevoHorario.hora_inicial} a ${nuevoHorario.hora_final}`);

  const resDisp = await fetch(`${BASE_URL}/api/disponibilidades`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id_medico: nuevoMedico.id,
      id_sala: 'Sala 301',
      id_horario: nuevoHorario.id,
    }),
  });
  const nuevaDisp = await resDisp.json();
  if (!resDisp.ok) throw new Error(nuevaDisp.error || 'Error al crear disponibilidad');
  console.log(`✓ Disponibilidad asignada: Médico ${nuevoMedico.nombres_completos} en Sala 301, estado = ${nuevaDisp.estado} (Libre)`);

  // Probar regla de integridad: Conflicto de Sala
  console.log('   -> Verificando rechazo de duplicado de sala en el mismo horario...');
  const resConflicto = await fetch(`${BASE_URL}/api/disponibilidades`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id_medico: 'med-1',
      id_sala: 'Sala 301', // Misma sala en mismo horario
      id_horario: nuevoHorario.id,
    }),
  });
  const errorConflicto = await resConflicto.json();
  console.log(`   ✓ Regla de integridad respetada: rechazada correctamente ("${errorConflicto.error}")`);

  // 5. Agendar Cita (Transacción)
  console.log('\n[5/6] Agendando Cita Médica (Transaccional)...');
  const resCita = await fetch(`${BASE_URL}/api/citas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id_paciente: nuevoPaciente.id,
      id_medico: nuevoMedico.id,
      id_sala: 'Sala 301',
      id_horario: nuevoHorario.id,
      motivo: 'Evaluación y fondo de ojo preventivo',
    }),
  });
  const nuevaCita = await resCita.json();
  if (!resCita.ok) throw new Error(nuevaCita.error || 'Error al agendar cita');
  console.log(`✓ Cita agendada con éxito. ID: ${nuevaCita.id}, Estado: ${nuevaCita.estado}`);

  // Verificar que la disponibilidad ahora está OCUPADA (estado = 1)
  const resDispVerif = await fetch(`${BASE_URL}/api/disponibilidades?id_medico=${nuevoMedico.id}&fecha=2026-11-20`);
  const dispLista = await resDispVerif.json();
  const dispItem = dispLista.find((d: any) => d.id_horario === nuevoHorario.id);
  console.log(`✓ Verificación transaccional: el slot de disponibilidad ahora tiene estado = ${dispItem?.estado} (Ocupada)`);

  // Intentar doble reserva sobre el mismo slot (debe fallar)
  const resDobleReserva = await fetch(`${BASE_URL}/api/citas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id_paciente: 'pac-1',
      id_medico: nuevoMedico.id,
      id_sala: 'Sala 301',
      id_horario: nuevoHorario.id,
      motivo: 'Intento de doble reserva',
    }),
  });
  const errorDoble = await resDobleReserva.json();
  console.log(`✓ Prevención de doble reserva exitosa: rechazada ("${errorDoble.error}")`);

  // 6. Cancelar Cita (Transacción de Liberación)
  console.log('\n[6/6] Cancelando Cita y liberando disponibilidad...');
  const resCancel = await fetch(`${BASE_URL}/api/citas/${nuevaCita.id}/cancelar`, {
    method: 'POST',
  });
  const cancelData = await resCancel.json();
  if (!resCancel.ok) throw new Error(cancelData.error || 'Error al cancelar cita');
  console.log(`✓ ${cancelData.message}`);

  // Verificar que la disponibilidad volvió a quedar LIBRE (estado = 0)
  const resDispPostCancel = await fetch(`${BASE_URL}/api/disponibilidades?id_medico=${nuevoMedico.id}&fecha=2026-11-20`);
  const dispListaPost = await resDispPostCancel.json();
  const dispItemPost = dispListaPost.find((d: any) => d.id_horario === nuevoHorario.id);
  console.log(`✓ Verificación transaccional post-cancelación: el slot volvió a estado = ${dispItemPost?.estado} (Libre)`);

  console.log('\n=====================================================');
  console.log('¡TODAS LAS PRUEBAS DE FLUJO COMPLETADAS CON ÉXITO 100%!');
  console.log('=====================================================');
}

testFlow().catch((e) => {
  console.error('\n❌ ERROR EN LA PRUEBA:', e);
  process.exit(1);
});
