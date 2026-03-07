import { useState } from 'react';
import { AppLayout } from '@/components/app/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, Cable, CircuitBoard, AlertTriangle, CheckCircle2, Info,
  ChevronDown, ChevronRight, Network, Gauge, Droplets
} from 'lucide-react';
import { WiringDiagramSVG } from '@/components/diagnostics/WiringDiagramSVG';
import { VoltageResistanceChart } from '@/components/diagnostics/VoltageResistanceChart';
import HydraulicSchematic from '@/components/diagnostics/HydraulicSchematic';

interface ConnectorPinout {
  id: string;
  name: string;
  type: string;
  pins: { pin: string; wire: string; function: string; voltage?: string }[];
  notes?: string[];
}

const getWireColor = (wire: string): string => {
  const colorMap: Record<string, string> = {
    'RED': '#ef4444', 'BLACK': '#1f2937', 'ORANGE': '#f97316', 'GREEN': '#22c55e',
    'GREEN/WHITE': '#86efac', 'BLUE': '#3b82f6', 'PURPLE': '#a855f7', 'YELLOW': '#eab308',
    'BROWN': '#92400e', 'PINK': '#ec4899', 'TAN': '#d2b48c', 'WHITE': '#f5f5f5',
    'GRAY': '#6b7280', 'SHIELD': '#9ca3af',
  };
  return colorMap[wire.toUpperCase()] || '#6b7280';
};

const connectorPinouts: ConnectorPinout[] = [
  {
    id: 'hcm-main', name: 'HCM Main Connector (96-Pin)', type: 'Hydraulic Control Module',
    pins: [
      { pin: '1', wire: 'RED', function: 'Battery +12V/24V', voltage: '12-24V DC' },
      { pin: '2', wire: 'BLACK', function: 'Ground (Battery -)', voltage: '0V' },
      { pin: '3', wire: 'ORANGE', function: 'Ignition Switch Input', voltage: '12-24V when ON' },
      { pin: '4-5', wire: 'GREEN/WHITE', function: 'CAN High/Low', voltage: '2.5V nominal' },
      { pin: '10', wire: 'BLUE', function: 'Pump Pressure Sensor Signal', voltage: '0.5-4.5V' },
      { pin: '20-25', wire: 'VARIOUS', function: 'Solenoid Outputs (PWM)', voltage: '12-24V PWM' },
      { pin: '40', wire: 'PINK', function: 'Joystick X-Axis', voltage: '0.5-4.5V' },
      { pin: '41', wire: 'TAN', function: 'Joystick Y-Axis', voltage: '0.5-4.5V' },
    ],
    notes: ['Always disconnect battery before unplugging HCM connector', 'Apply dielectric grease to pins after cleaning']
  },
  {
    id: 'pressure-sensor', name: 'Pressure Sensor (3-Pin Deutsch)', type: 'Sensor',
    pins: [
      { pin: 'A', wire: 'BLACK', function: 'Ground', voltage: '0V' },
      { pin: 'B', wire: 'RED', function: '+5V Reference', voltage: '5V DC' },
      { pin: 'C', wire: 'GREEN', function: 'Signal Output', voltage: '0.5-4.5V' },
    ],
    notes: ['Signal should read ~0.5V at 0 PSI', 'Signal should read ~4.5V at max rated pressure']
  },
  {
    id: 'solenoid-valve', name: 'Solenoid Valve (2-Pin Deutsch)', type: 'Actuator',
    pins: [
      { pin: 'A', wire: 'RED', function: 'Power +', voltage: '12-24V PWM' },
      { pin: 'B', wire: 'BLACK', function: 'Ground', voltage: '0V' },
    ],
    notes: ['Coil resistance: typically 4-12Ω', 'Listen/feel for click when energized']
  },
];

const wiringDiagrams = [
  {
    id: 'power-distribution', title: 'Power Distribution System',
    description: 'Main power flow from batteries through fuses to control modules',
    components: ['Battery Bank', 'Master Disconnect Switch', 'Main Fuse Block', 'Control Modules'],
    troubleshootingTips: ['Check battery voltage first', 'Voltage drop test: <0.5V difference', 'Check all ground straps']
  },
  {
    id: 'can-bus', title: 'CAN Bus Network',
    description: 'Communication network connecting all electronic control modules',
    components: ['CAN High', 'CAN Low', 'Terminating Resistors (120Ω)', 'Node Connections'],
    troubleshootingTips: ['60Ω between CAN H and CAN L with both terminators', '120Ω means one terminator missing']
  },
];

