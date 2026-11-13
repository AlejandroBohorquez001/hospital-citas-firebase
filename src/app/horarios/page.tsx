'use client';

import { useState, useEffect } from 'react';
import {
  Clock,
  Plus,
  Trash2,
  Calendar,
  MapPin,
  AlertCircle,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react';
import { Horario } from '@/types';

export default function HorariosPage() {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [loading, setLoading] = useState(true);
  const [fechaFiltro, setFechaFiltro] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [lugar, setLugar] = useState('Pabellón Central - Torre Médica A');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [horaInicial, setHoraInicial] = useState('08:00');
  const [horaFinal, setHoraFinal] = useState('08:30');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const cargarHorarios = async () => {
    try {
      setLoading(true);
      const url = fechaFiltro ? `/api/horarios?fecha=${fechaFiltro}` : '/api/horarios';
      const res = await fetch(url);
      const data = await res.json();
      setHorarios(data);
    } catch {
      console.error('Error al cargar horarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarHorarios();
  }, [fechaFiltro]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!lugar.trim() || !fecha.trim() || !horaInicial.trim() || !horaFinal.trim()) {
      setFormError('Todos los campos son obligatorios.');
      return;
    }

    if (horaInicial >= horaFinal) {
      setFormError('La hora inicial debe ser estrictamente anterior a la hora final.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/horarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lugar,
          fecha,
          hora_inicial: horaInicial,
          hora_final: horaFinal,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al crear horario');
      }

      setFormSuccess('Horario creado correctamente');
      cargarHorarios();
      setTimeout(() => setModalOpen(false), 700);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error al registrar horario');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Eliminar esta franja horaria?')) return;
    try {
      const res = await fetch(`/api/horarios/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Error al eliminar');
        return;
      }
      cargarHorarios();
    } catch {
      alert('Error al eliminar horario');
    }
  };

  // Generador rápido de franjas de 30 minutos
  const handleGenerarFranjas = async () => {
    const targetFecha = prompt(
      'Ingresa la fecha para generar franjas automáticas (YYYY-MM-DD):',
      new Date().toISOString().split('T')[0]
    );
    if (!targetFecha) return;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(targetFecha)) {
      alert('Formato de fecha inválido. Usa YYYY-MM-DD');
      return;
    }

    const slots = [
      { hi: '08:00', hf: '08:30' },
      { hi: '08:30', hf: '09:00' },
      { hi: '09:00', hf: '09:30' },
      { hi: '09:30', hf: '10:00' },
      { hi: '10:00', hf: '10:30' },
      { hi: '10:30', hf: '11:00' },
      { hi: '11:00', hf: '11:30' },
      { hi: '11:30', hf: '12:00' },
    ];

    try {
      setLoading(true);
      for (const slot of slots) {
        await fetch('/api/horarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lugar: 'Pabellón Central - Torre Médica A',
            fecha: targetFecha,
            hora_inicial: slot.hi,
            hora_final: slot.hf,
          }),
        });
      }
      cargarHorarios();
      alert(`Se generaron las franjas horarias con éxito para ${targetFecha}`);
    } catch {
      alert('Error al generar franjas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Clock className="w-7 h-7 text-hospital-600" />
            Catálogo de Horarios
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Definición de turnos, fechas y bloques horarios de atención (30 min).
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleGenerarFranjas}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm transition-colors"
          >
            <Sparkles className="w-4 h-4 text-hospital-600" />
            Generar Día (30 min)
          </button>
          <button
            onClick={() => {
              setFormError(null);
              setFormSuccess(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-hospital-600 hover:bg-hospital-700 text-white rounded-xl font-semibold text-sm shadow-sm transition-all hover:shadow"
          >
            <Plus className="w-4 h-4" />
            Nuevo Horario
          </button>
        </div>
      </div>

      {/* Filtro de Fecha */}
      <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm max-w-sm">
        <Calendar className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-semibold text-slate-500">Filtrar por fecha:</span>
        <input
          type="date"
          value={fechaFiltro}
          onChange={(e) => setFechaFiltro(e.target.value)}
          className="text-sm outline-none bg-transparent text-slate-800"
        />
        {fechaFiltro && (
          <button
            onClick={() => setFechaFiltro('')}
            className="text-xs text-hospital-600 hover:underline font-semibold ml-auto"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Grid de Horarios */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6">
        {loading ? (
          <div className="py-8 text-center text-slate-400 text-sm">Cargando franjas horarias...</div>
        ) : horarios.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-sm">
            No hay horarios registrados {fechaFiltro && `para la fecha ${fechaFiltro}`}.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {horarios.map((h) => (
              <div
                key={h.id}
                className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-hospital-50/30 hover:border-hospital-200 transition-all group"
              >
                <div className="flex justify-between items-start">
                  <div className="text-xs font-bold text-hospital-700 bg-hospital-100/60 px-2 py-0.5 rounded-md">
                    {h.fecha}
                  </div>
                  <button
                    onClick={() => handleEliminar(h.id)}
                    className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    title="Eliminar franja"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-base font-bold text-slate-800">
                    {h.hora_inicial} - {h.hora_final}
                  </span>
                </div>
                <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{h.lugar}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Crear Horario */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Crear Franja Horaria</h3>
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
                  Lugar / Pabellón *
                </label>
                <input
                  type="text"
                  value={lugar}
                  onChange={(e) => setLugar(e.target.value)}
                  placeholder="Ej: Pabellón Central - Torre Médica A"
                  className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-hospital-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Fecha *
                </label>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-hospital-500 bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Hora Inicial (HH:mm) *
                  </label>
                  <input
                    type="time"
                    value={horaInicial}
                    onChange={(e) => setHoraInicial(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-hospital-500 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Hora Final (HH:mm) *
                  </label>
                  <input
                    type="time"
                    value={horaFinal}
                    onChange={(e) => setHoraFinal(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-hospital-500 bg-white"
                    required
                  />
                </div>
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
                  {submitting ? 'Guardando...' : 'Crear Horario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
