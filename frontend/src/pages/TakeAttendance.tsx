import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import {
    ChevronRight, ChevronLeft, Check, X, Clock,
    Users, BookOpen, Layers, Save, Loader,
    AlertTriangle, CheckCircle2
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface Student {
    student_id: string;
    name: string;
    class_name: string;
    division: string;
    roll_no: number;
}

type AttendanceStatus = 'P' | 'A' | 'L';

// ── Config ───────────────────────────────────────────────────────────────────

const CLASSES = ['FY', 'SY', 'TY', 'SE', 'TE', 'BE', '8th', '9th', '10th', '11th', '12th'];
const DIVISIONS = ['A', 'B', 'C', 'D'];

const SUBJECTS_BY_CLASS: Record<string, string[]> = {
    FY: ['Mathematics', 'Physics', 'Chemistry', 'English', 'C Programming', 'Engineering Drawing'],
    SY: ['Data Structures', 'Digital Electronics', 'Mathematics-III', 'Object Oriented Programming', 'Microprocessors'],
    TY: ['Operating Systems', 'Database Management', 'Computer Networks', 'Software Engineering', 'Theory of Computation'],
    SE: ['Engineering Mathematics', 'Electronic Devices', 'Data Structures', 'Discrete Mathematics'],
    TE: ['Computer Organization', 'Algorithm Design', 'Web Technology', 'Compiler Design'],
    BE: ['Machine Learning', 'Cloud Computing', 'Project Management', 'Distributed Systems'],
    '8th': ['Mathematics', 'Science', 'English', 'Social Studies', 'Hindi'],
    '9th': ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History'],
    '10th': ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi', 'Sanskrit'],
    '11th': ['Physics', 'Chemistry', 'Mathematics', 'English', 'Computer Science'],
    '12th': ['Physics', 'Chemistry', 'Mathematics', 'English', 'Computer Science'],
};

// ── Step Indicator ────────────────────────────────────────────────────────────

const steps = [
    { label: 'Class', icon: Layers },
    { label: 'Division', icon: Users },
    { label: 'Subject', icon: BookOpen },
    { label: 'Attendance', icon: CheckCircle2 },
];

const StepBar: React.FC<{ current: number }> = ({ current }) => (
    <div className="flex items-center justify-center mb-8 gap-0">
        {steps.map((step, i) => {
            const Icon = step.icon;
            const done = i < current;
            const active = i === current;
            return (
                <React.Fragment key={step.label}>
                    <div className="flex flex-col items-center">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300
                ${done ? 'bg-green-500 text-white shadow-lg shadow-green-200'
                                    : active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110'
                                        : 'bg-gray-100 text-gray-400 dark:bg-gray-700'}`}
                        >
                            {done ? <Check className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                        </div>
                        <span className={`text-xs mt-1 font-medium ${active ? 'text-indigo-600' : done ? 'text-green-600' : 'text-gray-400'}`}>
                            {step.label}
                        </span>
                    </div>
                    {i < steps.length - 1 && (
                        <div className={`h-0.5 w-12 sm:w-20 mx-1 mt-[-14px] transition-all duration-300 ${i < current ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-600'}`} />
                    )}
                </React.Fragment>
            );
        })}
    </div>
);

// ── Status Button ─────────────────────────────────────────────────────────────

