"""Rebuild the bounded Tamil table from downloaded Golden Chennai monthly HTML.
Usage: python3 scripts/i18n/import-tamil-boundaries.py /path/to/downloaded/pages
Files must be YYYY-MM.html. Does not fetch data or expand verified coverage.
"""
import calendar
import datetime
import hashlib
import json
from pathlib import Path
import re
import sys

root = Path(__file__).resolve().parents[2]
source = Path(sys.argv[1])
month_names = ['Chithirai', 'Vaigasi', 'Aani', 'Aadi', 'Avani', 'Purattasi', 'Aippasi', 'Karthigai', 'Margazhi', 'Thai', 'Masi', 'Panguni']
boundaries = []
sources = []
for year in range(2018, 2027):
    for month in range(1, 13):
        page = source / f'{year}-{month:02}.html'
        content = page.read_text()
        # The publisher redirects unsupported historical URLs to the current month.
        assert f'{calendar.month_name[month]} {year} Tamil Monthly Calendar' in content, page
        rows = re.findall('<p class="j1">(.*?)</p>', content)
        assert len(rows) == calendar.monthrange(year, month)[1], page
        for day, row in enumerate(rows, 1):
            match = re.fullmatch(r'(\w+) (\d+),.*?, (\w+)', row)
            assert match, (page, row)
            if match[2] == '1' or not boundaries:
                start = datetime.date(year, month, day) - datetime.timedelta(days=int(match[2]) - 1)
                boundaries.append([str(start), month_names.index(match[1])])
        sources.append({'url': f'https://calendar.goldenchennai.com/tamil-monthly-calendar/{calendar.month_name[month].lower()}-{year}/', 'sha256': hashlib.sha256(page.read_bytes()).hexdigest()})
assert len(boundaries) == 109
for previous, current in zip(boundaries, boundaries[1:]):
    days = (datetime.date.fromisoformat(current[0]) - datetime.date.fromisoformat(previous[0])).days
    assert 29 <= days <= 32 and current[1] == (previous[1] + 1) % 12, (previous, current)
file = root / 'src/i18n/tamilSolar.json'
data = json.loads(file.read_text())
assert data['boundaries'] == boundaries, 'Reference boundaries changed: review sources and increment revision before replacing data.'
manifest = json.loads((root / 'docs/portfolio/PME-V1.6-CALENDAR-SOURCES.json').read_text())
assert sources == manifest['tamil'], 'Reference HTML changed: review source changes before approving hashes.'
print(f'Verified {len(boundaries)} boundaries against 108 source pages; source hashes match.')
