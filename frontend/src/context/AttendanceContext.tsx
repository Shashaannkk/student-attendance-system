import React, { createContext, useState, useContext, ReactNode } from 'react';

interface Student {
    student_id: string;
    name: string;
    class_name: string;
    roll_no: number;
}

interface Selection {
    className: string;
    subject: string;
    date: string; // ISO string YYYY-MM-DD
}

interface AttendanceContextType {
    selection: Selection;
    setSelection: (selection: Selection) => void;
    students: Student[];
    setStudents: (students: Student[]) => void;
    resetSelection: () => void;
}

const defaultSelection: Selection = {
    className: '',
    subject: '',
    date: new Date().toISOString().split('T')[0],
};

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export const AttendanceProvider = ({ children }: { children: ReactNode }) => {
    const [selection, setSelection] = useState<Selection>(defaultSelection);
    const [students, setStudents] = useState<Student[]>([]);

    const resetSelection = () => {
        setSelection(defaultSelection);
        setStudents([]);
    };

    return (
        <AttendanceContext.Provider value={{ selection, setSelection, students, setStudents, resetSelection }}>
            {children}
        </AttendanceContext.Provider>
    );
};

export const useAttendance = () => {
    const context = useContext(AttendanceContext);
    if (context === undefined) {
        throw new Error('useAttendance must be used within an AttendanceProvider');
    }
    return context;
};
