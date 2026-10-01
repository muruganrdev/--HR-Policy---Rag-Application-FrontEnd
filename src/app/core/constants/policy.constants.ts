import { PolicyCategory, SampleQuestion, PolicyDocumentMeta } from '../models/policy.model';

export const POLICY_CATEGORIES: PolicyCategory[] = [
  { id: 'all', name: 'All Policies', icon: 'layers' },
  { id: 'leave', name: 'Leave & Holidays', icon: 'calendar' },
  { id: 'attendance', name: 'Attendance & Timings', icon: 'clock' },
  { id: 'remote', name: 'Remote & WFH', icon: 'home' },
  { id: 'conduct', name: 'Code of Conduct', icon: 'shield' },
  { id: 'exit', name: 'Notice & Offboarding', icon: 'log-out' },
];

export const RECOMMENDED_QUESTIONS: SampleQuestion[] = [
  {
    category: 'leave',
    label: 'Leave balance',
    query: "What is Priya Nair's annual leave balance?",
    icon: '🌴'
  },
  {
    category: 'department',
    label: 'Department lookup',
    query: 'Who works in the Engineering department?',
    icon: '👥'
  },
  {
    category: 'management',
    label: 'Reporting line',
    query: 'Who reports to Arun Kumar?',
    icon: '🧭'
  },
  {
    category: 'policy',
    label: 'Annual leave policy',
    query: 'What is the annual leave policy for India?',
    icon: '📘'
  },
  {
    category: 'leave',
    label: 'Carry forward',
    query: "Can Priya Nair carry forward her remaining annual leave?",
    icon: '✅'
  }
];

export const SAMPLE_QUESTIONS = RECOMMENDED_QUESTIONS;

export const POLICY_DOCUMENTS_CATALOG: PolicyDocumentMeta[] = [
  {
    filename: 'leave_policy.pdf',
    title: 'Annual & Special Leave Policy',
    category: 'leave',
    version: '1.0',
    description: 'Guidelines on 20-day annual leave, sick leave, 26-week maternity leave, 5-day paternity leave, and encashment.',
    keyHighlights: ['20 Days Annual Leave', '12 Days Sick Leave', '26 Weeks Maternity', 'Max 5 Days Encashment']
  },
  {
    filename: 'attendance_policy.pdf',
    title: 'Attendance & Punctuality Policy',
    category: 'attendance',
    version: '1.0',
    description: 'Biometric tracking, standard hours (9 AM-6 PM), 10-min grace period, and 3 late arrivals = 1 day LWP rules.',
    keyHighlights: ['9:00 AM - 6:00 PM', '10 Min Grace Period', '3 Lates = 1 LWP Day', 'Biometric Log In']
  },
  {
    filename: 'work_from_home_policy.pdf',
    title: 'Work From Home (WFH) Policy',
    category: 'remote',
    version: '1.0',
    description: 'Eligibility after 6 months, maximum 2 days per week (Wednesday & Friday), laptop security and VPN rules.',
    keyHighlights: ['Eligible after 6 Months', 'Max 2 Days/Week', 'Default Wed & Fri', 'Company VPN Mandatory']
  },
  {
    filename: 'working_hours_policy.pdf',
    title: 'Working Hours & Shifts Policy',
    category: 'attendance',
    version: '1.0',
    description: '40-hour standard work week, flexi-time (8 AM-10 AM), 4 shift rotations, and overtime 1.5x/2.0x rates.',
    keyHighlights: ['40 Hours/Week', 'Core 10 AM - 4 PM', '20% Night Allowance', '1.5x Overtime']
  },
  {
    filename: 'employee_conduct_policy.pdf',
    title: 'Employee Code of Conduct',
    category: 'conduct',
    version: '1.0',
    description: 'Core values, zero-tolerance workplace harassment (ICC), gifts disclosure (>INR 1,000), NDA, and progressive PIP.',
    keyHighlights: ['Zero Harassment Policy', 'NDA (2 Yrs Post-Exit)', 'Gift Limit INR 1,000', '4-Step Disciplinary']
  },
  {
    filename: 'notice_period_policy.pdf',
    title: 'Notice Period & Exit Policy',
    category: 'exit',
    version: '1.0',
    description: 'Grade-based notice period (30/60/90 days), buyout calculations, garden leave, and 45-day F&F settlement.',
    keyHighlights: ['Grade 1-3: 30 Days', 'Grade 4-6: 60 Days', 'Grade 7+: 90 Days', 'F&F within 45 Days']
  }
];
