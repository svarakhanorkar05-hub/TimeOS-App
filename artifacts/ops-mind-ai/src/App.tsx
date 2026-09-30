import { type ReactNode } from 'react';
import { ErrorBoundary } from '@/components/error-boundary';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { OpsProvider } from './context/OpsContext';
import { AppShell } from './components/AppShell';
import { ToastStack } from './context/OpsContext';
import { ActionsPage, DashboardPage, DecisionsPage, DocumentsPage, InsightsPage, LoginPage, RisksPage, SettingsPage, TasksPage, WorkspacePage } from './pages/Pages';

function RoutedErrorBoundary({children}:{children:ReactNode}){
  const [location]=useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}
function Router(){
  const [location]=useLocation();
  if(location==='/')return <RoutedErrorBoundary><LoginPage/></RoutedErrorBoundary>;
  return <AppShell><RoutedErrorBoundary><Switch>
    <Route path="/dashboard" component={DashboardPage}/>
    <Route path="/workspace" component={WorkspacePage}/>
    <Route path="/documents" component={DocumentsPage}/>
    <Route path="/actions" component={ActionsPage}/>
    <Route path="/tasks" component={TasksPage}/>
    <Route path="/risks" component={RisksPage}/>
    <Route path="/decisions" component={DecisionsPage}/>
    <Route path="/insights" component={InsightsPage}/>
    <Route path="/settings" component={SettingsPage}/>
    <Route component={NotFound}/>
  </Switch></RoutedErrorBoundary></AppShell>;
}
function App(){
  return <OpsProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/,'')}><Router/></WouterRouter><ToastStack/></OpsProvider>;
}
export default App;