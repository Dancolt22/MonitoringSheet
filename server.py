# Custom HTTP Server and SMTP API Proxy for Niggas Monitoring Sheets

import http.server
import socketserver
import json
import smtplib
import os
import mimetypes
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders

class MonitoringHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/api/send':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8'))
                tutor_email = data.get('tutorEmail')
                tutor_password = data.get('tutorPassword')
                recipient = data.get('recipient')
                subject = data.get('subject')
                body = data.get('body')
                html = data.get('html')
                doc_filename = data.get('docFilename')
                doc_content = data.get('docContent')
                
                if not all([tutor_email, tutor_password, recipient, subject, body]):
                    self.send_error_response("Missing required parameters (Tutor Email, App Password, Boss Email, Subject, or Body).")
                    return
                
                # Setup email multipart message
                msg = MIMEMultipart('mixed')
                msg['From'] = tutor_email
                msg['To'] = recipient
                msg['Subject'] = subject
                
                # Create body (alternative plain + html)
                msg_body = MIMEMultipart('alternative')
                msg.attach(msg_body)
                
                # Attach plain text
                msg_body.attach(MIMEText(body, 'plain'))
                
                # Attach inline HTML table for rendering in the email body
                if html:
                    msg_body.attach(MIMEText(html, 'html'))
                
                # Attach the .doc file
                if doc_filename and doc_content:
                    # Add Word namespaces to enable standard print view and page settings
                    doc_wrapper = f"""
                        <html xmlns:o='urn:schemas-microsoft-com:office:office' 
                              xmlns:w='urn:schemas-microsoft-com:office:word' 
                              xmlns='http://www.w3.org/TR/REC-html40'>
                        <head>
                            <title>NIGGAS Monitoring Sheet</title>
                            <!--[if gte mso 9]>
                            <xml>
                                <w:WordDocument>
                                    <w:View>Print</w:View>
                                    <w:Zoom>100</w:Zoom>
                                    <w:DoNotOptimizeForBrowser/>
                                </w:WordDocument>
                            </xml>
                            <![endif]-->
                        </head>
                        <body>
                            {doc_content}
                        </body>
                        </html>
                    """
                    
                    attachment = MIMEBase('application', 'msword')
                    attachment.set_payload(doc_wrapper.encode('utf-8'))
                    encoders.encode_base64(attachment)
                    attachment.add_header('Content-Disposition', f'attachment; filename="{doc_filename}"')
                    msg.attach(attachment)
                
                # Send email using Yahoo Secure SMTP (port 465 SSL)
                print(f"[API] Connecting to Yahoo/Turbify SMTP server for {tutor_email}...")
                with smtplib.SMTP_SSL('smtp.mail.yahoo.com', 465) as server:
                    server.login(tutor_email, tutor_password)
                    server.sendmail(tutor_email, recipient, msg.as_string())
                
                print(f"[API] Email sent successfully to {recipient}!")
                self.send_success_response("Email sent successfully with .doc attachment!")
            except Exception as e:
                print("[API] SMTP error occurred:", e)
                self.send_error_response(str(e))
        else:
            self.send_error(404, "Not Found")
            
    def send_success_response(self, message):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({"success": True, "message": message}).encode('utf-8'))
        
    def send_error_response(self, message):
        self.send_response(400)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({"success": False, "error": message}).encode('utf-8'))

def run(port=8000):
    server_address = ('', port)
    httpd = http.server.HTTPServer(server_address, MonitoringHandler)
    print(f"Server is running on port {port} (API: /api/send)...")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    print("Server stopped.")

if __name__ == '__main__':
    run()
