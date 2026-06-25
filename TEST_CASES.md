# DJ YUI — Test Cases

Comprehensive GUI and functionality test suite for the DJ YUI tutoring application.

---

## 1. Navigation & Routing

| # | Test | Steps | Expected |
|---|------|--------|----------|
| N-01 | Landing page loads | Open app | Landing page visible, YUI character visible, feature cards shown |
| N-02 | Start Learning CTA | Click "Start Your DJ Journey" | Navigates to Dashboard |
| N-03 | Open Studio from landing | Click "Open Studio" | Navigates to DJ Studio |
| N-04 | Dashboard → Session | Click any unlocked session card | Navigates to SessionView for that session |
| N-05 | Dashboard → Studio | Click "Studio" in nav | Navigates to DJ Studio |
| N-06 | Dashboard → Mixes | Click "Mixes" in nav | Navigates to Compositions page |
| N-07 | Dashboard → Achievements | Click "Achievements" in nav | Navigates to Achievements page |
| N-08 | Session → Dashboard (back) | Click "← Dashboard" in session | Returns to Dashboard |
| N-09 | Studio → Dashboard (back) | Click "← Dashboard" in studio | Returns to Dashboard |
| N-10 | Achievements → back | Click X or backdrop | Returns to Dashboard |
| N-11 | XP card clicks achievements | Click "🏆 X XP" quick action | Navigates to Achievements page |
| N-12 | Page transition animation | Navigate between any two pages | Smooth fade + slide transition plays |
| N-13 | Browser refresh preserves level | Earn XP then refresh page | Level and XP retained (localStorage) |

---

## 2. Landing Page

| # | Test | Steps | Expected |
|---|------|--------|----------|
| L-01 | YUI character renders | Load landing | Animated anime character visible |
| L-02 | YUI floating animation | Wait 2-3 seconds | Character gently bobs up/down |
| L-03 | Speech bubble | Load landing | Speech bubble visible with greeting text |
| L-04 | Feature cards | Scroll down | 6 feature cards visible with icons |
| L-05 | Journey stages | Scroll further | 4 level stages (Beginner → Pro) visible |
| L-06 | Animated background | Observe background | Subtle particle/gradient animation |
| L-07 | Responsive layout | Resize to mobile width (375px) | Cards stack vertically, no overflow |

---

## 3. Dashboard

| # | Test | Steps | Expected |
|---|------|--------|----------|
| D-01 | YUI greeting message | Open dashboard as beginner | YUI shows beginner-appropriate message |
| D-02 | XP bar at zero | Fresh user opens dashboard | XP bar shows 0, "beginner" level |
| D-03 | XP bar fills | Complete a lesson, return to dashboard | XP bar increases proportionally |
| D-04 | Level label changes | Earn 800 XP | Level label changes from "beginner" to "intermediate" |
| D-05 | XP to next level text | View dashboard | Shows "X XP to [next level]" |
| D-06 | Session count stat | Complete sessions | Sessions count increments correctly |
| D-07 | Lesson count stat | Complete lessons | Lessons count increments correctly |
| D-08 | Beginner sessions visible | Fresh user | Sessions 1–4 shown and accessible |
| D-09 | Intermediate sessions locked | Fresh user (0 XP) | Sessions 5–8 shown with lock icon and dimmed |
| D-10 | Session unlocks at level | Reach intermediate level | Sessions 5–8 become clickable |
| D-11 | Completed session checkmark | Complete session 1 | Green checkmark appears on session 1 card |
| D-12 | Current session pulsing bolt | Active session | Animated ⚡ icon on current session |
| D-13 | Session skills chips | View session card | Up to 3 skill chips shown per session |
| D-14 | Session duration shown | View session card | "⏱ 15 min" style duration visible |
| D-15 | Lesson count shown | View session card | "📚 3 lessons" style count visible |
| D-16 | Locked session non-clickable | Click locked session | Nothing happens (cursor: not-allowed) |

---

## 4. Learning Sessions (SessionView)

