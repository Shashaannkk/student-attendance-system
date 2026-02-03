import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAttendance } from '../context/AttendanceContext';
import { API_URL } from '../config';
import { Check, X, Save, ArrowLeft, Loader } from 'lucide-react';



const Attendance = () => {

    const { selection, students, setStudents } = useAttendance();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true); // Loading students
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [attendanceData, setAttendanceData] = useState<Record<string, boolean>>({});
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Fetch students on mount
    useEffect(() => {
        if (!selection.className) {
            navigate('/dashboard');
            return;
        }

        const fetchStudents = async () => {
            setIsLoading(true);
            try {
                // Fetch students for the selected class
                const response = await fetch(`${API_URL}/students/?class_name=${encodeURIComponent(selection.className)}&limit=100`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!response.ok) throw new Error('Failed to fetch students');

                const data = await response.json();
                setStudents(data);

                // Initialize attendance data (default active/present?)
                // Let's default to present
                const initialData: Record<string, boolean> = {};
                data.forEach((s: any) => {
                    initialData[s.student_id] = true;
                });
                setAttendanceData(initialData);

            } catch (error) {
                console.error("Error fetching students:", error);
                setMessage({ type: 'error', text: 'Failed to load students.' });
            } finally {
                setIsLoading(false);
            }
        };

        fetchStudents();
    }, [selection.className, navigate, setStudents]);

    const toggleAttendance = (studentId: string) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: !prev[studentId]
        }));
    };

    const handleSelectAll = (present: boolean) => {
        const newData: Record<string, boolean> = {};
        students.forEach(s => {
            newData[s.student_id] = present;
        });
        setAttendanceData(newData);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setMessage(null);

        try {
            const items = Object.entries(attendanceData).map(([student_id, present]) => ({
                student_id,
                present
            }));

            const payload = {
                items,
                date: selection.date,
                subject: selection.subject
            };

            const response = await fetch(`${API_URL}/attendance/bulk`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Failed to submit attendance');

            setMessage({ type: 'success', text: 'Attendance marked successfully!' });
            // Optional: navigate back or stay?
            setTimeout(() => navigate('/dashboard'), 1500);

        } catch (error) {
            console.error("Error submitting attendance:", error);
            setMessage({ type: 'error', text: 'Failed to submit attendance.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader className="animate-spin h-10 w-10 text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8 pt-6">
                <div>
                    <button onClick={() => navigate('/dashboard')} className="flex items-center text-gray-500 hover:text-gray-700 mb-2">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Mark Attendance</h1>
                    <div className="flex space-x-4 mt-2 text-sm text-gray-600">
                        <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded">{selection.className}</span>
                        <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded">{selection.subject}</span>
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">{selection.date}</span>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleSelectAll(true)}
                        className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                    >
                        Mark All Present
                    </button>
                    <button
                        onClick={() => handleSelectAll(false)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                        Mark All Absent
                    </button>
                </div>
            </div>

            {message && (
                <div className={`mb-4 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
                <ul className="divide-y divide-gray-200">
                    {students.map((student) => {
                        const isPresent = attendanceData[student.student_id];
                        return (
                            <li key={student.student_id} className={`hover:bg-gray-50 transition-colors ${!isPresent ? 'bg-red-50 hover:bg-red-100' : ''}`}>
                                <div className="px-4 py-4 flex items-center justify-between sm:px-6 cursor-pointer" onClick={() => toggleAttendance(student.student_id)}>
                                    <div className="flex items-center">
                                        <div className={`flex-shrink-0 h-10 w-10 sorted-center rounded-full flex items-center justify-center font-bold text-white ${isPresent ? 'bg-green-500' : 'bg-red-500'}`}>
                                            {isPresent ? 'P' : 'A'}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                            <div className="text-sm text-gray-500">{student.student_id} | Roll: {student.roll_no}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleAttendance(student.student_id); }}
                                            className={`p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 ${isPresent ? 'text-green-600 hover:bg-green-100 focus:ring-green-500' : 'text-red-600 hover:bg-red-100 focus:ring-red-500'}`}
                                        >
                                            {isPresent ? <Check className="w-6 h-6" /> : <X className="w-6 h-6" />}
                                        </button>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>

            <div className="mt-6 flex justify-end pb-10">
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center px-6 py-3 border border-transparent rounded-lg shadow-lg text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-200"
                >
                    {isSubmitting ? 'Saving...' : (
                        <>
                            <Save className="w-5 h-5 mr-2" />
                            Submit Attendance
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default Attendance;
