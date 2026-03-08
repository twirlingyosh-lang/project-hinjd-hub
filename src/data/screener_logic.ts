import { DiagnosticNode } from "./crusher_logic";

export const ScreenerDiagnostics: Record<string, DiagnosticNode> = {
  root: {
    question: "Is the screener receiving power?",
    yes_node: "power_yes",
    no_node: "check_breaker",
  },
  check_breaker: {
    question: "Is the main breaker tripped?",
    yes_node: "breaker_tripped",
    no_node: "check_supply",
  },
  breaker_tripped: {
    question: "Does the breaker trip again after reset?",
    yes_node: "recurring_trip",
    no_node: "breaker_fixed",
  },
  recurring_trip: {
    action: "⚠️ Short circuit or ground fault. Check vibrator motor windings, junction boxes, and cable runs for damage before re-energizing.",
  },
  breaker_fixed: {
    action: "✅ Breaker reset successful. Monitor vibrator motor amps for 15 minutes under load.",
  },
  check_supply: {
    action: "🔌 No incoming power. Check utility feed, disconnect switch, and generator status.",
  },

  // === Vibration / Motion Branch ===
  power_yes: {
    question: "Is the screen deck vibrating?",
    yes_node: "vibrating",
    no_node: "not_vibrating",
  },
  not_vibrating: {
    question: "Is the vibrator motor running?",
    yes_node: "motor_yes_no_vib",
    no_node: "motor_not_running",
  },
  motor_not_running: {
    question: "Is the E-Stop engaged?",
    yes_node: "estop_engaged",
    no_node: "check_motor_power",
  },
  estop_engaged: {
    action: "🛑 Release all E-Stop buttons. Reset control circuit and attempt restart.",
  },
  check_motor_power: {
    question: "Is the motor starter pulling in?",
    yes_node: "starter_yes",
    no_node: "starter_no",
  },
  starter_no: {
    action: "🔧 Control circuit fault. Check control transformer, fuses, PLC output, and start/stop wiring.",
  },
  starter_yes: {
    question: "Is the motor humming but not turning?",
    yes_node: "motor_humming",
    no_node: "motor_silent",
  },
  motor_humming: {
    action: "⚡ Possible single-phasing or seized vibrator bearings. Check all 3 phases at motor. Disconnect motor from exciter and try to rotate shaft by hand.",
  },
  motor_silent: {
    action: "🔍 Starter engaging but no motor response. Check overload relay, motor leads, and terminal connections.",
  },
  motor_yes_no_vib: {
    question: "Are the drive belts intact?",
    yes_node: "belts_ok",
    no_node: "belts_broken",
  },
  belts_broken: {
    action: "🔗 Drive belts broken or thrown. Replace belts as a matched set. Check sheave alignment and tension before restarting.",
  },
  belts_ok: {
    question: "Can you rotate the vibrator shaft by hand?",
    yes_node: "shaft_free",
    no_node: "shaft_seized",
  },
  shaft_seized: {
    action: "🚨 Vibrator shaft seized. Likely bearing failure. Lock out, drain oil, and remove vibrator unit for inspection. Replace bearings and seals.",
  },
  shaft_free: {
    action: "⚙️ Motor running, belts intact, shaft turns freely — check coupling between motor and exciter. Inspect counterweight bolts and key.",
  },

  // === Screening Performance Branch ===
  vibrating: {
    question: "Is the screen separating material correctly?",
    yes_node: "separation_ok",
    no_node: "separation_bad",
  },
  separation_bad: {
    question: "Is material blinding (plugging) the screen?",
    yes_node: "blinding_issue",
    no_node: "check_carryover",
  },
  blinding_issue: {
    question: "Is the feed material wet or sticky?",
    yes_node: "wet_material",
    no_node: "dry_blinding",
  },
  wet_material: {
    action: "💧 Wet/sticky material causing blinding. Options: add spray bars for washing, switch to self-cleaning media (polyurethane or rubber), increase vibration amplitude, or pre-screen to remove fines.",
  },
  dry_blinding: {
    question: "Are near-size particles causing the plugging?",
    yes_node: "near_size",
    no_node: "check_amplitude",
  },
  near_size: {
    action: "📐 Near-size blinding. Install anti-blinding screen media (slotted, crowned, or piano wire). Add ball trays or kicker systems underneath the deck.",
  },
  check_amplitude: {
    question: "Is the vibration amplitude within spec?",
    yes_node: "amplitude_ok_blinding",
    no_node: "low_amplitude",
  },
  low_amplitude: {
    action: "📉 Low amplitude causing poor screening. Check counterweight settings, drive belt tension, and vibrator oil level. Adjust weights per manufacturer spec.",
  },
  amplitude_ok_blinding: {
    action: "🔍 Amplitude OK but still blinding. Review screen angle — increase inclination for better material travel. Consider air cannons or ultrasonic systems.",
  },
  check_carryover: {
    question: "Is there too much fine material in the oversize?",
    yes_node: "fines_in_oversize",
    no_node: "oversize_in_fines",
  },
  fines_in_oversize: {
    question: "Is the bed depth too high?",
    yes_node: "overloaded",
    no_node: "check_screen_condition",
  },
  overloaded: {
    action: "📦 Screen overloaded — reduce feed rate. Material bed depth should not exceed 4x the largest particle for top deck. Increase screen area or add a pre-screen.",
  },
  check_screen_condition: {
    question: "Are the screen openings worn or enlarged?",
    yes_node: "worn_media",
    no_node: "adjust_settings",
  },
  worn_media: {
    action: "🔩 Screen media worn beyond tolerance. Replace with correct aperture size. Inspect support bars and crown strips before installing new media.",
  },
  adjust_settings: {
    action: "⚙️ Openings OK — adjust stroke, speed, or deck angle. Steeper angle = faster travel but less screening time. Reduce feed rate for finer cuts.",
  },
  oversize_in_fines: {
    question: "Are there holes or tears in the screen media?",
    yes_node: "torn_media",
    no_node: "check_seals",
  },
  torn_media: {
    question: "Is the damage at the feed end?",
    yes_node: "feed_end_damage",
    no_node: "general_tear",
  },
  feed_end_damage: {
    action: "💥 Impact damage at feed end. Lower feed chute drop height, install rock box or impact curtains. Use heavier gauge media at feed zone.",
  },
  general_tear: {
    action: "🔍 Screen media tearing — check support structure for worn cross bars. Verify media is properly tensioned. Consider upgrading to more abrasion-resistant media.",
  },
  check_seals: {
    action: "🔧 No tears found — check side seals and clamp bars. Material may be bypassing the screen at edges. Tighten clamp bars and replace worn side liners.",
  },

  // === Mechanical Health Branch ===
  separation_ok: {
    question: "Is there excessive vibration or unusual noise?",
    yes_node: "abnormal_vibration",
    no_node: "check_structure",
  },
  abnormal_vibration: {
    question: "Is the vibration pattern irregular or erratic?",
    yes_node: "erratic_vibration",
    no_node: "high_steady_vibration",
  },
  erratic_vibration: {
    question: "Did it start suddenly?",
    yes_node: "sudden_erratic",
    no_node: "gradual_erratic",
  },
  sudden_erratic: {
    action: "🛑 STOP IMMEDIATELY. Possible broken spring, cracked side plate, or lost counterweight. Lock out and inspect before restarting.",
  },
  gradual_erratic: {
    action: "🔩 Gradually worsening vibration — check all spring mounts for fatigue or breakage. Inspect vibrator bearings and measure shaft runout.",
  },
  high_steady_vibration: {
    question: "Are the isolation springs in good condition?",
    yes_node: "springs_ok",
    no_node: "bad_springs",
  },
  bad_springs: {
    action: "🔧 Replace damaged springs as a complete set (never mix old and new). Verify spring rates match spec for the screen weight and speed.",
  },
  springs_ok: {
    action: "📊 Springs OK — check vibrator counterweight setting, bearing condition, and structural bolts. Run vibration analysis to identify frequency source.",
  },
  check_structure: {
    question: "Are the vibrator bearing temperatures normal (<180°F)?",
    yes_node: "all_good",
    no_node: "high_temp",
  },
  high_temp: {
    question: "Is the vibrator oil level correct?",
    yes_node: "oil_ok_hot",
    no_node: "low_oil",
  },
  low_oil: {
    action: "🛢️ Low vibrator oil. Fill to sight glass level with manufacturer-specified grade. Check for leaks at seals and drain plug.",
  },
  oil_ok_hot: {
    action: "🌡️ Oil level OK but running hot. Check oil condition — may need change. Verify correct viscosity grade. Inspect for bearing pre-load issues.",
  },
  all_good: {
    action: "✅ Screener operating normally. Log vibration readings and bearing temps. Schedule next PM per manufacturer intervals.",
  },
};