| # | Test | Steps | Expected |
|---|------|--------|----------|
| SV-01 | Lesson title shows | Open any session | Lesson title and level badge at top |
| SV-02 | YUI dialog appears | Open lesson | YUI speech visible with first dialog line |
| SV-03 | Dialog advances | Click "Continue" button | Next dialog line shown with slide animation |
| SV-04 | Dialog dots update | Cycle through dialogs | Dot indicator tracks current dialog position |
| SV-05 | YUI expression changes | Advance to last dialog | YUI expression changes (excited → encouraging) |
| SV-06 | Lesson content shown | Scroll past YUI | Full lesson content text block visible |
| SV-07 | Pro Tips section | Scroll down | Tips listed with star icons, stagger animation |
| SV-08 | Challenge hidden by default | Open fresh lesson | Challenge card shows "Click to reveal" |
| SV-09 | Challenge expands | Click challenge card | Challenge text slides into view |
| SV-10 | Challenge XP reward | Click "Mark Challenge Complete" | +100 XP added, challenge collapses |
| SV-11 | Mark complete button | Click "Mark Complete (+50 XP)" | Button changes to "Next Lesson", +50 XP added |
| SV-12 | Already done lesson | Re-open completed lesson | Button shows "Next Lesson" immediately, no duplicate XP |
| SV-13 | Lesson progress pills | View top nav | Pills match lesson count, colored for completed |
| SV-14 | Click lesson pill | Click a different pill | Jumps to that lesson |
| SV-15 | Back button between lessons | Go to lesson 2, click Prev | Returns to lesson 1 |
| SV-16 | No back button on lesson 1 | View lesson 1 | No "← Prev" button visible |
| SV-17 | Last lesson completes session | Complete final lesson | "Complete Session! (+200 XP)" button shown |
| SV-18 | Complete session redirects | Click "Complete Session" on last lesson | Returns to Dashboard with +200 XP |
| SV-19 | Studio shortcut | Click "Studio" button in bottom bar | Navigates to DJ Studio |

---

## 5. DJ Studio — Track Selection

| # | Test | Steps | Expected |
|---|------|--------|----------|
| TS-01 | Deck A selector shows | Open Studio | "Load Track ▾" button visible for Deck A |
| TS-02 | Dropdown opens | Click Deck A track selector | Dropdown appears above all other UI |
| TS-03 | Z-index fix (BUG FIX) | Open dropdown over turntable | Dropdown not hidden behind deck (portal rendering) |
| TS-04 | Search works | Type "Midnight" in search | Only "Midnight Groove" shown |
| TS-05 | Search case-insensitive | Type "groove" (lowercase) | "Midnight Groove" still found |
| TS-06 | Search by artist | Type "Deep Horizon" | Track by that artist appears |
| TS-07 | Genre filter chips | Click "Deep House" chip | Only Deep House tracks listed |
| TS-08 | Genre chip deselects | Click active chip again | All tracks shown again |
| TS-09 | "All" chip resets filter | Select genre, click "All" | All tracks shown |
| TS-10 | Track shows BPM + key | View dropdown items | Each shows BPM and Camelot key |
| TS-11 | Track color dot | View dropdown items | Colored dot matches track color |
| TS-12 | Select track loads it | Click a track | Deck shows track name, BPM updates |
| TS-13 | Dropdown closes on select | Select a track | Dropdown closes automatically |
| TS-14 | Dropdown closes on outside click | Open dropdown, click elsewhere | Dropdown closes |
| TS-15 | Deck B has separate selector | Open Deck B selector | Independent list, doesn't affect Deck A |
| TS-16 | 16 tracks available | Open any selector | All 16 tracks across genres listed |

---

## 6. DJ Studio — Turntable / Deck Controls