const safetyGuidelines = [
  { title: 'Before Any Electrical Work', items: ['Disconnect battery negative first', 'Wait 30 seconds for capacitors to discharge', 'Use insulated tools'] },
  { title: 'During Testing', items: ['Never probe through wire insulation', 'Use proper test leads', 'Verify multimeter settings'] },
  { title: 'Reconnecting', items: ['Reconnect positive first, then negative', 'Check for sparks', 'Test all functions'] },
];

const ElectricalPage = () => {
  const [expandedPinout, setExpandedPinout] = useState<string | null>(null);

  return (
    <AppLayout title="Electrical Troubleshooting">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Electrical Troubleshooting</h1>
              <p className="text-muted-foreground">Wiring diagrams, connector pinouts, and diagnostic procedures</p>
            </div>
          </div>
        </div>

        <Card className="border-destructive/50 bg-destructive/5 mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />Electrical Safety Warning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Always follow proper lockout/tagout procedures.</p>
            <div className="grid sm:grid-cols-3 gap-4">
              {safetyGuidelines.map((section) => (
                <div key={section.title} className="bg-background/50 rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-2">{section.title}</h4>
                  <ul className="space-y-1">
                    {section.items.map((item, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                        <CheckCircle2 className="w-3 h-3 mt-0.5 text-primary shrink-0" />{item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="visual" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="visual" className="gap-2"><Network className="w-4 h-4" />Wiring</TabsTrigger>
            <TabsTrigger value="hydraulic" className="gap-2"><Droplets className="w-4 h-4" />Hydraulics</TabsTrigger>
            <TabsTrigger value="pinouts" className="gap-2"><Cable className="w-4 h-4" />Pinouts</TabsTrigger>
            <TabsTrigger value="reference" className="gap-2"><Gauge className="w-4 h-4" />V/Ω Ref</TabsTrigger>
            <TabsTrigger value="diagrams" className="gap-2"><CircuitBoard className="w-4 h-4" />Info</TabsTrigger>
          </TabsList>

          <TabsContent value="visual"><WiringDiagramSVG /></TabsContent>
          <TabsContent value="hydraulic"><HydraulicSchematic /></TabsContent>

          <TabsContent value="pinouts" className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Info className="w-4 h-4" /><span>Click on a connector to expand pinout details.</span>
            </div>
            {connectorPinouts.map((connector) => (
              <Card key={connector.id} className={`cursor-pointer transition-all ${expandedPinout === connector.id ? 'ring-2 ring-primary' : 'hover:border-primary/50'}`}
                onClick={() => setExpandedPinout(expandedPinout === connector.id ? null : connector.id)}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">{connector.type}</Badge>
                      <CardTitle className="text-lg">{connector.name}</CardTitle>
                    </div>
                    {expandedPinout === connector.id ? <ChevronDown className="w-5 h-5 text-muted-foreground" /> : <ChevronRight className="w-5 h-5 text-muted-foreground" />}
                  </div>
                </CardHeader>
                {expandedPinout === connector.id && (
                  <CardContent className="pt-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2 px-3 font-medium">Pin</th>
                            <th className="text-left py-2 px-3 font-medium">Wire</th>
                            <th className="text-left py-2 px-3 font-medium">Function</th>
                            <th className="text-left py-2 px-3 font-medium">Voltage</th>
                          </tr>
                        </thead>
                        <tbody>
                          {connector.pins.map((pin, idx) => (
                            <tr key={idx} className="border-b border-border/50 hover:bg-muted/50">
                              <td className="py-2 px-3 font-mono">{pin.pin}</td>
                              <td className="py-2 px-3">
                                <span className="inline-flex items-center gap-2">
                                  <span className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: getWireColor(pin.wire) }} />
                                  {pin.wire}
                                </span>
                              </td>
                              <td className="py-2 px-3">{pin.function}</td>
                              <td className="py-2 px-3 text-muted-foreground">{pin.voltage || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {connector.notes && (
                      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><Info className="w-4 h-4 text-primary" />Notes</h4>
                        <ul className="space-y-1">
                          {connector.notes.map((note, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2"><span className="text-primary">•</span>{note}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="reference"><VoltageResistanceChart /></TabsContent>

          <TabsContent value="diagrams" className="space-y-6">
            {wiringDiagrams.map((diagram) => (
              <Card key={diagram.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><CircuitBoard className="w-5 h-5 text-primary" />{diagram.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{diagram.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted/30 rounded-lg border border-border">
                    <h4 className="font-semibold text-sm mb-3">System Components</h4>
                    <div className="flex flex-wrap gap-2">
                      {diagram.components.map((component, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">{component}</Badge>
                          {idx < diagram.components.length - 1 && <span className="text-muted-foreground">→</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-2"><Zap className="w-4 h-4 text-primary" />Tips</h4>
                    <ul className="space-y-2">
                      {diagram.troubleshootingTips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />{tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default ElectricalPage;
