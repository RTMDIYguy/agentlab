import os
import zipfile
import re
import xml.etree.ElementTree as ET
from pathlib import Path
import subprocess

# Paths
ROOT = Path("E:/OneDrive - Uncle Robert Consulting LLC/Working Docs/AI Native Agency Deepened")
PULSE_DIR = ROOT / "Pulse Social"
DOCX_PATH = PULSE_DIR / "Pulse Social App.docx"
TEMP_DOCX = PULSE_DIR / "temp_pulse.docx"

def copy_unlocked_docx():
    print("Safely copying Word document using Node.js to bypass OneDrive locks...")
    cmd = f"node -e \"import {{ copyFile }} from 'node:fs/promises'; await copyFile('{DOCX_PATH.as_posix()}', '{TEMP_DOCX.as_posix()}');\""
    res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if res.returncode != 0:
         print(f"Node copy error: {res.stderr}")
         return False
    return TEMP_DOCX.exists()

def clean_xml_text(text):
    if not text:
        return ""
    # Unescape XML entities
    text = text.replace("&lt;", "<").replace("&gt;", ">").replace("&amp;", "&")
    text = text.replace("&quot;", '"').replace("&apos;", "'").replace("&#x27;", "'")
    return text

def parse_paragraphs_from_docx(docx_path):
    namespaces = {
        'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
    }
    paragraphs = []
    with zipfile.ZipFile(docx_path) as docx:
        tree = ET.parse(docx.open('word/document.xml'))
        root_elem = tree.getroot()
        for p in root_elem.iter(f"{{{namespaces['w']}}}p"):
            text_parts = []
            for t in p.iter(f"{{{namespaces['w']}}}t"):
                if t.text:
                    text_parts.append(t.text)
            paragraphs.append("".join(text_parts))
    return paragraphs

def save_file(target_path, lines):
    # Skip any log files, test outputs, or reports
    if "test_pulse_api.py" in str(target_path) or "iteration_" in str(target_path) or "pytest" in str(target_path):
        return
        
    target_path.parent.mkdir(parents=True, exist_ok=True)
    clean_lines = []
    for line in lines:
        clean_lines.append(clean_xml_text(line))
    
    # Write file content
    content = "\n".join(clean_lines)
    # Remove any trailing leading quotes
    if content.startswith('"') and content.endswith('"'):
        content = content[1:-1]
        
    target_path.write_text(content.strip(), encoding="utf-8")
    print(f"Successfully wrote {target_path.relative_to(PULSE_DIR)}")

def extract_files():
    if not copy_unlocked_docx():
        print("Error: Could not secure unblocked copy of the Word document.")
        return
        
    print("Parsing document XML paragraphs...")
    paragraphs = parse_paragraphs_from_docx(TEMP_DOCX)
    print(f"Loaded {len(paragraphs)} paragraphs.")
    
    is_recording = False
    current_file_path = None
    file_lines = []
    extracted_count = 0
    
    # Precompiled regex for triggers
    # Matches /app/backend/..., /app/frontend/..., and ===FILE: /app/...
    create_pattern = re.compile(r"(?:Action:\s*(?:mcp_tool\s+)?(?:file_editor\s+)?create\s+|===FILE:\s*)(/app/[^\s]+)")
    
    for i, p in enumerate(paragraphs):
        text = p.strip()
        
        # Check for create trigger or bulk file marker
        match = create_pattern.search(text)
        if match:
            # Save any currently open file (safety fallback)
            if is_recording and current_file_path and file_lines:
                save_file(current_file_path, file_lines)
                extracted_count += 1
                
            raw_path = match.group(1).replace(":", "") # strip any trailing colon
            if raw_path.startswith("/app/"):
                rel_path = raw_path[5:]
            elif raw_path.startswith("/"):
                rel_path = raw_path[1:]
            else:
                rel_path = raw_path
                
            current_file_path = PULSE_DIR / rel_path
            is_recording = True
            file_lines = []
            print(f"Extracting file: {rel_path}...")
            continue
            
        if is_recording:
            # End of file triggers
            if text == '"' or text == '""' or text.startswith("Observation:") or text.startswith("===END") or "Action:" in text:
                if current_file_path and file_lines:
                    save_file(current_file_path, file_lines)
                    extracted_count += 1
                is_recording = False
                current_file_path = None
                file_lines = []
                # If "Action:" is on this line, we might have another create match. Process it immediately!
                match_next = create_pattern.search(text)
                if match_next:
                    raw_path = match_next.group(1).replace(":", "")
                    rel_path = raw_path[5:] if raw_path.startswith("/app/") else raw_path[1:] if raw_path.startswith("/") else raw_path
                    current_file_path = PULSE_DIR / rel_path
                    is_recording = True
                    file_lines = []
                    print(f"Extracting file: {rel_path}...")
                continue
            
            # Remove line numbering prefix if present (e.g. "1|", "10|") from bulk file viewer output
            numbered_match = re.match(r"^\d+\|(.*)$", text)
            if numbered_match:
                file_lines.append(numbered_match.group(1))
            else:
                file_lines.append(p)

    if is_recording and current_file_path and file_lines:
        save_file(current_file_path, file_lines)
        extracted_count += 1
        
    print(f"\nExtraction complete! Reconstructed {extracted_count} total file(s) from build history.")
    
    # Cleanup
    if TEMP_DOCX.exists():
        try:
            os.remove(TEMP_DOCX)
        except Exception as e:
            print(f"Warning: could not delete temp docx file: {e}")

if __name__ == "__main__":
    extract_files()
