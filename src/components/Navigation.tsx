'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  UserCheck,
  Users,
  Clock,
  CalendarCheck2,
  CalendarPlus,
  ClipboardList,
  Database,
  Menu,
  X,
  Stethoscope,
} from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  const [provider, setProvider] = useState<string>('cargando...');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        setProvider(data.provider || 'postgres');
      })
      .catch(() => setProvider('postgres'));
  }, []);

  const navItems = [
    { name: 'Dashboard', href: '/', icon: Activity },
    { name: 'Médicos', href: '/medicos', icon: Stethoscope },
    { name: 'Pacientes', href: '/pacientes', icon: Users },
    { name: 'Horarios', href: '/horarios', icon: Clock },
    { name: 'Disponibilidad', href: '/disponibilidad', icon: CalendarCheck2 },
    { name: 'Agendar Cita', href: '/agendar', icon: CalendarPlus, highlight: true },
    { name: 'Gestión de Citas', href: '/citas', icon: ClipboardList },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo y Nombre */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-hospital-600 to-clinical-500 flex items-center justify-center text-white shadow-md shadow-hospital-500/20 group-hover:scale-105 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <span className="text-lg font-bold text-slate-800 tracking-tight block leading-tight">
                  Hospital Citas
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Gestión Hospitalaria
                </span>
              </div>
            </Link>

            {/* Provider Badge */}
            <div className="hidden md:flex items-center ml-4 px-3 py-1 rounded-full text-xs font-semibold border transition-colors shadow-sm bg-slate-50 border-slate-200">
              <Database className="w-3.5 h-3.5 mr-1.5 text-hospital-600" />
              <span className="text-slate-600 mr-1.5">Motor:</span>
              {provider === 'firestore' ? (
                <span className="flex items-center text-amber-700 font-bold">
                  <span className="w-2 h-2 rounded-full bg-amber-500 mr-1 animate-pulse" />
                  Firestore (NoSQL)
                </span>
              ) : provider === 'memory' ? (
                <span className="flex items-center text-emerald-700 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                  Memoria (Local Demo)
                </span>
              ) : (
                <span className="flex items-center text-hospital-700 font-bold">
                  <span className="w-2 h-2 rounded-full bg-hospital-500 mr-1 animate-pulse" />
                  PostgreSQL (Prisma)
                </span>
              )}
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              if (item.highlight) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="ml-2 flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold bg-hospital-600 text-white hover:bg-hospital-700 shadow-sm transition-all hover:shadow"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-hospital-50 text-hospital-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-hospital-600' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile hamburger button */}
          <div className="flex items-center lg:hidden gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          <div className="py-2 px-3 mb-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-600 flex items-center">
              <Database className="w-3.5 h-3.5 mr-1 text-hospital-600" /> Motor Persistencia:
            </span>
            <span className="font-bold text-slate-800">
              {provider === 'firestore' ? 'Firestore (NoSQL)' : 'PostgreSQL (Prisma)'}
            </span>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium ${
                  item.highlight
                    ? 'bg-hospital-600 text-white font-semibold'
                    : isActive
                    ? 'bg-hospital-50 text-hospital-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
