import re
src=open('index.html').read()
lines=src.split('\n')
stack=[]
rows=[]
for i,l in enumerate(lines,1):
    for m in re.finditer(r'<section\b[^>]*id="([^"]+)"', l):
        stack.append((m.group(1),i))
    # section without id
    if re.search(r'<section\b', l) and not re.search(r'<section\b[^>]*id=', l):
        stack.append(('(noid)',i))
    if '</section>' in l:
        if stack:
            name,start=stack.pop()
            content=sum(1 for x in lines[start:i-1] if x.strip())
            rows.append(f"{name:20} open L{start:<6} close L{i:<6} nonblank={content}")
        else:
            rows.append(f"{'STRAY</section>':20} L{i}")
for name,start in stack:
    rows.append(f"UNCLOSED {name} open L{start}")
open('/tmp/map.txt','w').write('\n'.join(rows))
print('\n'.join(rows))
print('TOTAL_LINES', len(lines))
