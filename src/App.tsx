import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DarsProvider, useDars } from './context/DarsContext';
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

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState<NavPage>('dashboard');
  const [navData, setNavData] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5);
    const newToast: ToastMessage = { id, type, title, message };
    setToasts((prev) => [...prev, newToast]);

    // auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleNavigate = (page: NavPage, data?: any) => {
    setCurrentPage(page);
    setNavData(data || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
