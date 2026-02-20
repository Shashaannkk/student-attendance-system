import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import {
    ChevronRight, ChevronLeft, Check, X, Clock,
    Users, BookOpen, Layers, Save, Loader,
    AlertTriangle, CheckCircle2, GraduationCap, School
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Student {
    student_id: string;
    name: string;
    class_name: string;
    division: string;
    roll_no: number;
}

type AttendanceStatus = 'P' | 'A' | 'L';

// ── Config: School ─────────────────────────────────────────────────────────────

const SCHOOL_CLASSES = [
    'Jr.KG', 'Sr.KG',
    '1st', '2nd', '3rd', '4th', '5th', '6th',
    '7th', '8th', '9th', '10th', '11th', '12th'
];

const SCHOOL_SUBJECTS: Record<string, string[]> = {
    'Jr.KG': ['English', 'Drawing', 'EVS', 'Mathematics'],
    'Sr.KG': ['English', 'Drawing', 'EVS', 'Mathematics'],
    '1st': ['English', 'Mathematics', 'Hindi', 'EVS'],
    '2nd': ['English', 'Mathematics', 'Hindi', 'EVS'],
    '3rd': ['English', 'Mathematics', 'Hindi', 'Science', 'Social Studies'],
    '4th': ['English', 'Mathematics', 'Hindi', 'Science', 'Social Studies'],
    '5th': ['English', 'Mathematics', 'Hindi', 'Science', 'Social Studies'],
    '6th': ['English', 'Mathematics', 'Hindi', 'Science', 'Social Studies', 'History'],
    '7th': ['English', 'Mathematics', 'Hindi', 'Science', 'Social Studies', 'History'],
    '8th': ['English', 'Mathematics', 'Hindi', 'Physics', 'Chemistry', 'Biology', 'History'],
    '9th': ['English', 'Mathematics', 'Hindi', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography'],
    '10th': ['English', 'Mathematics', 'Hindi', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography'],
    '11th': ['English', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'History'],
    '12th': ['English', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'History'],
};

// ── Config: College ────────────────────────────────────────────────────────────

const COLLEGE_YEARS = ['FY', 'SY', 'TY'];            // 3-year degrees
const ENGG_YEARS = ['FE', 'SE', 'TE', 'BE'];       // 4-year engineering

const COLLEGE_BRANCHES = [
    'IT', 'CS', 'BCA', 'MCA',
    'EXTC', 'Mechanical', 'Civil', 'Electrical',
    'MBA', 'Commerce', 'Arts', 'Science',
];

// Subjects per year (same for most branches; can refine further)
const COLLEGE_SUBJECTS: Record<string, string[]> = {
    FY: ['Mathematics-I', 'Physics', 'Chemistry', 'English & Communication', 'C Programming', 'Engineering Drawing'],
    SY: ['Mathematics-II', 'Data Structures', 'Digital Electronics', 'OOP with Java', 'Microprocessors', 'Discrete Mathematics'],
    TY: ['Operating Systems', 'Database Management', 'Computer Networks', 'Software Engineering', 'Web Technology', 'Theory of Computation'],
    FE: ['Mathematics-I', 'Physics', 'Chemistry', 'Basic Electronics', 'C Programming', 'Workshop'],
    SE: ['Mathematics-III', 'Data Structures', 'Digital Systems', 'Object Oriented Programming', 'Discrete Maths'],
    TE: ['Algorithms', 'Computer Organizations', 'Compiler Design', 'Software Engineering', 'Computer Networks'],
    BE: ['Machine Learning', 'Cloud Computing', 'Project Management', 'Distributed Systems', 'Big Data'],
    BCA: ['Mathematics', 'Programming in C', 'Web Development', 'DBMS', 'Software Engineering'],
    MCA: ['Advanced Algorithms', 'Cloud Architecture', 'AI & ML', 'Research Methodology'],
    MBA: ['Management Principles', 'Marketing', 'Finance', 'HR Management', 'Business Analytics'],
};

const getCollegeSubjects = (year: string): string[] =>
    COLLEGE_SUBJECTS[year] ?? ['Mathematics', 'Science', 'English', 'Elective'];

const DIVISIONS = ['A', 'B', 'C', 'D'];

// ── Step Bar ──────────────────────────────────────────────────────────────────

// College: Class → Branch → Division → Subject → Mark
// School:  Class → Division → Subject → Mark

const StepBar: React.FC<{ steps: string[]; current: number }> = ({ steps, current }) => (
    <div className="flex items-center justify-center mb-8 gap-0">
        {steps.map((label, i) => {
            const done = i < current;
            const active = i === current;
            return (
                <React.Fragment key={label}>
                    <div className="flex flex-col items-center">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300
                ${done ? 'bg-green-500 text-white shadow-lg shadow-green-200'
                                    : active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110'
                                        : 'bg-gray-100 text-gray-400 dark:bg-gray-700'}`}
                        >
                            {done ? <Check className="w-5 h-5" /> : <span>{i + 1}</span>}
                        </div>
                        <span className={`text-xs mt-1 font-medium ${active ? 'text-indigo-600' : done ? 'text-green-600' : 'text-gray-400'}`}>
                            {label}
                        </span>
                    </div>
                    {i < steps.length - 1 && (
                        <div className={`h-0.5 w-10 sm:w-16 mx-1 mt-[-14px] transition-all duration-300 ${i < current ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-600'}`} />
                    )}
                </React.Fragment>
            );
        })}
    </div>
);

// ── Status Button ─────────────────────────────────────────────────────────────

const StatusBtn: React.FC<{
    value: AttendanceStatus; current: AttendanceStatus; onClick: () => void;
}> = ({ value, current, onClick }) => {
    const cfg = {
        P: { active: 'bg-green-500 text-white shadow-md ring-2 ring-green-400 scale-110', inactive: 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400' },
        A: { active: 'bg-red-500 text-white shadow-md ring-2 ring-red-400 scale-110', inactive: 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400' },
        L: { active: 'bg-amber-400 text-white shadow-md ring-2 ring-amber-300 scale-110', inactive: 'bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400' },
    }[value];
    return (
        <button onClick={onClick} className={`w-9 h-9 rounded-lg font-bold text-sm transition-all duration-150 focus:outline-none ${current === value ? cfg.active : cfg.inactive}`}
            title={value === 'P' ? 'Present' : value === 'A' ? 'Absent' : 'Late'}>
            {value}
        </button>
    );
};

// ── Main ──────────────────────────────────────────────────────────────────────

const TakeAttendance: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isCollege = (user?.institution_type ?? 'school') === 'college';

    // Steps vary by type
    const STEPS = isCollege
        ? ['Class', 'Branch', 'Division', 'Subject', 'Attendance']
        : ['Class', 'Division', 'Subject', 'Attendance'];
    const LAST_STEP = STEPS.length - 1;

    const [step, setStep] = useState(0);
    const [selectedYear, setSelectedYear] = useState('');  // FY / 8th etc
    const [selectedBranch, setSelectedBranch] = useState('');  // IT / BCA (college only)
    const [selectedDivision, setSelectedDivision] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const [students, setStudents] = useState<Student[]>([]);
    const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [autoSeeded, setAutoSeeded] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Derived: the actual class_name stored = "FY-IT" for college, "8th" for school
    const className = isCollege && selectedBranch
        ? `${selectedYear}-${selectedBranch}`
        : selectedYear;

    // Available years for college
    const collegeYears = [...COLLEGE_YEARS, ...ENGG_YEARS];
    const subjectsForYear = isCollege
        ? getCollegeSubjects(selectedYear)
        : (SCHOOL_SUBJECTS[selectedYear] ?? ['Mathematics', 'English', 'Science', 'Hindi']);

    // Auto-fetch + auto-seed students when entering last step
    const fetchStudents = useCallback(async (autoSeed = false) => {
        if (!className || !selectedDivision) return;
        setIsLoading(true);
        setAutoSeeded(false);
        try {
            const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
            const url = `${API_URL}/students/?class_name=${encodeURIComponent(className)}&division=${encodeURIComponent(selectedDivision)}&limit=100`;
            const res = await fetch(url, { headers });
            if (!res.ok) throw new Error('fetch failed');
            let data: Student[] = await res.json();
            data.sort((a, b) => a.roll_no - b.roll_no);

            // Auto-seed if empty
            if (data.length === 0 && autoSeed) {
                const seedRes = await fetch(`${API_URL}/students/seed-class`, {
                    method: 'POST',
                    headers: { ...headers, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ class_name: className, division: selectedDivision }),
                });
                if (seedRes.ok) {
                    data = (await seedRes.json() as Student[]).sort((a, b) => a.roll_no - b.roll_no);
                    setAutoSeeded(true);
                }
            }

            setStudents(data);
            const init: Record<string, AttendanceStatus> = {};
            data.forEach(s => { init[s.student_id] = 'P'; });
            setAttendance(init);
        } catch {
            setMessage({ type: 'error', text: 'Could not load students.' });
        } finally {
            setIsLoading(false);
        }
    }, [className, selectedDivision]);

    useEffect(() => {
        if (step === LAST_STEP) fetchStudents(true);
    }, [step, LAST_STEP, fetchStudents]);

    const setStatus = (id: string, s: AttendanceStatus) =>
        setAttendance(prev => ({ ...prev, [id]: s }));

    const markAll = (s: AttendanceStatus) => {
        const next: Record<string, AttendanceStatus> = {};
        students.forEach(st => { next[st.student_id] = s; });
        setAttendance(next);
    };

    const counts = {
        P: Object.values(attendance).filter(v => v === 'P').length,
        A: Object.values(attendance).filter(v => v === 'A').length,
        L: Object.values(attendance).filter(v => v === 'L').length,
    };

    const handleSubmit = async () => {
        setIsSubmitting(true); setMessage(null);
        try {
            const items = Object.entries(attendance).map(([student_id, status]) => ({ student_id, status }));
            const res = await fetch(`${API_URL}/attendance/bulk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({ class_name: className, division: selectedDivision, subject: selectedSubject, date: selectedDate, items }),
            });
            if (!res.ok) throw new Error('failed');
            setMessage({ type: 'success', text: `Attendance saved! ${counts.P} present, ${counts.A} absent, ${counts.L} late.` });
            setTimeout(() => navigate('/dashboard'), 2200);
        } catch {
            setMessage({ type: 'error', text: 'Failed to save. Please try again.' });
        } finally { setIsSubmitting(false); }
    };

    // ── nav helpers ────────────────────────────────────────────────────────────

    const next = () => setStep(s => Math.min(s + 1, LAST_STEP));
    const back = () => setStep(s => Math.max(s - 1, 0));

    const NavButtons: React.FC<{ canNext: boolean; onNext?: () => void }> = ({ canNext, onNext }) => (
        <div className="mt-6 flex justify-between">
            {step > 0
                ? <button onClick={back} className="flex items-center gap-2 px-5 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                    <ChevronLeft className="w-4 h-4" /> Back
                </button>
                : <div />}
            <button
                disabled={!canNext}
                onClick={onNext ?? next}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-105 shadow-lg shadow-indigo-200"
            >
                Next <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    );

    // ── Pill grid helper ───────────────────────────────────────────────────────

    const PillGrid: React.FC<{
        items: string[]; selected: string; onSelect: (v: string) => void;
        color?: string; cols?: string;
    }> = ({ items, selected, onSelect, color = 'indigo', cols = 'grid-cols-3 sm:grid-cols-4' }) => (
        <div className={`grid ${cols} gap-3`}>
            {items.map(item => (
                <button
                    key={item}
                    onClick={() => onSelect(item)}
                    className={`py-3.5 px-2 rounded-xl font-semibold text-sm border-2 transition-all duration-200 hover:scale-105
            ${selected === item
                            ? `bg-${color}-600 border-${color}-600 text-white shadow-lg shadow-${color}-200`
                            : `border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:border-${color}-400 hover:bg-${color}-50 dark:hover:bg-${color}-900/20`
                        }`}
                >
                    {item}
                </button>
            ))}
        </div>
    );

    // ── Step renders ───────────────────────────────────────────────────────────

    // Step 0 – Class / Year
    const renderClass = () => (
        <div>
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
                {isCollege ? 'Select Year' : 'Select Class'}
            </h2>
            {isCollege ? (
                <div className="space-y-4">
                    <div>
                        <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-2">3-Year Degree</p>
                        <PillGrid items={COLLEGE_YEARS} selected={selectedYear} onSelect={v => { setSelectedYear(v); setSelectedBranch(''); }} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-purple-500 uppercase tracking-wider mb-2">4-Year Engineering</p>
                        <PillGrid items={ENGG_YEARS} selected={selectedYear} onSelect={v => { setSelectedYear(v); setSelectedBranch(''); }} color="purple" />
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div>
                        <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-2">Kindergarten</p>
                        <PillGrid items={['Jr.KG', 'Sr.KG']} selected={selectedYear} onSelect={setSelectedYear} color="blue" cols="grid-cols-2" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-cyan-500 uppercase tracking-wider mb-2">Primary (1st – 5th)</p>
                        <PillGrid items={['1st', '2nd', '3rd', '4th', '5th']} selected={selectedYear} onSelect={setSelectedYear} color="cyan" cols="grid-cols-3 sm:grid-cols-5" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-teal-500 uppercase tracking-wider mb-2">Secondary (6th – 10th)</p>
                        <PillGrid items={['6th', '7th', '8th', '9th', '10th']} selected={selectedYear} onSelect={setSelectedYear} color="teal" cols="grid-cols-3 sm:grid-cols-5" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-2">Higher Secondary</p>
                        <PillGrid items={['11th', '12th']} selected={selectedYear} onSelect={setSelectedYear} color="green" cols="grid-cols-2" />
                    </div>
                </div>
            )}
            <NavButtons canNext={!!selectedYear} />
        </div>
    );

    // Step 1 – Branch (college only)
    const renderBranch = () => (
        <div>
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-1">Select Branch</h2>
            <p className="text-sm text-gray-500 mb-4">{selectedYear}</p>
            <PillGrid items={COLLEGE_BRANCHES} selected={selectedBranch} onSelect={setSelectedBranch} color="purple" cols="grid-cols-2 sm:grid-cols-3" />
            <NavButtons canNext={!!selectedBranch} />
        </div>
    );

    // Division step
    const renderDivision = () => (
        <div>
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-1">Select Division</h2>
            <p className="text-sm text-gray-500 mb-4">{className}</p>
            <div className="grid grid-cols-4 gap-4">
                {DIVISIONS.map(div => (
                    <button key={div} onClick={() => setSelectedDivision(div)}
                        className={`py-6 rounded-xl font-bold text-xl border-2 transition-all duration-200 hover:scale-105
              ${selectedDivision === div
                                ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-200'
                                : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:border-purple-400 hover:bg-purple-50'}`}>
                        {div}
                    </button>
                ))}
            </div>
            <NavButtons canNext={!!selectedDivision} />
        </div>
    );

    // Subject step
    const renderSubject = () => (
        <div>
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-1">Select Subject</h2>
            <p className="text-sm text-gray-500 mb-4">{className} – Div {selectedDivision}</p>
            <div className="mb-5">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Date</label>
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                    className="px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-gray-200 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {subjectsForYear.map(subj => (
                    <button key={subj} onClick={() => setSelectedSubject(subj)}
                        className={`px-4 py-3.5 rounded-xl font-medium text-left border-2 transition-all duration-200 hover:scale-[1.01]
              ${selectedSubject === subj
                                ? 'bg-pink-600 border-pink-600 text-white shadow-lg shadow-pink-200'
                                : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:border-pink-400 hover:bg-pink-50'}`}>
                        <BookOpen className="inline w-4 h-4 mr-2 opacity-70" />{subj}
                    </button>
                ))}
            </div>
            <NavButtons canNext={!!selectedSubject} />
        </div>
    );

    // Attendance step
    const renderAttendance = () => (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                    <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Mark Attendance</h2>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {[className, `Div ${selectedDivision}`, selectedSubject, selectedDate].map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded text-xs font-medium">{tag}</span>
                        ))}
                        {autoSeeded && <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">40 students auto-generated</span>}
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => markAll('P')} className="px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200">All Present</button>
                    <button onClick={() => markAll('A')} className="px-3 py-1.5 text-xs bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200">All Absent</button>
                </div>
            </div>

            {/* Live Summary */}
            <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                    { label: 'Present', count: counts.P, bg: 'bg-green-50 dark:bg-green-900/20 border-green-200', text: 'text-green-700 dark:text-green-400' },
                    { label: 'Absent', count: counts.A, bg: 'bg-red-50 dark:bg-red-900/20 border-red-200', text: 'text-red-700 dark:text-red-400' },
                    { label: 'Late', count: counts.L, bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200', text: 'text-amber-700 dark:text-amber-400' },
                ].map(({ label, count, bg, text }) => (
                    <div key={label} className={`rounded-xl border-2 p-3 text-center ${bg}`}>
                        <div className={`text-2xl font-bold ${text}`}>{count}</div>
                        <div className={`text-xs font-medium ${text} opacity-80`}>{label}</div>
                    </div>
                ))}
            </div>

            {/* Progress bar */}
            {students.length > 0 && (
                <div className="mb-4">
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden flex">
                        <div className="bg-green-400 transition-all duration-300" style={{ width: `${(counts.P / students.length) * 100}%` }} />
                        <div className="bg-amber-400 transition-all duration-300" style={{ width: `${(counts.L / students.length) * 100}%` }} />
                        <div className="bg-red-400 transition-all duration-300" style={{ width: `${(counts.A / students.length) * 100}%` }} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-right">{students.length} students total</p>
                </div>
            )}

            {/* Student List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader className="animate-spin w-8 h-8 text-indigo-500" />
                    <span className="ml-3 text-gray-500">Loading & auto-generating students...</span>
                </div>
            ) : students.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border-2 border-dashed border-gray-200">
                    <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-300 font-medium">Could not auto-generate students</p>
                    <p className="text-sm text-gray-400 mt-1">Please check your connection and try again.</p>
                </div>
            ) : (
                <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                    {students.map((student, idx) => {
                        const status = attendance[student.student_id] ?? 'P';
                        const rowBg = status === 'A' ? 'bg-red-50 dark:bg-red-900/10 border-red-100'
                            : status === 'L' ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-100'
                                : 'bg-white dark:bg-gray-700/60 border-gray-100 dark:border-gray-600';
                        return (
                            <div key={student.student_id} className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${rowBg}`}>
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0
                    ${status === 'P' ? 'bg-green-500' : status === 'A' ? 'bg-red-500' : 'bg-amber-400'}`}>
                                        {idx + 1}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">{student.name}</p>
                                        <p className="text-xs text-gray-500">Roll: {student.roll_no} &nbsp;|&nbsp; {student.student_id}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 flex-shrink-0 ml-3">
                                    <StatusBtn value="P" current={status} onClick={() => setStatus(student.student_id, 'P')} />
                                    <StatusBtn value="A" current={status} onClick={() => setStatus(student.student_id, 'A')} />
                                    <StatusBtn value="L" current={status} onClick={() => setStatus(student.student_id, 'L')} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {message && (
                <div className={`mt-4 p-4 rounded-xl border-2 text-sm font-medium
          ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                    {message.text}
                </div>
            )}

            <div className="mt-5 flex justify-between">
                <button onClick={back} className="flex items-center gap-2 px-5 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                    <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={handleSubmit} disabled={isSubmitting || students.length === 0}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-105 shadow-lg shadow-indigo-200">
                    {isSubmitting ? <><Loader className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Submit Attendance</>}
                </button>
            </div>
        </div>
    );

    // ── Step index mapping ─────────────────────────────────────────────────────
    // College:  0=Year, 1=Branch, 2=Division, 3=Subject, 4=Attendance
    // School:   0=Class, 1=Division, 2=Subject, 3=Attendance
    const renderStep = () => {
        if (isCollege) {
            if (step === 0) return renderClass();
            if (step === 1) return renderBranch();
            if (step === 2) return renderDivision();
            if (step === 3) return renderSubject();
            if (step === 4) return renderAttendance();
        } else {
            if (step === 0) return renderClass();
            if (step === 1) return renderDivision();
            if (step === 2) return renderSubject();
            if (step === 3) return renderAttendance();
        }
        return null;
    };

    // ── Layout ─────────────────────────────────────────────────────────────────
    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
            <div className="mb-8 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${isCollege ? 'bg-gradient-to-br from-indigo-600 to-purple-600' : 'bg-gradient-to-br from-blue-500 to-cyan-500'}`}>
                    {isCollege ? <GraduationCap className="w-6 h-6 text-white" /> : <School className="w-6 h-6 text-white" />}
                </div>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">Take Attendance</h1>
                    <p className="text-gray-500 text-sm mt-0.5">{isCollege ? 'College' : 'School'} – {user?.institution_name}</p>
                </div>
            </div>

            <StepBar steps={STEPS} current={step} />

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
                {renderStep()}
            </div>
        </div>
    );
};

export default TakeAttendance;
