import { ErrorBoundary } from '@/components/error-boundary';
import { Router as WouterRouter, Route, Switch } from 'wouter';
import { OpsProvider } from './context/OpsContext';
import { AppShell } from './components/AppShell';
import { DashboardPage } from './pages/Pages';

function Planner(){return <AppShell><ErrorBoundary resetKey="timeos-planner"><DashboardPage/></ErrorBoundary></AppShell>;}
function App(){
  return <OpsProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/,'')}><Switch><Route path="/" component={Planner}/><Route component={Planner}/></Switch></WouterRouter></OpsProvider>;
}
export default App;