import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./contexts/AppContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import DepartmentPage from "./pages/DepartmentPage";
import AddCasePage from "./pages/AddCasePage";
import CaseDetailPage from "./pages/CaseDetailPage";
import NotFound from "./pages/NotFound";
import SubDepartmentPage from '@/pages/SubDepartmentPage';
import SubDepartmentsListPage from '@/pages/SubDepartmentsListPage';
import AllCasesPage from '@/pages/AllCasesPage';
import HomePage from '@/pages/HomePage';
import CasesPage from '@/pages/CasesPage';
import ReportsPage from './pages/ReportsPage';
import ContemptCasesPage from './pages/ContemptCasesPage';
import DepartmentDashboardPage from './pages/DepartmentDashboardPage';
import PrintCasePage from "./pages/PrintCasePage";
import NotificationCasePage from "./pages/NotificationCasePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <NotificationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout hideHeader={true} />}>
                <Route index element={<LoginPage />} />
              </Route>
              <Route path="/dashboard" element={<Layout requireAuth />}>
                <Route index element={<DashboardPage />} />
              </Route>
              <Route path="/department/:id" element={<Layout requireAuth />}>
                <Route index element={<DepartmentPage />} />
              </Route>
              <Route path="/sub-department/:id" element={<Layout requireAuth />}>
                <Route index element={<SubDepartmentPage />} />
              </Route>
              <Route path="/sub-departments" element={<Layout requireAuth />}>
                <Route index element={<SubDepartmentsListPage />} />
              </Route>
              <Route path="/all-cases/:subDepartmentId" element={<Layout requireAuth />}>
                <Route index element={<AllCasesPage />} />
              </Route>
              <Route path="/print-case/:subDepartmentId" >
                <Route index element={<PrintCasePage/>} />
              </Route>
              <Route path="/print-case/" >
                <Route index element={<PrintCasePage/>} />
              </Route>
              <Route path="/add-case" element={<Layout requireAuth />}>
                <Route index element={<AddCasePage />} />
              </Route>
              <Route path="/case/:id" element={<Layout requireAuth />}>
                <Route index element={<CaseDetailPage />} />
              </Route>
              <Route path="/contempt-cases" element={<Layout requireAuth />}>
                <Route index element={<ContemptCasesPage />} />
              </Route>
              <Route path="/department-dashboard/:departmentId" element={<Layout requireAuth />}>
                <Route index element={<DepartmentDashboardPage />} />
              </Route>
              <Route path="/home" element={<HomePage />} />
              <Route path="/cases" element={<CasesPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/notification-case/:caseId" element={<Layout requireAuth><NotificationCasePage /></Layout>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </NotificationProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
