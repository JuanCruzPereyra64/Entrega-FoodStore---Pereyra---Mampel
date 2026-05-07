import zipfile
import xml.etree.ElementTree as ET
import sys

def read_docx(path):
    try:
        document = zipfile.ZipFile(path)
        xml_content = document.read('word/document.xml')
        document.close()
        tree = ET.XML(xml_content)
        
        paragraphs = []
        for paragraph in tree.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
            texts = [node.text
                     for node in paragraph.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t')
                     if node.text]
            if texts:
                paragraphs.append(''.join(texts))
        
        return '\n'.join(paragraphs)
    except Exception as e:
        return f"Error reading {path}: {str(e)}"

if __name__ == '__main__':
    in_path = sys.argv[1]
    out_path = sys.argv[2]
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(read_docx(in_path))
