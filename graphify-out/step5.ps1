@'
import sys, json
from graphify.build import build_from_json
from graphify.cluster import score_all
from graphify.analyze import god_nodes, surprising_connections, suggest_questions
from graphify.report import generate
from graphify.export import to_json
from pathlib import Path

extraction = json.loads(Path('graphify-out/.graphify_extract.json').read_text(encoding="utf-8"))
detection  = json.loads(Path('graphify-out/.graphify_detect.json').read_text(encoding="utf-8"))
analysis   = json.loads(Path('graphify-out/.graphify_analysis.json').read_text(encoding="utf-8"))

G = build_from_json(extraction, root='d:\\hackthon\\verve26_project\\Verve2K26', directed=False)
communities = {int(k): v for k, v in analysis['communities'].items()}
cohesion = {int(k): v for k, v in analysis['cohesion'].items()}
tokens = {'input': extraction.get('input_tokens', 0), 'output': extraction.get('output_tokens', 0)}

labels = {k: f"Community {k}" for k in communities.keys()}
labels[0] = "Core UI Components"
labels[1] = "Student Events Dashboard"
labels[2] = "Event Admin Actions"
labels[3] = "Registration Core"
labels[4] = "Event Creation Forms"
labels[5] = "Date Utils"
labels[6] = "User Management"
labels[7] = "Package Dependencies"
labels[8] = "Tailwind Config"
labels[9] = "Package Metadata"
labels[10] = "TypeScript Config"
labels[11] = "Dev Dependencies"
labels[12] = "Mock Data"
labels[13] = "Toast Component"
labels[14] = "Profile Settings"
labels[15] = "Database Audit Scripts"
labels[16] = "Registration Core Services"

questions = suggest_questions(G, communities, labels)

report = generate(G, communities, cohesion, labels, analysis['gods'], analysis['surprises'], detection, tokens, 'd:\\hackthon\\verve26_project\\Verve2K26', suggested_questions=questions)
Path('graphify-out/GRAPH_REPORT.md').write_text(report, encoding="utf-8")
Path('graphify-out/.graphify_labels.json').write_text(json.dumps({str(k): v for k, v in labels.items()}, ensure_ascii=False), encoding="utf-8")

wrote = to_json(G, communities, 'graphify-out/graph.json', community_labels=labels)
if not wrote:
    print('ERROR: refused to shrink graphify-out/graph.json (existing graph has more nodes; #479).')
print('Report updated with community labels')
'@ | & (Get-Content graphify-out\.graphify_python) -
