import React, { useState, useMemo } from 'react';
import { UserPlus, User, Phone, Home, MapPin, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { useDars } from '../../context/DarsContext';
import { NavPage } from '../navigation/Sidebar';
import { generateNextStudentId, validatePhone, validatePincode } from '../../utils/formatters';

interface AddStudentProps {
  onNavigate: (page: NavPage, data?: any) => void;
  showToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

const KERALA_DISTRICTS = [
  'Malappuram',
  'Kozhikode',
  'Kannur',
  'Palakkad',
  'Wayanad',
  'Thrissur',
  'Kasaragod',
  'Ernakulam',
  'Kollam',
  'Alappuzha',
  'Kottayam',
  'Idukki',
  'Pathanamthitta',
  'Thiruvananthapuram',
  'Other / Outside Kerala',
];

export const AddStudent: React.FC<AddStudentProps> = ({ onNavigate, showToast }) => {
  const { students, addStudent, addTransaction } = useDars();

  const suggestedId = useMemo(() => {
    return generateNextStudentId(students.map((s) => s.student_id));
  }, [students]);

  const [fullName, setFullName] = useState<string>('');
  const [studentId, setStudentId] = useState<string>(suggestedId);
  const [phone, setPhone] = useState<string>('');
  const [houseName, setHouseName] = useState<string>('');
  const [postOffice, setPostOffice] = useState<string>('');
  const [extraAddress, setExtraAddress] = useState<string>('');
  const [district, setDistrict] = useState<string>('Malappuram');
  const [state, setState] = useState<string>('Kerala');
  const [pincode, setPincode] = useState<string>('');

  // Optional opening fund contribution
  const [initialFund, setInitialFund] = useState<string>('');
  const [initialFundDesc, setInitialFundDesc] = useState<string>('Admission / Initial DARS Fund');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!fullName.trim()) {
      errs.fullName = 'Student Full Name is strictly required.';
    }

    if (!studentId.trim()) {
      errs.studentId = 'Student ID is required.';
    } else {
      const isDuplicate = students.some(
        (s) => s.student_id.trim().toLowerCase() === studentId.trim().toLowerCase()
      );
      if (isDuplicate) {
        errs.studentId = `Student ID "${studentId}" is already registered. Please use a unique ID.`;
      }
    }

    if (phone && !validatePhone(phone)) {
      errs.phone = 'Please enter a valid 10-digit mobile number.';
    }

    if (pincode && !validatePincode(pincode)) {
      errs.pincode = 'Pincode must be exactly 6 digits.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      showToast('error', 'Validation Error', 'Please check the highlighted form errors.');
      return;
    }

    try {
      const created = addStudent({
        full_name: fullName.trim(),
        student_id: studentId.trim().toUpperCase(),
        phone: phone.trim(),
        house_name: houseName.trim(),
        post_office: postOffice.trim(),
        extra_address: extraAddress.trim(),
        district: district.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
      });

      const initAmt = parseFloat(initialFund);
      if (initAmt > 0) {
        addTransaction({
          student_id: created.id,
          type: 'income',
          amount: initAmt,
          description: initialFundDesc || 'Admission / Initial DARS Fund',
          date: new Date().toISOString().split('T')[0],
        });
      }

      showToast(
        'success',
        'Student Registered Successfully',
        `${created.full_name} (${created.student_id}) has been added to DARS records.`
      );

      onNavigate('student-detail', { studentId: created.id });
    } catch (err: any) {
      showToast('error', 'Registration Failed', err.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 sm:space-y-6 pb-16 md:pb-0">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <UserPlus className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          <span>Register New Student</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
          Add student profile details into the Madinul Qutaba DARS database.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {/* Full Name (REQUIRED & Prominent) */}
          <div className="p-4 sm:p-5 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/80 rounded-2xl">
            <label className="block text-xs font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1.5">
              Student Full Name <span className="text-rose-500 text-sm">* REQUIRED</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Muhammad Bilal V.K."
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.fullName) setErrors({ ...errors, fullName: '' });
              }}
              className={`w-full min-h-[48px] px-4 py-3 text-base rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:outline-hidden focus:ring-2 ${
                errors.fullName
                  ? 'border-rose-500 focus:ring-rose-500'
                  : 'border-slate-200 dark:border-slate-700 focus:ring-emerald-500'
              }`}
              required
              autoFocus
            />
            {errors.fullName && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-bold mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.fullName}</span>
              </p>
            )}
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
              Enter complete name with initials as recorded in institutional registers.
            </p>
          </div>

          {/* Student ID & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Student ID <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setStudentId(suggestedId)}
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                >
                  Suggest: {suggestedId}
                </button>
              </div>

              <input
                type="text"
                placeholder="e.g. MQ-2026-007"
                value={studentId}
                onChange={(e) => {
                  setStudentId(e.target.value);
                  if (errors.studentId) setErrors({ ...errors, studentId: '' });
                }}
                className={`w-full min-h-[46px] px-3.5 py-2.5 text-base sm:text-sm font-mono font-bold rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 ${
                  errors.studentId
                    ? 'border-rose-500 focus:ring-rose-500'
                    : 'border-slate-200 dark:border-slate-700 focus:ring-emerald-500'
                }`}
                required
              />
              {errors.studentId && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-bold mt-1">
                  {errors.studentId}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="e.g. 9847012345"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors({ ...errors, phone: '' });
                }}
                className={`w-full min-h-[46px] px-3.5 py-2.5 text-base sm:text-sm font-mono rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 ${
                  errors.phone
                    ? 'border-rose-500 focus:ring-rose-500'
                    : 'border-slate-200 dark:border-slate-700 focus:ring-emerald-500'
                }`}
                required
              />
              {errors.phone && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-bold mt-1">
                  {errors.phone}
                </p>
              )}
            </div>
          </div>

          {/* House Name & Post Office */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                House Name / Tharavadu
              </label>
              <input
                type="text"
                placeholder="e.g. Vannathan Kandi"
                value={houseName}
                onChange={(e) => setHouseName(e.target.value)}
                className="w-full min-h-[46px] px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Post Office
              </label>
              <input
                type="text"
                placeholder="e.g. Manjeri"
                value={postOffice}
                onChange={(e) => setPostOffice(e.target.value)}
                className="w-full min-h-[46px] px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Extra Address */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Extra Address / Landmark
            </label>
            <input
              type="text"
              placeholder="e.g. Near Central Juma Masjid, Court Road"
              value={extraAddress}
              onChange={(e) => setExtraAddress(e.target.value)}
              className="w-full min-h-[46px] px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* District, State, Pincode */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                District <span className="text-rose-500">*</span>
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full min-h-[46px] px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
                required
              >
                {KERALA_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                State
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full min-h-[46px] px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Pincode
              </label>
              <input
                type="text"
                placeholder="676121"
                maxLength={6}
                value={pincode}
                onChange={(e) => {
                  setPincode(e.target.value);
                  if (errors.pincode) setErrors({ ...errors, pincode: '' });
                }}
                className={`w-full min-h-[46px] px-3.5 py-2.5 text-base sm:text-sm font-mono rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 ${
                  errors.pincode
                    ? 'border-rose-500 focus:ring-rose-500'
                    : 'border-slate-200 dark:border-slate-700 focus:ring-emerald-500'
                }`}
              />
              {errors.pincode && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-bold mt-1">
                  {errors.pincode}
                </p>
              )}
            </div>
          </div>

          {/* Optional Opening Contribution */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Optional Initial Opening Fund Deposit</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Opening Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-xs">₹</span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="e.g. 1000"
                    value={initialFund}
                    onChange={(e) => setInitialFund(e.target.value)}
                    className="w-full min-h-[42px] pl-7 pr-3 py-2 text-base sm:text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Admission / Initial DARS Fund"
                  value={initialFundDesc}
                  onChange={(e) => setInitialFundDesc(e.target.value)}
                  className="w-full min-h-[42px] px-3 py-2 text-base sm:text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full min-h-[50px] py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm sm:text-base shadow-md shadow-emerald-600/20 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Complete Student Registration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
