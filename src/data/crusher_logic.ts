export interface DiagnosticNode {
  question?: string;
  action?: string;
  yes_node?: string;
  no_node?: string;
}

export const CrusherDiagnostics: Record<string, DiagnosticNode> = {
  root: {
    question: "Is the machine powered on?",
    yes_node: "check_faults",
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
    action: "⚠️ Short circuit or ground fault detected. Inspect motor windings and cabling. Do NOT re-energize until fault is cleared.",
  },
  breaker_fixed: {
    action: "✅ Breaker reset successful. Monitor for 30 minutes under load before resuming normal operation.",
  },
  check_supply: {
    action: "🔌 No incoming power. Check utility feed, transfer switch, and generator status. Verify voltage at main disconnect.",
  },
  check_faults: {
    question: "Are there any fault codes on the PLC?",
    yes_node: "consult_manual",
    no_node: "check_hydraulics",
  },
  consult_manual: {
    action: "📖 Fault code detected. Record the code, cross-reference with the OEM manual, and follow the prescribed corrective action before restarting.",
  },

  // === Hydraulic System Branch ===
  check_hydraulics: {
    question: "Is the hydraulic system pressurized?",
    yes_node: "hyd_pressure_ok",
    no_node: "hyd_no_pressure",
  },
  hyd_no_pressure: {
    question: "Is the hydraulic pump running?",
    yes_node: "hyd_pump_running_no_pressure",
    no_node: "hyd_pump_not_running",
  },
  hyd_pump_not_running: {
    question: "Is the pump motor getting power?",
    yes_node: "hyd_pump_seized",
    no_node: "hyd_pump_electrical",
  },
  hyd_pump_electrical: {
    action: "⚡ No power to hydraulic pump motor. Check pump motor starter, overloads, and control wiring. Verify PLC output for pump start command.",
  },
  hyd_pump_seized: {
    action: "🔧 Pump motor energized but not turning. Possible seized pump or coupling failure. Lock out, disconnect coupling, and try to rotate pump shaft by hand.",
  },
  hyd_pump_running_no_pressure: {
    question: "Is the hydraulic reservoir oil level adequate?",
    yes_node: "hyd_oil_ok_no_pressure",
    no_node: "hyd_low_oil",
  },
  hyd_low_oil: {
    action: "🛢️ Low hydraulic oil. Refill to proper level with correct fluid grade. Inspect for leaks at cylinders, hoses, fittings, and pump seals before restarting.",
  },
  hyd_oil_ok_no_pressure: {
    question: "Is the relief valve set correctly?",
    yes_node: "hyd_internal_failure",
    no_node: "hyd_relief_valve",
  },
  hyd_relief_valve: {
    action: "⚙️ Relief valve may be stuck open or set too low. Adjust to manufacturer spec. If stuck, remove, clean, or replace the valve cartridge.",
  },
  hyd_internal_failure: {
    action: "🚨 Pump running, oil level OK, relief set — likely internal pump wear or failure. Pull pump, inspect vanes/gears/pistons. Replace pump assembly.",
  },
  hyd_pressure_ok: {
    question: "Are hydraulic cylinders responding correctly?",
    yes_node: "hyd_system_good",
    no_node: "hyd_cylinder_issue",
  },
  hyd_cylinder_issue: {
    question: "Is the cylinder drifting or moving slowly?",
    yes_node: "hyd_cylinder_drift",
    no_node: "hyd_cylinder_stuck",
  },
  hyd_cylinder_drift: {
    question: "Does the cylinder hold when the valve is centered?",
    yes_node: "hyd_valve_leak",
    no_node: "hyd_seal_failure",
  },
  hyd_valve_leak: {
    action: "🔄 Directional valve leaking internally. Replace or rebuild the spool valve. Check for contamination in hydraulic fluid.",
  },
  hyd_seal_failure: {
    action: "🔩 Cylinder seal failure — cylinder drifts with valve centered. Remove cylinder, replace piston seals and rod seal. Check rod for scoring.",
  },
  hyd_cylinder_stuck: {
    question: "Is the solenoid valve energizing?",
    yes_node: "hyd_valve_stuck",
    no_node: "hyd_solenoid_fault",
  },
  hyd_solenoid_fault: {
    action: "⚡ Solenoid not energizing. Check PLC output, solenoid coil resistance, and connector wiring. Replace coil if open circuit.",
  },
  hyd_valve_stuck: {
    action: "🔧 Valve solenoid energized but spool not shifting. Possible contamination or spool seizure. Remove valve, clean or replace. Flush system and change filters.",
  },
  hyd_system_good: {
    question: "Is the hydraulic oil temperature normal (<150°F)?",
    yes_node: "hyd_all_clear",
    no_node: "hyd_overtemp",
  },
  hyd_overtemp: {
    question: "Is the oil cooler fan running?",
    yes_node: "hyd_cooler_blocked",
    no_node: "hyd_cooler_fan",
  },
  hyd_cooler_fan: {
    action: "🌡️ Cooler fan not running. Check fan motor, thermostat switch, and wiring. Clean cooler core of debris.",
  },
  hyd_cooler_blocked: {
    action: "🌡️ Fan running but oil still hot. Clean cooler fins, check for restricted flow. Verify oil viscosity grade. Consider adding auxiliary cooling.",
  },
  hyd_all_clear: {
    question: "Is the crusher motor running?",
    yes_node: "motor_running",
    no_node: "motor_not_running",
  },

  // === Motor & Operation Branch ===
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
