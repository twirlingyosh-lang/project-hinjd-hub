import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gauge, Thermometer, Zap, Activity, CircuitBoard, AlertTriangle } from 'lucide-react';

interface SensorSpec {
  name: string;
  type: string;
  voltageRange: string;
  resistanceRange: string;
  testConditions: string;
  normalReading: string;
  failureSymptoms: string[];
}

interface ComponentSpec {
  name: string;
  category: string;
  resistance: string;
  voltage: string;
  current: string;
  testProcedure: string;
  notes: string[];
}

const sensorSpecs: SensorSpec[] = [
  {
    name: 'Pressure Transducer (0-500 PSI)',
    type: 'Analog Sensor',
    voltageRange: '0.5V - 4.5V',
    resistanceRange: 'N/A (3-wire)',
    testConditions: '5V Reference Required',
    normalReading: '0.5V @ 0 PSI, 4.5V @ 500 PSI',
    failureSymptoms: ['Constant 0V or 5V', 'Erratic readings', 'No response to pressure change']
  },
  {
    name: 'Pressure Transducer (0-5000 PSI)',
    type: 'Analog Sensor',
    voltageRange: '0.5V - 4.5V',
    resistanceRange: 'N/A (3-wire)',
    testConditions: '5V Reference Required',
    normalReading: '0.5V @ 0 PSI, 4.5V @ 5000 PSI',
    failureSymptoms: ['Constant 0V or 5V', 'Erratic readings', 'No response to pressure change']
  },
  {
    name: 'Temperature Sensor (NTC)',
    type: 'Thermistor',
    voltageRange: '0.5V - 4.5V (sensor circuit)',
    resistanceRange: '2.5kΩ @ 20°C, 300Ω @ 80°C',
    testConditions: 'Measure cold and hot resistance',
    normalReading: 'Resistance decreases smoothly with temperature',
    failureSymptoms: ['Open circuit (infinite Ω)', 'Short circuit (0Ω)', 'Erratic readings']
  },
  {
    name: 'Temperature Sensor (PTC)',
    type: 'Thermistor',
    voltageRange: '0.5V - 4.5V (sensor circuit)',
    resistanceRange: '500Ω @ 20°C, 2kΩ @ 80°C',
    testConditions: 'Measure cold and hot resistance',
    normalReading: 'Resistance increases smoothly with temperature',
    failureSymptoms: ['Open circuit (infinite Ω)', 'Short circuit (0Ω)', 'Erratic readings']
  },
  {
    name: 'Coolant Temperature Sensor',
    type: 'NTC Thermistor',
    voltageRange: '0.5V - 4.5V',
    resistanceRange: '2.5kΩ @ 20°C, 250Ω @ 100°C',
    testConditions: '5V Reference through ECM pull-up',
    normalReading: '~3.5V cold, ~0.8V hot',
    failureSymptoms: ['Constant high or low reading', 'Slow response', 'No warm-up enrichment']
  },
  {
    name: 'Intake Air Temperature Sensor',
    type: 'NTC Thermistor',
    voltageRange: '0.5V - 4.5V',
    resistanceRange: '2.5kΩ @ 20°C, 300Ω @ 80°C',
    testConditions: '5V Reference through ECM pull-up',
    normalReading: 'Varies with ambient temperature',
    failureSymptoms: ['Incorrect fuel mixture', 'Poor cold start', 'Black smoke']
  },
  {
    name: 'Speed/Proximity Sensor (Magnetic)',
    type: 'VR Sensor',
    voltageRange: 'AC 0.5V - 50V (varies with speed)',
    resistanceRange: '200Ω - 2000Ω (coil)',
    testConditions: 'Measure resistance between pins',
    normalReading: 'No voltage at standstill, AC increases with speed',
    failureSymptoms: ['Open coil', 'Short to ground', 'Weak or no signal']
  },
  {
    name: 'Speed Sensor (Hall Effect)',
    type: 'Digital Sensor',
    voltageRange: '0V and 5V/12V square wave',
    resistanceRange: 'N/A (3-wire active)',
    testConditions: 'Power supply required',
    normalReading: 'Clean square wave, frequency proportional to speed',
    failureSymptoms: ['No output', 'Constant high or low', 'Noisy signal']
  },
  {
    name: 'Throttle Position Sensor',
    type: 'Potentiometer',
    voltageRange: '0.5V - 4.5V',
    resistanceRange: '1kΩ - 5kΩ (total)',
    testConditions: '5V Reference Required',
    normalReading: '0.5V closed, 4.5V wide open, smooth sweep',
    failureSymptoms: ['Dead spots', 'Voltage dropouts', 'Erratic idle']
  },
  {
    name: 'Joystick Controller',
    type: 'Dual Potentiometer',
    voltageRange: '0.5V - 4.5V per axis',
    resistanceRange: '5kΩ - 10kΩ (total per axis)',
    testConditions: '5V Reference per axis',
    normalReading: '2.5V center, smooth travel both directions',
    failureSymptoms: ['Dead zone', 'Non-linear response', 'Jitter at center']
  },
  {
    name: 'Fuel Rail Pressure Sensor',
    type: 'Analog Sensor',
    voltageRange: '0.5V - 4.5V',
    resistanceRange: 'N/A (3-wire)',
    testConditions: '5V Reference Required',
    normalReading: '~0.5V key off, 2.5-4V running',
    failureSymptoms: ['Hard start', 'Power loss', 'Rail pressure faults']
  },
  {
    name: 'Boost Pressure Sensor',
    type: 'MAP Sensor',
    voltageRange: '0.5V - 4.5V',
    resistanceRange: 'N/A (3-wire)',
    testConditions: '5V Reference Required',
    normalReading: '~1V at idle, 3-4V under boost',
    failureSymptoms: ['Overboosting', 'Underboosting', 'Black smoke']
  },
  {
    name: 'Oil Pressure Sensor',
    type: 'Analog Sensor',
    voltageRange: '0.5V - 4.5V',
    resistanceRange: 'N/A (3-wire)',
    testConditions: '5V Reference Required',
    normalReading: '~0.5V off, 2-4V running (pressure dependent)',
    failureSymptoms: ['Low pressure warning', 'Gauge inaccurate', 'Engine protection fault']
  },
  {
    name: 'Crankshaft Position Sensor',
    type: 'VR/Hall Effect',
    voltageRange: 'AC 1V - 50V (VR) or 0/5V (Hall)',
    resistanceRange: '500Ω - 1500Ω (VR type)',
    testConditions: 'Gap: 0.5mm - 1.5mm to reluctor',
    normalReading: 'Clean signal pattern during cranking',
    failureSymptoms: ['No start', 'Stalling', 'Misfire', 'Timing faults']
  },
  {
    name: 'Camshaft Position Sensor',
    type: 'VR/Hall Effect',
    voltageRange: 'AC 1V - 50V (VR) or 0/5V (Hall)',
    resistanceRange: '500Ω - 1500Ω (VR type)',
    testConditions: 'Gap: 0.5mm - 1.5mm to reluctor',
    normalReading: 'Clean signal synchronized with crank',
    failureSymptoms: ['No start', 'Rough running', 'Timing codes']
  },
  {
    name: 'DEF Level Sensor',
    type: 'Ultrasonic/Resistive',
    voltageRange: '0.5V - 4.5V',
    resistanceRange: 'Varies by type',
    testConditions: 'Tank temperature affects reading',
    normalReading: 'Linear with fluid level',
    failureSymptoms: ['Incorrect level display', 'DEF warning', 'Derate conditions']
  },
  {
    name: 'DPF Differential Pressure Sensor',
    type: 'Dual-port Pressure',
    voltageRange: '0.5V - 4.5V',
    resistanceRange: 'N/A (powered sensor)',
    testConditions: 'Engine running, compare inlet/outlet',
    normalReading: 'Low differential when clean, increases with soot',
    failureSymptoms: ['Regen issues', 'Power derate', 'DPF fault codes']
  },
];

