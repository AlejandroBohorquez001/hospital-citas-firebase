'use client';

import { useState, useEffect } from 'react';
import {
  CalendarCheck2,
  Plus,
  Trash2,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  MapPin,
  X,
  Stethoscope,
} from 'lucide-react';
import { Disponibilidad, Medico, Horario } from '@/types';

export default function DisponibilidadPage() {
  const [disponibilidades, setDisponibilidades] = useState<Disponibilidad[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filtroMedico, setFiltroMedico] = useState('');
  const [filtroEspecialidad, setFiltroEspecialidad] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>(''); // '', '0', '1'

  // Modal Asignar Disponibilidad
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMedicoId, setSelectedMedicoId] = useState('');
  const [sala, setSala] = useState('Sala 101');
  const [selectedHorarioId, setSelectedHorarioId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const cargarDisponibilidades = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filtroMedico) params.append('id_medico', filtroMedico);
      if (filtroEspecialidad) params.append('especialidad', filtroEspecialidad);
      if (filtroFecha) params.append('fecha', filtroFecha);
      if (filtroEstado !== '') params.append('estado', filtroEstado);

      const res = await fetch(`/api/disponibilidades?${params.toString()}`);
      const data = await res.json();
      setDisponibilidades(data);
    } catch {
      console.error('Error al cargar disponibilidades');
    } finally {
      setLoading(false);
    }
  };

  const cargarCatalogos = async () => {
    try {
      const [resMed, resHor] = await Promise.all([
        fetch('/api/medicos'),
        fetch('/api/horarios'),
      ]);
      const dataMed = await resMed.json();
      const dataHor = await resHor.json();
      setMedicos(dataMed);
      setHorarios(dataHor);
    } catch {
      console.error('Error al cargar catálogos auxiliares');
    }
  };

  useEffect(() => {
    cargarCatalogos();
  }, []);

  useEffect(() => {
    cargarDisponibilidades();
  }, [filtroMedico, filtroEspecialidad, filtroFecha, filtroEstado]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!selectedMedicoId || !sala.trim() || !selectedHorarioId) {
      setFormError('Por favor selecciona el médico, la sala y el horario.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/disponibilidades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_medico: selectedMedicoId,
          id_sala: sala,
          id_horario: selectedHorarioId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al asignar disponibilidad');
      }

      setFormSuccess('Disponibilidad asignada correctamente');
      cargarDisponibilidades();
      setTimeout(() => setModalOpen(false), 700);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error al asignar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEliminar = async (d: Disponibilidad) => {
    if (!confirm(`¿Eliminar la disponibilidad en ${d.id_sala} del Dr./Dra. ${d.medico?.nombres_completos}?`)) {
      return;
    }

    try {
      const params = new URLSearchParams({
        id_medico: d.id_medico,
        id_sala: d.id_sala,
        id_horario: d.id_horario,
      });

      const res = await fetch(`/api/disponibilidades?${params.toString()}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Error al eliminar disponibilidad');
        return;
      }
      cargarDisponibilidades();
    } catch {
      alert('Error de conexión al eliminar disponibilidad');
    }
  };

  // Especialidades únicas para el filtro
  const especialidades = Array.from(new Set(medicos.map((m) => m.especialidad))).sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <CalendarCheck2 className="w-7 h-7 text-hospital-600" />
            Gestión de Disponibilidad
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Asignación y consulta de turnos médicos por sala y franja horaria.
          </p>
        </div>
        <button
          onClick={() => {
            setFormError(null);
            setFormSuccess(null);
            if (medicos.length > 0 && !selectedMedicoId) setSelectedMedicoId(medicos[0].id);
            if (horarios.length > 0 && !selectedHorarioId) setSelectedHorarioId(horarios[0].id);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-hospital-600 hover:bg-hospital-700 text-white rounded-xl font-semibold text-sm shadow-sm transition-all hover:shadow"
        >
          <Plus className="w-4 h-4" />
          Asignar Disponibilidad
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Filtro Médico */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
            Médico
          </label>
          <select
            value={filtroMedico}
            onChange={(e) => setFiltroMedico(e.target.value)}
            className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 outline-none focus:ring-2 focus:ring-hospital-500"
          >
            <option value="">Todos los médicos</option>
            {medicos.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombres_completos}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro Especialidad */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
            Especialidad
          </label>
          <select
            value={filtroEspecialidad}
            onChange={(e) => setFiltroEspecialidad(e.target.value)}
            className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 outline-none focus:ring-2 focus:ring-hospital-500"
          >
            <option value="">Todas las especialidades</option>
            {especialidades.map((esp) => (
              <option key={esp} value={esp}>
                {esp}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro Fecha */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
            Fecha
          </label>
          <input
            type="date"
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
            className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 outline-none focus:ring-2 focus:ring-hospital-500"
          />
        </div>

        {/* Filtro Estado */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
            Estado de Slot
          </label>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 outline-none focus:ring-2 focus:ring-hospital-500"
          >
            <option value="">Todos los estados</option>
            <option value="0">Solo Libres (Disponibles)</option>
            <option value="1">Solo Ocupadas (Con Cita)</option>
          </select>
        </div>
      </div>

      {/* Tabla de Disponibilidades */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Cargando disponibilidades...</div>
        ) : disponibilidades.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No se encontraron slots de disponibilidad con los filtros seleccionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Especialista</th>
                  <th className="py-3.5 px-6">Especialidad</th>
                  <th className="py-3.5 px-6">Sala Asignada</th>
                  <th className="py-3.5 px-6">Fecha &amp; Horario</th>
                  <th className="py-3.5 px-6">Estado</th>
                  <th className="py-3.5 px-6 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {disponibilidades.map((d) => {
                  const key = `${d.id_medico}_${d.id_sala}_${d.id_horario}`;
                  const esLibre = d.estado === 0;

                  return (
                    <tr key={key} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-6 font-semibold text-slate-800">
                        {d.medico?.nombres_completos || d.id_medico}
                      </td>
                      <td className="py-3.5 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-hospital-50 text-hospital-700 border border-hospital-200">
                          {d.medico?.especialidad || 'General'}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 font-mono text-xs text-slate-700 font-bold">
                        {d.id_sala}
                      </td>
                      <td className="py-3.5 px-6 text-slate-600">
                        <div className="font-medium text-slate-800">{d.horario?.fecha}</div>
                        <div className="text-xs text-slate-400">
                          {d.horario?.hora_inicial} - {d.horario?.hora_final} ({d.horario?.lugar})
                        </div>
                      </td>
                      <td className="py-3.5 px-6">
                        {esLibre ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Libre (0)
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <XCircle className="w-3 h-3 mr-1" />
                            Ocupada (1)
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <button
                          onClick={() => handleEliminar(d)}
                          disabled={!esLibre}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                          title={esLibre ? 'Eliminar asignación' : 'No se puede eliminar un slot ocupado'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Asignar Disponibilidad */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                Asignar Disponibilidad de Médico y Sala
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
              {formSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Médico Especialista *
                </label>
                <select
                  value={selectedMedicoId}
                  onChange={(e) => setSelectedMedicoId(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-hospital-500 bg-white"
                  required
                >
                  <option value="">Selecciona un médico</option>
                  {medicos.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombres_completos} — {m.especialidad}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Sala de Consulta *
                </label>
                <select
                  value={sala}
                  onChange={(e) => setSala(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-hospital-500 bg-white"
                  required
                >
                  <option value="Sala 101">Sala 101 (Torre A - Consulta Externa)</option>
                  <option value="Sala 102">Sala 102 (Torre A - Consulta Externa)</option>
                  <option value="Sala 201">Sala 201 (Torre B - Especialidades)</option>
                  <option value="Sala 202">Sala 202 (Torre B - Especialidades)</option>
                  <option value="Sala 301">Sala 301 (Pabellón Central)</option>
                  <option value="Sala 302">Sala 302 (Pabellón Central)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Franja Horaria *
                </label>
                <select
                  value={selectedHorarioId}
                  onChange={(e) => setSelectedHorarioId(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-hospital-500 bg-white"
                  required
                >
                  <option value="">Selecciona un horario</option>
                  {horarios.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.fecha} | {h.hora_inicial} - {h.hora_final} ({h.lugar})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-slate-700">Reglas de validación automáticas:</p>
                <p>• Un médico no puede tener dos turnos en el mismo horario.</p>
                <p>• Una sala no puede asignarse a dos médicos simultáneamente.</p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-semibold text-white bg-hospital-600 hover:bg-hospital-700 rounded-xl transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Verificando y Guardando...' : 'Asignar Disponibilidad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
