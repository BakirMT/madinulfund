import { Student, Transaction, DarsSettings, StudentFinancials, DashboardStats, RecentActivity, BulkIncomeInput } from '../types';
import { initialSettings, initialStudents, initialTransactions } from '../data/initialData';
import { db } from './firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './firestoreErrors';

const STORAGE_KEYS = {
  STUDENTS: 'mq_dars_students_v2',
  TRANSACTIONS: 'mq_dars_transactions_v2',
  SETTINGS: 'mq_dars_settings_v2',
  AUTH: 'mq_dars_auth_v1',
  THEME: 'mq_dars_theme_v1',
};

class StorageService {
  private students: Student[] = [];
  private transactions: Transaction[] = [];
  private settings: DarsSettings = initialSettings;
  private listeners: (() => void)[] = [];

  constructor() {
    this.initLocal();
    this.initFirestore();
  }

  private initLocal() {
    try {
      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (storedSettings) {
        this.settings = { ...initialSettings, ...JSON.parse(storedSettings) };
      } else {
        this.saveSettingsToLocal(initialSettings);
      }

      const storedStudents = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      if (storedStudents) {
        this.students = JSON.parse(storedStudents);
      } else {
        this.students = [];
        this.saveStudentsToLocal();
      }

      const storedTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (storedTransactions) {
        this.transactions = JSON.parse(storedTransactions);
      } else {
        this.transactions = [];
        this.saveTransactionsToLocal();
      }
    } catch (e) {
      console.error('Failed to load local storage:', e);
      this.students = [];
      this.transactions = [];
      this.settings = initialSettings;
    }
  }

  private initFirestore() {
    const studentsPath = 'students';
    const transactionsPath = 'transactions';
    const settingsPath = 'settings';

    // 1. Listen to students collection
    try {
      onSnapshot(
        collection(db, studentsPath),
        (snapshot) => {
          if (!snapshot.empty) {
            const remoteStudents: Student[] = [];
            snapshot.forEach((docSnap) => {
              remoteStudents.push(docSnap.data() as Student);
            });
            this.students = remoteStudents;
          } else {
            // Firestore is empty
            this.students = [];
          }
          this.saveStudentsToLocal();
        },
        (error) => {
          console.warn('Firestore students onSnapshot error:', error);
          handleFirestoreError(error, OperationType.GET, studentsPath);
        }
      );
    } catch (err) {
      console.warn('Error attaching students listener:', err);
    }

    // 2. Listen to transactions collection
    try {
      onSnapshot(
        collection(db, transactionsPath),
        (snapshot) => {
          if (!snapshot.empty) {
            const remoteTransactions: Transaction[] = [];
            snapshot.forEach((docSnap) => {
              remoteTransactions.push(docSnap.data() as Transaction);
            });
            this.transactions = remoteTransactions;
          } else {
            // Firestore is empty
            this.transactions = [];
          }
          this.saveTransactionsToLocal();
        },
        (error) => {
          console.warn('Firestore transactions onSnapshot error:', error);
          handleFirestoreError(error, OperationType.GET, transactionsPath);
        }
      );
    } catch (err) {
      console.warn('Error attaching transactions listener:', err);
    }

    // 3. Listen to settings document
    try {
      onSnapshot(
        doc(db, settingsPath, 'general'),
        (docSnap) => {
          if (docSnap.exists()) {
            this.settings = { ...this.settings, ...(docSnap.data() as DarsSettings) };
            this.saveSettingsToLocal(this.settings);
          }
        },
        (error) => {
          console.warn('Firestore settings onSnapshot error:', error);
          handleFirestoreError(error, OperationType.GET, `${settingsPath}/general`);
        }
      );
    } catch (err) {
      console.warn('Error attaching settings listener:', err);
    }
  }

  public subscribe(callback: () => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }

