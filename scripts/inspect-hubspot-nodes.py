import json
import os

path = r'E:\OneDrive - Uncle Robert Consulting LLC\Working Docs\AI Native Agency Deepened\workflows\mkt-06-content-creation-dissemination\n8n\mkt-06-content-creation-dissemination.workflow.json'
if os.path.exists(path):
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    for node in data.get('nodes', []):
        if 'hubspot' in node.get('type', '').lower():
            params = node.get('parameters', {})
            if 'association' in str(params).lower() or 'crmassociation' in str(params).lower() or 'associate' in node.get('name', '').lower():
                print("Found Node Name:", node.get('name'))
                print("Parameters:")
                print(json.dumps(params, indent=2))
else:
    print("Path does not exist")