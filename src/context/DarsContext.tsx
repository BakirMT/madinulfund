import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Student, Transaction, DarsSettings, StudentFinancials, DashboardStats, BulkIncomeInput } from '../types';
import { storageService } from '../services/storage';

interface DarsContextType {
  students: Student[];
  transactions: Transaction[];
  settings: DarsSettings;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  stats: DashboardStats;
  studentFinancials: StudentFinancials[];
  getStudentFinancials: (studentId: string) => StudentFinancials | null;
  getStudentLedger: (studentId: string) => any[];
  addStudent: (data: Omit<Student, 'id' | 'created_at' | 'updated_at'>) => Student;
  updateStudent: (id: string, updates: Partial<Omit<Student, 'id' | 'created_at'>>) => Student;
  deleteStudent: (id: string) => boolean;
  addTransaction: (data: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => Transaction;
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, 'id' | 'created_at'>>) => Transaction;
  deleteTransaction: (id: string) => boolean;
  addBulkIncome: (input: BulkIncomeInput) => { count: number; perStudent: number; remainder: number };
  updateSettings: (newSettings: Partial<DarsSettings>) => void;
  exportData: () => string;
  importData: (jsonStr: string) => { success: boolean; message: string };
  resetSampleData: () => void;
  formatCurrency: (amount: number) => string;
  formatDate: (dateStr: string) => string;
}

const DarsContext = createContext<DarsContextType | undefined>(undefined);

export const DarsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>(() => storageService.getStudents());
  const [transactions, setTransactions] = useState<Transaction[]>(() => storageService.getTransactions());
  const [settings, setSettings] = useState<DarsSettings>(() => storageService.getSettings());
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('mq_dars_theme_v1');
    if (saved === 'dark' || saved === 'light') return saved;
    return storageService.getSettings().theme || 'light';
  });

  const refreshData = useCallback(() => {
    setStudents(storageService.getStudents());
    setTransactions(storageService.getTransactions());
    setSettings(storageService.getSettings());
  }, []);

  useEffect(() => {
    const unsubscribe = storageService.subscribe(() => {
      refreshData();
    });
    return () => unsubscribe();
  }, [refreshData]);

  // Apply theme class to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body?.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.body?.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
    localStorage.setItem('mq_dars_theme_v1', theme);
  }, [theme]);

  const setTheme = (newTheme: 'light' | 'dark') => {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body?.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.body?.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
    setThemeState(newTheme);
    storageService.saveSettings({ theme: newTheme });
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  };

  const updateSettings = (newSettings: Partial<DarsSettings>) => {
    const saved = storageService.saveSettings(newSettings);
    setSettings(saved);
    if (newSettings.theme && newSettings.theme !== theme) {
      setThemeState(newSettings.theme);
    }
  };

  const addStudent = (data: Omit<Student, 'id' | 'created_at' | 'updated_at'>) => {
    const created = storageService.addStudent(data);
    refreshData();
    return created;
  };

  const updateStudent = (id: string, updates: Partial<Omit<Student, 'id' | 'created_at'>>) => {
    const updated = storageService.updateStudent(id, updates);
    refreshData();
    return updated;
  };

  const deleteStudent = (id: string) => {
    const result = storageService.deleteStudent(id);
    refreshData();
    return result;
  };

  const addTransaction = (data: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => {
    const tx = storageService.addTransaction(data);
    refreshData();
    return tx;
  };

  const updateTransaction = (id: string, updates: Partial<Omit<Transaction, 'id' | 'created_at'>>) => {
    const updated = storageService.updateTransaction(id, updates);
    refreshData();
    return updated;
  };

  const deleteTransaction = (id: string) => {
    const result = storageService.deleteTransaction(id);
    refreshData();
    return result;
  };

  const addBulkIncome = (input: BulkIncomeInput) => {
    const result = storageService.addBulkIncome(input);
    refreshData();
    return result;
  };

  const exportData = () => storageService.exportData();

  const importData = (jsonStr: string) => {
    const result = storageService.importData(jsonStr);
    refreshData();
    return result;
  };

  const resetSampleData = () => {
    storageService.resetToSampleData();
    refreshData();
  };

  const formatCurrency = useCallback(
    (amount: number) => {
      const sym = settings.currency || '₹';
      const formatted = Math.abs(amount).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return amount < 0 ? `-${sym}${formatted}` : `${sym}${formatted}`;
    },
    [settings.currency]
  );

  const formatDate = useCallback(
    (dateStr: string) => {
      if (!dateStr) return '—';
      try {
        const [year, month, day] = dateStr.split('-');
        if (!year || !month || !day) return dateStr;
        if (settings.date_format === 'YYYY-MM-DD') {
          return `${year}-${month}-${day}`;
        }
        if (settings.date_format === 'MM/DD/YYYY') {
          return `${month}/${day}/${year}`;
        }
        // default DD/MM/YYYY
        return `${day}/${month}/${year}`;
      } catch {
        return dateStr;
      }
    },
    [settings.date_format]
  );

  const stats = storageService.getDashboardStats();
  const studentFinancials = storageService.getAllStudentFinancials();

  return (
    <DarsContext.Provider
      value={{
        students,
        transactions,
        settings,
        theme,
        setTheme,
        toggleTheme,
        stats,
        studentFinancials,
        getStudentFinancials: (id: string) => storageService.getStudentFinancials(id),
        getStudentLedger: (id: string) => storageService.getStudentLedger(id),
        addStudent,
        updateStudent,
        deleteStudent,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addBulkIncome,
        updateSettings,
        exportData,
        importData,
        resetSampleData,
        formatCurrency,
        formatDate,
      }}
    >
      {children}
    </DarsContext.Provider>
  );
};

export const useDars = () => {
  const context = useContext(DarsContext);
  if (!context) {
    throw new Error('useDars must be used within a DarsProvider');
  }
  return context;
};
