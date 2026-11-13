"""Builds the Today's Hours calendar feeds (ยามอุบากอง) as static .ics files.

Run from the repo root:  python3 assets/cal/make_yam_ics.py
Same formula as yam.html: level = SEQ[(slot - weekday) mod 5]. A Thai day runs
06:01-06:00; night uses the same order as day. The table repeats every week, so
each window is one weekly-repeating event and the files never need a server.
Not served publicly (*.py is in .assetsignore).
"""
import os
from datetime import date, timedelta

OUT = os.path.dirname(os.path.abspath(__file__))
SEQ = [2, -2, 0, 1, -1]
ANCHOR = date(2026, 11, 8)  # a Sunday; every event repeats weekly from its first date
DAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์']
VERSE = {2: 'สี่ศูนย์ จะพูนผล แม้จรดลดีหนักหนา มีลาภล้นคณนา เร่งยาตราจะมีชัย',
         -2: 'กากบาท ตัวอัปรีย์ แม้จรลีจะอัปรา'}
MEANING = {2: 'ดีที่สุดของวัน เหมาะเริ่มเรื่องสำคัญ ออกเดินทาง เรื่องเงิน',
           -2: 'พักไว้ก่อน เลื่อนการเดินทางและเรื่องใหญ่'}
# Taksa circle: sun mon tue wed sat thu rahu fri
CIRCLE = {'sun': 0, 'mon': 1, 'tue': 2, 'wed': 3, 'sat': 4, 'thu': 5, 'rahu': 6, 'fri': 7}
WD2C = [0, 1, 2, 3, 5, 7, 4]
ROLES = [('บริวาร', 'คนรอบตัวช่วยงาน'), ('อายุ', 'ดูแลกายและใจ'), ('เดช', 'อำนาจ บารมี'),
         ('ศรี', 'โชคลาภ เสน่ห์'), ('มูละ', 'ทรัพย์สิน ฐานราก'), ('อุตสาหะ', 'ลงแรงแล้วได้ผล'),
         ('มนตรี', 'ผู้ใหญ่หนุน'), ('กาลกิณี', 'อุปสรรค ระวังเป็นพิเศษ')]
BORN_NAME = {'sun': 'อาทิตย์', 'mon': 'จันทร์', 'tue': 'อังคาร', 'wed': 'พุธกลางวัน',
             'rahu': 'พุธกลางคืน', 'thu': 'พฤหัสบดี', 'fri': 'ศุกร์', 'sat': 'เสาร์'}


def level(d, s):
    return SEQ[(s - d) % 5]


def esc(t):
    return t.replace('\\', '\\\\').replace(';', '\\;').replace(',', '\\,').replace('\n', '\\n')


def fold(line):
    """RFC 5545: lines of at most 75 octets, continuation lines start with a space."""
    out, cur = [], b''
    for ch in line:
        b = ch.encode('utf-8')
        mark = '\u0e31' == ch or '\u0e34' <= ch <= '\u0e3a' or '\u0e47' <= ch <= '\u0e4e'
        if len(cur) + len(b) > (69 if not out else 68) and not mark:
            out.append(cur)
            cur = b''
        cur += b
    out.append(cur)
    return b'\r\n '.join(out).decode('utf-8')


def window(d, k):
    """Start and end (date, HHMM00) of window k (0..9) of Thai day d, first week from ANCHOR."""
    day0 = ANCHOR + timedelta(days=d)
    start = 361 + 144 * k
    end = start + 143
    def at(m):
        dd = day0 + timedelta(days=m // 1440)
        m %= 1440
        return dd.strftime('%Y%m%d') + 'T%02d%02d00' % (m // 60, m % 60)
    def hm(m):
        m %= 1440
        return '%02d:%02d' % (m // 60, m % 60)
    return at(start), at(end), hm(start) + '–' + hm(end)


def feed(name, slug, lv, born=None):
    lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Bad Blood Company//Yam Ubakong//TH',
             'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:' + esc(name),
             'X-WR-TIMEZONE:Asia/Bangkok', 'REFRESH-INTERVAL;VALUE=DURATION:P7D', 'X-PUBLISHED-TTL:P7D',
             'BEGIN:VTIMEZONE', 'TZID:Asia/Bangkok', 'BEGIN:STANDARD', 'DTSTART:19700101T000000',
             'TZOFFSETFROM:+0700', 'TZOFFSETTO:+0700', 'TZNAME:+07', 'END:STANDARD', 'END:VTIMEZONE']
    for d in range(7):
        for k in range(10):
            if level(d, k % 5) != lv:
                continue
            s, e, rng = window(d, k)
            title = 'ยามทอง' if lv == 2 else 'ยามพัก'
            desc = MEANING[lv] + '\n' + VERSE[lv] + '\n\nวัน' + DAYS[d] + ' ' + ('กลางวัน' if k < 5 else 'กลางคืน') + ' ' + rng
            if born:
                i = (WD2C[d] - CIRCLE[born]) % 8
                role, mean = ROLES[i]
                title += ' · วัน' + role
                desc += '\nวัน' + DAYS[d] + 'เป็นวัน' + role + 'ของคนเกิดวัน' + BORN_NAME[born] + ' (' + mean + ')'
            desc += '\n\nตำรายามอุบากอง · ดูสดที่ https://badblood.company/yam'
            lines += ['BEGIN:VEVENT', 'UID:%s-d%d-k%d@badblood.company' % (slug, d, k),
                      'DTSTAMP:20261113T000000Z', 'DTSTART;TZID=Asia/Bangkok:' + s,
                      'DTEND;TZID=Asia/Bangkok:' + e, 'RRULE:FREQ=WEEKLY', 'SUMMARY:' + esc(title),
                      'DESCRIPTION:' + esc(desc), 'TRANSP:TRANSPARENT', 'END:VEVENT']
    lines.append('END:VCALENDAR')
    with open(os.path.join(OUT, slug + '.ics'), 'w', encoding='utf-8', newline='') as f:
        f.write('\r\n'.join(fold(l) for l in lines) + '\r\n')


feed('ยามทอง', 'yam-prime', 2)
feed('ยามพัก', 'yam-rest', -2)
for b in CIRCLE:
    feed('ยามทอง · คนเกิดวัน' + BORN_NAME[b], 'yam-prime-' + b, 2, born=b)
print('wrote', sorted(f for f in os.listdir(OUT) if f.endswith('.ics')))
