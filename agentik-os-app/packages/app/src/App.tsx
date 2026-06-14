import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';

// Páginas Principales
import Hoy from '@/pages/Hoy';
import Kpis from '@/pages/Kpis';
import Vault from '@/pages/Vault';
import Memory from '@/pages/Memory';
import Settings from '@/pages/Settings';

// Sub-páginas Iron Monkey
import IronMonkeyPipeline from '@/pages/iron-monkey/PipelinePage';
import IronMonkeyLeads from '@/pages/iron-monkey/LeadsPage';
import IronMonkeyLeadDetail from '@/pages/iron-monkey/LeadDetailPage';
import IronMonkeyPropuestas from '@/pages/iron-monkey/PropuestasPage';
import IronMonkeySeguimiento from '@/pages/iron-monkey/SeguimientoPage';

// Sub-páginas Growing
import GrowingSesiones from '@/pages/growing/SesionesPage';
import GrowingSesionDetail from '@/pages/growing/SesionDetailPage';
import GrowingSesionNueva from '@/pages/growing/SesionNuevaPage';
import GrowingProspectos from '@/pages/growing/ProspectosPage';
import GrowingFipas from '@/pages/growing/FipasPage';
import GrowingWeekly from '@/pages/growing/WeeklyPage';
import GrowingBetting from '@/pages/growing/BettingPage';

function RootRedirect() {
  const ultimoNegocio = localStorage.getItem('ultimoNegocio');
  if (ultimoNegocio === 'iron-monkey') {
    return <Navigate to="/iron-monkey/pipeline" replace />;
  }
  if (ultimoNegocio === 'growing') {
    return <Navigate to="/growing/sesiones" replace />;
  }
  return <Navigate to="/hoy" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        {/* Redirección raíz según el último negocio activo */}
        <Route path="/" element={<RootRedirect />} />
        
        {/* Página Hoy */}
        <Route path="/hoy" element={<Hoy />} />
        
        {/* Iron Monkey & Sub-páginas */}
        <Route path="/iron-monkey" element={<Navigate to="/iron-monkey/pipeline" replace />} />
        <Route path="/iron-monkey/pipeline" element={<IronMonkeyPipeline />} />
        <Route path="/iron-monkey/leads" element={<IronMonkeyLeads />} />
        <Route path="/iron-monkey/leads/:id" element={<IronMonkeyLeadDetail />} />
        <Route path="/iron-monkey/propuestas" element={<IronMonkeyPropuestas />} />
        <Route path="/iron-monkey/seguimiento" element={<IronMonkeySeguimiento />} />

        {/* Growing & Sub-páginas */}
        <Route path="/growing" element={<Navigate to="/growing/sesiones" replace />} />
        <Route path="/growing/sesiones" element={<GrowingSesiones />} />
        <Route path="/growing/sesiones/:id" element={<GrowingSesionDetail />} />
        <Route path="/growing/sesion-nueva" element={<GrowingSesionNueva />} />
        <Route path="/growing/prospectos" element={<GrowingProspectos />} />
        <Route path="/growing/fipas" element={<GrowingFipas />} />
        <Route path="/growing/weekly" element={<GrowingWeekly />} />
        <Route path="/growing/betting" element={<GrowingBetting />} />

        {/* KPIs, Vault, Memory & Settings */}
        <Route path="/kpis" element={<Kpis />} />
        <Route path="/vault" element={<Vault />} />
        <Route path="/memory" element={<Memory />} />
        <Route path="/settings" element={<Settings />} />

        {/* Redirecciones de compatibilidad (legacy aliases) */}
        <Route path="/dashboard" element={<Navigate to="/kpis" replace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
