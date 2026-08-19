import os

path = r'E:\OneDrive - Uncle Robert Consulting LLC\Working Docs\AI Native Agency Deepened\AgentLab\gdrive-staging\Founder Signal System README.md'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read().replace('\r\n', '\n')

old_text = """## Source Authority

Every step in this package maps back to a specific URC source workflow.
`source-map.md` gives the exact files. The package does not invent new
marketing theory — it picks the smallest viable cut from existing source."""

new_text = """## Source Authority & The SOE Standard

Every step in this package maps back to a specific URC source workflow.
`source-map.md` gives the exact files. The package does not invent new
marketing theory — it picks the smallest viable cut from existing source.

More importantly, the entire architecture is built directly on the principles
laid out in the book **"Startup Operational Excellence" (SOE)**, alongside the
Bootstrapper's guide. SOE is the standard by which we build every agency
system. The focus on constraint-driven, modular, and self-correcting pipelines
is a direct application of the SOE framework."""

if old_text in text:
    with open(path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(text.replace(old_text, new_text))
    print('Updated FSS README successfully.')
else:
    print('Failed to find old text.')
