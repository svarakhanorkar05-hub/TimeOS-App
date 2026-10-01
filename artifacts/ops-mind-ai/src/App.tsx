import { ErrorBoundary } from '@/components/error-boundary';
import { Router as WouterRouter, Route, Switch } from 'wouter';
import { OpsProvider } from './context/OpsContext';
import { AppShell } from './components/AppShell';
import { AnalyticsPage, LoginPage, NotFoundPage, ReschedulePage, SchedulePage, SettingsPage, TasksPage } from './pages/Pages';

function App(){
  return <OpsProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/,'')}><AppShell><ErrorBoundary resetKey="timeos-planner"><Switch>
    <Route path="/" component={SchedulePage}/>
    <Route path="/reschedule" component={ReschedulePage}/>
    <Route path="/tasks" component={TasksPage}/>
    <Route path="/analytics" component={AnalyticsPage}/>
    <Route path="/settings" component={SettingsPage}/>
    <Route path="/login" component={LoginPage}/>
    <Route component={NotFoundPage}/>
  </Switch></ErrorBoundary></AppShell></WouterRouter></OpsProvider>;
}
export default App;