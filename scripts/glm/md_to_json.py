"""Convert the GLM article Markdown files (front matter + body) into block JSON for the docx builder."""
import re, json, sys, glob, os, yaml

def parse_inline(s):
    return s  # inline markup is handled in the Node renderer

def parse_body(body):
    blocks=[]; lines=body.split("\n"); i=0
    while i<len(lines):
        ln=lines[i]
        if not ln.strip(): i+=1; continue
        m=re.match(r"^(#{1,3}) (.+)$", ln)
        if m: blocks.append({"type":"heading","level":len(m.group(1)),"text":m.group(2).strip()}); i+=1; continue
        if ln.startswith("|"):
            rows=[]
            while i<len(lines) and lines[i].startswith("|"):
                cells=[c.strip() for c in lines[i].strip().strip("|").split("|")]
                if not all(re.match(r"^:?-+:?$",c) for c in cells): rows.append(cells)
                i+=1
            blocks.append({"type":"table","rows":rows}); continue
        if re.match(r"^- ", ln):
            items=[]
            while i<len(lines) and re.match(r"^- ", lines[i]): items.append(lines[i][2:].strip()); i+=1
            blocks.append({"type":"bullets","items":items}); continue
        if re.match(r"^\d+\. ", ln):
            items=[]
            while i<len(lines) and re.match(r"^\d+\. ", lines[i]): items.append(re.sub(r"^\d+\. ","",lines[i]).strip()); i+=1
            blocks.append({"type":"numbered","items":items}); continue
        para=[]
        while i<len(lines) and lines[i].strip() and not re.match(r"^(#{1,3} |- |\d+\. |\|)", lines[i]): para.append(lines[i].strip()); i+=1
        blocks.append({"type":"para","text":" ".join(para)})
    return blocks

out=[]
for f in sorted(glob.glob(os.path.join(sys.argv[1],"0*.md"))):
    txt=open(f).read(); m=re.match(r"^---\n(.*?)\n---\n(.*)$",txt,re.S)
    meta=yaml.safe_load(m.group(1)); blocks=parse_body(m.group(2))
    plain=re.sub(r"\[([^\]]+)\]\([^)]+\)",r"\1",m.group(2)); plain=re.sub(r"[#*|>-]"," ",plain)
    meta["word_count"]=len(plain.split())
    out.append({"source":os.path.basename(f),"meta":meta,"blocks":blocks})
json.dump(out,open(sys.argv[2],"w"),indent=1,ensure_ascii=False)
print("articles:",len(out),"| blocks:",[len(a["blocks"]) for a in out])
