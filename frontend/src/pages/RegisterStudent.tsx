import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, ClipboardList, CreditCard, UserPlus, CheckCircle, Zap, ChevronDown, Users } from 'lucide-react';
import { API_URL } from '../config';

const CLASSES = ['FY', 'SY', 'TY', 'SE', 'TE', 'BE', '8th', '9th', '10th', '11th', '12th'];
const DIVISIONS = ['A', 'B', 'C', 'D'];

interface Student {
    student_id: string;
    name: string;
    class_name: string;
    division: string;
    roll_no: number;
}

const RegisterStudent = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        student_id: '',
        name: '',
        class_name: '',
        division: 'A',
        roll_no: ''
    });
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Seed class state
    const [seedClass, setSeedClass] = useState('FY');
    const [seedDivision, setSeedDivision] = useState('A');
    const [isSeeding, setSeedLoading] = useState(false);
    const [seedMessage, setSeedMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Students list
    const [students, setStudents] = useState<Student[]>([]);
    const [listClass, setListClass] = useState('');
    const [listDivision, setListDivision] = useState('A');
    const [isListLoading, setListLoading] = useState(false);

    if (user?.role !== 'admin') {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
                    <User className="w-8 h-8 text-red-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-red-900 mb-2">Access Denied</h3>
                    <p className="text-red-700">This page is only accessible to administrators.</p>
                </div>
            </div>
        );
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);
        try {
            const rollNo = parseInt(formData.roll_no);
            if (isNaN(rollNo)) throw new Error('Roll Number must be a valid number');
            const response = await fetch(`${API_URL}/students/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ ...formData, roll_no: rollNo })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Registration failed');
            }
            setMessage({ type: 'success', text: `Student ${formData.name} added successfully!` });
            setFormData({ student_id: '', name: '', class_name: '', division: 'A', roll_no: '' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSeedClass = async () => {
        setSeedLoading(true);
        setSeedMessage(null);
        try {
            const res = await fetch(`${API_URL}/students/seed-class`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ class_name: seedClass, division: seedDivision })
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || 'Seeding failed');
            }
            const data: Student[] = await res.json();
            setSeedMessage({ type: 'success', text: `✅ ${data.length} students generated for ${seedClass}-${seedDivision}!` });
            // Auto-load the seeded list
            setListClass(seedClass);
            setListDivision(seedDivision);
            setStudents(data.sort((a, b) => a.roll_no - b.roll_no));
        } catch (error: any) {
            setSeedMessage({ type: 'error', text: error.message });
        } finally {
            setSeedLoading(false);
        }
    };

    const handleLoadStudents = async () => {
        if (!listClass) return;
        setListLoading(true);
        try {
            const res = await fetch(
                `${API_URL}/students/?class_name=${encodeURIComponent(listClass)}&division=${encodeURIComponent(listDivision)}&limit=100`,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            if (!res.ok) throw new Error('Failed to load');
            const data: Student[] = await res.json();
            setStudents(data.sort((a, b) => a.roll_no - b.roll_no));
        } catch {
            setStudents([]);
        } finally {
            setListLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Page Header */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <UserPlus className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Students Management</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Register individually or generate 40 students at once</p>
                </div>
            </div>

            {/* ── Generate 40 Students ── */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-3xl border-2 border-indigo-200 dark:border-indigo-700 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-indigo-900 dark:text-indigo-100">Generate 40 Students</h2>
                        <p className="text-sm text-indigo-700 dark:text-indigo-300">Instantly populate a class with 40 real student names</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="flex-1">
                        <label className="block text-sm font-semibold text-indigo-800 dark:text-indigo-200 mb-1">Class</label>
                        <select
                            value={seedClass}
                            onChange={e => setSeedClass(e.target.value)}
                            className="w-full px-4 py-2.5 border-2 border-indigo-200 dark:border-indigo-600 rounded-xl text-gray-800 dark:text-gray-200 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-400 outline-none"
                        >
                            {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-semibold text-indigo-800 dark:text-indigo-200 mb-1">Division</label>
                        <select
                            value={seedDivision}
                            onChange={e => setSeedDivision(e.target.value)}
                            className="w-full px-4 py-2.5 border-2 border-indigo-200 dark:border-indigo-600 rounded-xl text-gray-800 dark:text-gray-200 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-400 outline-none"
                        >
                            {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={handleSeedClass}
                            disabled={isSeeding}
                            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all hover:scale-105 shadow-lg shadow-indigo-200 whitespace-nowrap"
                        >
                            {isSeeding ? (
                                <><div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> Generating...</>
                            ) : (
                                <><Zap className="w-4 h-4" /> Generate 40 Students</>
                            )}
                        </button>
                    </div>
                </div>

                {seedMessage && (
                    <div className={`p-3 rounded-xl text-sm font-medium ${seedMessage.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                        {seedMessage.text}
                    </div>
                )}
            </div>

            {/* ── Single Student Registration ── */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-blue-500" /> Register Single Student
                </h2>

                {message && (
                    <div className={`mb-6 p-4 rounded-2xl border-2 flex items-start gap-3 ${message.type === 'success'
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-red-50 border-red-200 text-red-800'}`}>
                        {message.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />}
                        <p className="font-medium">{message.text}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Name */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Student Name *</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input type="text" name="name" required value={formData.name} onChange={handleChange}
                                    className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    placeholder="Enter student's full name" />
                            </div>
                        </div>
                        {/* Student ID */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Student ID</label>
                            <div className="relative">
                                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input type="text" name="student_id" value={formData.student_id} onChange={handleChange}
                                    className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    placeholder="STU001 (optional)" />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Leave empty to auto-generate</p>
                        </div>
                        {/* Roll Number */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Roll Number *</label>
                            <input type="number" name="roll_no" required value={formData.roll_no} onChange={handleChange}
                                className="block w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                placeholder="Enter roll number" />
                        </div>
                        {/* Class */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Class *</label>
                            <div className="relative">
                                <ClipboardList className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <select name="class_name" required value={formData.class_name} onChange={handleChange}
                                    className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none">
                                    <option value="">Select class...</option>
                                    {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                        {/* Division */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Division *</label>
                            <select name="division" required value={formData.division} onChange={handleChange}
                                className="block w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all">
                                {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="pt-4 border-t-2 border-gray-100 dark:border-gray-700">
                        <button type="submit" disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200">
                            {isLoading ? (
                                <><div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /><span>Registering...</span></>
                            ) : (
                                <><UserPlus className="w-5 h-5" /><span>Register Student</span></>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* ── Student List Viewer ── */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-500" /> View Students
                </h2>
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <select value={listClass} onChange={e => setListClass(e.target.value)}
                        className="flex-1 px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-green-400 outline-none">
                        <option value="">Select class...</option>
                        {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select value={listDivision} onChange={e => setListDivision(e.target.value)}
                        className="w-32 px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-green-400 outline-none">
                        {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <button onClick={handleLoadStudents} disabled={!listClass || isListLoading}
                        className="px-5 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 transition-all hover:scale-105 flex items-center gap-2">
                        {isListLoading ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <Users className="w-4 h-4" />}
                        Load Students
                    </button>
                </div>

                {students.length > 0 && (
                    <>
                        <p className="text-sm text-gray-500 mb-3">{students.length} students in {listClass || seedClass}-{listDivision || seedDivision}</p>
                        <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">#</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Name</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Student ID</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Class</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Roll No</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((s, i) => (
                                        <tr key={s.student_id} className="border-t border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="py-3 px-4 text-gray-500">{i + 1}</td>
                                            <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{s.name}</td>
                                            <td className="py-3 px-4 text-gray-500 font-mono text-xs">{s.student_id}</td>
                                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{s.class_name}-{s.division}</td>
                                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{s.roll_no}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
                {students.length === 0 && listClass && !isListLoading && (
                    <p className="text-center text-gray-400 py-8">No students found. Use "Generate 40 Students" above to seed the class.</p>
                )}
            </div>
        </div>
    );
};

export default RegisterStudent;
