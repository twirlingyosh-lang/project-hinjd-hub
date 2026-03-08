export interface DiagnosticNode {
  question?: string;
  action?: string;
  yes_node?: string;
  no_node?: string;
}

export const CrusherDiagnostics: Record<string, DiagnosticNode> = {
  root: {
    question: "Is the crusher receiving power?",
    yes_node: "power_yes",
    no_node: "power_no",
  },
  power_no: {
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
    action: "⚠️ Short circuit or ground fault detected. Inspect motor windings and cabling. Do NOT re-energize until fault is cleared.",
  },
  breaker_fixed: {
    action: "✅ Breaker reset successful. Monitor for 30 minutes under load before resuming normal operation.",
  },
  check_supply: {
    action: "🔌 No incoming power. Check utility feed, transfer switch, and generator status. Verify voltage at main disconnect.",
  },
  power_yes: {
    question: "Is the crusher motor running?",
    yes_node: "motor_running",
    no_node: "motor_not_running",
  },
  motor_not_running: {
    question: "Is the E-Stop engaged?",
    yes_node: "estop_engaged",
    no_node: "check_starter",
  },
  estop_engaged: {
    action: "🛑 Release all E-Stop buttons (twist clockwise). Reset control circuit and attempt restart.",
  },
  check_starter: {
    question: "Do you hear the contactor pulling in?",
    yes_node: "contactor_yes",
    no_node: "contactor_no",
  },
  contactor_no: {
    action: "🔧 Control circuit fault. Check control transformer fuses, PLC outputs, and start/stop circuit wiring.",
  },
  contactor_yes: {
    question: "Is the motor humming but not turning?",
    yes_node: "motor_humming",
    no_node: "motor_silent",
  },
  motor_humming: {
    action: "⚡ Possible single-phasing or seized rotor. Check all 3 phases at motor terminals. Inspect coupling and chamber for jammed material.",
  },
  motor_silent: {
    action: "🔍 Contactor engaging but no motor response. Check overload relay, motor leads, and terminal connections.",
  },
  motor_running: {
    question: "Is the crusher producing material?",
    yes_node: "producing",
    no_node: "not_producing",
  },
  not_producing: {
    question: "Is material feeding into the crusher?",
    yes_node: "feed_yes_no_output",
    no_node: "no_feed",
  },
  no_feed: {
    action: "📦 Check feeder/conveyor upstream. Inspect hopper for bridging or blockage. Verify feeder is running and speed is correct.",
  },
  feed_yes_no_output: {
    action: "🚨 Material entering but not exiting — possible chamber blockage or tramp iron. Shut down, lockout, and inspect crushing chamber.",
  },
  producing: {
    question: "Is the product size within spec?",
    yes_node: "size_ok",
    no_node: "size_bad",
  },
  size_ok: {
    question: "Is there excessive vibration?",
    yes_node: "vibration_issue",
    no_node: "check_temp",
  },
  vibration_issue: {
    question: "Did the vibration start suddenly?",
    yes_node: "sudden_vibration",
    no_node: "gradual_vibration",
  },
  sudden_vibration: {
    action: "🛑 STOP IMMEDIATELY. Possible flywheel damage, broken toggle, or tramp iron. Lock out and inspect before restarting.",
  },
  gradual_vibration: {
    action: "🔩 Likely worn bearings, loose foundation bolts, or unbalanced flywheel. Schedule shutdown for inspection. Check bearing temps.",
  },
  check_temp: {
    question: "Are bearing temperatures normal (<180°F)?",
    yes_node: "all_good",
    no_node: "high_temp",
  },
  high_temp: {
    question: "Is the lube oil level adequate?",
    yes_node: "oil_ok_hot",
    no_node: "low_oil",
  },
  low_oil: {
    action: "🛢️ Add oil to proper level immediately. Check for leaks at seals, fittings, and cooler lines. Sample oil for contamination.",
  },
  oil_ok_hot: {
    action: "🌡️ Oil level OK but running hot. Check oil cooler fan, clean cooler fins, verify oil viscosity grade. May need oil change.",
  },
  all_good: {
    action: "✅ Crusher operating normally. Continue monitoring. Log readings and schedule next PM interval.",
  },
  size_bad: {
    question: "Is the product too coarse?",
    yes_node: "too_coarse",
    no_node: "too_fine",
  },
  too_coarse: {
    question: "Have the liners been inspected recently?",
    yes_node: "liners_ok_coarse",
    no_node: "check_liners",
  },
  check_liners: {
    action: "🔍 Inspect mantle and concave wear. Replace if worn past 60%. Measure CSS and adjust to target setting.",
  },
  liners_ok_coarse: {
    action: "⚙️ Reduce CSS (closed side setting). Check for proper choke feed. Verify crusher speed matches spec for material type.",
  },
  too_fine: {
    action: "📐 Product too fine — increase CSS, reduce feed rate, or check for excessive liner wear creating over-crushing. Review screen sizing downstream.",
  },
};
