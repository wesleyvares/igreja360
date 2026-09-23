import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './layouts/AppLayout'; import ProtectedRoute from './routes/ProtectedRoute'; import RoleRoute from './routes/RoleRoute';
import LoginPage from './pages/LoginPage'; import VisitantesPage from './pages/VisitantesPage'; import CelulasPage from './pages/CelulasPage'; import RelatoriosCelulaPage from './pages/RelatoriosCelulaPage'; import NotFoundPage from './pages/NotFoundPage';
import { accessByPath } from './config/access';
export default function App(){return <Routes><Route path="/login" element={<LoginPage/>}/><Route element={<ProtectedRoute/>}><Route element={<AppLayout/>}>
<Route index element={<Navigate to="/visitantes" replace/>}/>
<Route element={<RoleRoute allowed={accessByPath['/visitantes']}/>}><Route path="/visitantes" element={<VisitantesPage/>}/></Route>
<Route element={<RoleRoute allowed={accessByPath['/celulas']}/>}><Route path="/celulas" element={<CelulasPage/>}/></Route>
<Route element={<RoleRoute allowed={accessByPath['/relatorios-celula']}/>}><Route path="/relatorios-celula" element={<RelatoriosCelulaPage/>}/></Route>
<Route path="*" element={<Navigate to="/visitantes" replace/>}/></Route></Route><Route path="*" element={<NotFoundPage/>}/></Routes>}