const componentSpecs: ComponentSpec[] = [
  {
    name: 'Proportional Solenoid Valve',
    category: 'Hydraulic Actuator',
    resistance: '4Ω - 12Ω',
    voltage: '12V/24V PWM',
    current: '1A - 3A peak',
    testProcedure: 'Measure coil resistance. Apply voltage and check for click/movement.',
    notes: ['PWM frequency: 100-400Hz', 'Check for shorts to housing', 'Verify free movement of spool']
  },
  {
    name: 'On/Off Solenoid Valve',
    category: 'Hydraulic Actuator',
    resistance: '8Ω - 25Ω',
    voltage: '12V/24V DC',
    current: '0.5A - 2A',
    testProcedure: 'Measure coil resistance. Energize and listen for click.',
    notes: ['Should click audibly when energized', 'No click indicates stuck or bad coil', 'Check valve seat for debris']
  },
  {
    name: 'Transmission Shift Solenoid',
    category: 'Transmission',
    resistance: '15Ω - 35Ω',
    voltage: '12V DC',
    current: '0.3A - 0.8A',
    testProcedure: 'Measure resistance at TCM connector. Compare to spec.',
    notes: ['On/Off type', 'Quick cycling sound when shifting', 'Stuck solenoid causes harsh shifts']
  },
  {
    name: 'Transmission Pressure Control Solenoid',
    category: 'Transmission',
    resistance: '3Ω - 8Ω',
    voltage: '12V PWM',
    current: '0.5A - 1.5A avg',
    testProcedure: 'Measure resistance. Check PWM duty cycle with scope.',
    notes: ['Variable duty cycle control', 'Affects line pressure', 'Critical for smooth shifts']
  },
  {
    name: 'Torque Converter Clutch Solenoid',
    category: 'Transmission',
    resistance: '10Ω - 20Ω',
    voltage: '12V DC or PWM',
    current: '0.5A - 1A',
    testProcedure: 'Check resistance. Verify lockup engagement at correct speed.',
    notes: ['Engages at highway speeds', 'Shudder indicates worn clutch', 'Check brake switch input']
  },
  {
    name: 'Fuel Injector (Common Rail)',
    category: 'Fuel System',
    resistance: '0.5Ω - 2Ω',
    voltage: 'High voltage spike (>100V)',
    current: '15A - 25A peak, <1A hold',
    testProcedure: 'Measure resistance. Use noid light to check driver signal.',
    notes: ['Very low resistance normal', 'Requires injector driver circuit', 'Check return line for leaks']
  },
  {
    name: 'Fuel Injector (Conventional)',
    category: 'Fuel System',
    resistance: '12Ω - 16Ω',
    voltage: '12V pulsed',
    current: '0.75A - 1.5A',
    testProcedure: 'Measure resistance. Listen for click pattern.',
    notes: ['High impedance type', 'Even resistance across bank', 'Clean injector tips regularly']
  },
  {
    name: 'Glow Plug',
    category: 'Cold Start',
    resistance: '0.5Ω - 2Ω',
    voltage: '11V - 12V DC',
    current: '8A - 20A each',
    testProcedure: 'Measure resistance. Check current draw with clamp meter.',
    notes: ['Low resistance is normal', 'Open circuit = bad plug', 'Draws high current initially']
  },
  {
    name: 'Grid Heater',
    category: 'Cold Start',
    resistance: '0.1Ω - 0.5Ω',
    voltage: '12V/24V DC',
    current: '50A - 150A',
    testProcedure: 'Check relay operation. Measure heater element resistance.',
    notes: ['Very high current draw', 'Check relay contacts', 'Visible glow when working']
  },
  {
    name: 'Starter Motor',
    category: 'Starting System',
    resistance: '<0.1Ω (field coils)',
    voltage: '12V/24V DC',
    current: '150A - 500A cranking',
    testProcedure: 'Voltage drop test at battery and starter terminals.',
    notes: ['Max 0.5V drop on positive cable', 'Max 0.3V drop on ground', 'Check solenoid contacts']
  },
  {
    name: 'Alternator',
    category: 'Charging System',
    resistance: '2Ω - 5Ω (field)',
    voltage: '13.8V - 14.4V (12V sys)',
    current: '50A - 200A output',
    testProcedure: 'Check output voltage at battery. Load test output current.',
    notes: ['27.6V - 28.8V for 24V system', 'Check belt tension', 'Verify ground connections']
  },
  {
    name: 'EGR Valve (Electric)',
    category: 'Emissions',
    resistance: '3Ω - 8Ω (motor)',
    voltage: '12V PWM',
    current: '1A - 3A',
    testProcedure: 'Command open/closed with scan tool. Monitor position sensor.',
    notes: ['Check for carbon buildup', 'Position sensor: 0.5V-4.5V', 'Stuck open causes rough idle']
  },
  {
    name: 'VGT Actuator',
    category: 'Turbocharger',
    resistance: '2Ω - 6Ω',
    voltage: '12V PWM',
    current: '1A - 4A',
    testProcedure: 'Command position with scan tool. Check for binding.',
    notes: ['Electric or air actuated', 'Carbon causes sticking', 'Critical for boost control']
  },
  {
    name: 'DEF Injector',
    category: 'Aftertreatment',
    resistance: '1Ω - 3Ω',
    voltage: '12V pulsed',
    current: '2A - 5A',
    testProcedure: 'Check resistance. Verify spray pattern with test.',
    notes: ['Dosing valve', 'Crystallization causes blockage', 'Requires proper DEF quality']
  },
  {
    name: 'Electric Throttle Body',
    category: 'Engine Control',
    resistance: '1Ω - 5Ω (motor)',
    voltage: 'H-bridge DC motor control',
    current: '2A - 8A',
    testProcedure: 'Check motor and TPS circuits. Command with scan tool.',
    notes: ['Dual TPS for redundancy', 'Spring return to limp-home', 'Keep clean and calibrated']
  },
  {
    name: 'CAN Bus Terminating Resistor',
    category: 'Communication',
    resistance: '120Ω',
    voltage: 'N/A (passive)',
    current: 'N/A',
    testProcedure: 'Measure between CAN H and CAN L at bus ends.',
    notes: ['Total network: 60Ω (two 120Ω in parallel)', '120Ω = one terminator missing', '<60Ω = extra terminator']
  },
];

