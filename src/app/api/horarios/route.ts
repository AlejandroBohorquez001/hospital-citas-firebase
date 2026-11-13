import { NextRequest, NextResponse } from 'next/server';
import { getRepositories } from '@/lib/repositories';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const repos = getRepositories();
    const { searchParams } = new URL(request.url);
    const fecha = searchParams.get('fecha');

    const horarios = fecha
      ? await repos.horarios.findByFecha(fecha)
      : await repos.horarios.findAll();

    return NextResponse.json(horarios);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener horarios';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lugar, fecha, hora_inicial, hora_final } = body;

    if (!lugar?.trim() || !fecha?.trim() || !hora_inicial?.trim() || !hora_final?.trim()) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios (lugar, fecha, hora inicial y hora final).' },
        { status: 400 }
      );
    }

    // Validar formato fecha YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return NextResponse.json(
        { error: 'El formato de fecha debe ser YYYY-MM-DD.' },
        { status: 400 }
      );
    }

    // Validar formato hora HH:mm
    if (!/^\d{2}:\d{2}$/.test(hora_inicial) || !/^\d{2}:\d{2}$/.test(hora_final)) {
      return NextResponse.json(
        { error: 'El formato de las horas debe ser HH:mm (ej: 08:30).' },
        { status: 400 }
      );
    }

    if (hora_inicial >= hora_final) {
      return NextResponse.json(
        { error: 'La hora inicial debe ser estrictamente anterior a la hora final.' },
        { status: 400 }
      );
    }

    const repos = getRepositories();
    const horario = await repos.horarios.create({
      lugar,
      fecha,
      hora_inicial,
      hora_final,
    });

    return NextResponse.json(horario, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al crear horario';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
