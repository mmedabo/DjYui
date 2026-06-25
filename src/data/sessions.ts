import type { Session } from '../types';

export const SESSIONS: Session[] = [
  {
    id: 1,
    title: 'Welcome to DJing',
    subtitle: 'Your first steps into the DJ world',
    level: 'beginner',
    icon: '🎵',
    color: '#a855f7',
    duration: '15 min',
    locked: false,
    completed: false,
    skills: ['History of DJing', 'Types of DJs', 'Basic terminology'],
    lessons: [
      {
        id: '1-1',
        title: 'What is DJing?',
        yuiDialog: [
          "Hey there! I'm YUI, your personal DJ tutor! 🎧",
          "DJing is the art of selecting and mixing recorded music — creating a seamless flow that moves people emotionally and physically.",
          "From vinyl pioneers to digital masters, DJs shape culture. And now? It's your turn to join that legacy!"
        ],
        content: 'DJing (Disc Jockeying) is the art of selecting, playing, and mixing recorded music for an audience. A DJ creates a continuous, seamless flow of music by blending tracks together, manipulating tempo, adding effects, and reading the crowd\'s energy.',
        tips: [
          'DJ stands for Disc Jockey — originally referring to radio presenters who played records',
          'Modern DJs use digital software, CDJs, or vinyl turntables',
          'The key skill is LISTENING — great DJs develop exceptional ears',
        ],
        challenge: 'Listen to 3 DJ mixes online and identify where one song transitions to the next'
      },
      {
        id: '1-2',
        title: 'Types of DJs',
        yuiDialog: [
          "There are many DJ styles — which one speaks to YOU? 🎶",
          "Club DJs, radio DJs, mobile DJs, turntablists... each has its own art form.",
          "Most pros specialize but know the fundamentals of ALL styles. Let's build that foundation!"
        ],
        content: 'There are several types of DJs: Club/Festival DJs (who perform for large crowds), Radio DJs (who present music on air), Mobile DJs (weddings, corporate events), Turntablists (scratch artists), Bedroom DJs (hobbyists and aspiring pros), and Producer/DJs (who make their own music).',
        tips: [
          'Club DJs typically play 1-4 hour sets focused on energy flow',
          'Turntablists are skilled in scratching and beat juggling',
          'Many successful DJs started as bedroom producers',
        ]
      },
      {
        id: '1-3',
        title: 'Essential Terminology',
        yuiDialog: [
          "Let's learn the language of DJing! Every pro started here. 📚",
          "BPM, cue, loop, crossfade — these words will become second nature to you!",
          "Don't worry about memorizing everything now. You'll absorb it naturally as we practice!"
        ],
        content: 'Key DJ terms: BPM (Beats Per Minute) - the tempo of a track; Cue - a marked point in a track; Loop - a repeated section; Crossfader - the control that blends between two decks; EQ - equalization (adjusting bass, mid, treble); Drop - the moment the main beat hits; Build-up - rising tension before the drop; A/B Decks - the two playback channels.',
        tips: [
          'BPM ranges: 60-100 Hip-Hop, 120-130 House, 130-145 Techno, 170-180 Drum & Bass',
          'The "drop" is the climactic moment most crowd reactions happen',
          'EQ is your most powerful mixing tool',
        ],
        challenge: 'Can you identify the BPM of 5 songs by tapping along to the beat?'
      }
    ]
  },
  {
    id: 2,
    title: 'Know Your Gear',
    subtitle: 'Understanding DJ equipment',
    level: 'beginner',
    icon: '🎛️',
    color: '#06b6d4',
    duration: '20 min',
    locked: false,
    completed: false,
    skills: ['DJ controller basics', 'Turntables', 'Mixers', 'Software'],
    lessons: [
      {
        id: '2-1',
        title: 'The DJ Controller',
        yuiDialog: [
          "Look at this beautiful piece of equipment! This is your command center 🎛️",
          "Every button, knob, and fader has a purpose. Let me show you around!",
          "Don't be intimidated — by the end of our sessions, you'll navigate this blindfolded!"
        ],
        content: 'A DJ controller is an all-in-one device that includes jog wheels (simulating turntables), a mixer section, and pads. It connects to a computer running DJ software. Controllers range from entry-level (Numark Party Mix, Pioneer DDJ-200) to professional (Pioneer DDJ-1000, Rane ONE).',
        tips: [
          'Jog wheels simulate vinyl — the top surface scrubs, the side nudges',
          'Most controllers map directly to software like Serato, Traktor, or rekordbox',
          'Touch-sensitive jog wheels feel most like real vinyl',
        ]
      },
      {
        id: '2-2',
        title: 'Turntables & CDJs',
        yuiDialog: [
          "The classics never die! Turntables are the soul of DJing 🎚️",
          "CDJs are the industry standard in clubs worldwide. Learning them opens every door!",
          "In our virtual studio, I've set up a digital version for you to practice on!"
        ],
        content: 'Turntables play vinyl records. The Technics SL-1200 is legendary. CDJs (CD players/digital players) like Pioneer CDJ-3000 read digital files and have become the club standard. Both have jog wheels for manual control. Vinyl DJs develop incredible tactile feel; CDJ skills get you into professional venues.',
        tips: [
          'Vinyl DJing develops better ear training and tactile skill',
          'CDJs read USB drives with track libraries in the modern era',
          'Pioneer\'s CDJ ecosystem dominates 90% of clubs globally',
        ]
      },
      {
        id: '2-3',
        title: 'The Mixer',
        yuiDialog: [
          "The mixer is where the magic happens — it's the heart of your setup! ❤️",
          "Two channels go in, one blended output comes out. Simple concept, infinite artistry!",
          "The crossfader, EQ, and channel faders are your main tools. Let's explore them!"
        ],
        content: 'The DJ mixer sits between two sound sources and controls how they blend. Key components: Channel Faders (control individual deck volume), Crossfader (blends between decks), EQ Knobs (adjust bass/mid/high per channel), Gain (input level control), Master Output (final volume). Professional mixers include Allen & Heath Xone series and Pioneer DJM series.',
        tips: [
          'Kill the bass on the incoming track to avoid bass clash during transitions',
          'A well-calibrated crossfader curve is essential for scratching',
          'The channel fader is preferred for smooth transitions; crossfader for scratching',
        ],
        challenge: 'On the virtual mixer, practice moving the crossfader from full left to full right smoothly in 4 beats'
      },
      {
        id: '2-4',
        title: 'DJ Software',
        yuiDialog: [
          "Software brings your music library to life! 💻",
          "Serato, Traktor, rekordbox — they all do the same core things, just differently.",
          "We'll work with our built-in studio which teaches concepts from all major platforms!"
        ],
        content: 'Major DJ software platforms: Serato DJ Pro (industry standard, great for beginners and pros), rekordbox (Pioneer\'s ecosystem, free DJ planning), Traktor Pro (Pioneered by Native Instruments, powerful effects), Virtual DJ (feature-rich, great for mobile DJs), djay Pro (Apple-integrated, uses Spotify). Each offers waveform display, BPM detection, key analysis, and effects.',
        tips: [
          'Serato is the most common choice in clubs that provide software',
          'rekordbox is free for music preparation and great for CDJ prep',
          'Always organize and analyze your music library BEFORE performing',
        ]
      }
    ]
  },
  {
    id: 3,
    title: 'Beat Matching',
    subtitle: 'The core skill of seamless mixing',
    level: 'beginner',
    icon: '🥁',
    color: '#f59e0b',
    duration: '30 min',
    locked: false,
    completed: false,
    skills: ['BPM matching', 'Phrase matching', 'Pitch control', 'Ear training'],
    lessons: [
      {
        id: '3-1',
        title: 'Understanding BPM',
        yuiDialog: [
          "BPM is the heartbeat of every track — learn to FEEL it! 💓",
          "Two tracks at the same BPM can be played together perfectly. That's the goal!",
          "Tap along with me — 1, 2, 3, 4... feel the pulse!"
        ],
        content: 'BPM (Beats Per Minute) is the tempo of a track. For two tracks to mix seamlessly, they must play at the same or harmonically related BPMs. Modern DJ software detects BPM automatically, but training your ear to feel tempo naturally is essential. Common BPMs: Deep House 120-124, Tech House 125-130, Techno 133-145, Drum & Bass 170-180.',
        tips: [
          'Tap along to 8 beats minimum for accurate BPM counting',
          'You can mix tracks ±2-3 BPM apart with some pitch adjustment',
          'Mixing at double/half time (e.g., 90 BPM drum & bass with 180 BPM DnB) works!',
        ]
      },
      {
        id: '3-2',
        title: 'Using the Pitch Fader',
        yuiDialog: [
          "The pitch fader is your tempo adjustment tool — use it precisely! 🎚️",
          "Nudge the jog wheel to make quick tiny adjustments. Use the pitch fader for larger corrections.",
          "With practice, you'll do this by ear alone. I believe in you!"
        ],
        content: 'The pitch/tempo fader adjusts playback speed without changing pitch (with key lock on). Range is typically ±6% or ±10%. Small adjustments (±0.5%) correct minor drift. Larger adjustments sync very different BPMs. Always use the pitch fader BEFORE the track enters the mix, not during.',
        tips: [
          'Use jog wheel "nudge" for fine real-time corrections (+/-0.1%)',
          'The pitch fader range is usually ±6%, ±10%, or ±16% — wider = more flexibility',
          'KEY LOCK keeps musical pitch constant while changing speed',
        ],
        challenge: 'Match the BPM of both decks using the pitch fader until the waveforms align'
      },
      {
        id: '3-3',
        title: 'Phrase Matching',
        yuiDialog: [
          "Just matching BPM isn't enough — you need to match PHRASES too! 🎼",
          "Music is built in 4-bar, 8-bar, and 16-bar phrases. A good mix aligns these perfectly.",
          "Listen for the energy patterns — builds, drops, breakdowns. Match energy to energy!"
        ],
        content: 'Musical phrases are 4, 8, or 16 bars long. A bar has 4 beats. So an 8-bar phrase = 32 beats. You must align the phrase beginnings of both tracks for a smooth mix. The incoming track should start a new phrase exactly when the playing track starts a new phrase. Look for white lines on waveforms (downbeats) and listen for musical changes.',
        tips: [
          'Mix in 8-bar or 16-bar intervals for musical transitions',
          'A "phrase loop" button loops the current 4/8/16 bars — great for buying time',
          'Energy matching matters: don\'t mix a drop into a breakdown',
        ]
      },
      {
        id: '3-4',
        title: 'Manual Beat Matching',
        yuiDialog: [
          "Now the fun part — beat matching WITHOUT sync button! This separates pros from beginners 🏆",
          "Listen to both tracks in your headphones. Adjust until the beats align perfectly.",
          "It takes weeks to master. But every second of practice builds your skills!"
        ],
        content: 'Manual beat matching: 1) Play Track A through speakers. 2) Pre-listen to Track B in headphones. 3) Adjust Track B\'s pitch fader to match BPM. 4) Use jog wheel nudge to align the beats. 5) When beats align, bring Track B in with the crossfader or channel fader. 6) Monitor and make micro-corrections. This is the fundamental DJ skill — even if you use SYNC, understanding manual beatmatching makes you a better DJ.',
        tips: [
          'Listen to the hi-hats and kick drums — they\'re easiest to align',
          'If Track B is rushing (ahead), drag the jog wheel back slightly',
          'If Track B is dragging (behind), nudge the jog wheel forward',
          'Practice makes permanent — 20 minutes a day builds ear training fast',
        ],
        challenge: 'Successfully beat match both decks manually without using the SYNC button for 2 minutes straight'
      }
    ]
  },
  {
    id: 4,
    title: 'Your First Mix',
    subtitle: 'Blend two tracks seamlessly',
    level: 'beginner',
    icon: '🔀',
    color: '#10b981',
    duration: '25 min',
    locked: false,
    completed: false,
    skills: ['Basic transitions', 'Channel fader technique', 'Crossfader use', 'Cueing'],
    lessons: [
      {
        id: '4-1',
        title: 'Setting Your Cue Point',
        yuiDialog: [
          "A cue point is your launch pad — the exact moment your track will start! 🎯",
          "Set it right before the first kick drum of the phrase. Then you're ready to GO!",
          "Think of it like a racing car at the starting line — cued and ready!"
        ],
        content: 'A cue point marks the exact position where you want to start playing a track. Always set your cue at the beginning of a musical phrase — usually the first kick drum after the intro. Press CUE to return to this point and pause. Press PLAY from CUE to start from that exact position. Hot cues (colored buttons) let you mark multiple points.',
        tips: [
          'Set your cue BEFORE the track intro ends — during the previous track\'s outro',
          'Hot cues 1-8 let you mark choruses, drops, breakdowns for quick access',
          'Wrong cue point = wrong entry = ruined mix. Double-check every time!',
        ]
      },
      {
        id: '4-2',
        title: 'The Basic Blend',
        yuiDialog: [
          "This is it — your FIRST blend! Let's make it perfect 🌟",
          "Slow fade on the channel fader while you bring the new track in. Simple and effective!",
          "The blend is the bread-and-butter transition that never goes out of style."
        ],
        content: 'The Basic Blend: 1) Track A is playing. 2) Beat match Track B in headphones. 3) Start Track B at the right phrase. 4) Slowly raise Track B\'s channel fader over 4-8 bars. 5) Slowly lower Track A\'s channel fader. 6) Track B is now your main track. This is the foundation of all mixing — master this first.',
        tips: [
          'Move the fader smoothly — jerky movements create noticeable jumps',
          'A 4-bar blend is quick; 16-bar blend is gradual. Match energy needs',
          'EQ out the bass on the incoming track to prevent bass clash',
        ]
      },
      {
        id: '4-3',
        title: 'EQ Mixing',
        yuiDialog: [
          "EQ mixing sounds PROFESSIONAL. Kill that bass and swap cleanly! 🎚️",
          "Never have two bass lines playing at the same time — it sounds like mud.",
          "Swap the bass: kill it on Track A, bring it in on Track B. Clean and powerful!"
        ],
        content: 'EQ (Equalization) mixing: Instead of fading volume, use EQ knobs to swap frequency bands. Bass Swap: Cut the low EQ on the incoming track. Mix it in at full volume. Then swap: turn up the incoming bass while cutting the outgoing bass simultaneously. This is cleaner than a volume blend and preserves energy.',
        tips: [
          'Low EQ affects bass drum and bassline (60-250Hz)',
          'Mid EQ affects vocals and melodic elements (250-2kHz)',
          'High EQ affects hi-hats and brightness (2kHz-20kHz)',
          'Turning an EQ to zero doesn\'t mean silence — it reduces that band to minimum',
        ],
        challenge: 'Perform an EQ bass swap between Deck A and Deck B without the audience hearing any disruption'
      },
      {
        id: '4-4',
        title: 'Reading the Mix',
        yuiDialog: [
          "Amazing! You just did your first mix! I'm SO proud of you! 🎉",
          "Now step back and LISTEN objectively. Does it sound good? Be honest with yourself.",
          "Every great DJ listened critically to their own mixes and kept improving. You're on the path!"
        ],
        content: 'Critical listening: After each mix, evaluate it. Ask yourself: Did the beats align? Was the transition smooth? Did energy levels match? Was there bass clash? Did phrases align? Use headphones and speakers. Record your mixes and listen back — you\'ll catch mistakes you missed in the moment. Self-critique is how you improve.',
        tips: [
          'Record every practice session — your ear will catch what you miss in the moment',
          'Listen for: tempo drift, bass clash, abrupt volume changes, phrase misalignment',
          'Great DJs are their own harshest critics',
        ]
      }
    ]
  },
  {
    id: 5,
    title: 'EQ & Filters',
    subtitle: 'Shape your sound with precision',
    level: 'intermediate',
    icon: '📊',
    color: '#f97316',
    duration: '35 min',
    locked: false,
    completed: false,
    skills: ['3-band EQ', 'Filter sweeps', 'Frequency awareness', 'Surgical EQ'],
    lessons: [
      {
        id: '5-1',
        title: 'The 3-Band EQ',
        yuiDialog: [
          "Time to get technical — the EQ is your most powerful mixing weapon! ⚡",
          "Three bands: Low (bass), Mid (body), High (air). Each one controls a part of the frequency spectrum.",
          "Master the EQ and your mixes will sound professional even as a beginner!"
        ],
        content: 'The 3-band EQ controls: LOW (bass frequencies 20-300Hz) — kick drum, bass guitar, sub bass; MID (midrange 300Hz-3kHz) — vocals, synths, piano, most instruments; HIGH (treble 3kHz-20kHz) — hi-hats, cymbals, air, brightness. Each knob typically goes from -inf (full cut) through 0 (flat/off) to +6dB (boost).',
        tips: [
          'Most mixing happens with EQ CUTs (subtracting), not boosts',
          'Always reset EQ knobs to center (12 o\'clock) by default',
          'The low end is where bass clash happens — watch it carefully during transitions',
        ]
      },
      {
        id: '5-2',
        title: 'Filter Sweeps',
        yuiDialog: [
          "Filters are MAGICAL — they can build tension or create beautiful transitions! 🌊",
          "A low-pass filter sweeps away the highs... a high-pass filter clears the lows.",
          "Use them dramatically for effect or subtly during transitions. Both are valid!"
        ],
        content: 'Filters cut frequencies above or below a set point. Low-Pass Filter (LPF): passes frequencies below the cutoff — creates a muffled, underwater effect when closed. High-Pass Filter (HPF): passes frequencies above the cutoff — removes bass and creates a thin, bright sound. Filter sweeps during breaks or builds create dramatic tension and release.',
        tips: [
          'Open a filter slowly during a build to add tension',
          'Cut a filter to introduce a new element ("filter in" technique)',
          'High-pass filter on the outro of Track A while full Track B plays = clean exit',
        ]
      },
      {
        id: '5-3',
        title: 'Advanced EQ Techniques',
        yuiDialog: [
          "Let's go deeper! These techniques will level up your sound quality massively! 🚀",
          "Notch filtering, dynamic EQ use during transitions — this is intermediate-level mastery!",
          "Your ear is your guide. If it sounds good, it IS good!"
        ],
        content: 'Advanced EQ techniques: Harmonic mixing (match tracks by musical key), frequency carving (cut mids on one track so vocals from the other sit through), Outgoing track HPF (gradually high-pass the exiting track while the new track plays full), DJ EQ notation (boosting highs on the incoming track to "introduce" it before the full blend).',
        tips: [
          'Cutting the 1-2kHz range reduces harshness in dense mixes',
          'A slight mid boost on vocals helps them cut through in loud environments',
          'Use the HIGH EQ boost to preview a track\'s melodic elements early in the mix',
        ],
        challenge: 'Perform a complete transition using ONLY EQ and no volume faders'
      }
    ]
  },
  {
    id: 6,
    title: 'Effects & FX',
    subtitle: 'Add depth and creativity to your mixes',
    level: 'intermediate',
    icon: '✨',
    color: '#ec4899',
    duration: '30 min',
    locked: false,
    completed: false,
    skills: ['Reverb', 'Delay', 'Echo', 'Flanger', 'Creative FX'],
    lessons: [
      {
        id: '6-1',
        title: 'Reverb',
        yuiDialog: [
          "Reverb adds SPACE to your music — like performing in a cathedral! 🏛️",
          "Use it to extend an outro, smooth a transition, or create atmosphere.",
          "Don't overdo it though — too much reverb makes everything sound distant and muddy!"
        ],
        content: 'Reverb simulates acoustic space — adding the sensation of playing in a room, hall, or cathedral. In DJing, reverb is used to: extend the tail of an exiting track (apply reverb as the track fades out, creating a "floaty" exit), add space to drops, and create atmospheric transitions. Short reverb sounds like a room; long reverb sounds like a cathedral.',
        tips: [
          'Short decay (0.5-1s) sounds natural; long decay (3s+) creates drama',
          'Apply reverb during filter sweeps for magical buildup moments',
          'High reverb + downward HPF filter = beautiful "dreamlike" transition',
        ]
      },
      {
        id: '6-2',
        title: 'Delay & Echo',
        yuiDialog: [
          "Delay creates rhythm — use it to extend and embellish your transitions! 🔁",
          "Time your delay to the BPM and it becomes part of the music!",
          "A well-placed delay can make a transition feel inevitable and musical."
        ],
        content: 'Delay repeats a signal after a set time interval. When synced to BPM, delay becomes rhythmically musical. Common delay types: 1/4 note (every beat), 1/8 note (every half beat), 3/8 note (triplet feel). Techniques: "Delay freeze" — send audio to delay then cut the dry signal, leaving only the delay repeats; great for creating space during transitions.',
        tips: [
          'Always sync your delay to the track BPM for musical results',
          'Feedback controls how many repeats — keep below 70% to avoid feedback loops',
          'Use delay on just the high frequencies for a crisp, rhythmic effect',
        ]
      },
      {
        id: '6-3',
        title: 'Creative FX Chains',
        yuiDialog: [
          "Now you're thinking like a creative DJ! Combining effects creates signatures 🎨",
          "Flanger, phaser, bitcrusher, pitch shift — the FX palette is huge!",
          "YOUR unique effects usage is part of YOUR DJ identity. Experiment freely!"
        ],
        content: 'Creative FX chains combine multiple effects: Flanger (comb filtering, creates a swooshing "jet" effect), Phaser (phase shifting, creates a sweeping sound), Bitcrusher (digital distortion, lo-fi effect), Pitch Shift (real-time key change), Stutter/Gater (chops the audio rhythmically). Stack carefully — less is more. One signature effect used well beats five effects used poorly.',
        tips: [
          'Flangers and phasers sound amazing on hi-hats and cymbals',
          'Bitcrusher creates industrial/lo-fi energy perfect for techno transitions',
          'Save your favorite FX chains as presets for live performance efficiency',
        ],
        challenge: 'Create a 30-second transition that uses at least 2 different effects creatively'
      }
    ]
  },
  {
    id: 7,
    title: 'Transitions & Drops',
    subtitle: 'Master the art of the mix moment',
    level: 'intermediate',
    icon: '💥',
    color: '#ef4444',
    duration: '40 min',
    locked: false,
    completed: false,
    skills: ['Energy management', 'Drop technique', 'Spinback', 'Cuts', 'Crash cymbals'],
    lessons: [
      {
        id: '7-1',
        title: 'Energy Flow',
        yuiDialog: [
          "A DJ set is like a story — it has peaks, valleys, and moments of release! 📈",
          "Never go from 100% energy straight down — you'll lose the crowd.",
          "Build → Peak → Sustain → Breath → Build again. Feel the flow!"
        ],
        content: 'Energy management in a DJ set: Think of it as a journey. Start with moderate energy, build gradually, reach peaks, sustain, then bring it down for contrast before building again. The crowd needs moments of release. Energy tools: BPM (higher = more energy), Density (more instruments = more energy), Filter (open filter = more energy), Bass (full bass = more energy).',
        tips: [
          'A sudden drop from high energy to minimal creates powerful contrast',
          'Never raise BPM more than 10 BPM at once without audience preparation',
          'Track selection matters more than mixing skill — pick the right song at the right moment',
        ]
      },
      {
        id: '7-2',
        title: 'Drop Techniques',
        yuiDialog: [
          "THE DROP — the moment every DJ lives for! 🔥",
          "The spinback, the cut, the slam — there are many ways to drop!",
          "Each has its place. The spinback for drama, the cut for impact, the blend for smoothness!"
        ],
        content: 'Drop techniques: 1) The Blend Drop — smooth crossfade to the new drop, classic and always works. 2) The Cut — instant switch, high impact, works best when beats are perfectly aligned. 3) The Spinback — rewind the record for a dramatic effect before dropping the new track. 4) The Filter Drop — high-pass filter the current track while the new track\'s drop is ready, then cut in the full drop. 5) The Echo Out — delay/reverb on outgoing track, then hit the new drop cold.',
        tips: [
          'Spinbacks work best at crowd peaks — don\'t overuse them',
          'A perfectly aligned cut sounds amazing and very professional',
          'Practice your drops in private before trying them live',
        ]
      },
      {
        id: '7-3',
        title: 'Reading the Crowd',
        yuiDialog: [
          "Tech skills are nothing without CROWD connection. Read the room! 👁️",
          "Watch the dance floor. Are they jumping? Singing along? Looking bored? Adjust!",
          "The greatest DJs are storytellers who respond to their audience in real time."
        ],
        content: 'Crowd reading skills: Observe body language — people dancing with abandon means you\'re winning; people standing still means something needs to change. Watch the dance floor fill and empty. Time your big drops when energy is high. Use quieter moments to change musical direction subtly. Have 3 tracks in your mind at all times: the one playing, the likely next one, and an "emergency" crowd-pleaser.',
        tips: [
          'If the floor empties, drop a recognizable, accessible track immediately',
          'Never sacrifice musical quality just to please one person\'s request',
          'Your "emergency track" should be a crowd-tested anthem that always works',
        ],
        challenge: 'Play a 10-minute set using the studio tracks and create an intentional energy arc'
      }
    ]
  },
  {
    id: 8,
    title: 'Harmonic Mixing',
    subtitle: 'Mix by musical key for perfect harmony',
    level: 'intermediate',
    icon: '🎼',
    color: '#8b5cf6',
    duration: '35 min',
    locked: false,
    completed: false,
    skills: ['Camelot Wheel', 'Key compatibility', 'Tonal harmony', 'Melodic transitions'],
    lessons: [
      {
        id: '8-1',
        title: 'Musical Keys & The Camelot Wheel',
        yuiDialog: [
          "Harmonic mixing takes you to the NEXT level! 🎵",
          "The Camelot Wheel maps all 24 musical keys in a circle. Mix within compatible keys and it sounds MAGICAL.",
          "When two tracks share a compatible key, melodies blend naturally. Clash keys and it's a musical disaster!"
        ],
        content: 'The Camelot Wheel (created by Mark Davis) assigns numbers and letters to musical keys: A = minor, B = major, 1-12 clockwise. Compatible keys: Same key (obvious), Adjacent numbers (e.g., 8A to 7A or 9A), Change letter but same number (8A to 8B = relative major/minor). Example: 8A (Am) plays beautifully with 7A (Em), 9A (Dm), and 8B (C major).',
        tips: [
          'Move ±1 on the wheel for smooth, natural-sounding progressions',
          'Energy boost: move +1 number (e.g., 8A → 9A) for a sense of rising energy',
          'All DJ software shows key analysis and can display Camelot codes',
        ]
      },
      {
        id: '8-2',
        title: 'Melodic Blending',
        yuiDialog: [
          "When keys match... the melodies DANCE together. It's breathtaking! 🌟",
          "Listen for chord progressions that support each other, not fight each other.",
          "This is what separates tasteful DJs from track-selectors. Musicality!"
        ],
        content: 'Melodic blending: When two tracks share compatible keys, you can blend longer and the melodies coexist beautifully. Techniques: Key-matched intro blend (blend two tracks at full volume in their intro/outro sections), Melodic loop (loop a 4-bar section of Track A that harmonizes with Track B\'s melody), Key shift (some controllers/software allow real-time key shift for harmonic transitions).',
        tips: [
          'Long blends (32-64 bars) work beautifully when keys are compatible',
          'Try to find tracks with similar chord progressions for seamless blends',
          'Mixed In Key software analyzes your entire library — worth the investment',
        ],
        challenge: 'Find two tracks with compatible Camelot keys and perform a 32-bar harmonic blend'
      }
    ]
  },
  {
    id: 9,
    title: 'Scratching Basics',
    subtitle: 'The art of the turntablist',
    level: 'advanced',
    icon: '💿',
    color: '#06b6d4',
    duration: '45 min',
    locked: false,
    completed: false,
    skills: ['Baby scratch', 'Forward scratch', 'Backward scratch', 'Chirp'],
    lessons: [
      {
        id: '9-1',
        title: 'The Baby Scratch',
        yuiDialog: [
          "Welcome to turntablism! This is where DJing becomes an instrument! 🎹",
          "The baby scratch is the first building block — forward and backward. That's it!",
          "Position your hand on the record. Feel the groove. This IS music!"
        ],
        content: 'The Baby Scratch: The most basic scratch — push the record forward, pull it back, without touching the crossfader. Just the sound of the record going back and forth. Proper technique: Place fingers across the grooves. Push forward with a wrist snap. Pull back with wrist reversal. Equal time forward and back creates a "wah-wah" effect. Practice in 4-beat loops.',
        tips: [
          'Use a single-word sample ("aaah" or "fresh") to hear the scratch clearly',
          'Keep your non-scratch hand ready on the crossfader for future techniques',
          'Practice to a metronome — rhythm is everything in scratching',
        ]
      },
      {
        id: '9-2',
        title: 'The Cut Scratch & Chirp',
        yuiDialog: [
          "Now we add the crossfader! This is where it gets REAL! 🔥",
          "Cut scratch: open the fader, make the sound, close the fader. A rhythmic stab!",
          "The chirp is the baby scratch + crossfader combination. It sounds like a bird chirp!"
        ],
        content: 'Cut Scratch: Open crossfader → push record forward → close crossfader → pull record back (silent). Creates a rhythmic stab on the forward stroke only. Chirp Scratch: Baby scratch + crossfader. Open fader midway through the forward push, close it midway through the pull. This creates the iconic "chirp" sound DJs are famous for. The timing of the crossfader click relative to the record movement creates different chirp tones.',
        tips: [
          'Fast crossfader clicks create sharper, more percussive sounds',
          'The crossfader curve setting affects how scratches sound — try different settings',
          'Hamster-style (reversed fader) is preferred by many turntablists',
        ]
      },
      {
        id: '9-3',
        title: 'Scratch Patterns & Rhythm',
        yuiDialog: [
          "Scratching IS rhythm — it's percussion with your voice! 🥁",
          "Transform, flare, orbit — each scratch is a unique sound in your rhythmic arsenal.",
          "The goal: your scratch ADDS to the music, not just plays over it!"
        ],
        content: 'Advanced scratches to explore: Transform Scratch (rapid crossfader cuts over a sustained record push — creates machine-gun effect), Flare Scratch (reverse of transform, clicking fader closed briefly while pushing), Orbit (combines multiple click points in one movement), 2-Click Flare (clicking twice in one direction), Crab Scratch (using all four fingers on the fader for rapid clicking). These are long-term goals requiring months of practice.',
        tips: [
          'Record yourself scratching and listen back — rhythm reveals itself',
          'DJ Qbert, Jazzy Jeff, and A-Trak are the masters to study',
          'Consistency beats speed — slow scratches in perfect time sound better than fast sloppy ones',
        ],
        challenge: 'Record a 30-second scratch routine using at least the baby scratch and one cut scratch pattern'
      }
    ]
  },
  {
    id: 10,
    title: 'Advanced Mixing',
    subtitle: 'Long blends, layering, and live remixing',
    level: 'advanced',
    icon: '🌊',
    color: '#a855f7',
    duration: '50 min',
    locked: false,
    completed: false,
    skills: ['Long blends', 'Layering', 'Live remixing', 'Mashups', 'Acapellas'],
    lessons: [
      {
        id: '10-1',
        title: 'Extended Blends',
        yuiDialog: [
          "Advanced DJing is about SUSTAINING musical journeys, not just transitions! 🏔️",
          "Extended blends — 64 bars, even 128 bars — create immersive experiences.",
          "The audience stops noticing the mix and just feels the music. That's mastery!"
        ],
        content: 'Extended blending creates gradual, immersive transitions. Rather than a quick 8-bar blend, you overlay tracks for 32-128 bars, gradually introducing elements from Track B while maintaining Track A\'s energy. Keys must match. Phrases must align. EQ must be carefully managed. The result feels like one evolving piece of music rather than a sequence of tracks.',
        tips: [
          'Use EQ to carve space — reduce mids on one track so the other\'s vocal sits through',
          'Slowly introduce filter sweeps to add texture across the long blend',
          'The transition should feel inevitable — like the music was always going there',
        ]
      },
      {
        id: '10-2',
        title: 'Layering & Live Remixing',
        yuiDialog: [
          "YOU can be the remixer live on stage! Layer loops, drop samples, reshape music! 🎭",
          "Use your hot cues and loops to deconstruct and rebuild tracks in real time.",
          "This is the frontier of DJing — where DJ meets live performer!"
        ],
        content: 'Live remixing techniques: Vocal Isolation (use EQ to bring up/cut mids to feature or hide vocals), Loop Juggling (rapidly switching between loops to create new rhythms), Acapella Layering (drop an acapella over a different instrumental track — instant mashup), Sample Triggering (trigger one-shot samples from pads for extra percussion), Beat Building (loop just the kick, then layer hi-hat loops, then melody — build from scratch).',
        tips: [
          'Prepare your loops and cues before the set — improvise from preparation',
          'A well-placed acapella drop can transform a set moment into a crowd memory',
          'Hot cues 1-8 should be organized: 1=Intro, 2=Verse, 3=Chorus, 4=Breakdown, 5=Drop',
        ]
      },
      {
        id: '10-3',
        title: 'The Art of Mashups',
        yuiDialog: [
          "Mashups are DJ magic — two songs become one amazing experience! ✨",
          "Combine an instrumental with an acapella from a different genre for an ELECTRIFYING result!",
          "When it works, the crowd goes absolutely WILD. This is what they came for!"
        ],
        content: 'Creating live mashups: 1) Find two tracks in compatible keys. 2) Match their BPMs. 3) Play Track A (instrumental). 4) Layer Track B\'s acapella over it — use only the vocal track at appropriate moment. 5) Swap the instrumental while keeping the vocal running. Classic mashup genres: Pop acapella over house beat, Hip-hop vocal over techno, EDM vocal over different EDM.',
        tips: [
          'Studio mashups (pre-made) are safer for live performance',
          'Live mashups take extensive preparation and practice to execute reliably',
          'The key: both tracks MUST be in the same or compatible key',
        ],
        challenge: 'Create and perform a live mashup using any two tracks from the library'
      }
    ]
  },
  {
    id: 11,
    title: 'Building Your Set',
    subtitle: 'Craft a complete DJ performance',
    level: 'pro',
    icon: '🎭',
    color: '#f59e0b',
    duration: '60 min',
    locked: false,
    completed: false,
    skills: ['Set planning', 'Track selection', 'Peaks & valleys', 'Timing', 'Genre navigation'],
    lessons: [
      {
        id: '11-1',
        title: 'Set Architecture',
        yuiDialog: [
          "A DJ set is architecture — it has structure, tension, and resolution! 🏗️",
          "Plan your set like a screenplay: Act 1 (establishment), Act 2 (development), Act 3 (climax + resolution).",
          "But stay flexible — the best sets respond to the moment, not the plan!"
        ],
        content: 'Set architecture for a 60-minute set: 0-10 min: Opening — warm up, medium energy, familiar but not obvious tracks. 10-25 min: Build — gradually increase energy, BPM, and intensity. 25-40 min: Peak — your biggest, most energetic tracks. The "moment." 40-50 min: Sustain & Breathe — maintain or slight reduction, crowd recovers. 50-60 min: Resolution — gradual wind down or massive final peak. Adapt based on context (opening set vs. headline).',
        tips: [
          'Have 3x more tracks prepared than you\'ll need — options give freedom',
          'Mark your "must play" tracks but be ready to skip them if the moment isn\'t right',
          'Prepare peak tracks that work in multiple genres/tempos for flexibility',
        ]
      },
      {
        id: '11-2',
        title: 'Track Selection Mastery',
        yuiDialog: [
          "The RIGHT track at the RIGHT moment is worth 1000 perfect mixes! 🎯",
          "Track selection is the most important skill no tutorial can fully teach.",
          "It comes from listening widely, understanding the crowd, and trusting your instincts!"
        ],
        content: 'Track selection principles: Serve the context (club vs. festival vs. intimate venue), Know your music deeply (don\'t play tracks you barely know), Balance familiarity and discovery (crowd pleasers mixed with music discovery), Genre navigation (smooth transitions between genres require careful track sequencing), Energy anticipation (know what energy comes after the track you\'re playing).',
        tips: [
          'Spend 10 hours listening to music for every 1 hour performing',
          'Organize your library with folders: bangers, openers, closers, slow burns',
          'Never play a track for the first time live — pre-listen everything',
        ]
      },
      {
        id: '11-3',
        title: 'Live Performance Skills',
        yuiDialog: [
          "Performance is about MORE than just the music — it's presence, energy, connection! ✨",
          "Your body language on stage affects how the crowd feels the music.",
          "Engage, react, show you're feeling it — be human, not a robot behind the decks!"
        ],
        content: 'Performance skills: Stage presence (visible enjoyment and engagement encourages crowd enjoyment), Technical preparation (organized library, pre-analyzed tracks, practiced transitions), Mental preparation (arrive early, know the room, soundcheck thoroughly), Dealing with problems (technical issues, wrong BPM, emergency track needed — stay calm, professionals solve problems invisibly), Post-set analysis (what worked? what didn\'t? be honest).',
        tips: [
          'Always arrive 1 hour early — set up, soundcheck, and settle your nerves',
          'Have a backup USB and backup software configuration',
          'Never apologize for mistakes in your set — the crowd usually didn\'t notice',
        ],
        challenge: 'Plan and record a complete 15-minute DJ set with an intentional energy arc using all learned skills'
      }
    ]
  },
  {
    id: 12,
    title: 'Pro Production',
    subtitle: 'DJ as music producer and artist',
    level: 'pro',
    icon: '🎤',
    color: '#ec4899',
    duration: '60 min',
    locked: false,
    completed: false,
    skills: ['Music production basics', 'Remixing', 'Bootlegs', 'Artist identity', 'Recording & releasing'],
    lessons: [
      {
        id: '12-1',
        title: 'DJ to Producer',
        yuiDialog: [
          "You've come so far! Now — can you CREATE the music you DJ? 🎹",
          "Most legendary DJs are also producers. Your ear is already trained — now learn to create!",
          "DAW (Digital Audio Workstation) is your recording studio. Ableton, FL Studio, Logic — pick one!"
        ],
        content: 'The DJ-Producer path: Start with remixing — take an existing track and rework it in your DAW. Progress to bootlegs (unofficial remixes), then edits (small changes to make tracks more DJ-friendly), then original productions. Essential production tools: DAW (Ableton Live recommended for DJs due to its performance integration), a MIDI keyboard, quality headphones and/or studio monitors.',
        tips: [
          'Ableton Live is uniquely suited for DJ-producers — performance and production in one',
          'Learn music theory basics — just one year transforms your productions',
          'Sample packs let you produce before you can create sounds from scratch',
        ]
      },
      {
        id: '12-2',
        title: 'Creating Your Artist Identity',
        yuiDialog: [
          "Who ARE you as a DJ? What's your sound, your story, your aesthetic? 🌟",
          "The most successful DJs have a clear, authentic identity that audiences connect with.",
          "You don't need to be original on day one — but start thinking about what YOU bring to the world!"
        ],
        content: 'Artist identity elements: Sound identity (what genres, what BPM, what energy levels define your sets?), Visual identity (artwork, photos, social media aesthetic), Values (what does your music stand for?), Story (why do you DJ? what music moved you?), Name (memorable, searchable, unique), Social presence (where will you build your community?). Authenticity > calculation. Be genuinely yourself.',
        tips: [
          'Your artist name should be searchable on Google — test it',
          'Consistency in visual style builds recognition across platforms',
          'Share the music that inspires you — audiences connect with real passion',
        ]
      },
      {
        id: '12-3',
        title: 'Recording & Releasing Mixes',
        yuiDialog: [
          "The world needs to hear your music! Let's get it out there! 🌍",
          "Mix recordings, Soundcloud, Mixcloud, Beatport — there are many platforms!",
          "Your first release won't be perfect. Release it anyway. Momentum beats perfection!"
        ],
        content: 'Recording and releasing: DJ mixes can be recorded directly from your software (audio export), or recorded in real-time using Audacity/GarageBand. Platforms: Soundcloud (music community, great for DJs), Mixcloud (legally licensed mixes, better for royalty compliance), YouTube (video sets — visual presence helps), Instagram/TikTok (short clips build audience). Release regularly and consistently.',
        tips: [
          'Always record your practice sessions — your best mix often happens unexpectedly',
          'Mixcloud is legally safer for releases than Soundcloud due to licensing',
          'A simple cover image makes your mix look professional and shareable',
        ],
        challenge: 'Record and "release" a 20-minute mix from your Compositions — it\'s your debut!'
      }
    ]
  }
];
