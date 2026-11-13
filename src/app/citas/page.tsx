'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ClipboardList,
  CalendarPlus,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Stethoscope,
  Calendar,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { Cita, Medico } from '@/types';

export default function CitasPage() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroMedico, setFiltroMedico] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');

  // Estados de acción
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [bannerMessage, setBannerMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const cargarCitas = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filtroEstado) params.append('estado', filtroEstado);
      if (filtroMedico) params.append('id_medico', filtroMedico);
      if (filtroFecha) params.append('fecha', filtroFecha);

      const res = await fetch(`/api/citas?${params.toString()}`);
      const data = await res.json();
      setCitas(data);
    } catch {
      console.error('Error al cargar citas');
    } finally {
      setLoading(false);
    }
  };

  const cargarMedicos = async () => {
    try {
      const res = await fetch('/api/medicos');
      const data = await res.json();
      setMedicos(data);
    } catch {
      console.error('Error al cargar médicos');
    }
  };

  useEffect(() => {
    cargarMedicos();
  }, []);

  useEffect(() => {
    cargarCitas();
  }, [filtroEstado, filtroMedico, filtroFecha]);

  const handleCancelar = async (cita: Cita) => {
    if (
      !confirm(
        `¿Seguro que deseas cancelar la cita del paciente "${cita.paciente?.nombres_completos || 'Paciente'}"? Su horario volverá a quedar LIBRE en una transacción atómica.`
      )
    ) {
      return;
    }

    try {
      setActionLoadingId(cita.id);
      setBannerMessage(null);
      const res = await fetch(`/api/citas/${cita.id}/cancelar`, { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al cancelar la cita');
      }

      setBannerMessage({
        type: 'success',
        text: 'Cita cancelada con éxito y slot de disponibilidad liberado automáticamente.',
      });
      cargarCitas();
    } catch (err: unknown) {
      setBannerMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error al cancelar cita',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleMarcarAtendida = async (cita: Cita) => {
    try {
      setActionLoadingId(cita.id);
      setBannerMessage(null);
      const res = await fetch(`/api/citas/${cita.id}/atender`, { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al actualizar estado de la cita');
      }

      setBannerMessage({
        type: 'success',
        text: 'Cita médica marcada como ATENDIDA.',
      });
      cargarCitas();
    } catch (err: unknown) {
      setBannerMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error al marcar como atendida',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-hospital-600" />
            Gestión de Citas Médicas
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Listado integral, control de estados (programada, atendida, cancelada) y transaccionalidad.
          </p>
        </div>
        <Link
          href="/agendar"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-hospital-600 hover:bg-hospital-700 text-white rounded-xl font-semibold text-sm shadow-sm transition-all hover:shadow"
        >
          <CalendarPlus className="w-4 h-4" />
          Nueva Cita
        </Link>
      </div>

      {bannerMessage && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-sm ${
            bannerMessage.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {bannerMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
            )}
            <span>{bannerMessage.text}</span>
          </div>
          <button
            onClick={() => setBannerMessage(null)}
            className="text-xs font-semibold underline hover:no-underline"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
            Estado de Cita
          </label>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 outline-none focus:ring-2 focus:ring-hospital-500"
          >
            <option value="">Todos los estados</option>
            <option value="programada">Programadas</option>
            <option value="atendida">Atendidas</option>
            <option value="cancelada">Canceladas</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
            Médico Tratante
          </label>
          <select
            value={filtroMedico}
            onChange={(e) => setFiltroMedico(e.target.value)}
            className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 outline-none focus:ring-2 focus:ring-hospital-500"
          >
            <option value="">Todos los médicos</option>
            {medicos.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombres_completos} ({m.especialidad})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
            Fecha de Cita
          </label>
          <input
            type="date"
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
            className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 outline-none focus:ring-2 focus:ring-hospital-500"
          />
        </div>
      </div>

      {/* Tabla de Citas */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Cargando citas médicas...</div>
        ) : citas.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No se encontraron citas médicas con los criterios especificados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Paciente</th>
                  <th className="py-3.5 px-6">Médico / Especialidad</th>
                  <th className="py-3.5 px-6">Fecha y Horario</th>
                  <th className="py-3.5 px-6">Sala</th>
                  <th className="py-3.5 px-6">Motivo</th>
                  <th className="py-3.5 px-6">Estado</th>
                  <th className="py-3.5 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {citas.map((cita) => {
                  const isBusy = actionLoadingId === cita.id;

                  return (
                    <tr key={cita.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-6 font-semibold text-slate-800">
                        <div>{cita.paciente?.nombres_completos || 'Paciente'}</div>
                        <div className="text-xs text-slate-400 font-normal">
                          Tel: {cita.paciente?.telefono || 'N/A'}
                        </div>
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="font-semibold text-slate-700">
                          {cita.medico?.nombres_completos || 'Médico'}
                        </div>
                        <div className="text-xs text-hospital-600 font-medium">
                          {cita.medico?.especialidad}
                        </div>
                      </td>
                      <td className="py-3.5 px-6 text-slate-600">
                        <div className="font-medium text-slate-800">{cita.horario?.fecha}</div>
                        <div className="text-xs text-slate-400">
                          {cita.horario?.hora_inicial} - {cita.horario?.hora_final}
                        </div>
                      </td>
                      <td className="py-3.5 px-6 font-mono text-xs text-slate-700 font-bold">
                        {cita.id_sala}
                      </td>
                      <td className="py-3.5 px-6 text-slate-600 max-w-xs truncate text-xs">
                        {cita.motivo}
                      </td>
                      <td className="py-3.5 px-6">
                        {cita.estado === 'programada' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Clock className="w-3 h-3 mr-1" />
                            Programada
                          </span>
                        )}
                        {cita.estado === 'atendida' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Atendida
                          </span>
                        )}
                        {cita.estado === 'cancelada' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                            <XCircle className="w-3 h-3 mr-1" />
                            Cancelada
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-right space-x-1.5 whitespace-nowrap">
                        {cita.estado === 'programada' && (
                          <>
                            <button
                              onClick={() => handleMarcarAtendida(cita)}
                              disabled={isBusy}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200 disabled:opacity-50"
                              title="Marcar como Atendida"
                            >
                              Atender
                            </button>
                            <button
                              onClick={() => handleCancelar(cita)}
                              disabled={isBusy}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors border border-red-200 disabled:opacity-50"
                              title="Cancelar cita y liberar slot"
                            >
                              Cancelar
                            </button>
                          </>
                        )}
                        {cita.estado !== 'programada' && (
                          <span className="text-xs text-slate-400 italic">Cerrada</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
