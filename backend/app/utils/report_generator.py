import os
from datetime import datetime
from openpyxl import Workbook
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from ..config import settings

def generate_excel_report(report_type: str, data: list) -> str:
    """
    Generates an Excel report for the given data list of dicts and saves it to upload directory.
    Returns the relative url path.
    """
    wb = Workbook()
    ws = wb.active
    ws.title = report_type.capitalize()

    if not data:
        ws.append(["No data available for this report type"])
    else:
        # Get headers from keys
        headers = list(data[0].keys())
        ws.append(headers)
        
        # Add rows
        for row in data:
            values = []
            for h in headers:
                val = row[h]
                if isinstance(val, (datetime, datetime.date)):
                    values.append(val.strftime("%Y-%m-%d %H:%M:%S"))
                else:
                    values.append(str(val) if val is not None else "")
            ws.append(values)

    filename = f"report_{report_type}_{int(datetime.utcnow().timestamp())}.xlsx"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    wb.save(file_path)
    return f"/static/{filename}"


def generate_pdf_report(report_type: str, data: list) -> str:
    """
    Generates a PDF report for the given data list of dicts and saves it to upload directory.
    Returns the relative url path.
    """
    filename = f"report_{report_type}_{int(datetime.utcnow().timestamp())}.pdf"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    
    doc = SimpleDocTemplate(file_path, pagesize=letter)
    story = []
    styles = getSampleStyleSheet()
    
    # Custom Title Style
    title_style = ParagraphStyle(
        'ReportTitle',
        parent=styles['Heading1'],
        fontSize=20,
        textColor=colors.HexColor('#E65100'), # safety orange
        spaceAfter=20
    )
    
    story.append(Paragraph(f"Mine Safety Management System - {report_type.upper()} REPORT", title_style))
    story.append(Paragraph(f"Generated at: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC", styles['Normal']))
    story.append(Spacer(1, 20))
    
    if not data:
        story.append(Paragraph("No records found.", styles['Heading3']))
    else:
        headers = list(data[0].keys())
        # Truncate headers/values or convert to string
        table_data = [[h.replace("_", " ").upper() for h in headers]]
        
        for row in data:
            row_data = []
            for h in headers:
                val = row[h]
                if isinstance(val, (datetime, datetime.date)):
                    s = val.strftime("%Y-%m-%d %H:%M")
                else:
                    s = str(val) if val is not None else ""
                
                # Truncate very long descriptions
                if len(s) > 30:
                    s = s[:27] + "..."
                row_data.append(s)
            table_data.append(row_data)
        
        # Build table
        t = Table(table_data)
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#E65100')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,0), 9),
            ('BOTTOMPADDING', (0,0), (-1,0), 8),
            ('BACKGROUND', (0,1), (-1,-1), colors.HexColor('#F5F5F5')),
            ('GRID', (0,0), (-1,-1), 1, colors.HexColor('#E0E0E0')),
            ('FONTSIZE', (0,1), (-1,-1), 8),
        ]))
        story.append(t)
        
    doc.build(story)
    return f"/static/{filename}"
