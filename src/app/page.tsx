'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Activity,
  CalendarCheck2,
  CalendarPlus,
  Users,
  Stethoscope,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { DashboardMetricasDTO } from '@/types';

export default function DashboardPage() {
  const [metricas, setMetricas] = useState<DashboardMetricasDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarMetricas = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/dashboard');
      if (!res.ok) {
        throw new Error('Error al cargar datos del dashboard');
      }
      const data = await res.json();
      setMetricas(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarMetricas();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Panel de Control Hospitalario
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Resumen en tiempo real de citas médicas, disponibilidad de salas y especialistas.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/agendar"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-hospital-600 hover:bg-hospital-700 text-white rounded-xl font-semibold text-sm shadow-sm transition-all hover:shadow"
          >
            <CalendarPlus className="w-4 h-4" />
            Agendar Nueva Cita
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={cargarMetricas}
            className="text-xs font-semibold underline hover:no-underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Citas de Hoy */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Citas Hoy
            </span>
            <div className="w-10 h-10 rounded-xl bg-hospital-50 text-hospital-600 flex items-center justify-center">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {loading ? '...' : metricas?.citas_hoy ?? 0}
            </span>
            <span className="text-xs text-slate-500">agendadas</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Citas programadas para la fecha actual
          </p>
        </div>

        {/* Turnos Libres */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Turnos Libres
            </span>
            <div className="w-10 h-10 rounded-xl bg-clinical-50 text-clinical-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {loading ? '...' : metricas?.disponibilidades_libres ?? 0}
            </span>
            <span className="text-xs text-slate-500">disponibles</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Franjas libres listas para asignación
          </p>
        </div>

        {/* Total Médicos */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Médicos Activos
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {loading ? '...' : metricas?.total_medicos ?? 0}
            </span>
            <span className="text-xs text-slate-500">especialistas</span>
          </div>
          <Link
            href="/medicos"
            className="mt-2 inline-flex items-center gap-1 text-xs text-hospital-600 hover:text-hospital-700 font-semibold"
          >
            Ver directorio <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Total Pacientes */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pacientes
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {loading ? '...' : metricas?.total_pacientes ?? 0}
            </span>
            <span className="text-xs text-slate-500">registrados</span>
          </div>
          <Link
            href="/pacientes"
            className="mt-2 inline-flex items-center gap-1 text-xs text-hospital-600 hover:text-hospital-700 font-semibold"
          >
            Ver pacientes <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Grid: Citas por Especialidad & Próximas Citas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribución por Especialidad */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-hospital-600" />
              Citas por Especialidad
            </h2>
          </div>

          <div className="mt-5 space-y-4">
            {loading ? (
              <p className="text-sm text-slate-400">Cargando especialidades...</p>
            ) : metricas?.citas_por_especialidad && metricas.citas_por_especialidad.length > 0 ? (
              metricas.citas_por_especialidad.map((item) => (
                <div key={item.especialidad} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700">{item.especialidad}</span>
                    <span className="font-bold text-slate-900">{item.total} citas</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-hospital-500 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.max(15, (item.total / 10) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 text-center py-6">
                No hay citas registradas para graficar especialidades.
              </p>
            )}
          </div>
        </div>

        {/* Próximas Citas Programadas */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CalendarCheck2 className="w-4 h-4 text-clinical-600" />
              Próximas Citas Programadas
            </h2>
            <Link
              href="/citas"
              className="text-xs font-semibold text-hospital-600 hover:text-hospital-700 flex items-center gap-1"
            >
              Ver todas <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto">
            {loading ? (
              <p className="text-sm text-slate-400 py-6 text-center">Cargando citas...</p>
            ) : metricas?.proximas_citas && metricas.proximas_citas.length > 0 ? (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs text-slate-400 font-semibold border-b border-slate-100 uppercase">
                    <th className="pb-3">Paciente</th>
                    <th className="pb-3">Médico / Especialidad</th>
                    <th className="pb-3">Fecha y Hora</th>
                    <th className="pb-3">Sala</th>
                    <th className="pb-3 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {metricas.proximas_citas.map((cita) => (
                    <tr key={cita.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 font-medium text-slate-800">
                        {cita.paciente?.nombres_completos || 'Paciente'}
                      </td>
                      <td className="py-3">
                        <div className="font-medium text-slate-700">
                          {cita.medico?.nombres_completos || 'Médico'}
                        </div>
                        <div className="text-xs text-slate-400">
                          {cita.medico?.especialidad}
                        </div>
                      </td>
                      <td className="py-3 text-slate-600">
                        <div>{cita.horario?.fecha}</div>
                        <div className="text-xs text-slate-400">
                          {cita.horario?.hora_inicial} - {cita.horario?.hora_final}
                        </div>
                      </td>
                      <td className="py-3 text-slate-600 text-xs font-mono">
                        {cita.id_sala}
                      </td>
                      <td className="py-3 text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Programada
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-10">
                <p className="text-sm text-slate-500">No hay citas programadas actualmente.</p>
                <Link
                  href="/agendar"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-hospital-600"
                >
                  Agendar la primera cita <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
