import os
from pathlib import Path

PULSE_DIR = Path("E:/OneDrive - Uncle Robert Consulting LLC/Working Docs/AI Native Agency Deepened/Pulse Social")
SRC_DIR = PULSE_DIR / "frontend/src"

print(f"Scanning and cleaning quotes in {SRC_DIR}...")
cleaned_files = []

for root, dirs, files in os.walk(SRC_DIR):
    for file in files:
        if file.endswith(('.js', '.jsx', '.ts', '.tsx')):
            file_path = Path(root) / file
            try:
                content = file_path.read_text(encoding="utf-8")
                if '\\"' in content:
                    cleaned_files.append(file_path.relative_to(PULSE_DIR))
                    # Replace escaped double quotes with normal double quotes
                    content = content.replace('\\"', '"')
                    file_path.write_text(content, encoding="utf-8")
            except Exception as e:
                print(f"Error processing {file}: {e}")

print(f"\nSuccessfully cleaned escaped quotes from {len(cleaned_files)} files:")
for f in cleaned_files:
    print(f" - {f}")
