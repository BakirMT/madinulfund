import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Building,
  Key,
  Download,
  Upload,
  RotateCcw,
  CheckCircle,
  Database,
  Cloud,
} from 'lucide-react';
import { useDars } from '../../context/DarsContext';
import { useAuth } from '../../context/AuthContext';
import { ConfirmationModal } from '../common/ConfirmationModal';

interface SettingsProps {
  showToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({ showToast }) => {
  const {
    settings,
    updateSettings,
    theme,
    setTheme,
    exportData,
    importData,
    resetSampleData,
  } = useDars();
  const { adminUsername, updatePassword } = useAuth();

  const [darsName, setDarsName] = useState<string>(settings.dars_name);
  const [darsAddress, setDarsAddress] = useState<string>(settings.dars_address);
  const [phone, setPhone] = useState<string>(settings.phone);
  const [email, setEmail] = useState<string>(settings.email);
  const [otherDetails, setOtherDetails] = useState<string>(settings.other_details);
  const [currency, setCurrency] = useState<string>(settings.currency || '₹');
  const [dateFormat, setDateFormat] = useState<any>(settings.date_format || 'DD/MM/YYYY');

  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);

  const handleSaveDarsInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!darsName.trim()) {
      showToast('error', 'Name Required', 'Institution name cannot be blank.');
      return;
    }

    updateSettings({
      dars_name: darsName.trim(),
      dars_address: darsAddress.trim(),
      phone: phone.trim(),
      email: email.trim(),
      other_details: otherDetails.trim(),
      currency,
      date_format: dateFormat,
    });

    showToast('success', 'Settings Saved', 'Institution profile and fund settings updated.');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('error', 'Password Mismatch', 'New password and confirmation do not match.');
      return;
    }

    const res = updatePassword(oldPassword, newPassword);
    if (res.success) {
      showToast('success', 'Password Changed', 'Administrator password updated successfully.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      showToast('error', 'Password Update Failed', res.error);
    }
  };

  const handleExportJSON = () => {
    const jsonStr = exportData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Madinul_Qutaba_Fund_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('success', 'Backup Exported', 'Full database downloaded as JSON backup.');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = importData(content);
        if (result.success) {
          showToast('success', 'Data Restored', result.message);
        } else {
          showToast('error', 'Import Failed', result.message);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmReset = () => {
    resetSampleData();
    showToast('success', 'Sample Data Restored', 'Database reset to default Madinul Qutaba records.');
  };

  return (
    <div className="space-y-5 sm:space-y-6 max-w-4xl mx-auto pb-16 md:pb-0">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          <span>System & Institution Settings</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
          Configure DARS institution details, appearance themes, credentials, and data backups.
        </p>
      </div>

      {/* Database Connection Status Card */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Cloud Database Connection</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Google Cloud Firestore persistent storage</p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Connected & Live</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Database Provider</span>
            <div className="font-semibold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1">
              <Cloud className="w-3.5 h-3.5 text-emerald-600" />
              <span>Firebase Cloud Firestore</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Project Context</span>
            <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5 truncate">
              dars fund
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Security & Sync</span>
            <div className="font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
              Active Security Rules
            </div>
          </div>
        </div>
      </div>

      {/* 1. Appearance / Theme */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          {theme === 'dark' ? <Moon className="w-4 h-4 text-emerald-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
          <span>Appearance & Theme</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Select your preferred display theme. Your preference is automatically remembered on this device.
        </p>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-md pt-1">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`min-h-[56px] p-3.5 sm:p-4 rounded-2xl border text-left flex items-center gap-3 transition-all active:scale-95 ${
              theme === 'light'
                ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20 text-slate-900'
                : 'border-slate-200 hover:border-slate-300 text-slate-600'
            }`}
          >
            <Sun className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <div className="font-bold text-xs sm:text-sm">Light Theme</div>
              <div className="text-[11px] text-slate-400">Daylight mode</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`min-h-[56px] p-3.5 sm:p-4 rounded-2xl border text-left flex items-center gap-3 transition-all active:scale-95 ${
              theme === 'dark'
                ? 'border-emerald-500 bg-emerald-950/40 ring-2 ring-emerald-500/20 text-white'
                : 'border-slate-700 hover:border-slate-600 text-slate-400'
            }`}
          >
            <Moon className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-xs sm:text-sm">Dark Theme</div>
              <div className="text-[11px] text-slate-500">Night mode</div>
            </div>
          </button>
        </div>
      </div>

      {/* 2. DARS Institution Information */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Building className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>DARS Institution Profile</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          This institution name and address appears on all dashboards, print receipts, and PDF reports.
        </p>

        <form onSubmit={handleSaveDarsInfo} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              DARS Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={darsName}
              onChange={(e) => setDarsName(e.target.value)}
              className="w-full min-h-[46px] px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Affiliation / Other Details
            </label>
            <input
              type="text"
              value={otherDetails}
              onChange={(e) => setOtherDetails(e.target.value)}
              className="w-full min-h-[46px] px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Institution Address
            </label>
            <textarea
              rows={2}
              value={darsAddress}
              onChange={(e) => setDarsAddress(e.target.value)}
              className="w-full min-h-[56px] px-3.5 py-2 text-base sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Office Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full min-h-[46px] px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Official Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full min-h-[46px] px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Fund Currency Symbol
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full min-h-[46px] px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
              >
                <option value="₹">₹ — Indian Rupee (INR)</option>
                <option value="$">$ — US Dollar (USD)</option>
                <option value="AED">AED — UAE Dirham</option>
                <option value="SAR">SAR — Saudi Riyal</option>
                <option value="£">£ — British Pound</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Date Display Format
              </label>
              <select
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                className="w-full min-h-[46px] px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 01/10/2026)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-10-01)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 10/01/2026)</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="min-h-[46px] px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-xs transition-colors flex items-center gap-2 active:scale-95"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Save Institution Profile</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. Security / Administrator Credentials */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Key className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Administrator Access & Password</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Logged in as <strong className="text-slate-900 dark:text-white">@{adminUsername}</strong>. Update your administrator login password below.
        </p>

        <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs max-w-md">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Current Password <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full min-h-[46px] px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              New Password (min 6 chars) <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full min-h-[46px] px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Confirm New Password <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full min-h-[46px] px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              required
            />
          </div>

          <button
            type="submit"
            className="min-h-[46px] px-5 py-2.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold rounded-xl text-sm shadow-xs transition-colors active:scale-95"
          >
            Update Admin Password
          </button>
        </form>
      </div>

      {/* 4. Data Backup, Restore & Reset */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Data Backup & Recovery</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Ensure financial safety by downloading regular backup copies of students, balances, and transaction ledgers.
        </p>

        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 pt-1">
          {/* Download JSON Backup */}
          <button
            type="button"
            onClick={handleExportJSON}
            className="min-h-[44px] px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 active:scale-95"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Download Backup (.JSON)</span>
          </button>

          {/* Import JSON Backup */}
          <label className="min-h-[44px] px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-95">
            <Upload className="w-4 h-4 text-sky-600" />
            <span>Restore Backup File</span>
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>

          {/* Reset to Sample Data */}
          <button
            type="button"
            onClick={() => setIsResetModalOpen(true)}
            className="min-h-[44px] px-4 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs sm:text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 active:scale-95"
          >
            <RotateCcw className="w-4 h-4 text-rose-600" />
            <span>Reset to Realistic Sample Data</span>
          </button>
        </div>
      </div>

      {/* Confirmation for Sample Data Reset */}
      <ConfirmationModal
        isOpen={isResetModalOpen}
        title="Reset to Sample DARS Records?"
        message="This will overwrite current student and transaction records with the authentic default Madinul Qutaba DARS dataset. We recommend downloading a backup first if you have recorded real student funds."
        confirmLabel="Confirm Reset"
        isDestructive={true}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleConfirmReset}
      />
    </div>
  );
};