| # | Test | Steps | Expected |
|---|------|--------|----------|
| T-01 | Play button starts audio | Load track, click ▶ | Play button highlights, vinyl spins |
| T-02 | Vinyl spin animation | Click play | Turntable record rotates continuously |
| T-03 | Stop pauses audio | While playing, click ⏸ | Vinyl stops spinning |
| T-04 | BPM display accurate | Load 128 BPM track | "128 BPM" shown below vinyl |
| T-05 | Pitch fader changes BPM | Drag pitch to +50% | BPM display updates (e.g., 128 → ~133) |
| T-06 | Pitch range ±8% | Drag pitch slider to extremes | BPM changes by max ±8% of base BPM |
| T-07 | Pitch display shows % | Adjust pitch fader | Shows e.g., "+3.2%" next to pitch |
| T-08 | Pitch reset button | Click reset next to pitch fader | Pitch returns to 0%, BPM to base |
| T-09 | Hot cue set | Click empty cue slot (no track position) | Cue button turns colored |
| T-10 | Hot cue jump | Set cue, advance position, click cue | Jumps back to cue position |
| T-11 | Hot cue delete | Shift+click on active cue | Cue cleared, button goes gray |
| T-12 | CUE button rewinds | Click CUE (not hot cue) | Position resets to 0 |
| T-13 | SYNC button A → B | Load different BPM tracks, click SYNC on A | Deck A pitch adjusted to match Deck B's BPM |
| T-14 | SYNC button B → A | Click SYNC on B | Deck B pitch adjusted to match Deck A's BPM |
| T-15 | SYNC shows target BPM | Hover SYNC button | Shows the BPM it will sync to |
| T-16 | Jog wheel drag | Click-drag vinyl circle | Position scrubs, pitch indicator responds |

---

## 7. DJ Studio — Mixer

| # | Test | Steps | Expected |
|---|------|--------|----------|
| M-01 | Crossfader center default | Open Studio | Crossfader at 50% (center) |
| M-02 | Crossfader label updates | Drag crossfader left | Shows "A 60%" style label |
| M-03 | Crossfader center label | Move crossfader to center | Shows "CENTER" |
| M-04 | Channel fader A | Drag A VOL fader down | Deck A volume decreases |
| M-05 | Channel fader B | Drag B VOL fader down | Deck B volume decreases |
| M-06 | Master knob | Turn MASTER knob | Overall output volume changes |
| M-07 | EQ High knob A | Rotate HIGH knob for Deck A | High-frequency level adjusts |
| M-08 | EQ Mid knob A | Rotate MID knob | Mid-frequency level adjusts |
| M-09 | EQ Low knob A | Rotate LOW knob | Bass level adjusts |
| M-10 | EQ kill (full left) | Drag EQ knob to min | Frequency band muted |
| M-11 | EQ boost (full right) | Drag EQ knob to max | Frequency band boosted |
| M-12 | Knob double-click reset | Double-click any knob | Returns to center value |
| M-13 | FX Reverb A | Turn REV A knob | Reverb effect applied to Deck A |
| M-14 | FX Delay A | Turn DLY A knob | Delay effect applied |
| M-15 | FX Filter A | Turn FLT A knob | Filter effect applied |
| M-16 | EQ adjustments tracked | Adjust EQ multiple times | Achievement "EQ Master" progress increments |
| M-17 | Crossfader moves tracked | Move crossfader multiple times | Achievement "The Cross" progress increments |
| M-18 | Knob touch support | On touch device, drag knob | Knob value changes with finger |

---

## 8. DJ Studio — Audio Visualizer

