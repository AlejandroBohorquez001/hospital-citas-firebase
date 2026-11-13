import { NextRequest, NextResponse } from 'next/server';
import { getRepositories } from '@/lib/repositories';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const repos = getRepositories();
    const { searchParams } = new URL(request.url);

    const estado = searchParams.get('estado') || undefined;
    const id_medico = searchParams.get('id_medico') || undefined;
    const id_paciente = searchParams.get('id_paciente') || undefined;
    const fecha = searchParams.get('fecha') || undefined;

    const citas = await repos.citas.findAll({
      estado,
      id_medico,
      id_paciente,
      fecha,
    });

    return NextResponse.json(citas);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener citas';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id_paciente, id_medico, id_sala, id_horario, motivo } = body;

    if (!id_paciente || !id_medico || !id_sala || !id_horario || !motivo?.trim()) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios (paciente, médico, sala, horario y motivo).' },
        { status: 400 }
      );
    }

    const repos = getRepositories();
    const cita = await repos.citas.crearConTransaccion({
      id_paciente,
      id_medico,
      id_sala,
      id_horario,
      motivo,
    });

    return NextResponse.json(cita, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al programar la cita médica';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
