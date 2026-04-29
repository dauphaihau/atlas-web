import {
  BrowserRouter, Route, Routes, Navigate 
} from 'react-router-dom';
import { TooltipProvider } from '@atlas/ui/tooltip';
import { Toaster } from '@atlas/ui/sonner';
import { DashboardLayout } from '@/widgets/DashboardLayout';
import { ActivityLogsPage } from '@/pages/activity-logs/page';
import { DashboardPage } from '@/pages/dashboard/page';
import { LoginPage } from '@/pages/login/page';
import { RegisterPage } from '@/pages/register/page';
import { AcceptInvitationPage } from '@/pages/invitations/accept/page';
import { TenantsPage } from '@/pages/tenants/page';
import { UsersPage } from '@/pages/users/page';
import { SettingsPage } from '@/pages/settings/page';

function App() {
  return (
    <BrowserRouter>
      <TooltipProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/invitations/accept" element={<AcceptInvitationPage />} />
          <Route element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="tenants" element={<TenantsPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="activity-logs" element={<ActivityLogsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-right" richColors />
      </TooltipProvider>
    </BrowserRouter>
  );
}

export default App;