| # | Test | Steps | Expected |
|---|------|--------|----------|
| AV-01 | Visualizer idle state | No track playing | Flat line shown in visualizer |
| AV-02 | Visualizer active | Click play on a deck | Frequency bars animate in real time |
| AV-03 | Deck A visualizer color | View Deck A section | Purple (#a855f7) bars |
| AV-04 | Deck B visualizer color | View Deck B section | Cyan (#06b6d4) bars |
| AV-05 | Bars update with EQ | Boost bass, view visualizer | Lower bars grow taller |
| AV-06 | Visualizer stops on pause | Pause deck | Bars animate to idle flat line |
| AV-07 | No crash without track | Open Studio before loading tracks | Visualizers show idle state, no error |

---

## 9. DJ Studio — Recording & Composition Save

| # | Test | Steps | Expected |
|---|------|--------|----------|
| R-01 | Record button visible | Open Studio | "⏺ Record" button in header |
| R-02 | Start recording | Click Record | Button turns red "⏹ Stop", timer starts |
| R-03 | Timer increments | Wait 5 seconds | Timer shows "00:05" |
| R-04 | Stop recording | Click Stop after recording | Timer freezes, "Save Mix" button appears |
| R-05 | Save modal appears | Click Stop (with >0s recorded) | Save modal with name input appears |
| R-06 | Save modal shows track names | Open modal with tracks loaded | Track A × Track B names shown |
| R-07 | Empty name blocked | Click "Save Mix" with empty field | Button disabled |
| R-08 | Enter to save | Type name, press Enter | Mix saved, modal closes |
| R-09 | Mix saved to compositions | Save a mix | Navigating to Mixes shows the saved mix |
| R-10 | Cancel closes modal | Click Cancel | Modal closes, recording data preserved |
| R-11 | Save Mix button shown | Stop recording with time | "Save Mix" button visible in header |
| R-12 | Save Mix from header | Click "Save Mix" button | Same modal opens |
| R-13 | Re-record after save | Save mix then click Record | New recording starts from 0:00 |
| R-14 | Recording state race fix | Click Stop immediately | No race condition — modal shows correctly |

---

## 10. Compositions Page

| # | Test | Steps | Expected |
|---|------|--------|----------|
| C-01 | Empty state | No mixes saved | Empty state message shown |
| C-02 | Mix list after save | Save at least one mix | Composition cards appear |
| C-03 | Mix shows track names | View composition card | Track A and Track B names shown |
| C-04 | Mix shows duration | View card | Duration in MM:SS format |
| C-05 | Mix shows save date | View card | "Saved X days/hours ago" |
| C-06 | Mix shows BPM info | View card | BPM for each track shown |
| C-07 | Delete mix | Click delete on a mix | Mix removed from list |
| C-08 | Delete updates count | Delete a mix | Stats counter decrements |
| C-09 | Stats bar | 3+ mixes saved | Total mixes, total time, tracks used shown |
| C-10 | Newest mix first | Save multiple mixes | Most recent appears at top |

---

## 11. Achievements

| # | Test | Steps | Expected |
|---|------|--------|----------|
| A-01 | Achievements page loads | Navigate to Achievements | Panel opens with progress bar |
| A-02 | Count shows X/20 | View header | "X/20" fraction shown |
| A-03 | Progress bar | Unlock 5 achievements | Bar fills to 25% |
| A-04 | XP bonus total | Unlock achievements with XP | "Bonus XP earned" total shown |
| A-05 | Categories shown | View panel | Learning, Studio, Composition, Milestone sections |
| A-06 | First Step (first-lesson) | Complete 1 lesson | Achievement unlocks (no longer grayscale) |
| A-07 | Getting Into It | Complete 5 lessons | Achievement unlocks |
| A-08 | Dedicated Learner | Complete 10 lessons | Achievement unlocks |
| A-09 | Foundations Laid | Complete sessions 1-4 | Achievement unlocks |
| A-10 | Level Up! | Complete sessions 5-8 | Achievement unlocks |
| A-11 | All-Pro | Complete all 12 sessions | Achievement unlocks |
| A-12 | Turntablist | Complete session 9 | Achievement unlocks |
| A-13 | Press Play! | Click play on any deck | Achievement unlocks |
| A-14 | Two Turntables | Play both Deck A and Deck B | Achievement unlocks |
| A-15 | EQ Master | Adjust EQ 20 times | Achievement unlocks |
| A-16 | The Cross | Move crossfader 10 times | Achievement unlocks |
| A-17 | Scratch Star | Perform 5 vinyl scratches | Achievement unlocks |
| A-18 | First Mix! | Save first composition | Achievement unlocks |
| A-19 | Mix Tape | Save 3 compositions | Achievement unlocks |
| A-20 | Rising Star | Earn 500 XP | Milestone unlocks |
| A-21 | Pro DJ milestone | Earn 5000 XP | Milestone unlocks |
| A-22 | Locked achievements grayscale | View unearned achievements | Grayed out with opacity 50% |
| A-23 | Earned achievement styled | Unlock an achievement | Purple border + white text, checkmark |
| A-24 | XP reward shown | View any achievement | "+X XP" label visible |
| A-25 | Back navigation | Press X or click backdrop | Returns to Dashboard |

---

## 12. YUI Character & Panel

| # | Test | Steps | Expected |
|---|------|--------|----------|
| Y-01 | Character renders | Any page with YUI | Anime character fully visible |
| Y-02 | Neutral expression | Default state | Standard eyes, relaxed face |
| Y-03 | Excited expression | YUI in "excited" mood | Star/heart eyes visible |
| Y-04 | Teaching expression | In lesson/studio tip | Slightly different eye shape |
| Y-05 | Encouraging expression | Encouraging context | Warm expression shown |
| Y-06 | Celebrating expression | Celebration context | Wide smile, special eyes |
| Y-07 | Thinking expression | Thinking context | Raised eyebrow, pensive look |
| Y-08 | Floating animation | Studio tip bar / dashboard | Character gently bobs |
| Y-09 | Speech bubble | Dashboard/landing | Text bubble visible above character |
| Y-10 | YUI panel visible | On Dashboard/Session pages | Floating YUI panel in bottom-right |
| Y-11 | YUI panel minimize | Click minimize button | Panel collapses to small icon |
| Y-12 | YUI panel re-open | Click minimized panel | Panel expands again |
| Y-13 | YUI panel close | Click X button | Panel hidden until refreshed |
| Y-14 | Studio tip rotates | Stay in Studio 8+ seconds | YUI tip cycles to next message |
| Y-15 | Studio "next tip" | Click "next tip →" | Tip advances immediately |

---

## 13. Data Persistence (localStorage)

| # | Test | Steps | Expected |
|---|------|--------|----------|
| P-01 | XP persists | Earn XP, refresh page | XP same as before refresh |
| P-02 | Level persists | Reach intermediate, refresh | Still intermediate after refresh |
| P-03 | Completed sessions persist | Complete session 1, refresh | Session 1 still shows checkmark |
| P-04 | Completed lessons persist | Complete lesson, refresh | Lesson still marked done |
| P-05 | Studio stats persist | Make 10 EQ adjustments, refresh | Achievement progress preserved |
| P-06 | Compositions persist | Save a mix, refresh | Mix still in Compositions page |
| P-07 | Delete composition persists | Delete a mix, refresh | Mix stays deleted after refresh |
| P-08 | Deck state NOT persisted | Set crossfader off-center, refresh | Crossfader resets to 50% (by design) |
| P-09 | Multiple tabs same data | Open app in two tabs, complete lesson in tab 1 | Tab 2 reflects update on next action |

---

## 14. Audio Engine

| # | Test | Steps | Expected |
|---|------|--------|----------|
| AU-01 | Audio starts on first play | Click play | Web Audio context resumes (no browser block) |
| AU-02 | Beat plays at correct BPM | Load 128 BPM track, play | Audible rhythm at ~128 BPM |
| AU-03 | Different BPM sounds faster | Load 174 BPM (DnB) track | Noticeably faster beat |
| AU-04 | Pitch fader changes tempo | Drag pitch +50% | Beat plays faster |
| AU-05 | Volume fader works | Drag A VOL to zero | Deck A audio silent |
| AU-06 | Crossfader fully A | Move crossfader all left | Only Deck A audible |
| AU-07 | Crossfader fully B | Move crossfader all right | Only Deck B audible |
| AU-08 | Crossfader center | Center crossfader | Both decks audible, equal volume |
| AU-09 | EQ low kill | Drag LOW knob to min | Bass noticeably reduced |
| AU-10 | Two decks simultaneously | Play both decks | Both play at same time |
| AU-11 | Stop audio | Click pause while playing | Audio fades out |
| AU-12 | Re-play after stop | Stop then play again | Audio resumes correctly |
| AU-13 | Audio on page change | Start playing, navigate to dashboard | Audio continues (no audio context destruction) |
| AU-14 | No audio before interaction | Load app without clicking | No audio (browser policy respected) |

---

## 15. Responsive / Mobile

| # | Test | Steps | Expected |
|---|------|--------|----------|
| RES-01 | Landing mobile | View at 375px wide | Content fits, no horizontal scroll |
| RES-02 | Dashboard mobile | View at 375px | Session cards stack single column |
| RES-03 | Session view mobile | View at 375px | Content readable, no clipping |
| RES-04 | Studio on tablet (768px) | View at 768px | Deck layout adapts, not too cramped |
| RES-05 | Compositions mobile | View at 375px | Cards list cleanly |
| RES-06 | Achievements mobile | View at 375px | Achievement list scrollable |
| RES-07 | Dropdown on mobile | Open track selector on mobile | Dropdown positioned correctly, scrollable |
| RES-08 | Knob touch interaction | Touch and drag a knob on mobile | Value changes smoothly |
| RES-09 | Nav fits on small screens | View nav at 375px | No nav items clipped or hidden |
| RES-10 | Hidden stats on mobile | View dashboard on mobile | Quick stats hidden (md:flex class) |

---

## 16. Performance & Stability

| # | Test | Steps | Expected |
|---|------|--------|----------|
| PERF-01 | No flicker on navigation | Navigate between pages rapidly | No white flash or broken state |
| PERF-02 | Visualizer no memory leak | Play deck, navigate away, return | No accumulating animation frames |
| PERF-03 | Audio context cleanup | Play, navigate, return, play again | Audio works correctly on return |
| PERF-04 | Many compositions load | Save 20+ compositions | Page loads and scrolls without lag |
| PERF-05 | Fast XP gains | Complete all lessons quickly | XP math stays correct |
| PERF-06 | Rapid knob spinning | Spin a knob very fast | Value stays in range, no NaN |
| PERF-07 | Rapid crossfader moves | Sweep crossfader back and forth fast | No audio glitches or crashes |
| PERF-08 | Re-render efficiency | Knob drag while other things animate | App stays smooth at 60fps |
| PERF-09 | LocalStorage quota | Normal usage | No storage quota errors |

---

## 17. Edge Cases & Error Handling

| # | Test | Steps | Expected |
|---|------|--------|----------|
| EC-01 | Studio with no tracks | Open Studio, play without loading | Nothing plays, no crash |
| EC-02 | Studio no-track visualizer | Open Studio before loading tracks | Flat line shown, no JS error |
| EC-03 | Session not found | Navigate to invalid session | "Session not found" fallback shown |
| EC-04 | Complete same lesson twice | Click "Mark Complete" on already-done lesson | No duplicate XP added |
| EC-05 | Complete same session twice | Trigger session complete again | No duplicate +200 XP |
| EC-06 | Save mix with empty name | Leave name blank, press Save | Button disabled, no save occurs |
| EC-07 | BPM sync without tracks | Click SYNC with no tracks loaded | No crash, pitch set to 0 |
| EC-08 | SYNC identical BPMs | Load same BPM on both decks | Pitch stays at 0, no change |
| EC-09 | Delete all compositions | Delete every mix | Empty state message appears |
| EC-10 | Pitch sync outside ±1 range | Sync very different BPM tracks (e.g. 120 vs 174) | Pitch clamped to valid range |
| EC-11 | Crossfader spam | Move crossfader 100+ times rapidly | No crash, stat increments reasonably |
| EC-12 | Modal close on backdrop | Click outside Save Mix modal | Modal closes, no state corruption |

---

## Priority Bug Regression

| # | Bug | Steps to Reproduce | Verify Fixed |
|---|-----|--------------------|-------------|
| BUG-01 | Track dropdown behind deck | Open track selector dropdown | Dropdown appears ABOVE turntable deck |
| BUG-02 | Knob value resets on drag end | Drag knob 45°, release, drag again | Starts from released position, not zero |
| BUG-03 | Recording stop race condition | Click Stop immediately after recording starts | Save modal appears (was showing on wrong click) |
| BUG-04 | Duplicate lesson XP | Complete lesson, navigate away, mark complete again | +50 XP awarded once only |
| BUG-05 | Hot cue not functional | Click empty hot cue slot | Cue is set at current position |
| BUG-06 | BPM display wrong with pitch | Set pitch to +50%, check BPM display | Shows adjusted BPM, not base BPM |
| BUG-07 | useEffect missing dependency | Switch lessons rapidly | Lesson always resets correctly |
