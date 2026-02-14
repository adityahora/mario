import re

with open('d:/gf/game.js', 'r') as f:
    src = f.read()

maps = re.findall(r"map:\s*\[(.*?)\]", src, re.DOTALL)
for i, m in enumerate(maps):
    rows = re.findall(r"'([^']*?)'", m)
    roses = sum(r.count('4') for r in rows)
    hearts = sum(r.count('5') for r in rows)
    enemies = sum(r.count('E') for r in rows)
    players = sum(r.count('P') for r in rows)
    goals = sum(r.count('G') for r in rows)
    print(f"Level {i+1}: {len(rows)} rows, {roses} roses, {hearts} hearts, {enemies} enemies, P={players}, G={goals}")
    for ri, r in enumerate(rows):
        print(f"  Row {ri}: len={len(r)}")