const StatusBtn: React.FC<{
    value: AttendanceStatus;
    current: AttendanceStatus;
    onClick: () => void;
}> = ({ value, current, onClick }) => {
    const config = {
        P: { label: 'P', bg: 'bg-green-500 text-white shadow-green-200', ring: 'ring-green-400', inactive: 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400' },
        A: { label: 'A', bg: 'bg-red-500 text-white shadow-red-200', ring: 'ring-red-400', inactive: 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400' },
        L: { label: 'L', bg: 'bg-amber-400 text-white shadow-amber-200', ring: 'ring-amber-300', inactive: 'bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400' },
    }[value];

    const isActive = current === value;
    return (
        <button
            onClick={onClick}
            className={`w-9 h-9 rounded-lg font-bold text-sm transition-all duration-150 focus:outline-none
        ${isActive ? `${config.bg} shadow-md ring-2 ${config.ring} scale-110` : config.inactive}`}
            title={value === 'P' ? 'Present' : value === 'A' ? 'Absent' : 'Late'}
        >
            {config.label}
        </button>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────

const TakeAttendance: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedDivision, setSelectedDivision] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState<Student[]>([]);
    const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Available subjects for selected class
    const subjects = selectedClass ? (SUBJECTS_BY_CLASS[selectedClass] ?? ['Mathematics', 'Science', 'English', 'Hindi', 'Physical Education']) : [];

    // Load students when class+division are chosen
    useEffect(() => {
        if (!selectedClass || !selectedDivision) return;
        const fetchStudents = async () => {
            setIsLoading(true);
            try {
                const url = `${API_URL}/students/?class_name=${encodeURIComponent(selectedClass)}&division=${encodeURIComponent(selectedDivision)}&limit=100`;
                const res = await fetch(url, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                if (!res.ok) throw new Error('Failed to fetch');
                const data: Student[] = await res.json();
                data.sort((a, b) => a.roll_no - b.roll_no);
                setStudents(data);
                // Default everyone to Present
                const init: Record<string, AttendanceStatus> = {};
                data.forEach(s => { init[s.student_id] = 'P'; });
                setAttendance(init);
            } catch {
                setMessage({ type: 'error', text: 'Could not load students. Please seed students first.' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchStudents();
    }, [selectedClass, selectedDivision]);

    const setStatus = (studentId: string, status: AttendanceStatus) => {
        setAttendance(prev => ({ ...prev, [studentId]: status }));
    };

    const markAll = (status: AttendanceStatus) => {
        const next: Record<string, AttendanceStatus> = {};
        students.forEach(s => { next[s.student_id] = status; });
        setAttendance(next);
    };

    const counts = {
        P: Object.values(attendance).filter(v => v === 'P').length,
        A: Object.values(attendance).filter(v => v === 'A').length,
        L: Object.values(attendance).filter(v => v === 'L').length,
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setMessage(null);
        try {
            const items = Object.entries(attendance).map(([student_id, status]) => ({ student_id, status }));
            const payload = {
                class_name: selectedClass,
                division: selectedDivision,
                subject: selectedSubject,
                date: selectedDate,
                items,
            };
            const res = await fetch(`${API_URL}/attendance/bulk`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error('Submit failed');
            setMessage({ type: 'success', text: `✅ Attendance saved! ${counts.P} present, ${counts.A} absent, ${counts.L} late.` });
            setTimeout(() => navigate('/dashboard'), 2500);
        } catch {
            setMessage({ type: 'error', text: 'Failed to save attendance. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Step Renders ─────────────────────────────────────────────────────────────

    const renderStep0 = () => (
        <div>
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Select Class</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {CLASSES.map(cls => (
                    <button
                        key={cls}
                        onClick={() => { setSelectedClass(cls); setSelectedSubject(''); }}
                        className={`py-4 rounded-xl font-bold text-base border-2 transition-all duration-200 hover:scale-105
              ${selectedClass === cls
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200'
                                : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
                            }`}
                    >
                        {cls}
                    </button>
                ))}
            </div>
            <div className="mt-6 flex justify-end">
                <button
                    disabled={!selectedClass}
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-105 shadow-lg shadow-indigo-200"
                >
                    Next <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );

    const renderStep1 = () => (
        <div>
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Select Division  <span className="text-sm font-normal text-gray-500">({selectedClass})</span></h2>
            <div className="grid grid-cols-4 gap-4">
                {DIVISIONS.map(div => (
                    <button
                        key={div}
                        onClick={() => setSelectedDivision(div)}
                        className={`py-6 rounded-xl font-bold text-xl border-2 transition-all duration-200 hover:scale-105
              ${selectedDivision === div
                                ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-200'
                                : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30'
                            }`}
                    >
                        {div}
                    </button>
                ))}
            </div>
            <div className="mt-6 flex justify-between">
                <button onClick={() => setStep(0)} className="flex items-center gap-2 px-5 py-2.5 border-2 border-gray-200 rounded-xl text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                    <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                    disabled={!selectedDivision}
                    onClick={() => setStep(2)}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-105 shadow-lg shadow-indigo-200"
                >
                    Next <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div>
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-1">Select Subject</h2>
            <p className="text-sm text-gray-500 mb-4">{selectedClass} – Division {selectedDivision}</p>

            {/* Date picker */}
            <div className="mb-5">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Date</label>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    className="px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-gray-200 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {subjects.map(subj => (
                    <button
                        key={subj}
                        onClick={() => setSelectedSubject(subj)}
                        className={`px-4 py-3.5 rounded-xl font-medium text-left border-2 transition-all duration-200 hover:scale-[1.02]
              ${selectedSubject === subj
                                ? 'bg-pink-600 border-pink-600 text-white shadow-lg shadow-pink-200'
                                : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:border-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/30'
                            }`}
                    >
                        <BookOpen className="inline w-4 h-4 mr-2 opacity-70" />
                        {subj}
                    </button>
                ))}
            </div>
            <div className="mt-6 flex justify-between">
                <button onClick={() => setStep(1)} className="flex items-center gap-2 px-5 py-2.5 border-2 border-gray-200 rounded-xl text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                    <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                    disabled={!selectedSubject}
                    onClick={() => setStep(3)}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-105 shadow-lg shadow-indigo-200"
                >
                    Next <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                    <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Mark Attendance</h2>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {[selectedClass, `Div ${selectedDivision}`, selectedSubject, selectedDate].map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded text-xs font-medium">{tag}</span>
                        ))}
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => markAll('P')} className="px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 transition-colors">All Present</button>
                    <button onClick={() => markAll('A')} className="px-3 py-1.5 text-xs bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors">All Absent</button>
                </div>
            </div>

            {/* Live Summary Bar */}
            <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                    { label: 'Present', count: counts.P, color: 'bg-green-50 dark:bg-green-900/20 border-green-200', text: 'text-green-700 dark:text-green-400' },
                    { label: 'Absent', count: counts.A, color: 'bg-red-50 dark:bg-red-900/20 border-red-200', text: 'text-red-700 dark:text-red-400' },
                    { label: 'Late', count: counts.L, color: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200', text: 'text-amber-700 dark:text-amber-400' },
                ].map(({ label, count, color, text }) => (
                    <div key={label} className={`rounded-xl border-2 p-3 text-center ${color}`}>
                        <div className={`text-2xl font-bold ${text}`}>{count}</div>
                        <div className={`text-xs font-medium ${text} opacity-80`}>{label}</div>
                    </div>
                ))}
            </div>

            {/* Progress bar */}
            {students.length > 0 && (
                <div className="mb-4">
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden flex gap-0.5">
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
                    <span className="ml-3 text-gray-500">Loading students...</span>
                </div>
            ) : students.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-600">
                    <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-300 font-medium">No students found for {selectedClass} – {selectedDivision}</p>
                    <p className="text-sm text-gray-400 mt-1">Go to Students → Generate 40 Students for this class/division first.</p>
                    <button onClick={() => navigate('/register-student')} className="mt-4 px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
                        Go to Students Page
                    </button>
                </div>
            ) : (
                <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                    {students.map((student, idx) => {
                        const status = attendance[student.student_id] ?? 'P';
                        const rowBg = status === 'A' ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20'
                            : status === 'L' ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/20'
                                : 'bg-white dark:bg-gray-700/60 border-gray-100 dark:border-gray-600';
                        return (
                            <div
                                key={student.student_id}
                                className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 ${rowBg}`}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0
                    ${status === 'P' ? 'bg-green-500' : status === 'A' ? 'bg-red-500' : 'bg-amber-400'}`}>
                                        {idx + 1}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">{student.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Roll: {student.roll_no} &nbsp;|&nbsp; {student.student_id}</p>
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

            {/* Message */}
            {message && (
                <div className={`mt-4 p-4 rounded-xl border-2 text-sm font-medium
          ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                    {message.text}
                </div>
            )}

            {/* Footer Buttons */}
            <div className="mt-5 flex justify-between">
                <button onClick={() => setStep(2)} className="flex items-center gap-2 px-5 py-2.5 border-2 border-gray-200 rounded-xl text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                    <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || students.length === 0}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-105 shadow-lg shadow-indigo-200"
                >
                    {isSubmitting ? <><Loader className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Submit Attendance</>}
                </button>
            </div>
        </div>
    );

    // ── Layout ────────────────────────────────────────────────────────────────────

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
            {/* Page Title */}
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">Take Attendance</h1>
                <p className="text-gray-500 mt-1">Step-by-step attendance marking with live updates</p>
            </div>

            {/* Step Bar */}
            <StepBar current={step} />

            {/* Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
                {step === 0 && renderStep0()}
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
            </div>
        </div>
    );
};

export default TakeAttendance;
