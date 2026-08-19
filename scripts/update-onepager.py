import os

path = r'E:\OneDrive - Uncle Robert Consulting LLC\Working Docs\AI Native Agency Deepened\AgentLab\gdrive-staging\Founder Signal System Offer One-Pager.md'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read().replace('\r\n', '\n')

old_text = "## Who It Is For"
new_text = """## The Framework: Startup Operational Excellence

This system isn't just marketing theory—it is built directly on the principles laid out in **"Startup Operational Excellence" (SOE)**. We use SOE as our foundational standard for every agency build, ensuring that your marketing pipeline is constraint-driven, modular, and self-correcting from day one.

## Who It Is For"""

if old_text in text:
    with open(path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(text.replace(old_text, new_text))
    print('Updated FSS One-Pager successfully.')
else:
    print('Failed to find old text.')