  private saveStudentsToLocal() {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(this.students));
    this.notify();
  }

  private saveTransactionsToLocal() {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(this.transactions));
    this.notify();
  }

  private saveSettingsToLocal(settings: DarsSettings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    this.notify();
  }

  // --- Students Management ---
  public getStudents(): Student[] {
    return [...this.students];
  }

  public getStudentById(id: string): Student | undefined {
    return this.students.find((s) => s.id === id);
  }

  public getStudentByStudentId(studentId: string): Student | undefined {
    return this.students.find((s) => s.student_id.trim().toLowerCase() === studentId.trim().toLowerCase());
  }

  public addStudent(studentData: Omit<Student, 'id' | 'created_at' | 'updated_at'>): Student {
    const now = new Date().toISOString();
    const newStudent: Student = {
      ...studentData,
      id: 'stud_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      created_at: now,
      updated_at: now,
    };
    this.students.unshift(newStudent);
    this.saveStudentsToLocal();

    // Async write to Firestore
    setDoc(doc(db, 'students', newStudent.id), newStudent).catch((err) => {
      handleFirestoreError(err, OperationType.CREATE, `students/${newStudent.id}`);
    });

    return newStudent;
  }

  public updateStudent(id: string, updates: Partial<Omit<Student, 'id' | 'created_at'>>): Student {
    const index = this.students.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new Error('Student not found');
    }
    const updated: Student = {
      ...this.students[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.students[index] = updated;
    this.saveStudentsToLocal();

    // Async write to Firestore
    setDoc(doc(db, 'students', id), updated).catch((err) => {
      handleFirestoreError(err, OperationType.UPDATE, `students/${id}`);
    });

    return updated;
  }

  public deleteStudent(id: string): boolean {
    const initialLen = this.students.length;
    this.students = this.students.filter((s) => s.id !== id);
    const affectedTx = this.transactions.filter((tx) => tx.student_id === id);
    this.transactions = this.transactions.filter((tx) => tx.student_id !== id);

    this.saveStudentsToLocal();
    this.saveTransactionsToLocal();

    // Async delete from Firestore
    deleteDoc(doc(db, 'students', id)).catch((err) => {
      handleFirestoreError(err, OperationType.DELETE, `students/${id}`);
    });

    affectedTx.forEach((tx) => {
      deleteDoc(doc(db, 'transactions', tx.id)).catch(() => {});
    });

    return this.students.length < initialLen;
  }

  // --- Transactions Management ---
  public getTransactions(): Transaction[] {
    return [...this.transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public getTransactionsByStudent(studentId: string): Transaction[] {
    return this.transactions
      .filter((t) => t.student_id === studentId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public addTransaction(data: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Transaction {
    if (data.amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }
    const now = new Date().toISOString();
    const newTx: Transaction = {
      ...data,
      amount: Number(data.amount),
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      created_at: now,
      updated_at: now,
    };
    this.transactions.unshift(newTx);
    this.saveTransactionsToLocal();

    // Async write to Firestore
    setDoc(doc(db, 'transactions', newTx.id), newTx).catch((err) => {
      handleFirestoreError(err, OperationType.CREATE, `transactions/${newTx.id}`);
    });

    return newTx;
  }

  public addBulkIncome(input: BulkIncomeInput): { count: number; perStudent: number; remainder: number } {
    if (input.total_amount <= 0) {
      throw new Error('Total amount must be greater than 0');
    }
    if (!input.student_ids || input.student_ids.length === 0) {
      throw new Error('Please select at least one student');
    }

    const count = input.student_ids.length;
    const perStudentExact = input.total_amount / count;
    const perStudentRounded = Math.floor(perStudentExact * 100) / 100;
    const remainder = Number((input.total_amount - perStudentRounded * count).toFixed(2));

    const now = new Date().toISOString();
    const newTransactions: Transaction[] = input.student_ids.map((studId, idx) => {
      const adjustedAmount = idx === 0 ? Number((perStudentRounded + remainder).toFixed(2)) : perStudentRounded;
      return {
        id: 'tx_bulk_' + Date.now() + '_' + idx + '_' + Math.random().toString(36).substring(2, 6),
        student_id: studId,
        type: 'income',
        amount: adjustedAmount,
        description: input.description || 'Bulk Fund Distribution',
        date: input.date || new Date().toISOString().split('T')[0],
        created_at: now,
        updated_at: now,
      };
    });

    this.transactions.unshift(...newTransactions);
    this.saveTransactionsToLocal();

    // Async write all to Firestore
    newTransactions.forEach((tx) => {
      setDoc(doc(db, 'transactions', tx.id), tx).catch((err) => {
        handleFirestoreError(err, OperationType.CREATE, `transactions/${tx.id}`);
      });
    });

    return { count, perStudent: perStudentRounded, remainder };
  }

  public updateTransaction(id: string, updates: Partial<Omit<Transaction, 'id' | 'created_at'>>): Transaction {
    const index = this.transactions.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error('Transaction not found');
    }
    if (updates.amount !== undefined && updates.amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }
    const updated: Transaction = {
      ...this.transactions[index],
      ...updates,
      amount: updates.amount !== undefined ? Number(updates.amount) : this.transactions[index].amount,
      updated_at: new Date().toISOString(),
    };
    this.transactions[index] = updated;
    this.saveTransactionsToLocal();

    // Async write to Firestore
    setDoc(doc(db, 'transactions', id), updated).catch((err) => {
      handleFirestoreError(err, OperationType.UPDATE, `transactions/${id}`);
    });

    return updated;
  }

  public deleteTransaction(id: string): boolean {
    const initialLen = this.transactions.length;
    this.transactions = this.transactions.filter((t) => t.id !== id);
    this.saveTransactionsToLocal();

    // Async delete from Firestore
    deleteDoc(doc(db, 'transactions', id)).catch((err) => {
      handleFirestoreError(err, OperationType.DELETE, `transactions/${id}`);
    });

    return this.transactions.length < initialLen;
  }

  // --- Financial Calculations ---
  public getStudentFinancials(studentId: string): StudentFinancials | null {
    const student = this.getStudentById(studentId);
    if (!student) return null;

    const studentTx = this.transactions.filter((t) => t.student_id === studentId);
    let total_income = 0;
    let total_expense = 0;
    let lastDate: string | undefined;

    studentTx.forEach((tx) => {
      if (tx.type === 'income') {
        total_income += tx.amount;
      } else if (tx.type === 'expense') {
        total_expense += tx.amount;
      }
      if (!lastDate || tx.date > lastDate) {
        lastDate = tx.date;
      }
    });

    total_income = Math.round(total_income * 100) / 100;
    total_expense = Math.round(total_expense * 100) / 100;
    const balance = Math.round((total_income - total_expense) * 100) / 100;

    return {
      student,
      total_income,
      total_expense,
      balance,
      transaction_count: studentTx.length,
      last_transaction_date: lastDate,
    };
  }

  public getAllStudentFinancials(): StudentFinancials[] {
    return this.students.map((student) => {
      const studentTx = this.transactions.filter((t) => t.student_id === student.id);
      let total_income = 0;
      let total_expense = 0;
      let lastDate: string | undefined;

      studentTx.forEach((tx) => {
        if (tx.type === 'income') {
          total_income += tx.amount;
        } else if (tx.type === 'expense') {
          total_expense += tx.amount;
        }
        if (!lastDate || tx.date > lastDate) {
          lastDate = tx.date;
        }
      });

      total_income = Math.round(total_income * 100) / 100;
      total_expense = Math.round(total_expense * 100) / 100;
      const balance = Math.round((total_income - total_expense) * 100) / 100;

      return {
        student,
        total_income,
        total_expense,
        balance,
        transaction_count: studentTx.length,
        last_transaction_date: lastDate,
      };
    });
  }

  public getStudentLedger(studentId: string) {
    const txList = this.transactions
      .filter((t) => t.student_id === studentId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    let running = 0;
    const ledger = txList.map((tx) => {
      if (tx.type === 'income') {
        running += tx.amount;
      } else {
        running -= tx.amount;
      }
      return {
        ...tx,
        running_balance: Math.round(running * 100) / 100,
      };
    });

    return ledger.reverse();
  }

  public getDashboardStats(): DashboardStats {
    let total_income = 0;
    let total_expenses = 0;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const currentMonthPrefix = `${currentYear}-${currentMonth}`;

    let this_month_income = 0;
    let this_month_expenses = 0;

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyMap: Record<string, { income: number; expense: number }> = {};

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap[key] = { income: 0, expense: 0 };
    }

    this.transactions.forEach((tx) => {
      const amt = Number(tx.amount);
      if (tx.type === 'income') {
        total_income += amt;
        if (tx.date.startsWith(currentMonthPrefix)) {
          this_month_income += amt;
        }
      } else {
        total_expenses += amt;
        if (tx.date.startsWith(currentMonthPrefix)) {
          this_month_expenses += amt;
        }
      }

      const txMonthKey = tx.date.substring(0, 7);
      if (monthlyMap[txMonthKey]) {
        if (tx.type === 'income') {
          monthlyMap[txMonthKey].income += amt;
        } else {
          monthlyMap[txMonthKey].expense += amt;
        }
      }
    });

    total_income = Math.round(total_income * 100) / 100;
    total_expenses = Math.round(total_expenses * 100) / 100;
    const total_balance = Math.round((total_income - total_expenses) * 100) / 100;
    this_month_income = Math.round(this_month_income * 100) / 100;
    this_month_expenses = Math.round(this_month_expenses * 100) / 100;

    let rollingBalance = 0;
    const monthly_data = Object.keys(monthlyMap).sort().map((key) => {
      const [yr, mo] = key.split('-');
      const label = `${monthNames[parseInt(mo, 10) - 1]} ${yr.substring(2)}`;
      const inc = Math.round(monthlyMap[key].income * 100) / 100;
      const exp = Math.round(monthlyMap[key].expense * 100) / 100;
      rollingBalance += (inc - exp);
      return {
        month: label,
        income: inc,
        expense: exp,
        balance: Math.round(rollingBalance * 100) / 100,
      };
    });

    const studentMap = new Map(this.students.map((s) => [s.id, s.full_name]));
    const activities: RecentActivity[] = [];

    const sortedTx = [...this.transactions].sort((a, b) => new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime()).slice(0, 6);
    sortedTx.forEach((tx) => {
      activities.push({
        id: tx.id,
        type: tx.type,
        student_id: tx.student_id,
        student_name: studentMap.get(tx.student_id) || 'Unknown Student',
        amount: tx.amount,
        description: tx.description,
        date: tx.date,
      });
    });

    const sortedStudents = [...this.students].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 2);
    sortedStudents.forEach((st) => {
      activities.push({
        id: st.id,
        type: 'student',
        student_id: st.id,
        student_name: st.full_name,
        description: `Registered student (${st.student_id}) from ${st.district}`,
        date: st.created_at.split('T')[0],
      });
    });

    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      total_students: this.students.length,
      total_income,
      total_expenses,
      total_balance,
      this_month_income,
      this_month_expenses,
      monthly_data,
      recent_activities: activities.slice(0, 8),
    };
  }

  // --- Settings ---
  public getSettings(): DarsSettings {
    return { ...this.settings };
  }

  public saveSettings(newSettings: Partial<DarsSettings>): DarsSettings {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettingsToLocal(this.settings);

    // Async write to Firestore
    setDoc(doc(db, 'settings', 'general'), this.settings).catch((err) => {
      handleFirestoreError(err, OperationType.UPDATE, 'settings/general');
    });

    return { ...this.settings };
  }

  // --- Import / Export / Reset ---
  public exportData(): string {
    const exportPayload = {
      export_version: '1.0',
      exported_at: new Date().toISOString(),
      institution: this.settings.dars_name,
      settings: this.settings,
      students: this.students,
      transactions: this.transactions,
    };
    return JSON.stringify(exportPayload, null, 2);
  }

  public importData(jsonString: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonString);
      if (!Array.isArray(data.students) || !Array.isArray(data.transactions)) {
        return { success: false, message: 'Invalid data format. File must contain students and transactions arrays.' };
      }

      this.students = data.students;
      this.transactions = data.transactions;
      if (data.settings) {
        this.settings = { ...initialSettings, ...data.settings };
        this.saveSettings(this.settings);
      }
      this.saveStudentsToLocal();
      this.saveTransactionsToLocal();

      // Sync to Firestore
      this.students.forEach((st) => setDoc(doc(db, 'students', st.id), st).catch(() => {}));
      this.transactions.forEach((tx) => setDoc(doc(db, 'transactions', tx.id), tx).catch(() => {}));

      return { success: true, message: `Successfully imported ${this.students.length} students and ${this.transactions.length} transactions.` };
    } catch (e: any) {
      return { success: false, message: 'Failed to parse JSON file: ' + e.message };
    }
  }

  public resetToSampleData(): void {
    this.students = [];
    this.transactions = [];
    this.settings = { ...initialSettings };
    this.saveSettings(initialSettings);
    this.saveStudentsToLocal();
    this.saveTransactionsToLocal();
  }

  public clearAllData(): void {
    const oldStudents = [...this.students];
    const oldTransactions = [...this.transactions];
    this.students = [];
    this.transactions = [];
    this.saveStudentsToLocal();
    this.saveTransactionsToLocal();

    oldStudents.forEach((st) => deleteDoc(doc(db, 'students', st.id)).catch(() => {}));
    oldTransactions.forEach((tx) => deleteDoc(doc(db, 'transactions', tx.id)).catch(() => {}));
  }
}

export const storageService = new StorageService();
