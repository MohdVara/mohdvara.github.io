import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {loadFormatting} from '../scripts/i18n/load-formatting.mjs';
const {calendarDate:date, parseCanonicalDate:parse, withCalendarDates, isCalendarDisplayMode, calendarPreferenceKey} = await loadFormatting();
const registry = JSON.parse(await readFile('src/i18n/languages.json','utf8'));

test('strict canonical Gregorian validation rejects impossible days and precision mismatches',()=>{
  for(const iso of ['2023-02-29','2024-02-30','2026-04-31','2026-00-01','2026-13-01','2026-01-00','2026-01-32','2026-1-01','garbage']){
    assert.equal(parse(iso,'day'),undefined);
    for(const {locale} of registry)assert.equal(date(iso,locale),iso);
  }
  assert.ok(parse('2000-02-29','day'));assert.equal(parse('1900-02-29','day'),undefined);
  assert.ok(parse('2024-02-29','day'));assert.equal(parse('2026-01-01','month'),undefined);
  assert.equal(parse('2026-02','year'),undefined);
});

test('all eleven locales in both modes, repeated switching never reuses another mode',()=>{
  assert.equal(calendarPreferenceKey,'portfolio.calendar.v1');
  for(const invalid of [null,undefined,'','GREGORIAN','invalid',0])assert.equal(isCalendarDisplayMode(invalid),false);
  for(const {locale,calendar} of registry){
    const cultural = date('2026-04-14',locale);
    const gregorian = date('2026-04-14',locale,'day','gregorian');
    assert.equal(isCalendarDisplayMode('cultural'),true);assert.equal(isCalendarDisplayMode('gregorian'),true);
    assert.equal(gregorian,new Intl.DateTimeFormat(locale,{calendar:'gregory',timeZone:'UTC',year:'numeric',month:'long',day:'numeric'}).format(new Date('2026-04-14T12:00Z')));
    if(calendar!=='gregory'){assert.notEqual(cultural,gregorian);assert.ok(cultural.includes('[2026-04-14]'));}
    for(let n=0;n<10;n++){assert.equal(date('2026-04-14',locale,'day','gregorian'),gregorian);assert.equal(date('2026-04-14',locale),cultural);}
  }
});

// Published references are recorded in PME-V1.6-CALENDAR.md; expected values
// below are transcribed from those references, not generated snapshots.
test('Tamil solar New Year and month boundaries use a distinct sourced calendar',()=>{
  assert.match(date('2026-04-13','ta'),/பங்குனி 30, விசுவாவசு/);
  assert.match(date('2026-04-14','ta'),/சித்திரை 1, பராபவ/);
  assert.match(date('2026-05-14','ta'),/சித்திரை 31/);
  assert.match(date('2026-05-15','ta'),/வைகாசி 1/);
  assert.match(date('2026-06-15','ta'),/ஆனி 1/);
  assert.match(date('2026-07-17','ta'),/ஆடி 1/);
  assert.match(date('2026-08-18','ta'),/ஆவணி 1/);
  assert.match(date('2026-09-18','ta'),/புரட்டாசி 1/);
  assert.match(date('2026-10-18','ta'),/ஐப்பசி 1/);
  assert.match(date('2026-11-17','ta'),/கார்த்திகை 1/);
  assert.match(date('2026-12-16','ta'),/மார்கழி 1/);
  assert.match(date('2026-04','ta','month'),/பங்குனி, விசுவாவசு – சித்திரை, பராபவ/);
  assert.match(date('2026','ta','year'),/விசுவாவசு – பராபவ/);
  assert.match(date('2013','ta','year'),/சரிபார்க்கப்படவில்லை.*\[2013\]/);
  assert.match(date('2027-01','ta','month'),/சரிபார்க்கப்படவில்லை/);
});

test('published Malaysian Hijri differs from Arabic Umm al-Qura and labels estimates honestly',()=>{
  assert.match(date('2026-02-18','ms'),/30 Syaaban 1447 H/);
  assert.match(date('2026-02-19','ms'),/1 Ramadan 1447 H/);
  assert.match(date('2026-02-19','ar'),/أم القرى.*2 رمضان/);
  assert.match(date('2026-06-17','ms'),/1 Muharam 1448 H/);
  assert.match(date('2026-12-11','ms'),/1 Rejab 1448 H/);
  assert.match(date('2021-06','ms','month'),/anggaran kiraan tabular; bukan takwim rasmi Malaysia/);
  assert.doesNotMatch(date('2021-06','ms','month'),/Umm al-Qura/);
});

test('native calendars preserve Japanese eras, Chinese New Year and leap months, and Saka transitions',()=>{
  assert.match(date('2019-04-30','ja'),/平成31/);assert.match(date('2019-05-01','ja'),/令和元/);
  assert.match(date('2019','ja','year'),/平成31年 – 令和元年/);
  assert.match(date('2023-01-21','zh-Hans'),/壬寅年腊月30/);
  assert.match(date('2023-01-22','zh-Hans'),/癸卯年正月1/);
  assert.match(date('2023-03-21','zh-Hans'),/二月30/);assert.doesNotMatch(date('2023-03-21','zh-Hans'),/闰/);
  assert.match(date('2023-03-22','zh-Hans'),/闰二月1/);
  assert.match(date('2023-03','zh-Hans','month'),/二月 – .*闰二月/);
  assert.match(date('2024-03-20','hi'),/30 फाल्गुन 1945/);
  assert.match(date('2024-03-21','hi'),/1 चैत्र 1946/);
  assert.match(date('2025-03-22','hi'),/1 चैत्र 1947/);
});

test('partial source dates stay partial and prose never converts versions or identifiers',()=>{
  for(const {locale} of registry)for(const mode of ['cultural','gregorian']){
    const month=date('2026-04',locale,'month',mode),year=date('2026',locale,'year',mode);
    assert.ok(!month.includes('2026-04-01'));assert.ok(!year.includes('2026-01-01'));
    assert.equal(withCalendarDates('v1.6 and 733 tests','unchanged',locale,undefined,mode),'unchanged');
    assert.equal(withCalendarDates('15 October','unchanged',locale,undefined,mode),'unchanged');
  }
});