const canBusSpecs = [
  { parameter: 'CAN H Idle Voltage', value: '2.5V', tolerance: '±0.5V', notes: 'Measured with network active' },
  { parameter: 'CAN L Idle Voltage', value: '2.5V', tolerance: '±0.5V', notes: 'Measured with network active' },
  { parameter: 'CAN H Active (Dominant)', value: '3.5V', tolerance: '±0.5V', notes: 'During data transmission' },
  { parameter: 'CAN L Active (Dominant)', value: '1.5V', tolerance: '±0.5V', notes: 'During data transmission' },
  { parameter: 'Differential Voltage (Idle)', value: '0V', tolerance: '±0.5V', notes: 'H minus L at idle' },
  { parameter: 'Differential Voltage (Active)', value: '2.0V', tolerance: '±0.5V', notes: 'H minus L during transmission' },
  { parameter: 'Termination Resistance', value: '60Ω', tolerance: '±5Ω', notes: 'Two 120Ω resistors in parallel' },
  { parameter: 'Bus Capacitance', value: '<100pF/m', tolerance: 'Max', notes: 'Cable specification' },
  { parameter: 'J1939 Baud Rate', value: '250 kbps', tolerance: 'Fixed', notes: 'Heavy equipment standard' },
  { parameter: 'J1939 Bus Length', value: '<40m', tolerance: 'Max recommended', notes: 'With proper termination' },
];

