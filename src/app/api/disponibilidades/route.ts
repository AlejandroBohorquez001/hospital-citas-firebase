import { NextRequest, NextResponse } from 'next/server';
import { getRepositories } from '@/lib/repositories';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const repos = getRepositories();
    const { searchParams } = new URL(request.url);

    const id_medico = searchParams.get('id_medico') || undefined;
    const especialidad = searchParams.get('especialidad') || undefined;
    const fecha = searchParams.get('fecha') || undefined;
    const estadoParam = searchParams.get('estado');

    const estado = estadoParam !== null && estadoParam !== undefined && estadoParam !== ''
      ? parseInt(estadoParam, 10)
      : undefined;

    const disponibilidades = await repos.disponibilidades.findAll({
      id_medico,
      especialidad,
      fecha,
      estado,
    });

    return NextResponse.json(disponibilidades);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al consultar disponibilidades';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id_medico, id_sala, id_horario } = body;

    if (!id_medico || !id_sala?.trim() || !id_horario) {
      return NextResponse.json(
        { error: 'Debe especificar el médico, la sala y el horario.' },
        { status: 400 }
      );
    }

    const repos = getRepositories();
    const disponibilidad = await repos.disponibilidades.create({
      id_medico,
      id_sala,
      id_horario,
    });

    return NextResponse.json(disponibilidad, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al registrar disponibilidad';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id_medico = searchParams.get('id_medico');
    const id_sala = searchParams.get('id_sala');
    const id_horario = searchParams.get('id_horario');

    if (!id_medico || !id_sala || !id_horario) {
      return NextResponse.json(
        { error: 'Parámetros incompletos (id_medico, id_sala, id_horario requeridos).' },
        { status: 400 }
      );
    }

    const repos = getRepositories();
    await repos.disponibilidades.delete(id_medico, id_sala, id_horario);

    return NextResponse.json({ success: true, message: 'Disponibilidad eliminada correctamente' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al eliminar disponibilidad';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
