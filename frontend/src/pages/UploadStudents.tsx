import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import * as XLSX from 'xlsx';
import { Upload, FileUp, AlertCircle, CheckCircle } from 'lucide-react';
import { API_URL } from '../config';

const UploadStudents = () => {
    const { user } = useAuth();
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [previewData, setPreviewData] = useState<any[]>([]);

    if (user?.role !== 'admin') {
        return <div className="p-8 text-center text-red-600">Access Denied: Admins only.</div>;
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            parseExcel(selectedFile);
        }
    };

    const parseExcel = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet);
            setPreviewData(jsonData);
        };
        reader.readAsBinaryString(file);
    };

    const handleUpload = async () => {
        if (!previewData.length) {
            setMessage({ type: 'error', text: 'No data found in file.' });
            return;
        }

        setUploading(true);
        setMessage(null);

        try {
            // Need to map previewData to backend schema if column names differ
            // Expected backend schema: student_id (optional), name, class_name, roll_no
            // Let's assume Excel headers are: Name, Class, RollNo, StudentID (optional)

            const formattedData = previewData.map((row: any) => ({
                name: row['Name'] || row['name'],
                class_name: row['Class'] || row['class_name'],
                roll_no: parseInt(row['RollNo'] || row['roll_no']),
                student_id: row['StudentID'] || row['student_id'] || undefined
            }));

            // We need a bulk endpoint. Since we don't have one yet in routers/students.py (WAIT, I should check or add one),
            // I will loop through them for now to avoid backend changes if possible, or create the endpoint.
            // The plan said "add POST /students/bulk or loop is slower".
            // Since User requested "xl sheet of students... manually entry is skipped", reliability is key.
            // Looping 50 students is fine. 500 might take a bit.
            // Let's try concurrent requests in batches of 5.

            let successCount = 0;
            let errorCount = 0;

            const batchSize = 5;
            for (let i = 0; i < formattedData.length; i += batchSize) {
                const batch = formattedData.slice(i, i + batchSize);
                await Promise.all(batch.map(async (student: any) => {
                    try {
                        const response = await fetch(`${API_URL}/students/`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            },
                            body: JSON.stringify(student)
                        });
                        if (response.ok) successCount++;
                        else errorCount++;
                    } catch (err) {
                        errorCount++;
                    }
                }));
            }

            setMessage({ type: 'success', text: `Upload complete. Success: ${successCount}, Failed: ${errorCount}` });
            setFile(null);
            setPreviewData([]);

        } catch (error: any) {
            setMessage({ type: 'error', text: 'Upload process failed: ' + error.message });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg mt-10">
            <div className="flex items-center mb-6 text-indigo-600">
                <FileUp className="w-8 h-8 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Bulk Upload Students</h2>
            </div>

            <div className="mb-6 p-4 bg-blue-50 text-blue-800 rounded-lg text-sm flex items-start">
                <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                    <h4 className="font-bold">Instructions</h4>
                    <p>Upload an Excel (.xlsx) or CSV file with the following headers:</p>
                    <ul className="list-disc list-inside ml-2 mt-1">
                        <li><b>Name</b> (Required)</li>
                        <li><b>Class</b> (Required)</li>
                        <li><b>RollNo</b> (Required - Number)</li>
                        <li><b>StudentID</b> (Optional)</li>
                    </ul>
                </div>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-lg flex items-center ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
                    {message.text}
                </div>
            )}

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-indigo-500 transition-colors">
                <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                    <Upload className="w-12 h-12 text-gray-400 mb-3" />
                    <span className="text-gray-600 font-medium">Click to upload or drag and drop</span>
                    <span className="text-gray-400 text-sm mt-1">Excel or CSV files only</span>
                </label>
                {file && (
                    <div className="mt-4 text-sm text-indigo-600 font-medium">
                        Selected: {file.name}
                    </div>
                )}
            </div>

            {previewData.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Preview ({previewData.length} records)</h3>
                    <div className="overflow-x-auto border rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {Object.keys(previewData[0]).slice(0, 5).map((key) => (
                                        <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{key}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {previewData.slice(0, 5).map((row, idx) => (
                                    <tr key={idx}>
                                        {Object.values(row).slice(0, 5).map((val: any, i) => (
                                            <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{val}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {previewData.length > 5 && (
                        <p className="text-center text-sm text-gray-500 mt-2">...and {previewData.length - 5} more rows</p>
                    )}
                </div>
            )}

            <div className="mt-8 flex justify-end">
                <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {uploading ? 'Uploading...' : 'Upload Students'}
                </button>
            </div>
        </div>
    );
};

export default UploadStudents;
