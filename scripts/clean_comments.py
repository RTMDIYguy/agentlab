import os
from pathlib import Path

PULSE_DIR = Path("E:/OneDrive - Uncle Robert Consulting LLC/Working Docs/AI Native Agency Deepened/Pulse Social")
SRC_DIR = PULSE_DIR / "frontend/src"

print(f"Scanning React files in {SRC_DIR}...")
cleaned_files = []

for root, dirs, files in os.walk(SRC_DIR):
    for file in files:
        if file.endswith(('.js', '.jsx', '.ts', '.tsx')):
            file_path = Path(root) / file
            try:
                content = file_path.read_text(encoding="utf-8")
                lines = content.splitlines()
                if lines and lines[0].strip().startswith("//"):
                    # Check if first line contains backslashes or typical path markers
                    if "\\" in lines[0] or "OneDrive" in lines[0] or "Pulse Social" in lines[0]:
                        cleaned_files.append(file_path.relative_to(PULSE_DIR))
                        lines = lines[1:] # remove the first line
                        file_path.write_text("\n".join(lines), encoding="utf-8")
            except Exception as e:
                print(f"Error reading {file}: {e}")

print(f"\nSuccessfully cleaned comments from {len(cleaned_files)} files:")
for f in cleaned_files:
    print(f" - {f}")
