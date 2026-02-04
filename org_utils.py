import random
import string
import re

def generate_org_code(institution_name: str, institution_type: str) -> str:
    """
    Generate organization code in format:
    - School: SCH-{SHORT_NAME}-{UNIQUE}
    - College: CLG-{SHORT_NAME}-{UNIQUE}
    
    Args:
        institution_name: Full name like "St. Mary's School" or "MIT Engineering College"
        institution_type: 'school' or 'college'
    
    Returns:
        Org code like "SCH-STMARY-ABC123" or "CLG-MITENG-XYZ789"
    """
    # Determine prefix
    prefix = "SCH" if institution_type.lower() == "school" else "CLG"
    
    # Extract short name (remove special characters, take first letters of words)
    # Remove special characters and extra spaces
    clean_name = re.sub(r'[^a-zA-Z\s]', '', institution_name)
    words = clean_name.upper().split()
    
    # Create short name from first 6 characters of significant words
    short_name = ""
    for word in words:
        if word.lower() not in ['the', 'of', 'and', 'a', 'an']:  # Skip common words
            short_name += word
    
    # Limit to 6 characters
    short_name = short_name[:6]
    
    # Generate unique 6-character code (uppercase letters and numbers)
    unique_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    
    # Format: PREFIX-SHORTNAME-UNIQUE
    org_code = f"{prefix}-{short_name}-{unique_code}"
    
    return org_code


def send_org_code_email(email: str, org_code: str, institution_name: str, admin_username: str, admin_password: str):
    """
    Send email with organization code and credentials via SMTP.
    Uses Mailtrap for testing or any SMTP server configured in .env
    """
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart
    import os
    from dotenv import load_dotenv
    
    # Load environment variables
    load_dotenv()
    
    # Get SMTP configuration from environment
    smtp_host = os.getenv('SMTP_HOST', 'sandbox.smtp.mailtrap.io')
    smtp_port = int(os.getenv('SMTP_PORT', '2525'))
    smtp_username = os.getenv('SMTP_USERNAME', '')
    smtp_password = os.getenv('SMTP_PASSWORD', '')
    email_from = os.getenv('EMAIL_FROM', 'noreply@attendance-system.com')
    
    # Create HTML email
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
            .credentials {{ background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; }}
            .org-code {{ font-size: 24px; font-weight: bold; color: #667eea; font-family: monospace; }}
            .button {{ display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
            .warning {{ background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }}
            .footer {{ text-align: center; color: #666; font-size: 12px; margin-top: 30px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎓 Welcome to Attendance System</h1>
                <p>Your institution has been successfully registered!</p>
            </div>
            <div class="content">
                <h2>Hello Administrator,</h2>
                <p>Congratulations! <strong>{institution_name}</strong> has been registered in our attendance management system.</p>
                
                <div class="credentials">
                    <h3>📋 Your Login Credentials</h3>
                    <p><strong>Organization Code:</strong><br><span class="org-code">{org_code}</span></p>
                    <p><strong>Admin Username:</strong> {admin_username}</p>
                    <p><strong>Admin Password:</strong> {admin_password}</p>
                </div>
                
                <div class="warning">
                    <strong>⚠️ Important Security Notice:</strong>
                    <ul>
                        <li>Keep your organization code secure</li>
                        <li>Share it only with authorized staff members</li>
                        <li>You'll need it for every login</li>
                        <li>Consider changing your password after first login</li>
                    </ul>
                </div>
                
                <h3>🚀 How to Login:</h3>
                <ol>
                    <li>Visit the login page</li>
                    <li>Enter Organization Code: <code>{org_code}</code></li>
                    <li>Enter Username: <code>{admin_username}</code></li>
                    <li>Enter your password</li>
                    <li>Select "Admin" role</li>
                </ol>
                
                <div class="footer">
                    <p>This email was sent to: {email}</p>
                    <p>© 2024 Attendance Management System. All rights reserved.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """
    
    try:
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f'Your Organization Code: {org_code}'
        msg['From'] = email_from
        msg['To'] = email
        
        # Attach HTML content
        html_part = MIMEText(html_body, 'html')
        msg.attach(html_part)
        
        # Send email via SMTP
        if smtp_username and smtp_password:
            print(f"\n📧 Sending email to {email} via {smtp_host}...")
            with smtplib.SMTP(smtp_host, smtp_port) as server:
                server.starttls()
                server.login(smtp_username, smtp_password)
                server.send_message(msg)
            print(f"✅ Email sent successfully to {email}!")
            return True
        else:
            # Fallback to console if no SMTP credentials
            print("\n" + "="*60)
            print("⚠️  SMTP credentials not configured. Email not sent.")
            print("="*60)
            print(f"To: {email}")
            print(f"Subject: Your Organization Code: {org_code}")
            print(f"Org Code: {org_code}")
            print(f"Username: {admin_username}")
            print(f"Password: {admin_password}")
            print("="*60 + "\n")
            print("💡 To enable email sending:")
            print("1. Copy .env.example to .env")
            print("2. Add your Mailtrap credentials")
            print("3. Restart the server")
            print("="*60 + "\n")
            return True
            
    except Exception as e:
        # Graceful error handling - print to console if email fails
        print("\n" + "="*60)
        print(f"❌ Failed to send email: {str(e)}")
        print("="*60)
        print(f"To: {email}")
        print(f"Org Code: {org_code}")
        print(f"Username: {admin_username}")
        print(f"Password: {admin_password}")
        print("="*60 + "\n")
        return False
