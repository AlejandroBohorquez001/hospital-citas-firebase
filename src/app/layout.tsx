import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'Hospital Metropolitano - Gestión de Citas Médicas',
  description: 'Sistema integral de citas médicas con persistencia dual: PostgreSQL y Firebase Firestore',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-50 flex flex-col antialiased">
        <Navigation />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
            <p>© {new Date().getFullYear()} Hospital Metropolitano — Sistema de Gestión de Citas Médicas</p>
            <p className="font-mono text-slate-400">
              Arquitectura Limpia &amp; Repository Pattern (PostgreSQL / Firestore)
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
