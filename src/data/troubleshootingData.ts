export type EquipmentType = 'crusher' | 'screener';

export interface TroubleshootingStep {
  step: number;
  action: string;
  details: string;
  caution?: string;
}

export interface TroubleshootingIssue {
  id: string;
  title: string;
  symptoms: string[];
  possibleCauses: string[];
  steps: TroubleshootingStep[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  icon: string;
  description: string;
  issues: TroubleshootingIssue[];
}

export const crusherIssues: TroubleshootingIssue[] = [
  {
    id: 'crusher-no-start',
    title: 'Crusher Won\'t Start',
    symptoms: ['No response when start button pressed', 'No motor sounds', 'Control panel lights off'],
    possibleCauses: ['Power supply issue', 'Tripped breaker', 'Emergency stop engaged', 'Control system fault'],
    severity: 'high',
    steps: [
      { step: 1, action: 'Check Emergency Stop', details: 'Ensure all E-stop buttons are reset and in the released position. Twist clockwise to release.' },
      { step: 2, action: 'Verify Power Supply', details: 'Check main disconnect switch is in ON position. Verify incoming voltage at main panel.' },
      { step: 3, action: 'Inspect Circuit Breakers', details: 'Check all breakers in MCC panel. Reset any tripped breakers after investigating cause.', caution: 'Do not reset breakers multiple times - investigate root cause if breaker trips again.' },
      { step: 4, action: 'Check Control Voltage', details: 'Verify 120V control voltage is present. Check control transformer fuses.' },
      { step: 5, action: 'Review Fault Codes', details: 'Check PLC/HMI for any fault codes. Note all codes for troubleshooting.' },
    ]
  },
  {
    id: 'crusher-vibration',
    title: 'Excessive Vibration',
    symptoms: ['Unusual shaking', 'Loud rumbling noise', 'Visible machine movement', 'Bolts loosening'],
    possibleCauses: ['Unbalanced flywheel', 'Worn bearings', 'Loose mounting bolts', 'Bent shaft', 'Foreign material in chamber'],
    severity: 'critical',
    steps: [
      { step: 1, action: 'Stop Equipment Immediately', details: 'Shut down crusher and allow to coast to complete stop.', caution: 'Do not attempt to operate until issue is resolved - severe damage may occur.' },
      { step: 2, action: 'Visual Inspection', details: 'Check for loose or missing bolts on base frame and motor mounts. Look for cracks in frame.' },
      { step: 3, action: 'Check Flywheel', details: 'Inspect flywheel for damage, missing counterweights, or loose hub bolts.' },
      { step: 4, action: 'Inspect Bearings', details: 'Check bearing temperature (should be <180°F). Listen for grinding sounds during slow rotation.' },
      { step: 5, action: 'Clear Chamber', details: 'Remove any tramp iron or foreign objects from crushing chamber.' },
      { step: 6, action: 'Contact Support', details: 'If vibration persists after basic checks, contact equipment dealer for vibration analysis.' },
    ]
  },
  {
    id: 'crusher-low-production',
    title: 'Low Production Output',
    symptoms: ['Reduced throughput', 'Product size too large', 'Feed material bridging', 'Slow processing'],
    possibleCauses: ['Worn liners', 'Incorrect CSS setting', 'Feed issues', 'Wet/sticky material', 'Belt slippage'],
    severity: 'medium',
    steps: [
      { step: 1, action: 'Check Liner Wear', details: 'Inspect mantle and concave liners. Replace if wear exceeds 75% of original thickness.' },
      { step: 2, action: 'Verify CSS Setting', details: 'Measure closed side setting with lead balls or measuring tool. Adjust if outside specifications.' },
      { step: 3, action: 'Inspect Feed Arrangement', details: 'Ensure material is centered in feed opening. Check for bridging at feed hopper.' },
      { step: 4, action: 'Check Belt Tension', details: 'Verify drive belt tension. Adjust per manufacturer specifications if slipping.' },
      { step: 5, action: 'Review Operating Parameters', details: 'Confirm crusher is running at correct RPM. Check hydraulic pressure readings.' },
    ]
  },
  {
    id: 'crusher-overheating',
    title: 'Overheating Issues',
    symptoms: ['High bearing temperature', 'Oil temperature alarm', 'Smoke or burning smell', 'Thermal shutdown'],
    possibleCauses: ['Low oil level', 'Contaminated oil', 'Cooling system failure', 'Overloading', 'Blocked airflow'],
    severity: 'critical',
    steps: [
      { step: 1, action: 'Shut Down and Cool', details: 'Stop crusher and allow to cool for 30+ minutes before inspection.', caution: 'Hot surfaces can cause severe burns. Use PPE.' },
      { step: 2, action: 'Check Oil Level', details: 'Verify oil level in reservoir is between min and max marks.' },
      { step: 3, action: 'Inspect Cooling System', details: 'Clean oil cooler fins. Verify cooling fan operation. Check for blocked airflow.' },
      { step: 4, action: 'Oil Condition', details: 'Take oil sample for analysis. Look for metal particles, water contamination, or discoloration.' },
      { step: 5, action: 'Check Feed Rate', details: 'Reduce feed rate if consistently overloading. Verify feed material meets specifications.' },
    ]
  },
];

export const screenerIssues: TroubleshootingIssue[] = [
  {
    id: 'screener-blinding',
    title: 'Screen Blinding/Plugging',
    symptoms: ['Material not passing through', 'Buildup on screen surface', 'Reduced screening efficiency', 'Carryover of fines'],
    possibleCauses: ['Near-size particles', 'Wet or sticky material', 'Incorrect screen media', 'Low vibration amplitude'],
    severity: 'medium',
    steps: [
      { step: 1, action: 'Check Material Moisture', details: 'Test feed material moisture content. Consider adding drying or heating if consistently wet.' },
      { step: 2, action: 'Inspect Screen Media', details: 'Verify correct mesh/aperture size for application. Consider self-cleaning or anti-blinding media.' },
      { step: 3, action: 'Adjust Amplitude', details: 'Increase vibration amplitude if possible. Check vibrator weights are set correctly.' },
      { step: 4, action: 'Add Cleaning Devices', details: 'Install ball trays, brush systems, or air cannons to help keep screens clear.' },
      { step: 5, action: 'Review Screen Angle', details: 'Adjust deck angle to increase material velocity across screen surface.' },
    ]
  },
  {
    id: 'screener-no-vibration',
    title: 'No Vibration/Motion',
    symptoms: ['Screen deck not moving', 'Motor running but no movement', 'Grinding noise from vibrator'],
    possibleCauses: ['Broken drive belts', 'Seized bearings', 'Damaged vibrator mechanism', 'Electrical fault'],
    severity: 'high',
    steps: [
      { step: 1, action: 'Check Drive System', details: 'Inspect drive belts for wear, damage, or breakage. Replace if necessary.' },
      { step: 2, action: 'Listen for Bearing Noise', details: 'With motor off, try to rotate vibrator shaft by hand. Should turn freely.', caution: 'Lock out/tag out before checking rotating components.' },
      { step: 3, action: 'Inspect Vibrator Unit', details: 'Check for oil leaks around vibrator housing. Verify oil level in sight glass.' },
      { step: 4, action: 'Check Motor Amperage', details: 'Compare running amps to nameplate. High amps may indicate mechanical binding.' },
      { step: 5, action: 'Inspect Springs', details: 'Check all support springs for damage or fatigue. Replace any broken springs as a complete set.' },
    ]
  },
  {
    id: 'screener-torn-media',
    title: 'Premature Screen Media Wear/Tearing',
    symptoms: ['Holes in screen media', 'Torn edges', 'Frequent replacements needed', 'Contaminated product'],
    possibleCauses: ['Incorrect media selection', 'Improper tensioning', 'Impact damage', 'Abrasive material', 'Support bar wear'],
    severity: 'medium',
    steps: [
      { step: 1, action: 'Inspect Support Structure', details: 'Check cross supports and stringers for wear. Replace worn support bars before installing new media.' },
      { step: 2, action: 'Verify Tension', details: 'Check screen tension - should be drum-tight. Re-tension loose screens per manufacturer specs.' },
      { step: 3, action: 'Review Media Selection', details: 'Ensure media material and wire diameter is appropriate for application abrasiveness.' },
      { step: 4, action: 'Check Feed Drop Height', details: 'Reduce impact by lowering feed chute or adding rock box at feed point.' },
      { step: 5, action: 'Install Wear Liners', details: 'Add liner plates at high-wear areas like feed end and discharge lips.' },
    ]
  },
  {
    id: 'screener-misclassification',
    title: 'Poor Separation/Misclassification',
    symptoms: ['Oversize in undersize', 'Undersize in oversize', 'Inconsistent product gradation', 'Poor efficiency readings'],
    possibleCauses: ['Wrong screen opening size', 'Overloading', 'Improper stroke/speed', 'Worn screens', 'Deck angle issues'],
    severity: 'low',
    steps: [
      { step: 1, action: 'Verify Screen Opening', details: 'Measure actual screen openings. Replace if worn beyond acceptable tolerance.' },
      { step: 2, action: 'Check Feed Rate', details: 'Reduce feed rate if bed depth exceeds 4x largest particle size. Material should flow, not flood.' },
      { step: 3, action: 'Adjust Stroke/Speed', details: 'Review manufacturer recommendations for optimal settings based on material characteristics.' },
      { step: 4, action: 'Set Proper Angle', details: 'Adjust deck angle: steeper for finer cuts, flatter for coarser material.' },
      { step: 5, action: 'Run Efficiency Test', details: 'Sample products and perform sieve analysis to quantify actual efficiency vs target.' },
    ]
  },
];

export const equipmentList: Equipment[] = [
  {
    id: 'jaw-crusher',
    name: 'Jaw Crusher',
    type: 'crusher',
    icon: '⚙️',
    description: 'Primary crushing for large rocks and quarry applications',
    issues: crusherIssues,
  },
  {
    id: 'cone-crusher',
    name: 'Cone Crusher',
    type: 'crusher',
    icon: '🔩',
    description: 'Secondary and tertiary crushing for aggregate production',
    issues: crusherIssues,
  },
  {
    id: 'impact-crusher',
    name: 'Impact Crusher',
    type: 'crusher',
    icon: '💥',
    description: 'Reduction crushing using impact force for softer materials',
    issues: crusherIssues,
  },
  {
    id: 'vibrating-screen',
    name: 'Vibrating Screen',
    type: 'screener',
    icon: '📊',
    description: 'Multi-deck screening for material classification',
    issues: screenerIssues,
  },
  {
    id: 'horizontal-screen',
    name: 'Horizontal Screen',
    type: 'screener',
    icon: '➡️',
    description: 'High-capacity horizontal screening applications',
    issues: screenerIssues,
  },
  {
    id: 'inclined-screen',
    name: 'Inclined Screen',
    type: 'screener',
    icon: '📐',
    description: 'Traditional inclined screening for general aggregate',
    issues: screenerIssues,
  },
];
