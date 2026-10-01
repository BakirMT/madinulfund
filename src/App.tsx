import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DarsProvider } from './context/DarsContext';
import { Sidebar, NavPage } from './components/navigation/Sidebar';
import { Navbar } from './components/navigation/Navbar';
import { Dashboard } from './components/dashboard/Dashboard';
import { StudentManagement } from './components/students/StudentManagement';
import { SearchStudents } from './components/students/SearchStudents';
import { AddStudent } from './components/students/AddStudent';
import { StudentDetail } from './components/students/StudentDetail';
import { StudentFinancialSummary } from './components/students/StudentFinancialSummary';
import { AddIncome } from './components/income/AddIncome';
import { AddExpense } from './components/expense/AddExpense';
import { TransactionManagement } from './components/transactions/TransactionManagement';
import { Reports } from './components/reports/Reports';
import { Settings } from './components/settings/Settings';
import { Login } from './components/auth/Login';
import { ToastContainer, ToastMessage } from './components/common/Toast';
import { MobileBottomNav } from './components/navigation/MobileBottomNav';

const VALID_PAGES: Record<string, NavPage> = {
  dashboard: 'dashboard',
  students: 'students',
  'search-students': 'search-students',
  'add-student': 'add-student',
  'student-detail': 'student-detail',
  'student-financial': 'student-financial',
  income: 'income',
  'add-income': 'add-income',
  expenses: 'expenses',
  'add-expense': 'add-expense',
  transactions: 'transactions',
  reports: 'reports',
  settings: 'settings',
};

function parseUrlRoute(): { page: NavPage; data: any } {
  try {
    // 1. Check hash first: e.g. #/students or #/student-detail?id=xyz
    let raw = window.location.hash.replace(/^#\/?/, '').trim();

    // 2. If no hash, inspect pathname: e.g. /students
    if (!raw && window.location.pathname && window.location.pathname !== '/') {
      raw = window.location.pathname.replace(/^\/+/, '').trim();
    }

    if (!raw) {
      return { page: 'dashboard', data: null };
    }

    const [routePath, queryString] = raw.split('?');
    const cleanPath = routePath.toLowerCase();
    const page = VALID_PAGES[cleanPath] || 'dashboard';

    let data: any = null;
    if (queryString) {
      const params = new URLSearchParams(queryString);
      const studentId = params.get('id') || params.get('studentId');
      if (studentId) {
        data = { studentId };
      }
    }

    return { page, data };
  } catch {
    return { page: 'dashboard', data: null };
  }
}

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // Initialize route from current browser URL hash or path
  const initialRoute = parseUrlRoute();
  const [currentPage, setCurrentPage] = useState<NavPage>(initialRoute.page);
  const [navData, setNavData] = useState<any>(initialRoute.data);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Synchronize browser history and hash navigation
  const handleNavigate = useCallback((page: NavPage, data?: any) => {
    setCurrentPage(page);
    setNavData(data || null);

    let newHash = `#/${page}`;
    if (data?.studentId) {
      newHash += `?id=${encodeURIComponent(data.studentId)}`;
    }

    if (window.location.hash !== newHash) {
      window.location.hash = newHash;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Listen to browser Back/Forward and address bar navigation
  useEffect(() => {
    const handleUrlChange = () => {
      const { page, data } = parseUrlRoute();
      setCurrentPage(page);
      setNavData(data);
    };

    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);

    // Normalize direct pathname into hash so refresh always resolves to /
    const route = parseUrlRoute();
    if (!window.location.hash) {
      const initialHash = `#/${route.page}${route.data?.studentId ? `?id=${encodeURIComponent(route.data.studentId)}` : ''}`;
      window.history.replaceState(null, '', initialHash);
    }

    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  const showToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5);
    const newToast: ToastMessage = { id, type, title, message };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (!isAuthenticated) {
    return (
      <>
        <Login showToast={showToast} />
        <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
      </>
    );
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;

      case 'students':
        return <StudentManagement onNavigate={handleNavigate} showToast={showToast} />;

      case 'search-students':
        return <SearchStudents onNavigate={handleNavigate} />;

      case 'add-student':
        return <AddStudent onNavigate={handleNavigate} showToast={showToast} />;

      case 'student-detail':
        return (
          <StudentDetail
            studentId={navData?.studentId}
            onNavigate={handleNavigate}
            showToast={showToast}
          />
        );

      case 'student-financial':
        return (
          <StudentFinancialSummary
            studentId={navData?.studentId}
            onNavigate={handleNavigate}
            showToast={showToast}
          />
        );

      case 'income':
      case 'add-income':
        return (
          <AddIncome
            onNavigate={handleNavigate}
            preselectedStudentId={navData?.studentId}
            showToast={showToast}
          />
        );

      case 'expenses':
      case 'add-expense':
        return (
          <AddExpense
            onNavigate={handleNavigate}
            preselectedStudentId={navData?.studentId}
            showToast={showToast}
          />
        );

      case 'transactions':
        return <TransactionManagement onNavigate={handleNavigate} showToast={showToast} />;

      case 'reports':
        return <Reports />;

      case 'settings':
        return <Settings showToast={showToast} />;

      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onOpenMobile={() => setIsMobileMenuOpen(true)}
        />

        <main className="flex-1 p-3 sm:p-6 lg:p-8 pb-24 sm:pb-20 md:pb-8 overflow-y-auto">
          {renderCurrentPage()}
        </main>

        {/* Mobile Thumb Navigation */}
        <MobileBottomNav
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onOpenMenu={() => setIsMobileMenuOpen(true)}
        />
      </div>

      {/* Floating Notifications */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DarsProvider>
        <AppContent />
      </DarsProvider>
    </AuthProvider>
  );
}
