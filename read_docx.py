import zipfile
import xml.etree.ElementTree as ET
import os

def read_docx(file_path):
    try:
        with zipfile.ZipFile(file_path) as docx:
            xml_content = docx.read('word/document.xml')
            root = ET.fromstring(xml_content)
            
            # Namespaces
            ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            
            paragraphs = []
            for para in root.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
                text_elems = para.findall('.//{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t')
                text = "".join([t.text for t in text_elems if t.text])
                if text:
                    paragraphs.append(text)
            return "\n".join(paragraphs)
    except Exception as e:
        return f"Error reading {file_path}: {str(e)}"

docx_files = [f for f in os.listdir('.') if f.endswith('.docx')]
for f in sorted(docx_files):
    print(f"Reading {f}...")
    content = read_docx(f)
    
    txt_name = f.replace('.docx', '.txt')
    with open(txt_name, 'w', encoding='utf-8') as out:
        out.write(content)
    print(f"Saved text to {txt_name}")
