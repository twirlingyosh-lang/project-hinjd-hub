import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gauge, Thermometer, Zap, Activity, CircuitBoard, AlertTriangle } from 'lucide-react';

interface VoltageResistanceChartProps {
  voltage: number;
  resistance: number;
  temperature: number;
  current: number;
  status: 'ok' | 'warning' | 'error';
}

export function VoltageResistanceChart({ voltage, resistance, temperature, current, status }: VoltageResistanceChartProps) {
  const statusColor = status === 'ok' ? 'green' : status === 'warning' ? 'amber' : 'red';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Voltage & Resistance Diagnostics</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="voltage" className="space-y-4">
          <TabsList>
            <TabsTrigger value="voltage"><Zap className="w-4 h-4 mr-2" />Voltage</TabsTrigger>
            <TabsTrigger value="resistance"><CircuitBoard className="w-4 h-4 mr-2" />Resistance</TabsTrigger>
            <TabsTrigger value="temperature"><Thermometer className="w-4 h-4 mr-2" />Temperature</TabsTrigger>
            <TabsTrigger value="current"><Activity className="w-4 h-4 mr-2" />Current</TabsTrigger>
          </TabsList>
          <TabsContent value="voltage">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-2xl font-semibold">{voltage} V</p>
                <p className="text-muted-foreground">Current Voltage Level</p>
              </div>
              <Gauge className={`w-8 h-8 text-${statusColor}-500`} />
            </div>
          </TabsContent>
          <TabsContent value="resistance">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-2xl font-semibold">{resistance} Ω</p>
                <p className="text-muted-foreground">Current Resistance Level</p>
              </div>
              <CircuitBoard className={`w-8 h-8 text-${statusColor}-500`} />
            </div>
          </TabsContent>
          <TabsContent value="temperature">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-2xl font-semibold">{temperature} °C</p>
                <p className="text-muted-foreground">Current Temperature</p>
              </div>
              <Thermometer className={`w-8 h-8 text-${statusColor}-500`} />
            </div>
          </TabsContent>
           <TabsContent value="current">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-2xl font-semibold">{current} A</p>
                <p className="text-muted-foreground">Current Amperage</p>
              </div>
              <Activity className={`w-8 h-8 text-${statusColor}-500`} />
            </div>
          </TabsContent>
        </Tabs>
        <div className="mt-4 flex items-center justify-end">
          {status !== 'ok' && (
            <Badge variant="destructive">
              <AlertTriangle className="w-4 h-4 mr-2" />
              {status.toUpperCase()}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
