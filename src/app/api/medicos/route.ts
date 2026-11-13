import { NextRequest, NextResponse } from 'next/server';
import { getRepositories } from '@/lib/repositories';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const repos = getRepositories();
    const { searchParams } = new URL(request.url);
    const especialidad = searchParams.get('especialidad');

    const medicos = especialidad
      ? await repos.medicos.findByEspecialidad(especialidad)
      : await repos.medicos.findAll();

    return NextResponse.json(medicos);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener médicos';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombres_completos, telefono, direccion, especialidad } = body;

    if (!nombres_completos?.trim() || !telefono?.trim() || !direccion?.trim() || !especialidad?.trim()) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios (nombres completos, teléfono, dirección y especialidad).' },
        { status: 400 }
      );
    }

    // Validación básica de teléfono (mínimo 7 dígitos)
    const telDigits = telefono.replace(/\D/g, '');
    if (telDigits.length < 7) {
      return NextResponse.json(
        { error: 'El número de teléfono debe contener al menos 7 dígitos.' },
        { status: 400 }
      );
    }

    const repos = getRepositories();
    const medico = await repos.medicos.create({
      nombres_completos,
      telefono,
      direccion,
      especialidad,
    });

    return NextResponse.json(medico, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al crear médico';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
