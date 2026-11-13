import { NextRequest, NextResponse } from 'next/server';
import { getRepositories } from '@/lib/repositories';

export const dynamic = 'force-dynamic';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const repos = getRepositories();
    await repos.horarios.delete(params.id);
    return NextResponse.json({ success: true, message: 'Horario eliminado exitosamente' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al eliminar horario';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