const powerSystemSpecs = [
  { parameter: '12V Battery (Full)', value: '12.6V', min: '12.4V', max: '12.8V', notes: 'Open circuit, rested' },
  { parameter: '12V Battery (50%)', value: '12.0V', min: '11.9V', max: '12.2V', notes: 'Open circuit, rested' },
  { parameter: '12V Battery (Discharged)', value: '11.8V', min: 'N/A', max: '11.8V', notes: 'Needs charging' },
  { parameter: '12V Cranking Voltage', value: '>9.6V', min: '9.6V', max: '12V', notes: 'During engine crank' },
  { parameter: '12V Charging Voltage', value: '13.8-14.4V', min: '13.5V', max: '14.8V', notes: 'Engine running' },
  { parameter: '24V Battery (Full)', value: '25.2V', min: '24.8V', max: '25.6V', notes: 'Open circuit, rested' },
  { parameter: '24V Battery (50%)', value: '24.0V', min: '23.8V', max: '24.4V', notes: 'Open circuit, rested' },
  { parameter: '24V Cranking Voltage', value: '>19.2V', min: '19.2V', max: '24V', notes: 'During engine crank' },
  { parameter: '24V Charging Voltage', value: '27.6-28.8V', min: '27.0V', max: '29.5V', notes: 'Engine running' },
  { parameter: 'Voltage Drop (Power Cable)', value: '<0.5V', min: 'N/A', max: '0.5V', notes: 'Battery to module' },
  { parameter: 'Voltage Drop (Ground)', value: '<0.3V', min: 'N/A', max: '0.3V', notes: 'Module to battery negative' },
  { parameter: 'Ground Resistance', value: '<0.5Ω', min: 'N/A', max: '0.5Ω', notes: 'Good ground connection' },
];

