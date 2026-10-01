import { Student, Transaction, DarsSettings } from '../types';

export const initialSettings: DarsSettings = {
  dars_name: 'Madinul Qutaba',
  dars_address: "Central DARS Complex, Jami'a Nagar, Malappuram, Kerala - 676505",
  phone: '+91 98471 23456',
  email: 'office@madinulqutaba.edu.in',
  other_details: "Affiliated with Markazu Tharbiyathil Islamiyya — Dedicated to Islamic & Shari'ah Studies",
  theme: 'light',
  currency: '₹',
  date_format: 'DD/MM/YYYY',
};

// Clean database: No pre-seeded AI mock records
export const initialStudents: Student[] = [];

export const initialTransactions: Transaction[] = [];
