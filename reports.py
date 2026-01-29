"""
Attendance Reports Module
Generates reports for students, classes, and subjects.
Supports CSV export.
"""

import csv
import os
from datetime import datetime
from attendance import load_data as load_attendance, calculate_percentage, get_student_attendance
from students import get_student, get_students_by_class, get_all_classes

REPORTS_DIR = "reports"
DATE_FORMAT = "%d-%m-%Y"

def ensure_reports_dir():
    """Ensure reports directory exists."""
    if not os.path.exists(REPORTS_DIR):
        os.makedirs(REPORTS_DIR)

def get_student_report(student_id):
    """
    Generate a detailed report for a single student.
    Returns dict with student info, subjects, and attendance stats.
    """
    student_id = student_id.strip().upper()
    student = get_student(student_id)
    
    if not student:
        return None
    
    attendance_data = load_attendance()
    student_attendance = attendance_data["students"].get(student_id, {})
    
    subjects_report = []
    total_present = 0
    total_classes = 0
    
    for subject, dates in student_attendance.items():
        present = sum(1 for v in dates.values() if v)
        total = len(dates)
        percentage = round((present / total) * 100, 2) if total > 0 else 0
        
        subjects_report.append({
            "subject": subject,
            "present": present,
            "total": total,
            "percentage": percentage
        })
        
        total_present += present
        total_classes += total
    
    overall_percentage = round((total_present / total_classes) * 100, 2) if total_classes > 0 else 0
    
    return {
        "student_id": student_id,
        "name": student["name"],
        "class": student["class"],
        "roll_no": student.get("roll_no", "-"),
        "subjects": subjects_report,
        "overall": {
            "present": total_present,
            "total": total_classes,
            "percentage": overall_percentage
        }
    }

def get_class_report(class_name, subject=None):
    """
    Generate attendance report for an entire class.
    If subject is provided, shows only that subject.
    """
    students = get_students_by_class(class_name)
    
    if not students:
        return None
    
    report = []
    
    for sid, info in students:
        student_data = {
            "student_id": sid,
            "name": info["name"],
            "roll_no": info.get("roll_no", "-"),
        }
        
        if subject:
            subject = subject.strip().upper()
            percentage = calculate_percentage(sid, subject)
            attendance = get_student_attendance(sid, subject)
            present = sum(1 for v in attendance.values() if v) if attendance else 0
            total = len(attendance) if attendance else 0
            
            student_data["subject"] = subject
            student_data["present"] = present
            student_data["total"] = total
            student_data["percentage"] = percentage
        else:
            # Get all subjects for this student
            student_report = get_student_report(sid)
            if student_report:
                student_data["overall_percentage"] = student_report["overall"]["percentage"]
                student_data["total_present"] = student_report["overall"]["present"]
                student_data["total_classes"] = student_report["overall"]["total"]
        
        report.append(student_data)
    
    # Sort by roll number
    report.sort(key=lambda x: int(x["roll_no"]) if str(x["roll_no"]).isdigit() else 999)
    
    return {
        "class": class_name,
        "subject": subject,
        "students": report,
        "count": len(report)
    }

def print_student_report(student_id):
    """Print formatted student report to console."""
    report = get_student_report(student_id)
    
    if not report:
        print(f"✗ Student '{student_id}' not found.")
        return
    
    print(f"\n{'='*50}")
    print(f"ATTENDANCE REPORT - {report['name']}")
    print(f"{'='*50}")
    print(f"Student ID: {report['student_id']}")
    print(f"Class: {report['class']}")
    print(f"Roll No: {report['roll_no']}")
    print(f"\n{'Subject':<15} {'Present':<10} {'Total':<10} {'%':<10}")
    print("-" * 45)
    
    for subj in report["subjects"]:
        print(f"{subj['subject']:<15} {subj['present']:<10} {subj['total']:<10} {subj['percentage']:<10}")
    
    print("-" * 45)
    print(f"{'OVERALL':<15} {report['overall']['present']:<10} {report['overall']['total']:<10} {report['overall']['percentage']:<10}")
    print(f"{'='*50}\n")

def print_class_report(class_name, subject=None):
    """Print formatted class report to console."""
    report = get_class_report(class_name, subject)
    
    if not report:
        print(f"✗ No students found in class '{class_name}'.")
        return
    
    print(f"\n{'='*60}")
    title = f"CLASS REPORT - {class_name}"
    if subject:
        title += f" ({subject})"
    print(title)
    print(f"{'='*60}")
    
    if subject:
        print(f"{'Roll':<6} {'Name':<20} {'Present':<10} {'Total':<10} {'%':<10}")
        print("-" * 56)
        for s in report["students"]:
            print(f"{s['roll_no']:<6} {s['name']:<20} {s['present']:<10} {s['total']:<10} {s['percentage']:<10}")
    else:
        print(f"{'Roll':<6} {'Name':<20} {'Present':<10} {'Total':<10} {'Overall %':<10}")
        print("-" * 56)
        for s in report["students"]:
            print(f"{s['roll_no']:<6} {s['name']:<20} {s.get('total_present', 0):<10} {s.get('total_classes', 0):<10} {s.get('overall_percentage', 0):<10}")
    
    print(f"{'='*60}")
    print(f"Total Students: {report['count']}\n")

def export_class_report_csv(class_name, subject=None):
    """Export class report to CSV file."""
    ensure_reports_dir()
    
    report = get_class_report(class_name, subject)
    
    if not report:
        return None, f"No students found in class '{class_name}'"
    
    # Generate filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    if subject:
        filename = f"{class_name}_{subject}_{timestamp}.csv"
    else:
        filename = f"{class_name}_overall_{timestamp}.csv"
    
    filepath = os.path.join(REPORTS_DIR, filename)
    
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        
        if subject:
            writer.writerow(["Roll No", "Student ID", "Name", "Subject", "Present", "Total", "Percentage"])
            for s in report["students"]:
                writer.writerow([
                    s["roll_no"], s["student_id"], s["name"], 
                    subject, s["present"], s["total"], s["percentage"]
                ])
        else:
            writer.writerow(["Roll No", "Student ID", "Name", "Present", "Total", "Overall Percentage"])
            for s in report["students"]:
                writer.writerow([
                    s["roll_no"], s["student_id"], s["name"],
                    s.get("total_present", 0), s.get("total_classes", 0), s.get("overall_percentage", 0)
                ])
    
    return filepath, f"Report exported to {filepath}"

def export_student_report_csv(student_id):
    """Export individual student report to CSV."""
    ensure_reports_dir()
    
    report = get_student_report(student_id)
    
    if not report:
        return None, f"Student '{student_id}' not found"
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{student_id}_{timestamp}.csv"
    filepath = os.path.join(REPORTS_DIR, filename)
    
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        
        # Header info
        writer.writerow(["Student Report"])
        writer.writerow(["Student ID", report["student_id"]])
        writer.writerow(["Name", report["name"]])
        writer.writerow(["Class", report["class"]])
        writer.writerow(["Roll No", report["roll_no"]])
        writer.writerow([])
        
        # Subject-wise data
        writer.writerow(["Subject", "Present", "Total", "Percentage"])
        for subj in report["subjects"]:
            writer.writerow([subj["subject"], subj["present"], subj["total"], subj["percentage"]])
        
        writer.writerow([])
        writer.writerow(["OVERALL", report["overall"]["present"], report["overall"]["total"], report["overall"]["percentage"]])
    
    return filepath, f"Report exported to {filepath}"