export const VoltageResistanceChart = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="sensors" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="sensors" className="gap-2">
            <Gauge className="w-4 h-4" />
            Sensors
          </TabsTrigger>
          <TabsTrigger value="components" className="gap-2">
            <CircuitBoard className="w-4 h-4" />
            Components
          </TabsTrigger>
          <TabsTrigger value="can" className="gap-2">
            <Activity className="w-4 h-4" />
            CAN Bus
          </TabsTrigger>
          <TabsTrigger value="power" className="gap-2">
            <Zap className="w-4 h-4" />
            Power System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sensors" className="space-y-4">
          <Card className="bg-secondary/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Gauge className="w-5 h-5 text-primary" />
                Sensor Voltage & Resistance Specifications
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Reference values for common sensors found on heavy equipment
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left py-3 px-3 font-semibold">Sensor</th>
                      <th className="text-left py-3 px-3 font-semibold">Type</th>
                      <th className="text-left py-3 px-3 font-semibold">Voltage Range</th>
                      <th className="text-left py-3 px-3 font-semibold">Resistance</th>
                      <th className="text-left py-3 px-3 font-semibold">Normal Reading</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sensorSpecs.map((sensor, idx) => (
                      <tr key={idx} className="border-b border-border/50 hover:bg-muted/20">
                        <td className="py-3 px-3 font-medium">{sensor.name}</td>
                        <td className="py-3 px-3">
                          <Badge variant="outline" className="text-xs">{sensor.type}</Badge>
                        </td>
                        <td className="py-3 px-3 font-mono text-primary">{sensor.voltageRange}</td>
                        <td className="py-3 px-3 font-mono text-orange-400">{sensor.resistanceRange}</td>
                        <td className="py-3 px-3 text-muted-foreground text-xs">{sensor.normalReading}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg text-amber-500">
                <AlertTriangle className="w-5 h-5" />
                Sensor Failure Indicators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-3 bg-background/50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">Constant 0V</h4>
                  <p className="text-xs text-muted-foreground">Short to ground, open signal wire, or failed sensor ground circuit</p>
                </div>
                <div className="p-3 bg-background/50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">Constant 5V</h4>
                  <p className="text-xs text-muted-foreground">Open sensor (signal wire has pull-up), short to 5V reference</p>
                </div>
                <div className="p-3 bg-background/50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">Erratic Voltage</h4>
                  <p className="text-xs text-muted-foreground">Loose connection, corroded pins, damaged wire insulation, or EMI interference</p>
                </div>
                <div className="p-3 bg-background/50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">No 5V Reference</h4>
                  <p className="text-xs text-muted-foreground">ECM 5V supply overloaded (shorted sensor), fuse blown, ECM failure</p>
                </div>
                <div className="p-3 bg-background/50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">Infinite Resistance</h4>
                  <p className="text-xs text-muted-foreground">Open circuit in thermistor, broken wire, corroded connector</p>
                </div>
                <div className="p-3 bg-background/50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">0Ω Resistance</h4>
                  <p className="text-xs text-muted-foreground">Shorted sensor element, water intrusion, internal component failure</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="components" className="space-y-4">
          <Card className="bg-secondary/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CircuitBoard className="w-5 h-5 text-primary" />
                Component Electrical Specifications
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Resistance, voltage, and current values for actuators and control components
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left py-3 px-3 font-semibold">Component</th>
                      <th className="text-left py-3 px-3 font-semibold">Category</th>
                      <th className="text-left py-3 px-3 font-semibold">Resistance</th>
                      <th className="text-left py-3 px-3 font-semibold">Voltage</th>
                      <th className="text-left py-3 px-3 font-semibold">Current</th>
                    </tr>
                  </thead>
                  <tbody>
                    {componentSpecs.map((component, idx) => (
                      <tr key={idx} className="border-b border-border/50 hover:bg-muted/20">
                        <td className="py-3 px-3 font-medium">{component.name}</td>
                        <td className="py-3 px-3">
                          <Badge variant="secondary" className="text-xs">{component.category}</Badge>
                        </td>
                        <td className="py-3 px-3 font-mono text-orange-400">{component.resistance}</td>
                        <td className="py-3 px-3 font-mono text-primary">{component.voltage}</td>
                        <td className="py-3 px-3 font-mono text-green-400">{component.current}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="grid sm:grid-cols-2 gap-4">
            {componentSpecs.slice(0, 6).map((component, idx) => (
              <Card key={idx} className="bg-secondary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CircuitBoard className="w-4 h-4 text-primary" />
                    {component.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-xs text-muted-foreground">{component.testProcedure}</p>
                  <div className="space-y-1">
                    {component.notes.map((note, nidx) => (
                      <p key={nidx} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {note}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="can" className="space-y-4">
          <Card className="bg-secondary/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="w-5 h-5 text-primary" />
                CAN Bus Voltage Specifications
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                J1939 CAN bus voltage levels and network parameters
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left py-3 px-3 font-semibold">Parameter</th>
                      <th className="text-left py-3 px-3 font-semibold">Nominal Value</th>
                      <th className="text-left py-3 px-3 font-semibold">Tolerance</th>
                      <th className="text-left py-3 px-3 font-semibold">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {canBusSpecs.map((spec, idx) => (
                      <tr key={idx} className="border-b border-border/50 hover:bg-muted/20">
                        <td className="py-3 px-3 font-medium">{spec.parameter}</td>
                        <td className="py-3 px-3 font-mono text-primary">{spec.value}</td>
                        <td className="py-3 px-3 font-mono text-muted-foreground">{spec.tolerance}</td>
                        <td className="py-3 px-3 text-xs text-muted-foreground">{spec.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">CAN Bus Troubleshooting Quick Reference</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-background/50 rounded-lg">
                  <h4 className="font-semibold mb-2 text-green-400">60Ω Total</h4>
                  <p className="text-sm text-muted-foreground">Network properly terminated</p>
                </div>
                <div className="p-4 bg-background/50 rounded-lg">
                  <h4 className="font-semibold mb-2 text-amber-400">120Ω Total</h4>
                  <p className="text-sm text-muted-foreground">One terminating resistor missing</p>
                </div>
                <div className="p-4 bg-background/50 rounded-lg">
                  <h4 className="font-semibold mb-2 text-red-400">&lt;60Ω Total</h4>
                  <p className="text-sm text-muted-foreground">Extra terminator or short circuit</p>
                </div>
                <div className="p-4 bg-background/50 rounded-lg">
                  <h4 className="font-semibold mb-2 text-red-400">∞Ω (Open)</h4>
                  <p className="text-sm text-muted-foreground">Both terminators missing or broken bus</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="power" className="space-y-4">
          <Card className="bg-secondary/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="w-5 h-5 text-primary" />
                Power System Voltage Specifications
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Battery, charging, and power distribution reference values
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left py-3 px-3 font-semibold">Parameter</th>
                      <th className="text-left py-3 px-3 font-semibold">Nominal</th>
                      <th className="text-left py-3 px-3 font-semibold">Min</th>
                      <th className="text-left py-3 px-3 font-semibold">Max</th>
                      <th className="text-left py-3 px-3 font-semibold">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {powerSystemSpecs.map((spec, idx) => (
                      <tr key={idx} className="border-b border-border/50 hover:bg-muted/20">
                        <td className="py-3 px-3 font-medium">{spec.parameter}</td>
                        <td className="py-3 px-3 font-mono text-primary">{spec.value}</td>
                        <td className="py-3 px-3 font-mono text-green-400">{spec.min}</td>
                        <td className="py-3 px-3 font-mono text-amber-400">{spec.max}</td>
                        <td className="py-3 px-3 text-xs text-muted-foreground">{spec.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-red-500/10 to-transparent border-red-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Thermometer className="w-5 h-5 text-red-400" />
                  Voltage Drop Test
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Procedure:</h4>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Set multimeter to DC voltage</li>
                    <li>Connect meter between battery positive and module B+</li>
                    <li>Operate circuit at full load</li>
                    <li>Reading should be &lt;0.5V</li>
                    <li>Repeat for ground side (&lt;0.3V acceptable)</li>
                  </ol>
                </div>
                <div className="p-3 bg-background/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    <strong>Tip:</strong> High voltage drop indicates corroded connections, undersized wiring, or loose terminals.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  Ground Integrity Test
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Procedure:</h4>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Set multimeter to resistance (Ω)</li>
                    <li>Disconnect battery negative</li>
                    <li>Measure from module ground pin to battery negative post</li>
                    <li>Good: &lt;0.5Ω</li>
                    <li>Bad: &gt;1Ω indicates poor ground path</li>
                  </ol>
                </div>
                <div className="p-3 bg-background/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    <strong>Tip:</strong> Clean all ground studs and ensure star washers bite through paint.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
