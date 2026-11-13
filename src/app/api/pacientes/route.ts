import { NextRequest, NextResponse } from 'next/server';
import { getRepositories } from '@/lib/repositories';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const repos = getRepositories();
    const pacientes = await repos.pacientes.findAll();
    return NextResponse.json(pacientes);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener pacientes';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombres_completos, telefono, direccion, genero } = body;

    if (!nombres_completos?.trim() || !telefono?.trim() || !direccion?.trim() || !genero?.trim()) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios (nombres completos, teléfono, dirección y género).' },
        { status: 400 }
      );
    }

    if (!['M', 'F', 'Otro'].includes(genero)) {
      return NextResponse.json(
        { error: 'El género debe ser "M", "F" u "Otro".' },
        { status: 400 }
      );
    }

    const telDigits = telefono.replace(/\D/g, '');
    if (telDigits.length < 7) {
      return NextResponse.json(
        { error: 'El teléfono debe tener un formato válido con al menos 7 dígitos.' },
        { status: 400 }
      );
    }

    const repos = getRepositories();
    const paciente = await repos.pacientes.create({
      nombres_completos,
      telefono,
      direccion,
      genero,
    });

    return NextResponse.json(paciente, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al crear paciente';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
