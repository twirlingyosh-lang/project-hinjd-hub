import { useState, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Info, Download, Printer } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas';


interface WireConnection {
  id: string;
  from: string;
  to: string;
  color: string;
  label: string;
  type: 'can' | 'power' | 'ground' | 'signal' | 'data';
}

interface Module {
  id: string;
  name: string;
  shortName: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  pins: { id: string; label: string; side: 'left' | 'right' | 'top' | 'bottom'; position: number }[];
}

interface BrandDiagram {
  id: string;
  name: string;
  description: string;
  modules: Module[];
  wires: WireConnection[];
}

// Generic control modules shared across brands
const createGenericModules = (): Module[] => [
  {
    id: 'ecm',
    name: 'Engine Control Module',
    shortName: 'ECM',
    x: 50,
    y: 200,
    width: 120,
    height: 160,
    color: 'hsl(25, 95%, 53%)',
    pins: [
      { id: 'ecm-can-h', label: 'CAN H', side: 'right', position: 0.15 },
      { id: 'ecm-can-l', label: 'CAN L', side: 'right', position: 0.25 },
      { id: 'ecm-pwr', label: 'B+', side: 'top', position: 0.3 },
      { id: 'ecm-gnd', label: 'GND', side: 'top', position: 0.7 },
      { id: 'ecm-throttle', label: 'THR', side: 'right', position: 0.45 },
      { id: 'ecm-torque', label: 'TRQ', side: 'right', position: 0.55 },
      { id: 'ecm-speed', label: 'SPD', side: 'right', position: 0.70 },
      { id: 'ecm-hcm', label: 'HYD', side: 'bottom', position: 0.5 },
    ]
  },
  {
    id: 'tcm',
    name: 'Transmission Control Module',
    shortName: 'TCM',
    x: 220,
    y: 200,
    width: 120,
    height: 160,
    color: 'hsl(200, 80%, 50%)',
    pins: [
      { id: 'tcm-can-h', label: 'CAN H', side: 'left', position: 0.15 },
      { id: 'tcm-can-l', label: 'CAN L', side: 'left', position: 0.25 },
      { id: 'tcm-can-h-r', label: 'CAN H', side: 'right', position: 0.15 },
      { id: 'tcm-can-l-r', label: 'CAN L', side: 'right', position: 0.25 },
      { id: 'tcm-pwr', label: 'B+', side: 'top', position: 0.3 },
      { id: 'tcm-gnd', label: 'GND', side: 'top', position: 0.7 },
      { id: 'tcm-throttle', label: 'THR', side: 'left', position: 0.45 },
      { id: 'tcm-torque', label: 'TRQ', side: 'left', position: 0.55 },
      { id: 'tcm-speed', label: 'SPD', side: 'left', position: 0.70 },
      { id: 'tcm-dcm', label: 'DRV', side: 'bottom', position: 0.5 },
    ]
  },
  {
    id: 'hcm',
    name: 'Hydraulic Control Module',
    shortName: 'HCM',
    x: 50,
    y: 450,
    width: 120,
    height: 140,
    color: 'hsl(280, 70%, 50%)',
    pins: [
      { id: 'hcm-can-h', label: 'CAN H', side: 'right', position: 0.2 },
      { id: 'hcm-can-l', label: 'CAN L', side: 'right', position: 0.35 },
      { id: 'hcm-pwr', label: 'B+', side: 'top', position: 0.3 },
      { id: 'hcm-gnd', label: 'GND', side: 'top', position: 0.7 },
      { id: 'hcm-pump', label: 'PUMP', side: 'left', position: 0.4 },
      { id: 'hcm-valve', label: 'VALVE', side: 'left', position: 0.6 },
      { id: 'hcm-joy', label: 'JOY', side: 'bottom', position: 0.5 },
    ]
  },
  {
    id: 'dcm',
    name: 'Drive Control Module',
    shortName: 'DCM',
    x: 220,
    y: 450,
    width: 120,
    height: 140,
    color: 'hsl(340, 70%, 50%)',
    pins: [
      { id: 'dcm-can-h', label: 'CAN H', side: 'left', position: 0.2 },
      { id: 'dcm-can-l', label: 'CAN L', side: 'left', position: 0.35 },
      { id: 'dcm-can-h-r', label: 'CAN H', side: 'right', position: 0.2 },
      { id: 'dcm-can-l-r', label: 'CAN L', side: 'right', position: 0.35 },
      { id: 'dcm-pwr', label: 'B+', side: 'top', position: 0.3 },
      { id: 'dcm-gnd', label: 'GND', side: 'top', position: 0.7 },
      { id: 'dcm-motor', label: 'MTR', side: 'bottom', position: 0.3 },
      { id: 'dcm-brake', label: 'BRK', side: 'bottom', position: 0.7 },
    ]
  },
  {
    id: 'telematics',
    name: 'Telematics Module',
    shortName: 'TLM',
    x: 390,
    y: 200,
    width: 120,
    height: 160,
    color: 'hsl(142, 71%, 45%)',
    pins: [
      { id: 'tlm-can-h', label: 'CAN H', side: 'left', position: 0.15 },
      { id: 'tlm-can-l', label: 'CAN L', side: 'left', position: 0.25 },
      { id: 'tlm-can-h-r', label: 'CAN H', side: 'right', position: 0.15 },
      { id: 'tlm-can-l-r', label: 'CAN L', side: 'right', position: 0.25 },
      { id: 'tlm-pwr', label: 'B+', side: 'top', position: 0.3 },
      { id: 'tlm-gnd', label: 'GND', side: 'top', position: 0.7 },
      { id: 'tlm-gps', label: 'GPS', side: 'right', position: 0.5 },
      { id: 'tlm-cell', label: 'CELL', side: 'right', position: 0.7 },
      { id: 'tlm-io', label: 'I/O', side: 'bottom', position: 0.5 },
    ]
  },
  {
    id: 'battery',
    name: 'Battery Bank',
    shortName: '24V',
    x: 220,
    y: 50,
    width: 120,
    height: 60,
    color: 'hsl(0, 72%, 51%)',
    pins: [
      { id: 'bat-pos', label: '+', side: 'bottom', position: 0.3 },
      { id: 'bat-neg', label: '-', side: 'bottom', position: 0.7 },
    ]
  },
];

const createPeripherals = (): Module[] => [
  {
    id: 'gps-antenna',
    name: 'GPS Antenna',
    shortName: 'GPS',
    x: 540,
    y: 200,
    width: 70,
    height: 45,
    color: 'hsl(45, 93%, 47%)',
    pins: [
      { id: 'gps-sig', label: 'SIG', side: 'left', position: 0.5 },
    ]
  },
  {
    id: 'cell-antenna',
    name: 'Cellular Antenna',
    shortName: 'CELL',
    x: 540,
    y: 270,
    width: 70,
    height: 45,
    color: 'hsl(45, 93%, 47%)',
    pins: [
      { id: 'cell-sig', label: 'SIG', side: 'left', position: 0.5 },
    ]
  },
  {
    id: 'joystick',
    name: 'Joystick Controller',
    shortName: 'JOY',
    x: 50,
    y: 630,
    width: 90,
    height: 50,
    color: 'hsl(180, 60%, 45%)',
    pins: [
      { id: 'joy-sig', label: 'SIG', side: 'top', position: 0.5 },
    ]
  },
  {
    id: 'pump',
    name: 'Hydraulic Pump',
    shortName: 'PUMP',
    x: 390,
    y: 450,
    width: 90,
    height: 50,
    color: 'hsl(220, 60%, 55%)',
    pins: [
      { id: 'pump-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
    ]
  },
  {
    id: 'motor',
    name: 'Drive Motor',
    shortName: 'MOTOR',
    x: 220,
    y: 630,
    width: 90,
    height: 50,
    color: 'hsl(220, 60%, 55%)',
    pins: [
      { id: 'motor-pwr', label: 'PWR', side: 'top', position: 0.5 },
    ]
  },
  {
    id: 'can-term-1',
    name: 'CAN Terminator',
    shortName: '120Ω',
    x: 540,
    y: 340,
    width: 60,
    height: 35,
    color: 'hsl(220, 13%, 30%)',
    pins: [
      { id: 'term1-h', label: 'H', side: 'left', position: 0.35 },
      { id: 'term1-l', label: 'L', side: 'left', position: 0.65 },
    ]
  },
];

const createBaseWires = (): WireConnection[] => [
  // Main CAN Bus
  { id: 'can-h-1', from: 'ecm-can-h', to: 'tcm-can-h', color: '#22c55e', label: 'CAN H (Green)', type: 'can' },
  { id: 'can-h-2', from: 'tcm-can-h-r', to: 'tlm-can-h', color: '#22c55e', label: 'CAN H (Green)', type: 'can' },
  { id: 'can-l-1', from: 'ecm-can-l', to: 'tcm-can-l', color: '#22c55e', label: 'CAN L (Green/White)', type: 'can' },
  { id: 'can-l-2', from: 'tcm-can-l-r', to: 'tlm-can-l', color: '#22c55e', label: 'CAN L (Green/White)', type: 'can' },
  
  // HCM/DCM CAN connections
  { id: 'can-h-hcm', from: 'hcm-can-h', to: 'dcm-can-h', color: '#22c55e', label: 'CAN H (Green)', type: 'can' },
  { id: 'can-l-hcm', from: 'hcm-can-l', to: 'dcm-can-l', color: '#22c55e', label: 'CAN L (Green/White)', type: 'can' },
  { id: 'can-h-dcm-tlm', from: 'dcm-can-h-r', to: 'tlm-can-h-r', color: '#22c55e', label: 'CAN H (Green)', type: 'can' },
  { id: 'can-l-dcm-tlm', from: 'dcm-can-l-r', to: 'tlm-can-l-r', color: '#22c55e', label: 'CAN L (Green/White)', type: 'can' },
  
  // CAN Terminators
  { id: 'term1-h-conn', from: 'term1-h', to: 'tlm-can-h-r', color: '#22c55e', label: 'CAN H Term', type: 'can' },
  { id: 'term1-l-conn', from: 'term1-l', to: 'tlm-can-l-r', color: '#22c55e', label: 'CAN L Term', type: 'can' },
  
  // Power distribution
  { id: 'pwr-ecm', from: 'bat-pos', to: 'ecm-pwr', color: '#ef4444', label: 'B+ (Red)', type: 'power' },
  { id: 'pwr-tcm', from: 'bat-pos', to: 'tcm-pwr', color: '#ef4444', label: 'B+ (Red)', type: 'power' },
  { id: 'pwr-tlm', from: 'bat-pos', to: 'tlm-pwr', color: '#ef4444', label: 'B+ (Red)', type: 'power' },
  { id: 'pwr-hcm', from: 'bat-pos', to: 'hcm-pwr', color: '#ef4444', label: 'B+ (Red)', type: 'power' },
  { id: 'pwr-dcm', from: 'bat-pos', to: 'dcm-pwr', color: '#ef4444', label: 'B+ (Red)', type: 'power' },
  
  // Ground distribution
  { id: 'gnd-ecm', from: 'bat-neg', to: 'ecm-gnd', color: '#1f2937', label: 'GND (Black)', type: 'ground' },
  { id: 'gnd-tcm', from: 'bat-neg', to: 'tcm-gnd', color: '#1f2937', label: 'GND (Black)', type: 'ground' },
  { id: 'gnd-tlm', from: 'bat-neg', to: 'tlm-gnd', color: '#1f2937', label: 'GND (Black)', type: 'ground' },
  { id: 'gnd-hcm', from: 'bat-neg', to: 'hcm-gnd', color: '#1f2937', label: 'GND (Black)', type: 'ground' },
  { id: 'gnd-dcm', from: 'bat-neg', to: 'dcm-gnd', color: '#1f2937', label: 'GND (Black)', type: 'ground' },
  
  // Data signals
  { id: 'throttle', from: 'ecm-throttle', to: 'tcm-throttle', color: '#a855f7', label: 'Throttle Position (Purple)', type: 'signal' },
  { id: 'torque', from: 'ecm-torque', to: 'tcm-torque', color: '#3b82f6', label: 'Torque Request (Blue)', type: 'signal' },
  { id: 'speed', from: 'ecm-speed', to: 'tcm-speed', color: '#eab308', label: 'Vehicle Speed (Yellow)', type: 'signal' },
  
  // HCM signals
  { id: 'ecm-hcm-sig', from: 'ecm-hcm', to: 'hcm-pwr', color: '#a855f7', label: 'Hydraulic Enable (Purple)', type: 'signal' },
  { id: 'joy-hcm', from: 'joy-sig', to: 'hcm-joy', color: '#06b6d4', label: 'Joystick Signal (Cyan)', type: 'signal' },
  { id: 'hcm-pump', from: 'hcm-pump', to: 'pump-ctrl', color: '#f97316', label: 'Pump Control (Orange)', type: 'signal' },
  
  // DCM signals
  { id: 'tcm-dcm-sig', from: 'tcm-dcm', to: 'dcm-pwr', color: '#3b82f6', label: 'Drive Command (Blue)', type: 'signal' },
  { id: 'dcm-motor', from: 'dcm-motor', to: 'motor-pwr', color: '#f97316', label: 'Motor Power (Orange)', type: 'power' },
  
  // Antenna connections
  { id: 'gps-conn', from: 'tlm-gps', to: 'gps-sig', color: '#f97316', label: 'GPS Coax', type: 'data' },
  { id: 'cell-conn', from: 'tlm-cell', to: 'cell-sig', color: '#f97316', label: 'Cellular Coax', type: 'data' },
];

// Brand-specific configurations
const brandDiagrams: BrandDiagram[] = [
  {
    id: 'metso',
    name: 'Metso',
    description: 'Lokotrack & Nordberg series crushers and screeners with IC700 control system',
    modules: [
      ...createGenericModules(),
      {
        id: 'ic700',
        name: 'IC700 Controller',
        shortName: 'IC700',
        x: 390,
        y: 450,
        width: 120,
        height: 120,
        color: 'hsl(210, 90%, 45%)',
        pins: [
          { id: 'ic700-can-h', label: 'CAN H', side: 'left', position: 0.15 },
          { id: 'ic700-can-l', label: 'CAN L', side: 'left', position: 0.30 },
          { id: 'ic700-pwr', label: 'B+', side: 'top', position: 0.3 },
          { id: 'ic700-gnd', label: 'GND', side: 'top', position: 0.7 },
          { id: 'ic700-feeder', label: 'FDR', side: 'right', position: 0.3 },
          { id: 'ic700-crusher', label: 'CRSH', side: 'right', position: 0.5 },
          { id: 'ic700-conv', label: 'CONV', side: 'right', position: 0.7 },
        ]
      },
      {
        id: 'vfd-crusher',
        name: 'Crusher VFD',
        shortName: 'VFD-C',
        x: 540,
        y: 420,
        width: 80,
        height: 60,
        color: 'hsl(35, 90%, 50%)',
        pins: [
          { id: 'vfd-c-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'vfd-feeder',
        name: 'Feeder VFD',
        shortName: 'VFD-F',
        x: 540,
        y: 500,
        width: 80,
        height: 60,
        color: 'hsl(35, 90%, 50%)',
        pins: [
          { id: 'vfd-f-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'conveyor',
        name: 'Conveyor Motor',
        shortName: 'CONV',
        x: 540,
        y: 580,
        width: 80,
        height: 60,
        color: 'hsl(220, 60%, 55%)',
        pins: [
          { id: 'conv-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      ...createPeripherals(),
    ],
    wires: [
      ...createBaseWires(),
      { id: 'ic700-can-h-conn', from: 'dcm-can-h-r', to: 'ic700-can-h', color: '#22c55e', label: 'CAN H (Green)', type: 'can' },
      { id: 'ic700-can-l-conn', from: 'dcm-can-l-r', to: 'ic700-can-l', color: '#22c55e', label: 'CAN L (Green/White)', type: 'can' },
      { id: 'ic700-vfd-c', from: 'ic700-crusher', to: 'vfd-c-ctrl', color: '#f97316', label: 'Crusher Control', type: 'signal' },
      { id: 'ic700-vfd-f', from: 'ic700-feeder', to: 'vfd-f-ctrl', color: '#f97316', label: 'Feeder Control', type: 'signal' },
      { id: 'ic700-conv', from: 'ic700-conv', to: 'conv-ctrl', color: '#f97316', label: 'Conveyor Control', type: 'signal' },
      { id: 'pwr-ic700', from: 'bat-pos', to: 'ic700-pwr', color: '#ef4444', label: 'B+ (Red)', type: 'power' },
      { id: 'gnd-ic700', from: 'bat-neg', to: 'ic700-gnd', color: '#1f2937', label: 'GND (Black)', type: 'ground' },
    ],
  },
  {
    id: 'mccloskey',
    name: 'McCloskey',
    description: 'I-Series and J-Series with MACS telematics and control system',
    modules: [
      ...createGenericModules(),
      {
        id: 'macs',
        name: 'MACS Controller',
        shortName: 'MACS',
        x: 390,
        y: 450,
        width: 120,
        height: 120,
        color: 'hsl(120, 70%, 40%)',
        pins: [
          { id: 'macs-can-h', label: 'CAN H', side: 'left', position: 0.15 },
          { id: 'macs-can-l', label: 'CAN L', side: 'left', position: 0.30 },
          { id: 'macs-pwr', label: 'B+', side: 'top', position: 0.3 },
          { id: 'macs-gnd', label: 'GND', side: 'top', position: 0.7 },
          { id: 'macs-screen', label: 'SCR', side: 'right', position: 0.3 },
          { id: 'macs-jaw', label: 'JAW', side: 'right', position: 0.5 },
          { id: 'macs-belt', label: 'BELT', side: 'right', position: 0.7 },
        ]
      },
      {
        id: 'screen-motor',
        name: 'Screen Drive',
        shortName: 'SCRN',
        x: 540,
        y: 420,
        width: 80,
        height: 55,
        color: 'hsl(180, 60%, 45%)',
        pins: [
          { id: 'scrn-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'jaw-motor',
        name: 'Jaw Motor',
        shortName: 'JAW',
        x: 540,
        y: 495,
        width: 80,
        height: 55,
        color: 'hsl(25, 95%, 53%)',
        pins: [
          { id: 'jaw-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'belt-motor',
        name: 'Belt Motor',
        shortName: 'BELT',
        x: 540,
        y: 570,
        width: 80,
        height: 55,
        color: 'hsl(220, 60%, 55%)',
        pins: [
          { id: 'belt-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      ...createPeripherals(),
    ],
    wires: [
      ...createBaseWires(),
      { id: 'macs-can-h-conn', from: 'dcm-can-h-r', to: 'macs-can-h', color: '#22c55e', label: 'CAN H (Green)', type: 'can' },
      { id: 'macs-can-l-conn', from: 'dcm-can-l-r', to: 'macs-can-l', color: '#22c55e', label: 'CAN L (Green/White)', type: 'can' },
      { id: 'macs-screen', from: 'macs-screen', to: 'scrn-ctrl', color: '#06b6d4', label: 'Screen Control', type: 'signal' },
      { id: 'macs-jaw', from: 'macs-jaw', to: 'jaw-ctrl', color: '#f97316', label: 'Jaw Control', type: 'signal' },
      { id: 'macs-belt', from: 'macs-belt', to: 'belt-ctrl', color: '#a855f7', label: 'Belt Control', type: 'signal' },
      { id: 'pwr-macs', from: 'bat-pos', to: 'macs-pwr', color: '#ef4444', label: 'B+ (Red)', type: 'power' },
      { id: 'gnd-macs', from: 'bat-neg', to: 'macs-gnd', color: '#1f2937', label: 'GND (Black)', type: 'ground' },
    ],
  },
  {
    id: 'eagle',
    name: 'Eagle Crusher',
    description: 'UltraMax series with Eagle Connect telematics and PLC control',
    modules: [
      ...createGenericModules(),
      {
        id: 'eagle-plc',
        name: 'Eagle PLC',
        shortName: 'PLC',
        x: 390,
        y: 450,
        width: 120,
        height: 120,
        color: 'hsl(0, 75%, 50%)',
        pins: [
          { id: 'plc-can-h', label: 'CAN H', side: 'left', position: 0.15 },
          { id: 'plc-can-l', label: 'CAN L', side: 'left', position: 0.30 },
          { id: 'plc-pwr', label: 'B+', side: 'top', position: 0.3 },
          { id: 'plc-gnd', label: 'GND', side: 'top', position: 0.7 },
          { id: 'plc-impact', label: 'IMP', side: 'right', position: 0.25 },
          { id: 'plc-feeder', label: 'FDR', side: 'right', position: 0.45 },
          { id: 'plc-magnet', label: 'MAG', side: 'right', position: 0.65 },
          { id: 'plc-dust', label: 'DUST', side: 'right', position: 0.85 },
        ]
      },
      {
        id: 'impactor',
        name: 'Impactor Drive',
        shortName: 'IMP',
        x: 540,
        y: 400,
        width: 80,
        height: 50,
        color: 'hsl(25, 95%, 53%)',
        pins: [
          { id: 'imp-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'feeder-drive',
        name: 'Feeder Drive',
        shortName: 'FDR',
        x: 540,
        y: 465,
        width: 80,
        height: 50,
        color: 'hsl(120, 60%, 45%)',
        pins: [
          { id: 'fdr-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'magnet',
        name: 'Magnet Drive',
        shortName: 'MAG',
        x: 540,
        y: 530,
        width: 80,
        height: 50,
        color: 'hsl(280, 70%, 50%)',
        pins: [
          { id: 'mag-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'dust-suppress',
        name: 'Dust Suppression',
        shortName: 'DUST',
        x: 540,
        y: 595,
        width: 80,
        height: 50,
        color: 'hsl(200, 80%, 50%)',
        pins: [
          { id: 'dust-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      ...createPeripherals(),
    ],
    wires: [
      ...createBaseWires(),
      { id: 'plc-can-h-conn', from: 'dcm-can-h-r', to: 'plc-can-h', color: '#22c55e', label: 'CAN H (Green)', type: 'can' },
      { id: 'plc-can-l-conn', from: 'dcm-can-l-r', to: 'plc-can-l', color: '#22c55e', label: 'CAN L (Green/White)', type: 'can' },
      { id: 'plc-imp', from: 'plc-impact', to: 'imp-ctrl', color: '#f97316', label: 'Impactor Control', type: 'signal' },
      { id: 'plc-fdr', from: 'plc-feeder', to: 'fdr-ctrl', color: '#22c55e', label: 'Feeder Control', type: 'signal' },
      { id: 'plc-mag', from: 'plc-magnet', to: 'mag-ctrl', color: '#a855f7', label: 'Magnet Control', type: 'signal' },
      { id: 'plc-dust', from: 'plc-dust', to: 'dust-ctrl', color: '#3b82f6', label: 'Dust Control', type: 'signal' },
      { id: 'pwr-plc', from: 'bat-pos', to: 'plc-pwr', color: '#ef4444', label: 'B+ (Red)', type: 'power' },
      { id: 'gnd-plc', from: 'bat-neg', to: 'plc-gnd', color: '#1f2937', label: 'GND (Black)', type: 'ground' },
    ],
  },
  {
    id: 'superior',
    name: 'Superior Industries',
    description: 'Patriot and Liberty series with Guardian telematics system',
    modules: [
      ...createGenericModules(),
      {
        id: 'guardian',
        name: 'Guardian Controller',
        shortName: 'GUARD',
        x: 390,
        y: 450,
        width: 120,
        height: 120,
        color: 'hsl(220, 80%, 55%)',
        pins: [
          { id: 'guard-can-h', label: 'CAN H', side: 'left', position: 0.15 },
          { id: 'guard-can-l', label: 'CAN L', side: 'left', position: 0.30 },
          { id: 'guard-pwr', label: 'B+', side: 'top', position: 0.3 },
          { id: 'guard-gnd', label: 'GND', side: 'top', position: 0.7 },
          { id: 'guard-cone', label: 'CONE', side: 'right', position: 0.25 },
          { id: 'guard-grizzly', label: 'GRIZ', side: 'right', position: 0.45 },
          { id: 'guard-stack', label: 'STCK', side: 'right', position: 0.65 },
          { id: 'guard-radial', label: 'RAD', side: 'right', position: 0.85 },
        ]
      },
      {
        id: 'cone-crusher',
        name: 'Cone Crusher',
        shortName: 'CONE',
        x: 540,
        y: 400,
        width: 80,
        height: 50,
        color: 'hsl(25, 95%, 53%)',
        pins: [
          { id: 'cone-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'grizzly',
        name: 'Grizzly Feeder',
        shortName: 'GRIZ',
        x: 540,
        y: 465,
        width: 80,
        height: 50,
        color: 'hsl(45, 90%, 50%)',
        pins: [
          { id: 'griz-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'stacker',
        name: 'Stacking Conv',
        shortName: 'STCK',
        x: 540,
        y: 530,
        width: 80,
        height: 50,
        color: 'hsl(160, 60%, 45%)',
        pins: [
          { id: 'stack-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'radial',
        name: 'Radial Stacker',
        shortName: 'RAD',
        x: 540,
        y: 595,
        width: 80,
        height: 50,
        color: 'hsl(280, 60%, 50%)',
        pins: [
          { id: 'rad-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      ...createPeripherals(),
    ],
    wires: [
      ...createBaseWires(),
      { id: 'guard-can-h-conn', from: 'dcm-can-h-r', to: 'guard-can-h', color: '#22c55e', label: 'CAN H (Green)', type: 'can' },
      { id: 'guard-can-l-conn', from: 'dcm-can-l-r', to: 'guard-can-l', color: '#22c55e', label: 'CAN L (Green/White)', type: 'can' },
      { id: 'guard-cone', from: 'guard-cone', to: 'cone-ctrl', color: '#f97316', label: 'Cone Control', type: 'signal' },
      { id: 'guard-griz', from: 'guard-grizzly', to: 'griz-ctrl', color: '#eab308', label: 'Grizzly Control', type: 'signal' },
      { id: 'guard-stack', from: 'guard-stack', to: 'stack-ctrl', color: '#22c55e', label: 'Stacker Control', type: 'signal' },
      { id: 'guard-rad', from: 'guard-radial', to: 'rad-ctrl', color: '#a855f7', label: 'Radial Control', type: 'signal' },
      { id: 'pwr-guard', from: 'bat-pos', to: 'guard-pwr', color: '#ef4444', label: 'B+ (Red)', type: 'power' },
      { id: 'gnd-guard', from: 'bat-neg', to: 'guard-gnd', color: '#1f2937', label: 'GND (Black)', type: 'ground' },
    ],
  },
  {
    id: 'aztec',
    name: 'Aztec',
    description: 'Aztec portable crushing plants with integrated control systems',
    modules: [
      ...createGenericModules(),
      {
        id: 'aztec-ctrl',
        name: 'Aztec Controller',
        shortName: 'AZTC',
        x: 390,
        y: 450,
        width: 120,
        height: 120,
        color: 'hsl(35, 85%, 50%)',
        pins: [
          { id: 'aztc-can-h', label: 'CAN H', side: 'left', position: 0.15 },
          { id: 'aztc-can-l', label: 'CAN L', side: 'left', position: 0.30 },
          { id: 'aztc-pwr', label: 'B+', side: 'top', position: 0.3 },
          { id: 'aztc-gnd', label: 'GND', side: 'top', position: 0.7 },
          { id: 'aztc-crusher', label: 'CRSH', side: 'right', position: 0.25 },
          { id: 'aztc-screen', label: 'SCR', side: 'right', position: 0.45 },
          { id: 'aztc-wash', label: 'WASH', side: 'right', position: 0.65 },
          { id: 'aztc-stock', label: 'STCK', side: 'right', position: 0.85 },
        ]
      },
      {
        id: 'primary-crusher',
        name: 'Primary Crusher',
        shortName: 'PRIM',
        x: 540,
        y: 400,
        width: 80,
        height: 50,
        color: 'hsl(0, 70%, 50%)',
        pins: [
          { id: 'prim-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'screen-unit',
        name: 'Screen Unit',
        shortName: 'SCR',
        x: 540,
        y: 465,
        width: 80,
        height: 50,
        color: 'hsl(180, 60%, 45%)',
        pins: [
          { id: 'scr-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'wash-plant',
        name: 'Wash Plant',
        shortName: 'WASH',
        x: 540,
        y: 530,
        width: 80,
        height: 50,
        color: 'hsl(200, 80%, 50%)',
        pins: [
          { id: 'wash-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'stockpile',
        name: 'Stockpile Conv',
        shortName: 'STCK',
        x: 540,
        y: 595,
        width: 80,
        height: 50,
        color: 'hsl(120, 50%, 45%)',
        pins: [
          { id: 'stock-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      ...createPeripherals(),
    ],
    wires: [
      ...createBaseWires(),
      { id: 'aztc-can-h-conn', from: 'dcm-can-h-r', to: 'aztc-can-h', color: '#22c55e', label: 'CAN H (Green)', type: 'can' },
      { id: 'aztc-can-l-conn', from: 'dcm-can-l-r', to: 'aztc-can-l', color: '#22c55e', label: 'CAN L (Green/White)', type: 'can' },
      { id: 'aztc-crusher', from: 'aztc-crusher', to: 'prim-ctrl', color: '#ef4444', label: 'Crusher Control', type: 'signal' },
      { id: 'aztc-scr', from: 'aztc-screen', to: 'scr-ctrl', color: '#06b6d4', label: 'Screen Control', type: 'signal' },
      { id: 'aztc-wash', from: 'aztc-wash', to: 'wash-ctrl', color: '#3b82f6', label: 'Wash Control', type: 'signal' },
      { id: 'aztc-stock', from: 'aztc-stock', to: 'stock-ctrl', color: '#22c55e', label: 'Stockpile Control', type: 'signal' },
      { id: 'pwr-aztc', from: 'bat-pos', to: 'aztc-pwr', color: '#ef4444', label: 'B+ (Red)', type: 'power' },
      { id: 'gnd-aztc', from: 'bat-neg', to: 'aztc-gnd', color: '#1f2937', label: 'GND (Black)', type: 'ground' },
    ],
  },
  {
    id: 'terex-finlay',
    name: 'Terex Finlay',
    description: 'J-Series, I-Series and C-Series with T-Link telematics and CAN-based control',
    modules: [
      ...createGenericModules(),
      {
        id: 'tlink',
        name: 'T-Link Controller',
        shortName: 'T-LINK',
        x: 390,
        y: 450,
        width: 120,
        height: 120,
        color: 'hsl(200, 85%, 45%)',
        pins: [
          { id: 'tlink-can-h', label: 'CAN H', side: 'left', position: 0.15 },
          { id: 'tlink-can-l', label: 'CAN L', side: 'left', position: 0.30 },
          { id: 'tlink-pwr', label: 'B+', side: 'top', position: 0.3 },
          { id: 'tlink-gnd', label: 'GND', side: 'top', position: 0.7 },
          { id: 'tlink-jaw', label: 'JAW', side: 'right', position: 0.20 },
          { id: 'tlink-imp', label: 'IMP', side: 'right', position: 0.40 },
          { id: 'tlink-scrn', label: 'SCR', side: 'right', position: 0.60 },
          { id: 'tlink-fdr', label: 'FDR', side: 'right', position: 0.80 },
        ]
      },
      {
        id: 'finlay-jaw',
        name: 'Jaw Crusher',
        shortName: 'JAW',
        x: 540,
        y: 390,
        width: 80,
        height: 50,
        color: 'hsl(25, 95%, 53%)',
        pins: [
          { id: 'fjaw-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'finlay-impact',
        name: 'Impactor',
        shortName: 'IMP',
        x: 540,
        y: 455,
        width: 80,
        height: 50,
        color: 'hsl(0, 70%, 50%)',
        pins: [
          { id: 'fimp-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'finlay-screen',
        name: 'Screen Box',
        shortName: 'SCR',
        x: 540,
        y: 520,
        width: 80,
        height: 50,
        color: 'hsl(180, 60%, 45%)',
        pins: [
          { id: 'fscr-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'finlay-feeder',
        name: 'Vibrating Feeder',
        shortName: 'VFD',
        x: 540,
        y: 585,
        width: 80,
        height: 50,
        color: 'hsl(45, 90%, 50%)',
        pins: [
          { id: 'ffdr-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      ...createPeripherals(),
    ],
    wires: [
      ...createBaseWires(),
      { id: 'tlink-can-h-conn', from: 'dcm-can-h-r', to: 'tlink-can-h', color: '#22c55e', label: 'CAN H (Green)', type: 'can' },
      { id: 'tlink-can-l-conn', from: 'dcm-can-l-r', to: 'tlink-can-l', color: '#22c55e', label: 'CAN L (Green/White)', type: 'can' },
      { id: 'tlink-jaw', from: 'tlink-jaw', to: 'fjaw-ctrl', color: '#f97316', label: 'Jaw Control', type: 'signal' },
      { id: 'tlink-imp', from: 'tlink-imp', to: 'fimp-ctrl', color: '#ef4444', label: 'Impactor Control', type: 'signal' },
      { id: 'tlink-scrn', from: 'tlink-scrn', to: 'fscr-ctrl', color: '#06b6d4', label: 'Screen Control', type: 'signal' },
      { id: 'tlink-fdr', from: 'tlink-fdr', to: 'ffdr-ctrl', color: '#eab308', label: 'Feeder Control', type: 'signal' },
      { id: 'pwr-tlink', from: 'bat-pos', to: 'tlink-pwr', color: '#ef4444', label: 'B+ (Red)', type: 'power' },
      { id: 'gnd-tlink', from: 'bat-neg', to: 'tlink-gnd', color: '#1f2937', label: 'GND (Black)', type: 'ground' },
    ],
  },
  {
    id: 'kleemann',
    name: 'Kleemann',
    description: 'MOBICAT, MOBIREX and MOBICONE series with SPECTIVE control system',
    modules: [
      ...createGenericModules(),
      {
        id: 'spective',
        name: 'SPECTIVE Controller',
        shortName: 'SPECT',
        x: 390,
        y: 450,
        width: 120,
        height: 120,
        color: 'hsl(280, 75%, 55%)',
        pins: [
          { id: 'spect-can-h', label: 'CAN H', side: 'left', position: 0.15 },
          { id: 'spect-can-l', label: 'CAN L', side: 'left', position: 0.30 },
          { id: 'spect-pwr', label: 'B+', side: 'top', position: 0.3 },
          { id: 'spect-gnd', label: 'GND', side: 'top', position: 0.7 },
          { id: 'spect-crush', label: 'CRSH', side: 'right', position: 0.20 },
          { id: 'spect-prescreen', label: 'PRE', side: 'right', position: 0.40 },
          { id: 'spect-conv', label: 'CONV', side: 'right', position: 0.60 },
          { id: 'spect-fdr', label: 'FDR', side: 'right', position: 0.80 },
        ]
      },
      {
        id: 'kl-crusher',
        name: 'Crusher Unit',
        shortName: 'CRSH',
        x: 540,
        y: 390,
        width: 80,
        height: 50,
        color: 'hsl(340, 80%, 50%)',
        pins: [
          { id: 'kcrsh-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'kl-prescreen',
        name: 'Prescreen',
        shortName: 'PRE',
        x: 540,
        y: 455,
        width: 80,
        height: 50,
        color: 'hsl(45, 85%, 50%)',
        pins: [
          { id: 'kpre-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'kl-conveyor',
        name: 'Main Conveyor',
        shortName: 'CONV',
        x: 540,
        y: 520,
        width: 80,
        height: 50,
        color: 'hsl(160, 60%, 45%)',
        pins: [
          { id: 'kconv-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'kl-feeder',
        name: 'Feed Hopper',
        shortName: 'FDR',
        x: 540,
        y: 585,
        width: 80,
        height: 50,
        color: 'hsl(220, 70%, 55%)',
        pins: [
          { id: 'kfdr-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      ...createPeripherals(),
    ],
    wires: [
      ...createBaseWires(),
      { id: 'spect-can-h-conn', from: 'dcm-can-h-r', to: 'spect-can-h', color: '#22c55e', label: 'CAN H (Green)', type: 'can' },
      { id: 'spect-can-l-conn', from: 'dcm-can-l-r', to: 'spect-can-l', color: '#22c55e', label: 'CAN L (Green/White)', type: 'can' },
      { id: 'spect-crush', from: 'spect-crush', to: 'kcrsh-ctrl', color: '#ec4899', label: 'Crusher Control', type: 'signal' },
      { id: 'spect-pre', from: 'spect-prescreen', to: 'kpre-ctrl', color: '#eab308', label: 'Prescreen Control', type: 'signal' },
      { id: 'spect-conv', from: 'spect-conv', to: 'kconv-ctrl', color: '#22c55e', label: 'Conveyor Control', type: 'signal' },
      { id: 'spect-fdr', from: 'spect-fdr', to: 'kfdr-ctrl', color: '#3b82f6', label: 'Feeder Control', type: 'signal' },
      { id: 'pwr-spect', from: 'bat-pos', to: 'spect-pwr', color: '#ef4444', label: 'B+ (Red)', type: 'power' },
      { id: 'gnd-spect', from: 'bat-neg', to: 'spect-gnd', color: '#1f2937', label: 'GND (Black)', type: 'ground' },
    ],
  },
  {
    id: 'sandvik',
    name: 'Sandvik',
    description: 'QJ, QH and QA series with My Sandvik telematics and Automation system',
    modules: [
      ...createGenericModules(),
      {
        id: 'my-sandvik',
        name: 'My Sandvik Controller',
        shortName: 'MSDVK',
        x: 390,
        y: 450,
        width: 120,
        height: 120,
        color: 'hsl(35, 95%, 50%)',
        pins: [
          { id: 'msdvk-can-h', label: 'CAN H', side: 'left', position: 0.15 },
          { id: 'msdvk-can-l', label: 'CAN L', side: 'left', position: 0.30 },
          { id: 'msdvk-pwr', label: 'B+', side: 'top', position: 0.3 },
          { id: 'msdvk-gnd', label: 'GND', side: 'top', position: 0.7 },
          { id: 'msdvk-crush', label: 'CRSH', side: 'right', position: 0.20 },
          { id: 'msdvk-scrn', label: 'SCR', side: 'right', position: 0.40 },
          { id: 'msdvk-track', label: 'TRK', side: 'right', position: 0.60 },
          { id: 'msdvk-hydr', label: 'HYD', side: 'right', position: 0.80 },
        ]
      },
      {
        id: 'sdvk-crusher',
        name: 'Crusher Chamber',
        shortName: 'CRSH',
        x: 540,
        y: 390,
        width: 80,
        height: 50,
        color: 'hsl(25, 95%, 53%)',
        pins: [
          { id: 'sdcrsh-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'sdvk-screen',
        name: 'Screening Unit',
        shortName: 'SCR',
        x: 540,
        y: 455,
        width: 80,
        height: 50,
        color: 'hsl(180, 60%, 45%)',
        pins: [
          { id: 'sdscr-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'sdvk-track',
        name: 'Track Drive',
        shortName: 'TRK',
        x: 540,
        y: 520,
        width: 80,
        height: 50,
        color: 'hsl(340, 70%, 50%)',
        pins: [
          { id: 'sdtrk-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'sdvk-hydraulic',
        name: 'Hydraulic Pack',
        shortName: 'HYD',
        x: 540,
        y: 585,
        width: 80,
        height: 50,
        color: 'hsl(280, 70%, 50%)',
        pins: [
          { id: 'sdhyd-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      ...createPeripherals(),
    ],
    wires: [
      ...createBaseWires(),
      { id: 'msdvk-can-h-conn', from: 'dcm-can-h-r', to: 'msdvk-can-h', color: '#22c55e', label: 'CAN H (Green)', type: 'can' },
      { id: 'msdvk-can-l-conn', from: 'dcm-can-l-r', to: 'msdvk-can-l', color: '#22c55e', label: 'CAN L (Green/White)', type: 'can' },
      { id: 'msdvk-crush', from: 'msdvk-crush', to: 'sdcrsh-ctrl', color: '#f97316', label: 'Crusher Control', type: 'signal' },
      { id: 'msdvk-scrn', from: 'msdvk-scrn', to: 'sdscr-ctrl', color: '#06b6d4', label: 'Screen Control', type: 'signal' },
      { id: 'msdvk-track', from: 'msdvk-track', to: 'sdtrk-ctrl', color: '#ec4899', label: 'Track Control', type: 'signal' },
      { id: 'msdvk-hydr', from: 'msdvk-hydr', to: 'sdhyd-ctrl', color: '#a855f7', label: 'Hydraulic Control', type: 'signal' },
      { id: 'pwr-msdvk', from: 'bat-pos', to: 'msdvk-pwr', color: '#ef4444', label: 'B+ (Red)', type: 'power' },
      { id: 'gnd-msdvk', from: 'bat-neg', to: 'msdvk-gnd', color: '#1f2937', label: 'GND (Black)', type: 'ground' },
    ],
  },
  {
    id: 'powerscreen',
    name: 'Powerscreen',
    description: 'Premiertrak, Warrior and Chieftain series with Pulse telematics system',
    modules: [
      ...createGenericModules(),
      {
        id: 'pulse',
        name: 'Pulse Controller',
        shortName: 'PULSE',
        x: 390,
        y: 450,
        width: 120,
        height: 120,
        color: 'hsl(145, 80%, 40%)',
        pins: [
          { id: 'pulse-can-h', label: 'CAN H', side: 'left', position: 0.15 },
          { id: 'pulse-can-l', label: 'CAN L', side: 'left', position: 0.30 },
          { id: 'pulse-pwr', label: 'B+', side: 'top', position: 0.3 },
          { id: 'pulse-gnd', label: 'GND', side: 'top', position: 0.7 },
          { id: 'pulse-jaw', label: 'JAW', side: 'right', position: 0.20 },
          { id: 'pulse-scrn', label: 'SCR', side: 'right', position: 0.40 },
          { id: 'pulse-fdr', label: 'FDR', side: 'right', position: 0.60 },
          { id: 'pulse-side', label: 'SIDE', side: 'right', position: 0.80 },
        ]
      },
      {
        id: 'ps-jaw',
        name: 'Jaw Crusher',
        shortName: 'JAW',
        x: 540,
        y: 390,
        width: 80,
        height: 50,
        color: 'hsl(0, 70%, 50%)',
        pins: [
          { id: 'psjaw-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'ps-screen',
        name: 'Screen Deck',
        shortName: 'SCR',
        x: 540,
        y: 455,
        width: 80,
        height: 50,
        color: 'hsl(200, 75%, 50%)',
        pins: [
          { id: 'psscr-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'ps-feeder',
        name: 'Vibrating Grizzly',
        shortName: 'FDR',
        x: 540,
        y: 520,
        width: 80,
        height: 50,
        color: 'hsl(45, 90%, 50%)',
        pins: [
          { id: 'psfdr-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'ps-side-conv',
        name: 'Side Conveyor',
        shortName: 'SIDE',
        x: 540,
        y: 585,
        width: 80,
        height: 50,
        color: 'hsl(160, 60%, 45%)',
        pins: [
          { id: 'psside-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      ...createPeripherals(),
    ],
    wires: [
      ...createBaseWires(),
      { id: 'pulse-can-h-conn', from: 'dcm-can-h-r', to: 'pulse-can-h', color: '#22c55e', label: 'CAN H (Green)', type: 'can' },
      { id: 'pulse-can-l-conn', from: 'dcm-can-l-r', to: 'pulse-can-l', color: '#22c55e', label: 'CAN L (Green/White)', type: 'can' },
      { id: 'pulse-jaw', from: 'pulse-jaw', to: 'psjaw-ctrl', color: '#ef4444', label: 'Jaw Control', type: 'signal' },
      { id: 'pulse-scrn', from: 'pulse-scrn', to: 'psscr-ctrl', color: '#3b82f6', label: 'Screen Control', type: 'signal' },
      { id: 'pulse-fdr', from: 'pulse-fdr', to: 'psfdr-ctrl', color: '#eab308', label: 'Feeder Control', type: 'signal' },
      { id: 'pulse-side', from: 'pulse-side', to: 'psside-ctrl', color: '#22c55e', label: 'Side Conv Control', type: 'signal' },
      { id: 'pwr-pulse', from: 'bat-pos', to: 'pulse-pwr', color: '#ef4444', label: 'B+ (Red)', type: 'power' },
      { id: 'gnd-pulse', from: 'bat-neg', to: 'pulse-gnd', color: '#1f2937', label: 'GND (Black)', type: 'ground' },
    ],
  },
  {
    id: 'wirtgen',
    name: 'Wirtgen Group',
    description: 'Kleemann MOBICONE/MOBICAT with WITOS FleetView telematics system',
    modules: [
      ...createGenericModules(),
      {
        id: 'witos',
        name: 'WITOS Controller',
        shortName: 'WITOS',
        x: 390,
        y: 450,
        width: 120,
        height: 120,
        color: 'hsl(205, 85%, 45%)',
        pins: [
          { id: 'witos-can-h', label: 'CAN H', side: 'left', position: 0.15 },
          { id: 'witos-can-l', label: 'CAN L', side: 'left', position: 0.30 },
          { id: 'witos-pwr', label: 'B+', side: 'top', position: 0.3 },
          { id: 'witos-gnd', label: 'GND', side: 'top', position: 0.7 },
          { id: 'witos-crush', label: 'CRSH', side: 'right', position: 0.20 },
          { id: 'witos-feed', label: 'FDR', side: 'right', position: 0.40 },
          { id: 'witos-conv', label: 'CONV', side: 'right', position: 0.60 },
          { id: 'witos-diesel', label: 'DSL', side: 'right', position: 0.80 },
        ]
      },
      {
        id: 'wirt-crusher',
        name: 'Crusher Unit',
        shortName: 'CRSH',
        x: 540,
        y: 390,
        width: 80,
        height: 50,
        color: 'hsl(25, 95%, 53%)',
        pins: [
          { id: 'wcrsh-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'wirt-feeder',
        name: 'Feed System',
        shortName: 'FDR',
        x: 540,
        y: 455,
        width: 80,
        height: 50,
        color: 'hsl(45, 90%, 50%)',
        pins: [
          { id: 'wfdr-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'wirt-conveyor',
        name: 'Discharge Conv',
        shortName: 'CONV',
        x: 540,
        y: 520,
        width: 80,
        height: 50,
        color: 'hsl(160, 60%, 45%)',
        pins: [
          { id: 'wconv-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'wirt-diesel',
        name: 'Diesel-Electric',
        shortName: 'DSL',
        x: 540,
        y: 585,
        width: 80,
        height: 50,
        color: 'hsl(0, 70%, 50%)',
        pins: [
          { id: 'wdsl-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      ...createPeripherals(),
    ],
    wires: [
      ...createBaseWires(),
      { id: 'witos-can-h-conn', from: 'dcm-can-h-r', to: 'witos-can-h', color: '#22c55e', label: 'CAN H (Green)', type: 'can' },
      { id: 'witos-can-l-conn', from: 'dcm-can-l-r', to: 'witos-can-l', color: '#22c55e', label: 'CAN L (Green/White)', type: 'can' },
      { id: 'witos-crush', from: 'witos-crush', to: 'wcrsh-ctrl', color: '#f97316', label: 'Crusher Control', type: 'signal' },
      { id: 'witos-feed', from: 'witos-feed', to: 'wfdr-ctrl', color: '#eab308', label: 'Feeder Control', type: 'signal' },
      { id: 'witos-conv', from: 'witos-conv', to: 'wconv-ctrl', color: '#22c55e', label: 'Conveyor Control', type: 'signal' },
      { id: 'witos-diesel', from: 'witos-diesel', to: 'wdsl-ctrl', color: '#ef4444', label: 'Diesel Control', type: 'signal' },
      { id: 'pwr-witos', from: 'bat-pos', to: 'witos-pwr', color: '#ef4444', label: 'B+ (Red)', type: 'power' },
      { id: 'gnd-witos', from: 'bat-neg', to: 'witos-gnd', color: '#1f2937', label: 'GND (Black)', type: 'ground' },
    ],
  },
  {
    id: 'astec',
    name: 'Astec Industries',
    description: 'KPI-JCI and Telsmith series with Astec Connect telematics platform',
    modules: [
      ...createGenericModules(),
      {
        id: 'astec-connect',
        name: 'Astec Connect',
        shortName: 'ASTEC',
        x: 390,
        y: 450,
        width: 120,
        height: 120,
        color: 'hsl(15, 90%, 50%)',
        pins: [
          { id: 'astec-can-h', label: 'CAN H', side: 'left', position: 0.15 },
          { id: 'astec-can-l', label: 'CAN L', side: 'left', position: 0.30 },
          { id: 'astec-pwr', label: 'B+', side: 'top', position: 0.3 },
          { id: 'astec-gnd', label: 'GND', side: 'top', position: 0.7 },
          { id: 'astec-impact', label: 'IMP', side: 'right', position: 0.20 },
          { id: 'astec-vib', label: 'VIB', side: 'right', position: 0.40 },
          { id: 'astec-scrn', label: 'SCR', side: 'right', position: 0.60 },
          { id: 'astec-wash', label: 'WASH', side: 'right', position: 0.80 },
        ]
      },
      {
        id: 'ast-impactor',
        name: 'Impactor Drive',
        shortName: 'IMP',
        x: 540,
        y: 390,
        width: 80,
        height: 50,
        color: 'hsl(0, 75%, 50%)',
        pins: [
          { id: 'aimp-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'ast-vibratory',
        name: 'Vibratory Feeder',
        shortName: 'VIB',
        x: 540,
        y: 455,
        width: 80,
        height: 50,
        color: 'hsl(280, 70%, 50%)',
        pins: [
          { id: 'avib-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'ast-screen',
        name: 'Incline Screen',
        shortName: 'SCR',
        x: 540,
        y: 520,
        width: 80,
        height: 50,
        color: 'hsl(180, 60%, 45%)',
        pins: [
          { id: 'ascr-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'ast-wash',
        name: 'Wash System',
        shortName: 'WASH',
        x: 540,
        y: 585,
        width: 80,
        height: 50,
        color: 'hsl(200, 80%, 50%)',
        pins: [
          { id: 'awash-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      ...createPeripherals(),
    ],
    wires: [
      ...createBaseWires(),
      { id: 'astec-can-h-conn', from: 'dcm-can-h-r', to: 'astec-can-h', color: '#22c55e', label: 'CAN H (Green)', type: 'can' },
      { id: 'astec-can-l-conn', from: 'dcm-can-l-r', to: 'astec-can-l', color: '#22c55e', label: 'CAN L (Green/White)', type: 'can' },
      { id: 'astec-impact', from: 'astec-impact', to: 'aimp-ctrl', color: '#ef4444', label: 'Impactor Control', type: 'signal' },
      { id: 'astec-vib', from: 'astec-vib', to: 'avib-ctrl', color: '#a855f7', label: 'Vibratory Control', type: 'signal' },
      { id: 'astec-scrn', from: 'astec-scrn', to: 'ascr-ctrl', color: '#06b6d4', label: 'Screen Control', type: 'signal' },
      { id: 'astec-wash', from: 'astec-wash', to: 'awash-ctrl', color: '#3b82f6', label: 'Wash Control', type: 'signal' },
      { id: 'pwr-astec', from: 'bat-pos', to: 'astec-pwr', color: '#ef4444', label: 'B+ (Red)', type: 'power' },
      { id: 'gnd-astec', from: 'bat-neg', to: 'astec-gnd', color: '#1f2937', label: 'GND (Black)', type: 'ground' },
    ],
  },
  // Heavy Equipment - CAT Excavator
  {
    id: 'cat-excavator',
    name: 'CAT Excavator',
    description: 'Caterpillar 320/330 series excavators with Cat Electronic Technician (ET) system',
    modules: [
      ...createGenericModules(),
      {
        id: 'cat-ecm',
        name: 'Cat A4 ECM',
        shortName: 'A4 ECM',
        x: 390,
        y: 450,
        width: 120,
        height: 130,
        color: 'hsl(45, 95%, 50%)',
        pins: [
          { id: 'cat-can-h', label: 'CAN H', side: 'left', position: 0.12 },
          { id: 'cat-can-l', label: 'CAN L', side: 'left', position: 0.24 },
          { id: 'cat-pwr', label: 'B+', side: 'top', position: 0.3 },
          { id: 'cat-gnd', label: 'GND', side: 'top', position: 0.7 },
          { id: 'cat-boom', label: 'BOOM', side: 'right', position: 0.18 },
          { id: 'cat-stick', label: 'STCK', side: 'right', position: 0.36 },
          { id: 'cat-bucket', label: 'BCKT', side: 'right', position: 0.54 },
          { id: 'cat-swing', label: 'SWNG', side: 'right', position: 0.72 },
          { id: 'cat-travel', label: 'TRVL', side: 'right', position: 0.90 },
        ]
      },
      {
        id: 'boom-valve',
        name: 'Boom Valve',
        shortName: 'BOOM',
        x: 540,
        y: 400,
        width: 75,
        height: 40,
        color: 'hsl(35, 90%, 50%)',
        pins: [
          { id: 'boom-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'stick-valve',
        name: 'Stick Valve',
        shortName: 'STCK',
        x: 540,
        y: 450,
        width: 75,
        height: 40,
        color: 'hsl(35, 90%, 50%)',
        pins: [
          { id: 'stick-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'bucket-valve',
        name: 'Bucket Valve',
        shortName: 'BCKT',
        x: 540,
        y: 500,
        width: 75,
        height: 40,
        color: 'hsl(35, 90%, 50%)',
        pins: [
          { id: 'bucket-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'swing-motor',
        name: 'Swing Motor',
        shortName: 'SWNG',
        x: 540,
        y: 550,
        width: 75,
        height: 40,
        color: 'hsl(220, 60%, 55%)',
        pins: [
          { id: 'swing-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'travel-motor',
        name: 'Travel Motors',
        shortName: 'TRVL',
        x: 540,
        y: 600,
        width: 75,
        height: 40,
        color: 'hsl(220, 60%, 55%)',
        pins: [
          { id: 'travel-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      ...createPeripherals(),
    ],
    wires: [
      ...createBaseWires(),
      { id: 'cat-can-h-conn', from: 'dcm-can-h-r', to: 'cat-can-h', color: '#22c55e', label: 'CAN H (Green)', type: 'can' },
      { id: 'cat-can-l-conn', from: 'dcm-can-l-r', to: 'cat-can-l', color: '#22c55e', label: 'CAN L (Green/White)', type: 'can' },
      { id: 'cat-boom', from: 'cat-boom', to: 'boom-ctrl', color: '#f97316', label: 'Boom Control (Orange)', type: 'signal' },
      { id: 'cat-stick', from: 'cat-stick', to: 'stick-ctrl', color: '#f97316', label: 'Stick Control (Orange)', type: 'signal' },
      { id: 'cat-bucket', from: 'cat-bucket', to: 'bucket-ctrl', color: '#a855f7', label: 'Bucket Control (Purple)', type: 'signal' },
      { id: 'cat-swing', from: 'cat-swing', to: 'swing-ctrl', color: '#3b82f6', label: 'Swing Control (Blue)', type: 'signal' },
      { id: 'cat-travel', from: 'cat-travel', to: 'travel-ctrl', color: '#06b6d4', label: 'Travel Control (Cyan)', type: 'signal' },
      { id: 'pwr-cat', from: 'bat-pos', to: 'cat-pwr', color: '#ef4444', label: 'B+ (Red)', type: 'power' },
      { id: 'gnd-cat', from: 'bat-neg', to: 'cat-gnd', color: '#1f2937', label: 'GND (Black)', type: 'ground' },
    ],
  },
  // Heavy Equipment - Komatsu Dozer
  {
    id: 'komatsu-dozer',
    name: 'Komatsu Dozer',
    description: 'Komatsu D65/D85 series dozers with KOMTRAX telematics and EMMS control',
    modules: [
      ...createGenericModules(),
      {
        id: 'kom-emms',
        name: 'EMMS Controller',
        shortName: 'EMMS',
        x: 390,
        y: 450,
        width: 120,
        height: 130,
        color: 'hsl(200, 90%, 45%)',
        pins: [
          { id: 'emms-can-h', label: 'CAN H', side: 'left', position: 0.12 },
          { id: 'emms-can-l', label: 'CAN L', side: 'left', position: 0.24 },
          { id: 'emms-pwr', label: 'B+', side: 'top', position: 0.3 },
          { id: 'emms-gnd', label: 'GND', side: 'top', position: 0.7 },
          { id: 'emms-blade', label: 'BLD', side: 'right', position: 0.20 },
          { id: 'emms-ripper', label: 'RIP', side: 'right', position: 0.40 },
          { id: 'emms-steer', label: 'STR', side: 'right', position: 0.60 },
          { id: 'emms-drive', label: 'DRV', side: 'right', position: 0.80 },
        ]
      },
      {
        id: 'blade-cyl',
        name: 'Blade Cylinders',
        shortName: 'BLD',
        x: 540,
        y: 420,
        width: 75,
        height: 45,
        color: 'hsl(35, 90%, 50%)',
        pins: [
          { id: 'blade-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'ripper-cyl',
        name: 'Ripper Cylinder',
        shortName: 'RIP',
        x: 540,
        y: 475,
        width: 75,
        height: 45,
        color: 'hsl(35, 90%, 50%)',
        pins: [
          { id: 'ripper-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'steer-motor',
        name: 'Steering',
        shortName: 'STR',
        x: 540,
        y: 530,
        width: 75,
        height: 45,
        color: 'hsl(220, 60%, 55%)',
        pins: [
          { id: 'steer-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'drive-pump',
        name: 'Drive Pump',
        shortName: 'DRV',
        x: 540,
        y: 585,
        width: 75,
        height: 45,
        color: 'hsl(280, 70%, 50%)',
        pins: [
          { id: 'drive-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      ...createPeripherals(),
    ],
    wires: [
      ...createBaseWires(),
      { id: 'emms-can-h-conn', from: 'dcm-can-h-r', to: 'emms-can-h', color: '#22c55e', label: 'CAN H (Green)', type: 'can' },
      { id: 'emms-can-l-conn', from: 'dcm-can-l-r', to: 'emms-can-l', color: '#22c55e', label: 'CAN L (Green/White)', type: 'can' },
      { id: 'emms-blade', from: 'emms-blade', to: 'blade-ctrl', color: '#f97316', label: 'Blade Control (Orange)', type: 'signal' },
      { id: 'emms-ripper', from: 'emms-ripper', to: 'ripper-ctrl', color: '#a855f7', label: 'Ripper Control (Purple)', type: 'signal' },
      { id: 'emms-steer', from: 'emms-steer', to: 'steer-ctrl', color: '#3b82f6', label: 'Steering Control (Blue)', type: 'signal' },
      { id: 'emms-drive', from: 'emms-drive', to: 'drive-ctrl', color: '#06b6d4', label: 'Drive Control (Cyan)', type: 'signal' },
      { id: 'pwr-emms', from: 'bat-pos', to: 'emms-pwr', color: '#ef4444', label: 'B+ (Red)', type: 'power' },
      { id: 'gnd-emms', from: 'bat-neg', to: 'emms-gnd', color: '#1f2937', label: 'GND (Black)', type: 'ground' },
    ],
  },
  // Heavy Equipment - John Deere Loader
  {
    id: 'john-deere-loader',
    name: 'John Deere Loader',
    description: 'John Deere 644K/744K wheel loaders with JDLink telematics and PowerTech engine',
    modules: [
      ...createGenericModules(),
      {
        id: 'jd-vcm',
        name: 'JD Vehicle Controller',
        shortName: 'VCM',
        x: 390,
        y: 450,
        width: 120,
        height: 130,
        color: 'hsl(120, 80%, 35%)',
        pins: [
          { id: 'vcm-can-h', label: 'CAN H', side: 'left', position: 0.12 },
          { id: 'vcm-can-l', label: 'CAN L', side: 'left', position: 0.24 },
          { id: 'vcm-pwr', label: 'B+', side: 'top', position: 0.3 },
          { id: 'vcm-gnd', label: 'GND', side: 'top', position: 0.7 },
          { id: 'vcm-lift', label: 'LIFT', side: 'right', position: 0.20 },
          { id: 'vcm-tilt', label: 'TILT', side: 'right', position: 0.40 },
          { id: 'vcm-steer', label: 'STR', side: 'right', position: 0.60 },
          { id: 'vcm-brake', label: 'BRK', side: 'right', position: 0.80 },
        ]
      },
      {
        id: 'lift-cyl',
        name: 'Lift Cylinders',
        shortName: 'LIFT',
        x: 540,
        y: 420,
        width: 75,
        height: 45,
        color: 'hsl(120, 70%, 40%)',
        pins: [
          { id: 'lift-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'tilt-cyl',
        name: 'Tilt Cylinder',
        shortName: 'TILT',
        x: 540,
        y: 475,
        width: 75,
        height: 45,
        color: 'hsl(120, 70%, 40%)',
        pins: [
          { id: 'tilt-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'jd-steer',
        name: 'Steering Valve',
        shortName: 'STR',
        x: 540,
        y: 530,
        width: 75,
        height: 45,
        color: 'hsl(220, 60%, 55%)',
        pins: [
          { id: 'jdsteer-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'jd-brake',
        name: 'Brake System',
        shortName: 'BRK',
        x: 540,
        y: 585,
        width: 75,
        height: 45,
        color: 'hsl(0, 70%, 50%)',
        pins: [
          { id: 'jdbrake-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      ...createPeripherals(),
    ],
    wires: [
      ...createBaseWires(),
      { id: 'vcm-can-h-conn', from: 'dcm-can-h-r', to: 'vcm-can-h', color: '#22c55e', label: 'CAN H (Green)', type: 'can' },
      { id: 'vcm-can-l-conn', from: 'dcm-can-l-r', to: 'vcm-can-l', color: '#22c55e', label: 'CAN L (Green/White)', type: 'can' },
      { id: 'vcm-lift', from: 'vcm-lift', to: 'lift-ctrl', color: '#22c55e', label: 'Lift Control (Green)', type: 'signal' },
      { id: 'vcm-tilt', from: 'vcm-tilt', to: 'tilt-ctrl', color: '#f97316', label: 'Tilt Control (Orange)', type: 'signal' },
      { id: 'vcm-steer', from: 'vcm-steer', to: 'jdsteer-ctrl', color: '#3b82f6', label: 'Steering Control (Blue)', type: 'signal' },
      { id: 'vcm-brake', from: 'vcm-brake', to: 'jdbrake-ctrl', color: '#ef4444', label: 'Brake Control (Red)', type: 'signal' },
      { id: 'pwr-vcm', from: 'bat-pos', to: 'vcm-pwr', color: '#ef4444', label: 'B+ (Red)', type: 'power' },
      { id: 'gnd-vcm', from: 'bat-neg', to: 'vcm-gnd', color: '#1f2937', label: 'GND (Black)', type: 'ground' },
    ],
  },
  // Heavy Equipment - Volvo Motor Grader
  {
    id: 'volvo-grader',
    name: 'Volvo Motor Grader',
    description: 'Volvo G900 series graders with CareTrack telematics and EMS2 engine management',
    modules: [
      ...createGenericModules(),
      {
        id: 'volvo-ems',
        name: 'EMS2 Controller',
        shortName: 'EMS2',
        x: 390,
        y: 450,
        width: 120,
        height: 130,
        color: 'hsl(210, 85%, 45%)',
        pins: [
          { id: 'ems-can-h', label: 'CAN H', side: 'left', position: 0.12 },
          { id: 'ems-can-l', label: 'CAN L', side: 'left', position: 0.24 },
          { id: 'ems-pwr', label: 'B+', side: 'top', position: 0.3 },
          { id: 'ems-gnd', label: 'GND', side: 'top', position: 0.7 },
          { id: 'ems-moldboard', label: 'MLD', side: 'right', position: 0.18 },
          { id: 'ems-circle', label: 'CIR', side: 'right', position: 0.36 },
          { id: 'ems-articulate', label: 'ART', side: 'right', position: 0.54 },
          { id: 'ems-lean', label: 'LN', side: 'right', position: 0.72 },
          { id: 'ems-awd', label: 'AWD', side: 'right', position: 0.90 },
        ]
      },
      {
        id: 'moldboard-cyl',
        name: 'Moldboard Lift',
        shortName: 'MLD',
        x: 540,
        y: 400,
        width: 75,
        height: 40,
        color: 'hsl(210, 80%, 50%)',
        pins: [
          { id: 'mld-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'circle-drive',
        name: 'Circle Drive',
        shortName: 'CIR',
        x: 540,
        y: 450,
        width: 75,
        height: 40,
        color: 'hsl(210, 80%, 50%)',
        pins: [
          { id: 'cir-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'articulate-cyl',
        name: 'Articulation',
        shortName: 'ART',
        x: 540,
        y: 500,
        width: 75,
        height: 40,
        color: 'hsl(280, 70%, 50%)',
        pins: [
          { id: 'art-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'lean-cyl',
        name: 'Wheel Lean',
        shortName: 'LEAN',
        x: 540,
        y: 550,
        width: 75,
        height: 40,
        color: 'hsl(35, 90%, 50%)',
        pins: [
          { id: 'lean-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'awd-motor',
        name: 'AWD Motor',
        shortName: 'AWD',
        x: 540,
        y: 600,
        width: 75,
        height: 40,
        color: 'hsl(220, 60%, 55%)',
        pins: [
          { id: 'awd-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      ...createPeripherals(),
    ],
    wires: [
      ...createBaseWires(),
      { id: 'ems-can-h-conn', from: 'dcm-can-h-r', to: 'ems-can-h', color: '#22c55e', label: 'CAN H (Green)', type: 'can' },
      { id: 'ems-can-l-conn', from: 'dcm-can-l-r', to: 'ems-can-l', color: '#22c55e', label: 'CAN L (Green/White)', type: 'can' },
      { id: 'ems-moldboard', from: 'ems-moldboard', to: 'mld-ctrl', color: '#3b82f6', label: 'Moldboard Control (Blue)', type: 'signal' },
      { id: 'ems-circle', from: 'ems-circle', to: 'cir-ctrl', color: '#f97316', label: 'Circle Control (Orange)', type: 'signal' },
      { id: 'ems-articulate', from: 'ems-articulate', to: 'art-ctrl', color: '#a855f7', label: 'Articulation Control (Purple)', type: 'signal' },
      { id: 'ems-lean', from: 'ems-lean', to: 'lean-ctrl', color: '#eab308', label: 'Lean Control (Yellow)', type: 'signal' },
      { id: 'ems-awd', from: 'ems-awd', to: 'awd-ctrl', color: '#06b6d4', label: 'AWD Control (Cyan)', type: 'signal' },
      { id: 'pwr-ems', from: 'bat-pos', to: 'ems-pwr', color: '#ef4444', label: 'B+ (Red)', type: 'power' },
      { id: 'gnd-ems', from: 'bat-neg', to: 'ems-gnd', color: '#1f2937', label: 'GND (Black)', type: 'ground' },
    ],
  },
  // Heavy Equipment - Case Backhoe
  {
    id: 'case-backhoe',
    name: 'Case Backhoe',
    description: 'Case 580/590 series backhoe loaders with SiteWatch telematics and ProControl system',
    modules: [
      ...createGenericModules(),
      {
        id: 'case-pcm',
        name: 'ProControl Module',
        shortName: 'PCM',
        x: 390,
        y: 450,
        width: 120,
        height: 130,
        color: 'hsl(0, 85%, 45%)',
        pins: [
          { id: 'pcm-can-h', label: 'CAN H', side: 'left', position: 0.12 },
          { id: 'pcm-can-l', label: 'CAN L', side: 'left', position: 0.24 },
          { id: 'pcm-pwr', label: 'B+', side: 'top', position: 0.3 },
          { id: 'pcm-gnd', label: 'GND', side: 'top', position: 0.7 },
          { id: 'pcm-loader', label: 'LDR', side: 'right', position: 0.18 },
          { id: 'pcm-backhoe', label: 'BKH', side: 'right', position: 0.36 },
          { id: 'pcm-stab', label: 'STAB', side: 'right', position: 0.54 },
          { id: 'pcm-extnd', label: 'EXT', side: 'right', position: 0.72 },
          { id: 'pcm-aux', label: 'AUX', side: 'right', position: 0.90 },
        ]
      },
      {
        id: 'loader-valve',
        name: 'Loader Valve',
        shortName: 'LDR',
        x: 540,
        y: 400,
        width: 75,
        height: 40,
        color: 'hsl(0, 75%, 50%)',
        pins: [
          { id: 'ldr-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'backhoe-valve',
        name: 'Backhoe Valve',
        shortName: 'BKH',
        x: 540,
        y: 450,
        width: 75,
        height: 40,
        color: 'hsl(0, 75%, 50%)',
        pins: [
          { id: 'bkh-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'stabilizer-cyl',
        name: 'Stabilizers',
        shortName: 'STAB',
        x: 540,
        y: 500,
        width: 75,
        height: 40,
        color: 'hsl(35, 90%, 50%)',
        pins: [
          { id: 'stab-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'extender-cyl',
        name: 'Extendahoe',
        shortName: 'EXT',
        x: 540,
        y: 550,
        width: 75,
        height: 40,
        color: 'hsl(280, 70%, 50%)',
        pins: [
          { id: 'ext-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'aux-valve',
        name: 'Aux Hydraulics',
        shortName: 'AUX',
        x: 540,
        y: 600,
        width: 75,
        height: 40,
        color: 'hsl(220, 60%, 55%)',
        pins: [
          { id: 'aux-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      ...createPeripherals(),
    ],
    wires: [
      ...createBaseWires(),
      { id: 'pcm-can-h-conn', from: 'dcm-can-h-r', to: 'pcm-can-h', color: '#22c55e', label: 'CAN H (Green)', type: 'can' },
      { id: 'pcm-can-l-conn', from: 'dcm-can-l-r', to: 'pcm-can-l', color: '#22c55e', label: 'CAN L (Green/White)', type: 'can' },
      { id: 'pcm-loader', from: 'pcm-loader', to: 'ldr-ctrl', color: '#ef4444', label: 'Loader Control (Red)', type: 'signal' },
      { id: 'pcm-backhoe', from: 'pcm-backhoe', to: 'bkh-ctrl', color: '#f97316', label: 'Backhoe Control (Orange)', type: 'signal' },
      { id: 'pcm-stab', from: 'pcm-stab', to: 'stab-ctrl', color: '#eab308', label: 'Stabilizer Control (Yellow)', type: 'signal' },
      { id: 'pcm-extnd', from: 'pcm-extnd', to: 'ext-ctrl', color: '#a855f7', label: 'Extendahoe Control (Purple)', type: 'signal' },
      { id: 'pcm-aux', from: 'pcm-aux', to: 'aux-ctrl', color: '#3b82f6', label: 'Aux Control (Blue)', type: 'signal' },
      { id: 'pwr-pcm', from: 'bat-pos', to: 'pcm-pwr', color: '#ef4444', label: 'B+ (Red)', type: 'power' },
      { id: 'gnd-pcm', from: 'bat-neg', to: 'pcm-gnd', color: '#1f2937', label: 'GND (Black)', type: 'ground' },
    ],
  },
  // Semi Truck - Peterbilt
  {
    id: 'peterbilt',
    name: 'Peterbilt',
    description: 'Peterbilt 379/389 series trucks with PACCAR MX engine and ESA diagnostics',
    modules: [
      ...createGenericModules(),
      {
        id: 'pb-esa',
        name: 'ESA Controller',
        shortName: 'ESA',
        x: 390,
        y: 450,
        width: 120,
        height: 130,
        color: 'hsl(0, 90%, 40%)',
        pins: [
          { id: 'esa-can-h', label: 'CAN H', side: 'left', position: 0.12 },
          { id: 'esa-can-l', label: 'CAN L', side: 'left', position: 0.24 },
          { id: 'esa-pwr', label: 'B+', side: 'top', position: 0.3 },
          { id: 'esa-gnd', label: 'GND', side: 'top', position: 0.7 },
          { id: 'esa-abs', label: 'ABS', side: 'right', position: 0.18 },
          { id: 'esa-cluster', label: 'CLST', side: 'right', position: 0.36 },
          { id: 'esa-body', label: 'BCM', side: 'right', position: 0.54 },
          { id: 'esa-hvac', label: 'HVAC', side: 'right', position: 0.72 },
          { id: 'esa-trailer', label: 'TRL', side: 'right', position: 0.90 },
        ]
      },
      {
        id: 'abs-module',
        name: 'ABS Module',
        shortName: 'ABS',
        x: 540,
        y: 400,
        width: 75,
        height: 40,
        color: 'hsl(45, 90%, 50%)',
        pins: [
          { id: 'abs-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'cluster',
        name: 'Instrument Cluster',
        shortName: 'CLST',
        x: 540,
        y: 450,
        width: 75,
        height: 40,
        color: 'hsl(180, 60%, 45%)',
        pins: [
          { id: 'clst-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'body-ctrl',
        name: 'Body Controller',
        shortName: 'BCM',
        x: 540,
        y: 500,
        width: 75,
        height: 40,
        color: 'hsl(280, 70%, 50%)',
        pins: [
          { id: 'bcm-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'hvac-ctrl',
        name: 'HVAC Module',
        shortName: 'HVAC',
        x: 540,
        y: 550,
        width: 75,
        height: 40,
        color: 'hsl(200, 80%, 50%)',
        pins: [
          { id: 'hvac-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'trailer-conn',
        name: 'Trailer Interface',
        shortName: 'TRL',
        x: 540,
        y: 600,
        width: 75,
        height: 40,
        color: 'hsl(35, 90%, 50%)',
        pins: [
          { id: 'trl-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      ...createPeripherals(),
    ],
    wires: [
      ...createBaseWires(),
      { id: 'esa-can-h-conn', from: 'dcm-can-h-r', to: 'esa-can-h', color: '#22c55e', label: 'CAN H (Green)', type: 'can' },
      { id: 'esa-can-l-conn', from: 'dcm-can-l-r', to: 'esa-can-l', color: '#22c55e', label: 'CAN L (Green/White)', type: 'can' },
      { id: 'esa-abs', from: 'esa-abs', to: 'abs-ctrl', color: '#eab308', label: 'ABS Data (Yellow)', type: 'data' },
      { id: 'esa-cluster', from: 'esa-cluster', to: 'clst-ctrl', color: '#06b6d4', label: 'Cluster Data (Cyan)', type: 'data' },
      { id: 'esa-body', from: 'esa-body', to: 'bcm-ctrl', color: '#a855f7', label: 'Body Control (Purple)', type: 'signal' },
      { id: 'esa-hvac', from: 'esa-hvac', to: 'hvac-ctrl', color: '#3b82f6', label: 'HVAC Control (Blue)', type: 'signal' },
      { id: 'esa-trailer', from: 'esa-trailer', to: 'trl-ctrl', color: '#f97316', label: 'Trailer Data (Orange)', type: 'data' },
      { id: 'pwr-esa', from: 'bat-pos', to: 'esa-pwr', color: '#ef4444', label: 'B+ (Red)', type: 'power' },
      { id: 'gnd-esa', from: 'bat-neg', to: 'esa-gnd', color: '#1f2937', label: 'GND (Black)', type: 'ground' },
    ],
  },
  // Semi Truck - Kenworth
  {
    id: 'kenworth',
    name: 'Kenworth',
    description: 'Kenworth W900/T680 series trucks with PACCAR engine and NavPlus system',
    modules: [
      ...createGenericModules(),
      {
        id: 'kw-nav',
        name: 'NavPlus Controller',
        shortName: 'NAV+',
        x: 390,
        y: 450,
        width: 120,
        height: 130,
        color: 'hsl(210, 90%, 35%)',
        pins: [
          { id: 'nav-can-h', label: 'CAN H', side: 'left', position: 0.12 },
          { id: 'nav-can-l', label: 'CAN L', side: 'left', position: 0.24 },
          { id: 'nav-pwr', label: 'B+', side: 'top', position: 0.3 },
          { id: 'nav-gnd', label: 'GND', side: 'top', position: 0.7 },
          { id: 'nav-display', label: 'DSP', side: 'right', position: 0.18 },
          { id: 'nav-audio', label: 'AUD', side: 'right', position: 0.36 },
          { id: 'nav-cam', label: 'CAM', side: 'right', position: 0.54 },
          { id: 'nav-brake', label: 'BRK', side: 'right', position: 0.72 },
          { id: 'nav-pto', label: 'PTO', side: 'right', position: 0.90 },
        ]
      },
      {
        id: 'display-mod',
        name: 'Display Module',
        shortName: 'DSP',
        x: 540,
        y: 400,
        width: 75,
        height: 40,
        color: 'hsl(180, 60%, 45%)',
        pins: [
          { id: 'dsp-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'audio-mod',
        name: 'Audio System',
        shortName: 'AUD',
        x: 540,
        y: 450,
        width: 75,
        height: 40,
        color: 'hsl(280, 70%, 50%)',
        pins: [
          { id: 'aud-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'camera-mod',
        name: 'Camera System',
        shortName: 'CAM',
        x: 540,
        y: 500,
        width: 75,
        height: 40,
        color: 'hsl(45, 90%, 50%)',
        pins: [
          { id: 'cam-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'brake-mod',
        name: 'Brake Controller',
        shortName: 'BRK',
        x: 540,
        y: 550,
        width: 75,
        height: 40,
        color: 'hsl(0, 75%, 50%)',
        pins: [
          { id: 'brk-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'pto-mod',
        name: 'PTO Module',
        shortName: 'PTO',
        x: 540,
        y: 600,
        width: 75,
        height: 40,
        color: 'hsl(35, 90%, 50%)',
        pins: [
          { id: 'pto-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      ...createPeripherals(),
    ],
    wires: [
      ...createBaseWires(),
      { id: 'nav-can-h-conn', from: 'dcm-can-h-r', to: 'nav-can-h', color: '#22c55e', label: 'CAN H (Green)', type: 'can' },
      { id: 'nav-can-l-conn', from: 'dcm-can-l-r', to: 'nav-can-l', color: '#22c55e', label: 'CAN L (Green/White)', type: 'can' },
      { id: 'nav-display', from: 'nav-display', to: 'dsp-ctrl', color: '#06b6d4', label: 'Display Data (Cyan)', type: 'data' },
      { id: 'nav-audio', from: 'nav-audio', to: 'aud-ctrl', color: '#a855f7', label: 'Audio Signal (Purple)', type: 'signal' },
      { id: 'nav-cam', from: 'nav-cam', to: 'cam-ctrl', color: '#eab308', label: 'Camera Video (Yellow)', type: 'data' },
      { id: 'nav-brake', from: 'nav-brake', to: 'brk-ctrl', color: '#ef4444', label: 'Brake Control (Red)', type: 'signal' },
      { id: 'nav-pto', from: 'nav-pto', to: 'pto-ctrl', color: '#f97316', label: 'PTO Control (Orange)', type: 'signal' },
      { id: 'pwr-nav', from: 'bat-pos', to: 'nav-pwr', color: '#ef4444', label: 'B+ (Red)', type: 'power' },
      { id: 'gnd-nav', from: 'bat-neg', to: 'nav-gnd', color: '#1f2937', label: 'GND (Black)', type: 'ground' },
    ],
  },
  // Semi Truck - Freightliner
  {
    id: 'freightliner',
    name: 'Freightliner',
    description: 'Freightliner Cascadia/Columbia series with Detroit engine and Demand Detroit diagnostics',
    modules: [
      ...createGenericModules(),
      {
        id: 'fl-sam',
        name: 'SAM Chassis Module',
        shortName: 'SAM-C',
        x: 390,
        y: 450,
        width: 120,
        height: 130,
        color: 'hsl(0, 0%, 30%)',
        pins: [
          { id: 'sam-can-h', label: 'CAN H', side: 'left', position: 0.12 },
          { id: 'sam-can-l', label: 'CAN L', side: 'left', position: 0.24 },
          { id: 'sam-pwr', label: 'B+', side: 'top', position: 0.3 },
          { id: 'sam-gnd', label: 'GND', side: 'top', position: 0.7 },
          { id: 'sam-lights', label: 'LTS', side: 'right', position: 0.18 },
          { id: 'sam-air', label: 'AIR', side: 'right', position: 0.36 },
          { id: 'sam-def', label: 'DEF', side: 'right', position: 0.54 },
          { id: 'sam-regen', label: 'RGN', side: 'right', position: 0.72 },
          { id: 'sam-icu', label: 'ICU', side: 'right', position: 0.90 },
        ]
      },
      {
        id: 'lights-mod',
        name: 'Lighting Module',
        shortName: 'LTS',
        x: 540,
        y: 400,
        width: 75,
        height: 40,
        color: 'hsl(45, 90%, 50%)',
        pins: [
          { id: 'lts-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'air-mod',
        name: 'Air Dryer',
        shortName: 'AIR',
        x: 540,
        y: 450,
        width: 75,
        height: 40,
        color: 'hsl(200, 80%, 50%)',
        pins: [
          { id: 'air-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'def-mod',
        name: 'DEF System',
        shortName: 'DEF',
        x: 540,
        y: 500,
        width: 75,
        height: 40,
        color: 'hsl(210, 85%, 45%)',
        pins: [
          { id: 'def-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'regen-mod',
        name: 'Regen Module',
        shortName: 'RGN',
        x: 540,
        y: 550,
        width: 75,
        height: 40,
        color: 'hsl(25, 95%, 53%)',
        pins: [
          { id: 'rgn-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'icu-mod',
        name: 'ICU Module',
        shortName: 'ICU',
        x: 540,
        y: 600,
        width: 75,
        height: 40,
        color: 'hsl(180, 60%, 45%)',
        pins: [
          { id: 'icu-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
      ...createPeripherals(),
    ],
    wires: [
      ...createBaseWires(),
      { id: 'sam-can-h-conn', from: 'dcm-can-h-r', to: 'sam-can-h', color: '#22c55e', label: 'CAN H (Green)', type: 'can' },
      { id: 'sam-can-l-conn', from: 'dcm-can-l-r', to: 'sam-can-l', color: '#22c55e', label: 'CAN L (Green/White)', type: 'can' },
      { id: 'sam-lights', from: 'sam-lights', to: 'lts-ctrl', color: '#eab308', label: 'Lighting Control (Yellow)', type: 'signal' },
      { id: 'sam-air', from: 'sam-air', to: 'air-ctrl', color: '#3b82f6', label: 'Air System (Blue)', type: 'signal' },
      { id: 'sam-def', from: 'sam-def', to: 'def-ctrl', color: '#06b6d4', label: 'DEF Control (Cyan)', type: 'signal' },
      { id: 'sam-regen', from: 'sam-regen', to: 'rgn-ctrl', color: '#f97316', label: 'Regen Control (Orange)', type: 'signal' },
      { id: 'sam-icu', from: 'sam-icu', to: 'icu-ctrl', color: '#a855f7', label: 'ICU Data (Purple)', type: 'data' },
      { id: 'pwr-sam', from: 'bat-pos', to: 'sam-pwr', color: '#ef4444', label: 'B+ (Red)', type: 'power' },
      { id: 'gnd-sam', from: 'bat-neg', to: 'sam-gnd', color: '#1f2937', label: 'GND (Black)', type: 'ground' },
    ],
  },
  // Hitachi Excavator
  {
    id: 'hitachi-excavator',
    name: 'Hitachi Excavator',
    description: 'Hitachi ZX series excavators with HIOS III control system and ConSite telematics',
    modules: [
      ...createGenericModules(),
      {
        id: 'hios-iii',
        name: 'HIOS III Controller',
        shortName: 'HIOS',
        x: 390,
        y: 450,
        width: 120,
        height: 130,
        color: 'hsl(25, 95%, 50%)',
        pins: [
          { id: 'hios-can-h', label: 'CAN H', side: 'left', position: 0.12 },
          { id: 'hios-can-l', label: 'CAN L', side: 'left', position: 0.24 },
          { id: 'hios-pwr', label: 'B+', side: 'top', position: 0.3 },
          { id: 'hios-gnd', label: 'GND', side: 'top', position: 0.7 },
          { id: 'hios-boom', label: 'BOOM', side: 'right', position: 0.18 },
          { id: 'hios-arm', label: 'ARM', side: 'right', position: 0.36 },
          { id: 'hios-bucket', label: 'BCKT', side: 'right', position: 0.54 },
          { id: 'hios-swing', label: 'SWNG', side: 'right', position: 0.72 },
          { id: 'hios-travel', label: 'TRVL', side: 'right', position: 0.90 },
        ]
      },
      {
        id: 'hit-boom',
        name: 'Boom Cylinder',
        shortName: 'BOOM',
        x: 540,
        y: 400,
        width: 75,
        height: 40,
        color: 'hsl(25, 90%, 50%)',
        pins: [{ id: 'hboom-ctrl', label: 'CTRL', side: 'left', position: 0.5 }]
      },
      {
        id: 'hit-arm',
        name: 'Arm Cylinder',
        shortName: 'ARM',
        x: 540,
        y: 450,
        width: 75,
        height: 40,
        color: 'hsl(25, 90%, 50%)',
        pins: [{ id: 'harm-ctrl', label: 'CTRL', side: 'left', position: 0.5 }]
      },
      {
        id: 'hit-bucket',
        name: 'Bucket Cylinder',
        shortName: 'BCKT',
        x: 540,
        y: 500,
        width: 75,
        height: 40,
        color: 'hsl(35, 90%, 50%)',
        pins: [{ id: 'hbckt-ctrl', label: 'CTRL', side: 'left', position: 0.5 }]
      },
      {
        id: 'hit-swing',
        name: 'Swing Motor',
        shortName: 'SWNG',
        x: 540,
        y: 550,
        width: 75,
        height: 40,
        color: 'hsl(220, 60%, 55%)',
        pins: [{ id: 'hswng-ctrl', label: 'CTRL', side: 'left', position: 0.5 }]
      },
      {
        id: 'hit-travel',
        name: 'Travel Motors',
        shortName: 'TRVL',
        x: 540,
        y: 600,
        width: 75,
        height: 40,
        color: 'hsl(220, 60%, 55%)',
        pins: [{ id: 'htrvl-ctrl', label: 'CTRL', side: 'left', position: 0.5 }]
      },
      ...createPeripherals(),
    ],
    wires: [
      ...createBaseWires(),
      { id: 'hios-can-h-conn', from: 'dcm-can-h-r', to: 'hios-can-h', color: '#22c55e', label: 'CAN H (Green)', type: 'can' },
      { id: 'hios-can-l-conn', from: 'dcm-can-l-r', to: 'hios-can-l', color: '#22c55e', label: 'CAN L (Green/White)', type: 'can' },
      { id: 'hios-boom', from: 'hios-boom', to: 'hboom-ctrl', color: '#f97316', label: 'Boom Control (Orange)', type: 'signal' },
      { id: 'hios-arm', from: 'hios-arm', to: 'harm-ctrl', color: '#eab308', label: 'Arm Control (Yellow)', type: 'signal' },
      { id: 'hios-bucket', from: 'hios-bucket', to: 'hbckt-ctrl', color: '#a855f7', label: 'Bucket Control (Purple)', type: 'signal' },
      { id: 'hios-swing', from: 'hios-swing', to: 'hswng-ctrl', color: '#3b82f6', label: 'Swing Control (Blue)', type: 'signal' },
      { id: 'hios-travel', from: 'hios-travel', to: 'htrvl-ctrl', color: '#06b6d4', label: 'Travel Control (Cyan)', type: 'signal' },
      { id: 'pwr-hios', from: 'bat-pos', to: 'hios-pwr', color: '#ef4444', label: 'B+ (Red)', type: 'power' },
      { id: 'gnd-hios', from: 'bat-neg', to: 'hios-gnd', color: '#1f2937', label: 'GND (Black)', type: 'ground' },
    ],
  },
  // Link-Belt Excavator
  {
    id: 'linkbelt-excavator',
    name: 'Link-Belt Excavator',
    description: 'Link-Belt X Series excavators with ALIS telematics and Isuzu engine controls',
    modules: [
      ...createGenericModules(),
      {
        id: 'lb-alis',
        name: 'ALIS Controller',
        shortName: 'ALIS',
        x: 390,
        y: 450,
        width: 120,
        height: 130,
        color: 'hsl(200, 85%, 40%)',
        pins: [
          { id: 'alis-can-h', label: 'CAN H', side: 'left', position: 0.12 },
          { id: 'alis-can-l', label: 'CAN L', side: 'left', position: 0.24 },
          { id: 'alis-pwr', label: 'B+', side: 'top', position: 0.3 },
          { id: 'alis-gnd', label: 'GND', side: 'top', position: 0.7 },
          { id: 'alis-boom', label: 'BOOM', side: 'right', position: 0.20 },
          { id: 'alis-stick', label: 'STCK', side: 'right', position: 0.40 },
          { id: 'alis-swing', label: 'SWNG', side: 'right', position: 0.60 },
          { id: 'alis-track', label: 'TRK', side: 'right', position: 0.80 },
        ]
      },
      {
        id: 'lb-boom',
        name: 'Boom Valve',
        shortName: 'BOOM',
        x: 540,
        y: 420,
        width: 75,
        height: 45,
        color: 'hsl(200, 80%, 45%)',
        pins: [{ id: 'lbboom-ctrl', label: 'CTRL', side: 'left', position: 0.5 }]
      },
      {
        id: 'lb-stick',
        name: 'Stick Valve',
        shortName: 'STCK',
        x: 540,
        y: 475,
        width: 75,
        height: 45,
        color: 'hsl(200, 80%, 45%)',
        pins: [{ id: 'lbstck-ctrl', label: 'CTRL', side: 'left', position: 0.5 }]
      },
      {
        id: 'lb-swing',
        name: 'Swing Motor',
        shortName: 'SWNG',
        x: 540,
        y: 530,
        width: 75,
        height: 45,
        color: 'hsl(220, 60%, 55%)',
        pins: [{ id: 'lbswng-ctrl', label: 'CTRL', side: 'left', position: 0.5 }]
      },
      {
        id: 'lb-track',
        name: 'Track Motors',
        shortName: 'TRK',
        x: 540,
        y: 585,
        width: 75,
        height: 45,
        color: 'hsl(280, 70%, 50%)',
        pins: [{ id: 'lbtrk-ctrl', label: 'CTRL', side: 'left', position: 0.5 }]
      },
      ...createPeripherals(),
    ],
    wires: [
      ...createBaseWires(),
      { id: 'alis-can-h-conn', from: 'dcm-can-h-r', to: 'alis-can-h', color: '#22c55e', label: 'CAN H (Green)', type: 'can' },
      { id: 'alis-can-l-conn', from: 'dcm-can-l-r', to: 'alis-can-l', color: '#22c55e', label: 'CAN L (Green/White)', type: 'can' },
      { id: 'alis-boom', from: 'alis-boom', to: 'lbboom-ctrl', color: '#3b82f6', label: 'Boom Control (Blue)', type: 'signal' },
      { id: 'alis-stick', from: 'alis-stick', to: 'lbstck-ctrl', color: '#f97316', label: 'Stick Control (Orange)', type: 'signal' },
      { id: 'alis-swing', from: 'alis-swing', to: 'lbswng-ctrl', color: '#06b6d4', label: 'Swing Control (Cyan)', type: 'signal' },
      { id: 'alis-track', from: 'alis-track', to: 'lbtrk-ctrl', color: '#a855f7', label: 'Track Control (Purple)', type: 'signal' },
      { id: 'pwr-alis', from: 'bat-pos', to: 'alis-pwr', color: '#ef4444', label: 'B+ (Red)', type: 'power' },
      { id: 'gnd-alis', from: 'bat-neg', to: 'alis-gnd', color: '#1f2937', label: 'GND (Black)', type: 'ground' },
    ],
  },
  // CAT Dozer
  {
    id: 'cat-dozer',
    name: 'CAT Dozer',
    description: 'Caterpillar D6/D8/D9 series dozers with GRADE control and Cat Command system',
    modules: [
      ...createGenericModules(),
      {
        id: 'cat-grade',
        name: 'GRADE Controller',
        shortName: 'GRADE',
        x: 390,
        y: 450,
        width: 120,
        height: 130,
        color: 'hsl(45, 95%, 50%)',
        pins: [
          { id: 'grade-can-h', label: 'CAN H', side: 'left', position: 0.12 },
          { id: 'grade-can-l', label: 'CAN L', side: 'left', position: 0.24 },
          { id: 'grade-pwr', label: 'B+', side: 'top', position: 0.3 },
          { id: 'grade-gnd', label: 'GND', side: 'top', position: 0.7 },
          { id: 'grade-blade', label: 'BLD', side: 'right', position: 0.18 },
          { id: 'grade-tilt', label: 'TILT', side: 'right', position: 0.36 },
          { id: 'grade-ripper', label: 'RIP', side: 'right', position: 0.54 },
          { id: 'grade-steer', label: 'STR', side: 'right', position: 0.72 },
          { id: 'grade-trans', label: 'TRN', side: 'right', position: 0.90 },
        ]
      },
      {
        id: 'catd-blade',
        name: 'Blade Lift',
        shortName: 'BLD',
        x: 540,
        y: 400,
        width: 75,
        height: 40,
        color: 'hsl(45, 90%, 50%)',
        pins: [{ id: 'catbld-ctrl', label: 'CTRL', side: 'left', position: 0.5 }]
      },
      {
        id: 'catd-tilt',
        name: 'Blade Tilt',
        shortName: 'TILT',
        x: 540,
        y: 450,
        width: 75,
        height: 40,
        color: 'hsl(45, 90%, 50%)',
        pins: [{ id: 'cattilt-ctrl', label: 'CTRL', side: 'left', position: 0.5 }]
      },
      {
        id: 'catd-ripper',
        name: 'Ripper',
        shortName: 'RIP',
        x: 540,
        y: 500,
        width: 75,
        height: 40,
        color: 'hsl(35, 90%, 50%)',
        pins: [{ id: 'catrip-ctrl', label: 'CTRL', side: 'left', position: 0.5 }]
      },
      {
        id: 'catd-steer',
        name: 'Steering',
        shortName: 'STR',
        x: 540,
        y: 550,
        width: 75,
        height: 40,
        color: 'hsl(220, 60%, 55%)',
        pins: [{ id: 'catstr-ctrl', label: 'CTRL', side: 'left', position: 0.5 }]
      },
      {
        id: 'catd-trans',
        name: 'Powershift Trans',
        shortName: 'TRN',
        x: 540,
        y: 600,
        width: 75,
        height: 40,
        color: 'hsl(280, 70%, 50%)',
        pins: [{ id: 'cattrn-ctrl', label: 'CTRL', side: 'left', position: 0.5 }]
      },
      ...createPeripherals(),
    ],
    wires: [
      ...createBaseWires(),
      { id: 'grade-can-h-conn', from: 'dcm-can-h-r', to: 'grade-can-h', color: '#22c55e', label: 'CAN H (Green)', type: 'can' },
      { id: 'grade-can-l-conn', from: 'dcm-can-l-r', to: 'grade-can-l', color: '#22c55e', label: 'CAN L (Green/White)', type: 'can' },
      { id: 'grade-blade', from: 'grade-blade', to: 'catbld-ctrl', color: '#eab308', label: 'Blade Control (Yellow)', type: 'signal' },
      { id: 'grade-tilt', from: 'grade-tilt', to: 'cattilt-ctrl', color: '#f97316', label: 'Tilt Control (Orange)', type: 'signal' },
      { id: 'grade-ripper', from: 'grade-ripper', to: 'catrip-ctrl', color: '#a855f7', label: 'Ripper Control (Purple)', type: 'signal' },
      { id: 'grade-steer', from: 'grade-steer', to: 'catstr-ctrl', color: '#3b82f6', label: 'Steering Control (Blue)', type: 'signal' },
      { id: 'grade-trans', from: 'grade-trans', to: 'cattrn-ctrl', color: '#06b6d4', label: 'Trans Control (Cyan)', type: 'signal' },
      { id: 'pwr-grade', from: 'bat-pos', to: 'grade-pwr', color: '#ef4444', label: 'B+ (Red)', type: 'power' },
      { id: 'gnd-grade', from: 'bat-neg', to: 'grade-gnd', color: '#1f2937', label: 'GND (Black)', type: 'ground' },
    ],
  },
  // CAT Wheel Loader
  {
    id: 'cat-loader',
    name: 'CAT Wheel Loader',
    description: 'Caterpillar 950/966/980 series wheel loaders with Advanced Productivity System',
    modules: [
      ...createGenericModules(),
      {
        id: 'cat-aps',
        name: 'APS Controller',
        shortName: 'APS',
        x: 390,
        y: 450,
        width: 120,
        height: 130,
        color: 'hsl(45, 95%, 50%)',
        pins: [
          { id: 'aps-can-h', label: 'CAN H', side: 'left', position: 0.12 },
          { id: 'aps-can-l', label: 'CAN L', side: 'left', position: 0.24 },
          { id: 'aps-pwr', label: 'B+', side: 'top', position: 0.3 },
          { id: 'aps-gnd', label: 'GND', side: 'top', position: 0.7 },
          { id: 'aps-lift', label: 'LIFT', side: 'right', position: 0.20 },
          { id: 'aps-tilt', label: 'TILT', side: 'right', position: 0.40 },
          { id: 'aps-steer', label: 'STR', side: 'right', position: 0.60 },
          { id: 'aps-brake', label: 'BRK', side: 'right', position: 0.80 },
        ]
      },
      {
        id: 'catl-lift',
        name: 'Lift Arms',
        shortName: 'LIFT',
        x: 540,
        y: 420,
        width: 75,
        height: 45,
        color: 'hsl(45, 90%, 50%)',
        pins: [{ id: 'catlift-ctrl', label: 'CTRL', side: 'left', position: 0.5 }]
      },
      {
        id: 'catl-tilt',
        name: 'Bucket Tilt',
        shortName: 'TILT',
        x: 540,
        y: 475,
        width: 75,
        height: 45,
        color: 'hsl(45, 90%, 50%)',
        pins: [{ id: 'catltilt-ctrl', label: 'CTRL', side: 'left', position: 0.5 }]
      },
      {
        id: 'catl-steer',
        name: 'Steering',
        shortName: 'STR',
        x: 540,
        y: 530,
        width: 75,
        height: 45,
        color: 'hsl(220, 60%, 55%)',
        pins: [{ id: 'catlstr-ctrl', label: 'CTRL', side: 'left', position: 0.5 }]
      },
      {
        id: 'catl-brake',
        name: 'Brake System',
        shortName: 'BRK',
        x: 540,
        y: 585,
        width: 75,
        height: 45,
        color: 'hsl(0, 75%, 50%)',
        pins: [{ id: 'catlbrk-ctrl', label: 'CTRL', side: 'left', position: 0.5 }]
      },
      ...createPeripherals(),
    ],
    wires: [
      ...createBaseWires(),
      { id: 'aps-can-h-conn', from: 'dcm-can-h-r', to: 'aps-can-h', color: '#22c55e', label: 'CAN H (Green)', type: 'can' },
      { id: 'aps-can-l-conn', from: 'dcm-can-l-r', to: 'aps-can-l', color: '#22c55e', label: 'CAN L (Green/White)', type: 'can' },
      { id: 'aps-lift', from: 'aps-lift', to: 'catlift-ctrl', color: '#22c55e', label: 'Lift Control (Green)', type: 'signal' },
      { id: 'aps-tilt', from: 'aps-tilt', to: 'catltilt-ctrl', color: '#f97316', label: 'Tilt Control (Orange)', type: 'signal' },
      { id: 'aps-steer', from: 'aps-steer', to: 'catlstr-ctrl', color: '#3b82f6', label: 'Steering Control (Blue)', type: 'signal' },
      { id: 'aps-brake', from: 'aps-brake', to: 'catlbrk-ctrl', color: '#ef4444', label: 'Brake Control (Red)', type: 'signal' },
      { id: 'pwr-aps', from: 'bat-pos', to: 'aps-pwr', color: '#ef4444', label: 'B+ (Red)', type: 'power' },
      { id: 'gnd-aps', from: 'bat-neg', to: 'aps-gnd', color: '#1f2937', label: 'GND (Black)', type: 'ground' },
    ],
  },
  // Grove/Manitowoc Crane
  {
    id: 'grove-crane',
    name: 'Grove/Manitowoc Crane',
    description: 'Grove GMK/TMS and Manitowoc series cranes with EPIC control system',
    modules: [
      ...createGenericModules(),
      {
        id: 'epic-ctrl',
        name: 'EPIC Controller',
        shortName: 'EPIC',
        x: 390,
        y: 450,
        width: 120,
        height: 130,
        color: 'hsl(0, 80%, 45%)',
        pins: [
          { id: 'epic-can-h', label: 'CAN H', side: 'left', position: 0.10 },
          { id: 'epic-can-l', label: 'CAN L', side: 'left', position: 0.20 },
          { id: 'epic-pwr', label: 'B+', side: 'top', position: 0.3 },
          { id: 'epic-gnd', label: 'GND', side: 'top', position: 0.7 },
          { id: 'epic-hoist', label: 'HST', side: 'right', position: 0.15 },
          { id: 'epic-boom', label: 'BOOM', side: 'right', position: 0.30 },
          { id: 'epic-swing', label: 'SWNG', side: 'right', position: 0.45 },
          { id: 'epic-outrig', label: 'OUT', side: 'right', position: 0.60 },
          { id: 'epic-lmi', label: 'LMI', side: 'right', position: 0.75 },
          { id: 'epic-atb', label: 'ATB', side: 'right', position: 0.90 },
        ]
      },
      {
        id: 'crane-hoist',
        name: 'Main Hoist',
        shortName: 'HST',
        x: 540,
        y: 390,
        width: 75,
        height: 35,
        color: 'hsl(0, 75%, 50%)',
        pins: [{ id: 'hoist-ctrl', label: 'CTRL', side: 'left', position: 0.5 }]
      },
      {
        id: 'crane-boom',
        name: 'Boom Controls',
        shortName: 'BOOM',
        x: 540,
        y: 435,
        width: 75,
        height: 35,
        color: 'hsl(25, 95%, 50%)',
        pins: [{ id: 'cboom-ctrl', label: 'CTRL', side: 'left', position: 0.5 }]
      },
      {
        id: 'crane-swing',
        name: 'Swing Drive',
        shortName: 'SWNG',
        x: 540,
        y: 480,
        width: 75,
        height: 35,
        color: 'hsl(220, 60%, 55%)',
        pins: [{ id: 'cswng-ctrl', label: 'CTRL', side: 'left', position: 0.5 }]
      },
      {
        id: 'crane-outrig',
        name: 'Outriggers',
        shortName: 'OUT',
        x: 540,
        y: 525,
        width: 75,
        height: 35,
        color: 'hsl(35, 90%, 50%)',
        pins: [{ id: 'cout-ctrl', label: 'CTRL', side: 'left', position: 0.5 }]
      },
      {
        id: 'crane-lmi',
        name: 'Load Moment Ind',
        shortName: 'LMI',
        x: 540,
        y: 570,
        width: 75,
        height: 35,
        color: 'hsl(45, 90%, 50%)',
        pins: [{ id: 'lmi-ctrl', label: 'CTRL', side: 'left', position: 0.5 }]
      },
      {
        id: 'crane-atb',
        name: 'Anti Two-Block',
        shortName: 'ATB',
        x: 540,
        y: 615,
        width: 75,
        height: 35,
        color: 'hsl(280, 70%, 50%)',
        pins: [{ id: 'atb-ctrl', label: 'CTRL', side: 'left', position: 0.5 }]
      },
      ...createPeripherals(),
    ],
    wires: [
      ...createBaseWires(),
      { id: 'epic-can-h-conn', from: 'dcm-can-h-r', to: 'epic-can-h', color: '#22c55e', label: 'CAN H (Green)', type: 'can' },
      { id: 'epic-can-l-conn', from: 'dcm-can-l-r', to: 'epic-can-l', color: '#22c55e', label: 'CAN L (Green/White)', type: 'can' },
      { id: 'epic-hoist', from: 'epic-hoist', to: 'hoist-ctrl', color: '#ef4444', label: 'Hoist Control (Red)', type: 'signal' },
      { id: 'epic-boom', from: 'epic-boom', to: 'cboom-ctrl', color: '#f97316', label: 'Boom Control (Orange)', type: 'signal' },
      { id: 'epic-swing', from: 'epic-swing', to: 'cswng-ctrl', color: '#3b82f6', label: 'Swing Control (Blue)', type: 'signal' },
      { id: 'epic-outrig', from: 'epic-outrig', to: 'cout-ctrl', color: '#eab308', label: 'Outrigger Control (Yellow)', type: 'signal' },
      { id: 'epic-lmi', from: 'epic-lmi', to: 'lmi-ctrl', color: '#06b6d4', label: 'LMI Data (Cyan)', type: 'data' },
      { id: 'epic-atb', from: 'epic-atb', to: 'atb-ctrl', color: '#a855f7', label: 'ATB Signal (Purple)', type: 'signal' },
      { id: 'pwr-epic', from: 'bat-pos', to: 'epic-pwr', color: '#ef4444', label: 'B+ (Red)', type: 'power' },
      { id: 'gnd-epic', from: 'bat-neg', to: 'epic-gnd', color: '#1f2937', label: 'GND (Black)', type: 'ground' },
    ],
  },
  // CAT Motor Scraper
  {
    id: 'cat-scraper',
    name: 'CAT Motor Scraper',
    description: 'Caterpillar 621/631/657 series scrapers with Electronic Control Module',
    modules: [
      ...createGenericModules(),
      {
        id: 'scr-ecm',
        name: 'Scraper ECM',
        shortName: 'S-ECM',
        x: 390,
        y: 450,
        width: 120,
        height: 130,
        color: 'hsl(45, 95%, 50%)',
        pins: [
          { id: 'secm-can-h', label: 'CAN H', side: 'left', position: 0.12 },
          { id: 'secm-can-l', label: 'CAN L', side: 'left', position: 0.24 },
          { id: 'secm-pwr', label: 'B+', side: 'top', position: 0.3 },
          { id: 'secm-gnd', label: 'GND', side: 'top', position: 0.7 },
          { id: 'secm-bowl', label: 'BWL', side: 'right', position: 0.18 },
          { id: 'secm-apron', label: 'APR', side: 'right', position: 0.36 },
          { id: 'secm-ejector', label: 'EJT', side: 'right', position: 0.54 },
          { id: 'secm-steer', label: 'STR', side: 'right', position: 0.72 },
          { id: 'secm-cushion', label: 'CSH', side: 'right', position: 0.90 },
        ]
      },
      {
        id: 'scr-bowl',
        name: 'Bowl Cylinder',
        shortName: 'BWL',
        x: 540,
        y: 400,
        width: 75,
        height: 40,
        color: 'hsl(45, 90%, 50%)',
        pins: [{ id: 'bowl-ctrl', label: 'CTRL', side: 'left', position: 0.5 }]
      },
      {
        id: 'scr-apron',
        name: 'Apron Cylinder',
        shortName: 'APR',
        x: 540,
        y: 450,
        width: 75,
        height: 40,
        color: 'hsl(35, 90%, 50%)',
        pins: [{ id: 'apr-ctrl', label: 'CTRL', side: 'left', position: 0.5 }]
      },
      {
        id: 'scr-ejector',
        name: 'Ejector',
        shortName: 'EJT',
        x: 540,
        y: 500,
        width: 75,
        height: 40,
        color: 'hsl(25, 95%, 50%)',
        pins: [{ id: 'ejt-ctrl', label: 'CTRL', side: 'left', position: 0.5 }]
      },
      {
        id: 'scr-steer',
        name: 'Steering',
        shortName: 'STR',
        x: 540,
        y: 550,
        width: 75,
        height: 40,
        color: 'hsl(220, 60%, 55%)',
        pins: [{ id: 'scrsteer-ctrl', label: 'CTRL', side: 'left', position: 0.5 }]
      },
      {
        id: 'scr-cushion',
        name: 'Cushion Hitch',
        shortName: 'CSH',
        x: 540,
        y: 600,
        width: 75,
        height: 40,
        color: 'hsl(280, 70%, 50%)',
        pins: [{ id: 'csh-ctrl', label: 'CTRL', side: 'left', position: 0.5 }]
      },
      ...createPeripherals(),
    ],
    wires: [
      ...createBaseWires(),
      { id: 'secm-can-h-conn', from: 'dcm-can-h-r', to: 'secm-can-h', color: '#22c55e', label: 'CAN H (Green)', type: 'can' },
      { id: 'secm-can-l-conn', from: 'dcm-can-l-r', to: 'secm-can-l', color: '#22c55e', label: 'CAN L (Green/White)', type: 'can' },
      { id: 'secm-bowl', from: 'secm-bowl', to: 'bowl-ctrl', color: '#eab308', label: 'Bowl Control (Yellow)', type: 'signal' },
      { id: 'secm-apron', from: 'secm-apron', to: 'apr-ctrl', color: '#f97316', label: 'Apron Control (Orange)', type: 'signal' },
      { id: 'secm-ejector', from: 'secm-ejector', to: 'ejt-ctrl', color: '#ef4444', label: 'Ejector Control (Red)', type: 'signal' },
      { id: 'secm-steer', from: 'secm-steer', to: 'scrsteer-ctrl', color: '#3b82f6', label: 'Steering Control (Blue)', type: 'signal' },
      { id: 'secm-cushion', from: 'secm-cushion', to: 'csh-ctrl', color: '#a855f7', label: 'Cushion Control (Purple)', type: 'signal' },
      { id: 'pwr-secm', from: 'bat-pos', to: 'secm-pwr', color: '#ef4444', label: 'B+ (Red)', type: 'power' },
      { id: 'gnd-secm', from: 'bat-neg', to: 'secm-gnd', color: '#1f2937', label: 'GND (Black)', type: 'ground' },
    ],
  },
  // CAT/Bomag Vibratory Roller
  {
    id: 'vibratory-roller',
    name: 'Vibratory Roller',
    description: 'CAT CB/CS series and Bomag BW rollers with Compaction Control system',
    modules: [
      ...createGenericModules(),
      {
        id: 'ccs-ctrl',
        name: 'Compaction Control',
        shortName: 'CCS',
        x: 390,
        y: 450,
        width: 120,
        height: 130,
        color: 'hsl(120, 70%, 40%)',
        pins: [
          { id: 'ccs-can-h', label: 'CAN H', side: 'left', position: 0.12 },
          { id: 'ccs-can-l', label: 'CAN L', side: 'left', position: 0.24 },
          { id: 'ccs-pwr', label: 'B+', side: 'top', position: 0.3 },
          { id: 'ccs-gnd', label: 'GND', side: 'top', position: 0.7 },
          { id: 'ccs-vib', label: 'VIB', side: 'right', position: 0.20 },
          { id: 'ccs-drive', label: 'DRV', side: 'right', position: 0.40 },
          { id: 'ccs-steer', label: 'STR', side: 'right', position: 0.60 },
          { id: 'ccs-meter', label: 'MTR', side: 'right', position: 0.80 },
        ]
      },
      {
        id: 'roll-vib',
        name: 'Vibratory System',
        shortName: 'VIB',
        x: 540,
        y: 420,
        width: 75,
        height: 45,
        color: 'hsl(120, 65%, 45%)',
        pins: [{ id: 'vib-ctrl', label: 'CTRL', side: 'left', position: 0.5 }]
      },
      {
        id: 'roll-drive',
        name: 'Drive Pump',
        shortName: 'DRV',
        x: 540,
        y: 475,
        width: 75,
        height: 45,
        color: 'hsl(220, 60%, 55%)',
        pins: [{ id: 'rdrive-ctrl', label: 'CTRL', side: 'left', position: 0.5 }]
      },
      {
        id: 'roll-steer',
        name: 'Articulated Steer',
        shortName: 'STR',
        x: 540,
        y: 530,
        width: 75,
        height: 45,
        color: 'hsl(35, 90%, 50%)',
        pins: [{ id: 'rsteer-ctrl', label: 'CTRL', side: 'left', position: 0.5 }]
      },
      {
        id: 'roll-meter',
        name: 'Compaction Meter',
        shortName: 'MTR',
        x: 540,
        y: 585,
        width: 75,
        height: 45,
        color: 'hsl(45, 90%, 50%)',
        pins: [{ id: 'meter-ctrl', label: 'CTRL', side: 'left', position: 0.5 }]
      },
      ...createPeripherals(),
    ],
    wires: [
      ...createBaseWires(),
      { id: 'ccs-can-h-conn', from: 'dcm-can-h-r', to: 'ccs-can-h', color: '#22c55e', label: 'CAN H (Green)', type: 'can' },
      { id: 'ccs-can-l-conn', from: 'dcm-can-l-r', to: 'ccs-can-l', color: '#22c55e', label: 'CAN L (Green/White)', type: 'can' },
      { id: 'ccs-vib', from: 'ccs-vib', to: 'vib-ctrl', color: '#22c55e', label: 'Vibration Control (Green)', type: 'signal' },
      { id: 'ccs-drive', from: 'ccs-drive', to: 'rdrive-ctrl', color: '#3b82f6', label: 'Drive Control (Blue)', type: 'signal' },
      { id: 'ccs-steer', from: 'ccs-steer', to: 'rsteer-ctrl', color: '#f97316', label: 'Steering Control (Orange)', type: 'signal' },
      { id: 'ccs-meter', from: 'ccs-meter', to: 'meter-ctrl', color: '#eab308', label: 'Meter Data (Yellow)', type: 'data' },
      { id: 'pwr-ccs', from: 'bat-pos', to: 'ccs-pwr', color: '#ef4444', label: 'B+ (Red)', type: 'power' },
      { id: 'gnd-ccs', from: 'bat-neg', to: 'ccs-gnd', color: '#1f2937', label: 'GND (Black)', type: 'ground' },
    ],
  },
  // Wacker/Mikasa Jumping Jack Rammer
  {
    id: 'jumping-jack',
    name: 'Jumping Jack Rammer',
    description: 'Wacker Neuson BS/DS and Mikasa MTR series rammers with Honda/Robin engine',
    modules: [
      {
        id: 'jj-engine',
        name: 'Small Engine',
        shortName: 'ENG',
        x: 120,
        y: 200,
        width: 120,
        height: 120,
        color: 'hsl(0, 75%, 50%)',
        pins: [
          { id: 'eng-kill', label: 'KILL', side: 'right', position: 0.20 },
          { id: 'eng-ign', label: 'IGN', side: 'right', position: 0.40 },
          { id: 'eng-coil', label: 'COIL', side: 'right', position: 0.60 },
          { id: 'eng-gnd', label: 'GND', side: 'right', position: 0.80 },
        ]
      },
      {
        id: 'jj-kill-sw',
        name: 'Kill Switch',
        shortName: 'KILL',
        x: 300,
        y: 200,
        width: 80,
        height: 50,
        color: 'hsl(0, 80%, 45%)',
        pins: [
          { id: 'kill-in', label: 'IN', side: 'left', position: 0.5 },
          { id: 'kill-out', label: 'OUT', side: 'right', position: 0.5 },
        ]
      },
      {
        id: 'jj-throttle',
        name: 'Throttle Control',
        shortName: 'THR',
        x: 300,
        y: 270,
        width: 80,
        height: 50,
        color: 'hsl(45, 90%, 50%)',
        pins: [
          { id: 'thr-sig', label: 'SIG', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'jj-ignition',
        name: 'Ignition Coil',
        shortName: 'COIL',
        x: 300,
        y: 340,
        width: 80,
        height: 50,
        color: 'hsl(25, 95%, 50%)',
        pins: [
          { id: 'coil-pri', label: 'PRI', side: 'left', position: 0.35 },
          { id: 'coil-sec', label: 'SEC', side: 'right', position: 0.5 },
        ]
      },
      {
        id: 'jj-spark',
        name: 'Spark Plug',
        shortName: 'PLUG',
        x: 420,
        y: 340,
        width: 70,
        height: 50,
        color: 'hsl(210, 80%, 50%)',
        pins: [
          { id: 'plug-in', label: 'HV', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'jj-ground',
        name: 'Engine Ground',
        shortName: 'GND',
        x: 300,
        y: 410,
        width: 80,
        height: 40,
        color: 'hsl(220, 13%, 30%)',
        pins: [
          { id: 'gnd-frame', label: 'FRM', side: 'left', position: 0.5 },
        ]
      },
    ],
    wires: [
      { id: 'jj-kill-wire', from: 'eng-kill', to: 'kill-in', color: '#ef4444', label: 'Kill Circuit (Red)', type: 'signal' },
      { id: 'jj-thr-wire', from: 'eng-ign', to: 'thr-sig', color: '#eab308', label: 'Throttle (Yellow)', type: 'signal' },
      { id: 'jj-coil-wire', from: 'eng-coil', to: 'coil-pri', color: '#f97316', label: 'Primary Coil (Orange)', type: 'power' },
      { id: 'jj-spark-wire', from: 'coil-sec', to: 'plug-in', color: '#3b82f6', label: 'HV Lead (Blue)', type: 'power' },
      { id: 'jj-gnd-wire', from: 'eng-gnd', to: 'gnd-frame', color: '#1f2937', label: 'Ground (Black)', type: 'ground' },
    ],
  },
  // Wacker/Bomag Plate Compactor
  {
    id: 'plate-compactor',
    name: 'Plate Compactor',
    description: 'Wacker Neuson WP/VP and Bomag BVP series plate compactors with Honda/Hatz engine',
    modules: [
      {
        id: 'pc-engine',
        name: 'Diesel/Gas Engine',
        shortName: 'ENG',
        x: 120,
        y: 200,
        width: 120,
        height: 120,
        color: 'hsl(0, 75%, 50%)',
        pins: [
          { id: 'pceng-start', label: 'STR', side: 'right', position: 0.15 },
          { id: 'pceng-stop', label: 'STP', side: 'right', position: 0.30 },
          { id: 'pceng-oil', label: 'OIL', side: 'right', position: 0.45 },
          { id: 'pceng-coil', label: 'COIL', side: 'right', position: 0.60 },
          { id: 'pceng-exc', label: 'EXC', side: 'right', position: 0.75 },
          { id: 'pceng-gnd', label: 'GND', side: 'right', position: 0.90 },
        ]
      },
      {
        id: 'pc-throttle',
        name: 'Throttle Lever',
        shortName: 'THR',
        x: 300,
        y: 190,
        width: 80,
        height: 45,
        color: 'hsl(45, 90%, 50%)',
        pins: [
          { id: 'pcthr-sig', label: 'SIG', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'pc-oil-sw',
        name: 'Oil Level Switch',
        shortName: 'OIL',
        x: 300,
        y: 245,
        width: 80,
        height: 45,
        color: 'hsl(25, 95%, 50%)',
        pins: [
          { id: 'oil-sens', label: 'SENS', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'pc-ignition',
        name: 'Magneto/CDI',
        shortName: 'MAG',
        x: 300,
        y: 300,
        width: 80,
        height: 45,
        color: 'hsl(280, 70%, 50%)',
        pins: [
          { id: 'mag-in', label: 'IN', side: 'left', position: 0.5 },
          { id: 'mag-out', label: 'OUT', side: 'right', position: 0.5 },
        ]
      },
      {
        id: 'pc-exciter',
        name: 'Exciter Unit',
        shortName: 'EXC',
        x: 300,
        y: 355,
        width: 80,
        height: 45,
        color: 'hsl(120, 65%, 45%)',
        pins: [
          { id: 'exc-drv', label: 'DRV', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'pc-spark',
        name: 'Spark Plug',
        shortName: 'PLUG',
        x: 420,
        y: 300,
        width: 70,
        height: 45,
        color: 'hsl(210, 80%, 50%)',
        pins: [
          { id: 'pcplug-in', label: 'HV', side: 'left', position: 0.5 },
        ]
      },
    ],
    wires: [
      { id: 'pc-thr-wire', from: 'pceng-start', to: 'pcthr-sig', color: '#eab308', label: 'Throttle (Yellow)', type: 'signal' },
      { id: 'pc-oil-wire', from: 'pceng-oil', to: 'oil-sens', color: '#f97316', label: 'Oil Sensor (Orange)', type: 'signal' },
      { id: 'pc-mag-wire', from: 'pceng-coil', to: 'mag-in', color: '#a855f7', label: 'Magneto (Purple)', type: 'power' },
      { id: 'pc-spark-wire', from: 'mag-out', to: 'pcplug-in', color: '#3b82f6', label: 'HV Lead (Blue)', type: 'power' },
      { id: 'pc-exc-wire', from: 'pceng-exc', to: 'exc-drv', color: '#22c55e', label: 'Exciter Drive (Green)', type: 'signal' },
    ],
  },
  // Honda Generator/Power Equipment
  {
    id: 'honda-generator',
    name: 'Honda Generator',
    description: 'Honda EU/EB/EM series generators with GX engine and inverter system',
    modules: [
      {
        id: 'gen-engine',
        name: 'GX Engine',
        shortName: 'GX',
        x: 80,
        y: 200,
        width: 100,
        height: 120,
        color: 'hsl(0, 75%, 50%)',
        pins: [
          { id: 'gxeng-ign', label: 'IGN', side: 'right', position: 0.20 },
          { id: 'gxeng-oil', label: 'OIL', side: 'right', position: 0.40 },
          { id: 'gxeng-alt', label: 'ALT', side: 'right', position: 0.60 },
          { id: 'gxeng-gnd', label: 'GND', side: 'right', position: 0.80 },
        ]
      },
      {
        id: 'gen-ecu',
        name: 'Inverter ECU',
        shortName: 'ECU',
        x: 230,
        y: 200,
        width: 100,
        height: 100,
        color: 'hsl(210, 85%, 45%)',
        pins: [
          { id: 'ecu-ign', label: 'IGN', side: 'left', position: 0.25 },
          { id: 'ecu-oil', label: 'OIL', side: 'left', position: 0.50 },
          { id: 'ecu-ac-in', label: 'AC-I', side: 'left', position: 0.75 },
          { id: 'ecu-ac-out', label: 'AC-O', side: 'right', position: 0.35 },
          { id: 'ecu-dc', label: 'DC', side: 'right', position: 0.65 },
        ]
      },
      {
        id: 'gen-alternator',
        name: 'Alternator',
        shortName: 'ALT',
        x: 80,
        y: 350,
        width: 100,
        height: 80,
        color: 'hsl(45, 90%, 50%)',
        pins: [
          { id: 'alt-out', label: 'OUT', side: 'right', position: 0.5 },
        ]
      },
      {
        id: 'gen-panel',
        name: 'Control Panel',
        shortName: 'PANL',
        x: 380,
        y: 200,
        width: 100,
        height: 100,
        color: 'hsl(120, 65%, 40%)',
        pins: [
          { id: 'panl-ac', label: '120V', side: 'left', position: 0.35 },
          { id: 'panl-dc', label: '12V', side: 'left', position: 0.65 },
          { id: 'panl-gfci', label: 'GFCI', side: 'right', position: 0.5 },
        ]
      },
      {
        id: 'gen-outlets',
        name: 'GFCI Outlets',
        shortName: 'GFCI',
        x: 520,
        y: 220,
        width: 80,
        height: 60,
        color: 'hsl(25, 95%, 50%)',
        pins: [
          { id: 'gfci-in', label: 'IN', side: 'left', position: 0.5 },
        ]
      },
    ],
    wires: [
      { id: 'gen-ign-wire', from: 'gxeng-ign', to: 'ecu-ign', color: '#ef4444', label: 'Ignition (Red)', type: 'signal' },
      { id: 'gen-oil-wire', from: 'gxeng-oil', to: 'ecu-oil', color: '#f97316', label: 'Oil Alert (Orange)', type: 'signal' },
      { id: 'gen-alt-wire', from: 'gxeng-alt', to: 'alt-out', color: '#eab308', label: 'Stator (Yellow)', type: 'power' },
      { id: 'gen-ac-wire', from: 'alt-out', to: 'ecu-ac-in', color: '#eab308', label: 'AC Input (Yellow)', type: 'power' },
      { id: 'gen-acout-wire', from: 'ecu-ac-out', to: 'panl-ac', color: '#22c55e', label: 'AC Output (Green)', type: 'power' },
      { id: 'gen-dc-wire', from: 'ecu-dc', to: 'panl-dc', color: '#3b82f6', label: 'DC Output (Blue)', type: 'power' },
      { id: 'gen-gfci-wire', from: 'panl-gfci', to: 'gfci-in', color: '#a855f7', label: 'GFCI Circuit (Purple)', type: 'power' },
    ],
  },
  // Concrete Saw / Cut-Off Saw
  {
    id: 'concrete-saw',
    name: 'Concrete Cut-Off Saw',
    description: 'Stihl TS/Husqvarna K series cut-off saws with 2-stroke engine and centrifugal clutch',
    modules: [
      {
        id: 'saw-engine',
        name: '2-Stroke Engine',
        shortName: '2STR',
        x: 120,
        y: 200,
        width: 110,
        height: 110,
        color: 'hsl(25, 95%, 50%)',
        pins: [
          { id: 'saweng-ign', label: 'IGN', side: 'right', position: 0.20 },
          { id: 'saweng-kill', label: 'KILL', side: 'right', position: 0.40 },
          { id: 'saweng-coil', label: 'COIL', side: 'right', position: 0.60 },
          { id: 'saweng-gnd', label: 'GND', side: 'right', position: 0.80 },
        ]
      },
      {
        id: 'saw-module',
        name: 'Ignition Module',
        shortName: 'IGN',
        x: 280,
        y: 200,
        width: 90,
        height: 70,
        color: 'hsl(280, 70%, 50%)',
        pins: [
          { id: 'ign-pulse', label: 'PLS', side: 'left', position: 0.5 },
          { id: 'ign-hv', label: 'HV', side: 'right', position: 0.5 },
        ]
      },
      {
        id: 'saw-kill',
        name: 'Kill Switch',
        shortName: 'KILL',
        x: 280,
        y: 290,
        width: 90,
        height: 50,
        color: 'hsl(0, 80%, 45%)',
        pins: [
          { id: 'sawkill-in', label: 'IN', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'saw-spark',
        name: 'Spark Plug',
        shortName: 'PLUG',
        x: 420,
        y: 210,
        width: 75,
        height: 50,
        color: 'hsl(210, 80%, 50%)',
        pins: [
          { id: 'sawplug-in', label: 'HV', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'saw-decompression',
        name: 'Decompression Valve',
        shortName: 'DCMP',
        x: 280,
        y: 360,
        width: 90,
        height: 45,
        color: 'hsl(45, 90%, 50%)',
        pins: [
          { id: 'dcmp-act', label: 'ACT', side: 'left', position: 0.5 },
        ]
      },
    ],
    wires: [
      { id: 'saw-ign-wire', from: 'saweng-ign', to: 'ign-pulse', color: '#a855f7', label: 'Ignition Pulse (Purple)', type: 'signal' },
      { id: 'saw-kill-wire', from: 'saweng-kill', to: 'sawkill-in', color: '#ef4444', label: 'Kill Circuit (Red)', type: 'signal' },
      { id: 'saw-hv-wire', from: 'ign-hv', to: 'sawplug-in', color: '#3b82f6', label: 'HV Lead (Blue)', type: 'power' },
      { id: 'saw-coil-wire', from: 'saweng-coil', to: 'dcmp-act', color: '#f97316', label: 'Coil Ground (Orange)', type: 'ground' },
    ],
  },
  // Volvo Excavator
  {
    id: 'volvo-excavator',
    name: 'Volvo Excavator',
    description: 'Volvo EC series excavators with VCADS Pro diagnostic system and V-ACT engine control',
    modules: [
      {
        id: 'volvo-vecu',
        name: 'V-ECU Engine Controller',
        shortName: 'V-ECU',
        x: 50,
        y: 180,
        width: 120,
        height: 140,
        color: 'hsl(210, 85%, 50%)',
        pins: [
          { id: 'vecu-can1-h', label: 'CAN1 H', side: 'right', position: 0.15 },
          { id: 'vecu-can1-l', label: 'CAN1 L', side: 'right', position: 0.25 },
          { id: 'vecu-pwr', label: 'B+', side: 'top', position: 0.3 },
          { id: 'vecu-gnd', label: 'GND', side: 'top', position: 0.7 },
          { id: 'vecu-fuel', label: 'FUEL', side: 'right', position: 0.45 },
          { id: 'vecu-egr', label: 'EGR', side: 'right', position: 0.60 },
          { id: 'vecu-turbo', label: 'VGT', side: 'right', position: 0.75 },
          { id: 'vecu-dpf', label: 'DPF', side: 'bottom', position: 0.5 },
        ]
      },
      {
        id: 'volvo-vcm',
        name: 'Vehicle Control Module',
        shortName: 'VCM',
        x: 220,
        y: 180,
        width: 120,
        height: 140,
        color: 'hsl(45, 90%, 50%)',
        pins: [
          { id: 'vcm-can1-h', label: 'CAN1 H', side: 'left', position: 0.15 },
          { id: 'vcm-can1-l', label: 'CAN1 L', side: 'left', position: 0.25 },
          { id: 'vcm-can2-h', label: 'CAN2 H', side: 'right', position: 0.15 },
          { id: 'vcm-can2-l', label: 'CAN2 L', side: 'right', position: 0.25 },
          { id: 'vcm-pwr', label: 'B+', side: 'top', position: 0.3 },
          { id: 'vcm-gnd', label: 'GND', side: 'top', position: 0.7 },
          { id: 'vcm-joy-l', label: 'JOY-L', side: 'bottom', position: 0.3 },
          { id: 'vcm-joy-r', label: 'JOY-R', side: 'bottom', position: 0.7 },
        ]
      },
      {
        id: 'volvo-mcu',
        name: 'Monitor Control Unit',
        shortName: 'MCU',
        x: 390,
        y: 180,
        width: 110,
        height: 100,
        color: 'hsl(280, 70%, 50%)',
        pins: [
          { id: 'mcu-can2-h', label: 'CAN2 H', side: 'left', position: 0.25 },
          { id: 'mcu-can2-l', label: 'CAN2 L', side: 'left', position: 0.45 },
          { id: 'mcu-pwr', label: 'B+', side: 'top', position: 0.35 },
          { id: 'mcu-gnd', label: 'GND', side: 'top', position: 0.65 },
          { id: 'mcu-disp', label: 'DISP', side: 'right', position: 0.5 },
        ]
      },
      {
        id: 'volvo-hcu',
        name: 'Hydraulic Control Unit',
        shortName: 'HCU',
        x: 50,
        y: 400,
        width: 120,
        height: 120,
        color: 'hsl(340, 75%, 50%)',
        pins: [
          { id: 'hcu-can2-h', label: 'CAN2 H', side: 'right', position: 0.15 },
          { id: 'hcu-can2-l', label: 'CAN2 L', side: 'right', position: 0.30 },
          { id: 'hcu-pwr', label: 'B+', side: 'top', position: 0.3 },
          { id: 'hcu-gnd', label: 'GND', side: 'top', position: 0.7 },
          { id: 'hcu-pump1', label: 'P1', side: 'bottom', position: 0.25 },
          { id: 'hcu-pump2', label: 'P2', side: 'bottom', position: 0.50 },
          { id: 'hcu-swing', label: 'SWG', side: 'bottom', position: 0.75 },
        ]
      },
      {
        id: 'volvo-tcu',
        name: 'Track Control Unit',
        shortName: 'TCU',
        x: 220,
        y: 400,
        width: 120,
        height: 120,
        color: 'hsl(25, 90%, 50%)',
        pins: [
          { id: 'tcu-can2-h', label: 'CAN2 H', side: 'left', position: 0.15 },
          { id: 'tcu-can2-l', label: 'CAN2 L', side: 'left', position: 0.30 },
          { id: 'tcu-pwr', label: 'B+', side: 'top', position: 0.3 },
          { id: 'tcu-gnd', label: 'GND', side: 'top', position: 0.7 },
          { id: 'tcu-left', label: 'L-TRK', side: 'bottom', position: 0.35 },
          { id: 'tcu-right', label: 'R-TRK', side: 'bottom', position: 0.65 },
        ]
      },
      {
        id: 'volvo-caretrack',
        name: 'CareTrack Telematics',
        shortName: 'CARE',
        x: 390,
        y: 320,
        width: 110,
        height: 100,
        color: 'hsl(142, 70%, 45%)',
        pins: [
          { id: 'care-can2-h', label: 'CAN2 H', side: 'left', position: 0.25 },
          { id: 'care-can2-l', label: 'CAN2 L', side: 'left', position: 0.45 },
          { id: 'care-pwr', label: 'B+', side: 'top', position: 0.35 },
          { id: 'care-gnd', label: 'GND', side: 'top', position: 0.65 },
          { id: 'care-gps', label: 'GPS', side: 'right', position: 0.35 },
          { id: 'care-cell', label: 'CELL', side: 'right', position: 0.65 },
        ]
      },
      {
        id: 'volvo-display',
        name: 'LCD Display Panel',
        shortName: 'LCD',
        x: 530,
        y: 180,
        width: 80,
        height: 60,
        color: 'hsl(200, 80%, 45%)',
        pins: [
          { id: 'lcd-in', label: 'DATA', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'volvo-joy-l',
        name: 'Left Joystick',
        shortName: 'JOY-L',
        x: 180,
        y: 550,
        width: 80,
        height: 50,
        color: 'hsl(180, 60%, 45%)',
        pins: [
          { id: 'joyl-sig', label: 'SIG', side: 'top', position: 0.5 },
        ]
      },
      {
        id: 'volvo-joy-r',
        name: 'Right Joystick',
        shortName: 'JOY-R',
        x: 280,
        y: 550,
        width: 80,
        height: 50,
        color: 'hsl(180, 60%, 45%)',
        pins: [
          { id: 'joyr-sig', label: 'SIG', side: 'top', position: 0.5 },
        ]
      },
      {
        id: 'volvo-pump1',
        name: 'Main Pump 1',
        shortName: 'P1',
        x: 30,
        y: 550,
        width: 70,
        height: 50,
        color: 'hsl(220, 70%, 50%)',
        pins: [
          { id: 'p1-ctrl', label: 'CTRL', side: 'top', position: 0.5 },
        ]
      },
      {
        id: 'volvo-pump2',
        name: 'Main Pump 2',
        shortName: 'P2',
        x: 110,
        y: 550,
        width: 60,
        height: 50,
        color: 'hsl(220, 70%, 50%)',
        pins: [
          { id: 'p2-ctrl', label: 'CTRL', side: 'top', position: 0.5 },
        ]
      },
      {
        id: 'volvo-battery',
        name: 'Battery Bank 24V',
        shortName: '24V',
        x: 220,
        y: 50,
        width: 120,
        height: 55,
        color: 'hsl(0, 72%, 51%)',
        pins: [
          { id: 'vbat-pos', label: '+', side: 'bottom', position: 0.3 },
          { id: 'vbat-neg', label: '-', side: 'bottom', position: 0.7 },
        ]
      },
      {
        id: 'volvo-gps',
        name: 'GPS Antenna',
        shortName: 'GPS',
        x: 530,
        y: 300,
        width: 70,
        height: 45,
        color: 'hsl(45, 93%, 47%)',
        pins: [
          { id: 'vgps-sig', label: 'SIG', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'volvo-cell',
        name: 'Cellular Antenna',
        shortName: 'CELL',
        x: 530,
        y: 360,
        width: 70,
        height: 45,
        color: 'hsl(45, 93%, 47%)',
        pins: [
          { id: 'vcell-sig', label: 'SIG', side: 'left', position: 0.5 },
        ]
      },
    ],
    wires: [
      // CAN1 Bus (Engine network)
      { id: 'v-can1-h', from: 'vecu-can1-h', to: 'vcm-can1-h', color: '#22c55e', label: 'CAN1 H (Green)', type: 'can' },
      { id: 'v-can1-l', from: 'vecu-can1-l', to: 'vcm-can1-l', color: '#22c55e', label: 'CAN1 L (Green/Wht)', type: 'can' },
      // CAN2 Bus (Machine network)
      { id: 'v-can2-h-1', from: 'vcm-can2-h', to: 'mcu-can2-h', color: '#3b82f6', label: 'CAN2 H (Blue)', type: 'can' },
      { id: 'v-can2-l-1', from: 'vcm-can2-l', to: 'mcu-can2-l', color: '#3b82f6', label: 'CAN2 L (Blue/Wht)', type: 'can' },
      { id: 'v-can2-h-2', from: 'hcu-can2-h', to: 'tcu-can2-h', color: '#3b82f6', label: 'CAN2 H (Blue)', type: 'can' },
      { id: 'v-can2-l-2', from: 'hcu-can2-l', to: 'tcu-can2-l', color: '#3b82f6', label: 'CAN2 L (Blue/Wht)', type: 'can' },
      { id: 'v-can2-h-3', from: 'mcu-can2-h', to: 'care-can2-h', color: '#3b82f6', label: 'CAN2 H (Blue)', type: 'can' },
      { id: 'v-can2-l-3', from: 'mcu-can2-l', to: 'care-can2-l', color: '#3b82f6', label: 'CAN2 L (Blue/Wht)', type: 'can' },
      // Power distribution
      { id: 'v-pwr-vecu', from: 'vbat-pos', to: 'vecu-pwr', color: '#ef4444', label: 'B+ (Red)', type: 'power' },
      { id: 'v-pwr-vcm', from: 'vbat-pos', to: 'vcm-pwr', color: '#ef4444', label: 'B+ (Red)', type: 'power' },
      { id: 'v-pwr-mcu', from: 'vbat-pos', to: 'mcu-pwr', color: '#ef4444', label: 'B+ (Red)', type: 'power' },
      { id: 'v-pwr-hcu', from: 'vbat-pos', to: 'hcu-pwr', color: '#ef4444', label: 'B+ (Red)', type: 'power' },
      { id: 'v-pwr-tcu', from: 'vbat-pos', to: 'tcu-pwr', color: '#ef4444', label: 'B+ (Red)', type: 'power' },
      { id: 'v-pwr-care', from: 'vbat-pos', to: 'care-pwr', color: '#ef4444', label: 'B+ (Red)', type: 'power' },
      // Ground distribution
      { id: 'v-gnd-vecu', from: 'vbat-neg', to: 'vecu-gnd', color: '#1f2937', label: 'GND (Black)', type: 'ground' },
      { id: 'v-gnd-vcm', from: 'vbat-neg', to: 'vcm-gnd', color: '#1f2937', label: 'GND (Black)', type: 'ground' },
      { id: 'v-gnd-mcu', from: 'vbat-neg', to: 'mcu-gnd', color: '#1f2937', label: 'GND (Black)', type: 'ground' },
      { id: 'v-gnd-hcu', from: 'vbat-neg', to: 'hcu-gnd', color: '#1f2937', label: 'GND (Black)', type: 'ground' },
      { id: 'v-gnd-tcu', from: 'vbat-neg', to: 'tcu-gnd', color: '#1f2937', label: 'GND (Black)', type: 'ground' },
      { id: 'v-gnd-care', from: 'vbat-neg', to: 'care-gnd', color: '#1f2937', label: 'GND (Black)', type: 'ground' },
      // Signal connections
      { id: 'v-disp', from: 'mcu-disp', to: 'lcd-in', color: '#a855f7', label: 'Display Data (Purple)', type: 'data' },
      { id: 'v-joy-l', from: 'vcm-joy-l', to: 'joyl-sig', color: '#06b6d4', label: 'Left Joystick (Cyan)', type: 'signal' },
      { id: 'v-joy-r', from: 'vcm-joy-r', to: 'joyr-sig', color: '#06b6d4', label: 'Right Joystick (Cyan)', type: 'signal' },
      { id: 'v-pump1', from: 'hcu-pump1', to: 'p1-ctrl', color: '#f97316', label: 'Pump 1 Control (Orange)', type: 'signal' },
      { id: 'v-pump2', from: 'hcu-pump2', to: 'p2-ctrl', color: '#f97316', label: 'Pump 2 Control (Orange)', type: 'signal' },
      { id: 'v-gps', from: 'care-gps', to: 'vgps-sig', color: '#eab308', label: 'GPS Coax (Yellow)', type: 'data' },
      { id: 'v-cell', from: 'care-cell', to: 'vcell-sig', color: '#eab308', label: 'Cellular Coax (Yellow)', type: 'data' },
    ],
  },
  // Liebherr Crane
  {
    id: 'liebherr-crane',
    name: 'Liebherr Crane',
    description: 'Liebherr LTM/LTR mobile cranes with LICCON2 crane control and LMI safety system',
    modules: [
      {
        id: 'liccon',
        name: 'LICCON2 Controller',
        shortName: 'LICCON',
        x: 50,
        y: 180,
        width: 130,
        height: 150,
        color: 'hsl(45, 95%, 50%)',
        pins: [
          { id: 'lic-can1-h', label: 'CAN1 H', side: 'right', position: 0.10 },
          { id: 'lic-can1-l', label: 'CAN1 L', side: 'right', position: 0.20 },
          { id: 'lic-can2-h', label: 'CAN2 H', side: 'right', position: 0.30 },
          { id: 'lic-can2-l', label: 'CAN2 L', side: 'right', position: 0.40 },
          { id: 'lic-pwr', label: 'B+', side: 'top', position: 0.3 },
          { id: 'lic-gnd', label: 'GND', side: 'top', position: 0.7 },
          { id: 'lic-lmi', label: 'LMI', side: 'bottom', position: 0.3 },
          { id: 'lic-boom', label: 'BOOM', side: 'bottom', position: 0.5 },
          { id: 'lic-hoist', label: 'HOIST', side: 'bottom', position: 0.7 },
        ]
      },
      {
        id: 'lh-lmi',
        name: 'LMI Safety System',
        shortName: 'LMI',
        x: 230,
        y: 180,
        width: 120,
        height: 120,
        color: 'hsl(0, 80%, 50%)',
        pins: [
          { id: 'lmi-can1-h', label: 'CAN1 H', side: 'left', position: 0.15 },
          { id: 'lmi-can1-l', label: 'CAN1 L', side: 'left', position: 0.30 },
          { id: 'lmi-pwr', label: 'B+', side: 'top', position: 0.3 },
          { id: 'lmi-gnd', label: 'GND', side: 'top', position: 0.7 },
          { id: 'lmi-load', label: 'LOAD', side: 'right', position: 0.25 },
          { id: 'lmi-angle', label: 'ANGLE', side: 'right', position: 0.50 },
          { id: 'lmi-length', label: 'LEN', side: 'right', position: 0.75 },
        ]
      },
      {
        id: 'lh-display',
        name: 'Operator Display',
        shortName: 'DISP',
        x: 400,
        y: 180,
        width: 100,
        height: 80,
        color: 'hsl(200, 85%, 50%)',
        pins: [
          { id: 'disp-can1-h', label: 'CAN1 H', side: 'left', position: 0.30 },
          { id: 'disp-can1-l', label: 'CAN1 L', side: 'left', position: 0.60 },
          { id: 'disp-pwr', label: 'B+', side: 'top', position: 0.35 },
          { id: 'disp-gnd', label: 'GND', side: 'top', position: 0.65 },
        ]
      },
      {
        id: 'lh-engine',
        name: 'Engine Controller',
        shortName: 'ECU',
        x: 50,
        y: 400,
        width: 120,
        height: 110,
        color: 'hsl(25, 90%, 50%)',
        pins: [
          { id: 'lh-ecu-can2-h', label: 'CAN2 H', side: 'right', position: 0.20 },
          { id: 'lh-ecu-can2-l', label: 'CAN2 L', side: 'right', position: 0.40 },
          { id: 'lh-ecu-pwr', label: 'B+', side: 'top', position: 0.3 },
          { id: 'lh-ecu-gnd', label: 'GND', side: 'top', position: 0.7 },
          { id: 'lh-ecu-fuel', label: 'FUEL', side: 'bottom', position: 0.5 },
        ]
      },
      {
        id: 'lh-pump-ctrl',
        name: 'Pump Controller',
        shortName: 'PUMP',
        x: 230,
        y: 400,
        width: 110,
        height: 100,
        color: 'hsl(280, 70%, 50%)',
        pins: [
          { id: 'pump-can2-h', label: 'CAN2 H', side: 'left', position: 0.20 },
          { id: 'pump-can2-l', label: 'CAN2 L', side: 'left', position: 0.40 },
          { id: 'pump-pwr', label: 'B+', side: 'top', position: 0.35 },
          { id: 'pump-gnd', label: 'GND', side: 'top', position: 0.65 },
          { id: 'pump-main', label: 'MAIN', side: 'right', position: 0.35 },
          { id: 'pump-aux', label: 'AUX', side: 'right', position: 0.65 },
        ]
      },
      {
        id: 'lh-slew',
        name: 'Slew Control',
        shortName: 'SLEW',
        x: 400,
        y: 320,
        width: 100,
        height: 80,
        color: 'hsl(340, 75%, 50%)',
        pins: [
          { id: 'slew-can2-h', label: 'CAN2 H', side: 'left', position: 0.30 },
          { id: 'slew-can2-l', label: 'CAN2 L', side: 'left', position: 0.60 },
          { id: 'slew-pwr', label: 'B+', side: 'top', position: 0.35 },
          { id: 'slew-gnd', label: 'GND', side: 'top', position: 0.65 },
        ]
      },
      {
        id: 'lh-load-cell',
        name: 'Load Cell',
        shortName: 'LOAD',
        x: 400,
        y: 430,
        width: 90,
        height: 50,
        color: 'hsl(120, 65%, 45%)',
        pins: [
          { id: 'load-sig', label: 'SIG', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'lh-angle-sensor',
        name: 'Boom Angle Sensor',
        shortName: 'ANGLE',
        x: 400,
        y: 500,
        width: 90,
        height: 50,
        color: 'hsl(180, 60%, 45%)',
        pins: [
          { id: 'angle-sig', label: 'SIG', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'lh-length-sensor',
        name: 'Boom Length Sensor',
        shortName: 'LENGTH',
        x: 400,
        y: 570,
        width: 90,
        height: 50,
        color: 'hsl(60, 70%, 45%)',
        pins: [
          { id: 'length-sig', label: 'SIG', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'lh-battery',
        name: 'Battery Bank 24V',
        shortName: '24V',
        x: 200,
        y: 50,
        width: 120,
        height: 55,
        color: 'hsl(0, 72%, 51%)',
        pins: [
          { id: 'lhbat-pos', label: '+', side: 'bottom', position: 0.3 },
          { id: 'lhbat-neg', label: '-', side: 'bottom', position: 0.7 },
        ]
      },
      {
        id: 'lh-main-pump',
        name: 'Main Hydraulic Pump',
        shortName: 'M-PMP',
        x: 380,
        y: 430,
        width: 80,
        height: 50,
        color: 'hsl(220, 70%, 50%)',
        pins: [
          { id: 'mpump-ctrl', label: 'CTRL', side: 'left', position: 0.5 },
        ]
      },
    ],
    wires: [
      // CAN1 Bus (Safety network)
      { id: 'lh-can1-h-1', from: 'lic-can1-h', to: 'lmi-can1-h', color: '#ef4444', label: 'CAN1 H Safety (Red)', type: 'can' },
      { id: 'lh-can1-l-1', from: 'lic-can1-l', to: 'lmi-can1-l', color: '#ef4444', label: 'CAN1 L Safety (Red/Wht)', type: 'can' },
      { id: 'lh-can1-h-2', from: 'lmi-can1-h', to: 'disp-can1-h', color: '#ef4444', label: 'CAN1 H Safety (Red)', type: 'can' },
      { id: 'lh-can1-l-2', from: 'lmi-can1-l', to: 'disp-can1-l', color: '#ef4444', label: 'CAN1 L Safety (Red/Wht)', type: 'can' },
      // CAN2 Bus (Machine network)
      { id: 'lh-can2-h-1', from: 'lic-can2-h', to: 'lh-ecu-can2-h', color: '#22c55e', label: 'CAN2 H (Green)', type: 'can' },
      { id: 'lh-can2-l-1', from: 'lic-can2-l', to: 'lh-ecu-can2-l', color: '#22c55e', label: 'CAN2 L (Green/Wht)', type: 'can' },
      { id: 'lh-can2-h-2', from: 'lh-ecu-can2-h', to: 'pump-can2-h', color: '#22c55e', label: 'CAN2 H (Green)', type: 'can' },
      { id: 'lh-can2-l-2', from: 'lh-ecu-can2-l', to: 'pump-can2-l', color: '#22c55e', label: 'CAN2 L (Green/Wht)', type: 'can' },
      { id: 'lh-can2-h-3', from: 'pump-can2-h', to: 'slew-can2-h', color: '#22c55e', label: 'CAN2 H (Green)', type: 'can' },
      { id: 'lh-can2-l-3', from: 'pump-can2-l', to: 'slew-can2-l', color: '#22c55e', label: 'CAN2 L (Green/Wht)', type: 'can' },
      // Power distribution
      { id: 'lh-pwr-lic', from: 'lhbat-pos', to: 'lic-pwr', color: '#ef4444', label: 'B+ (Red)', type: 'power' },
      { id: 'lh-pwr-lmi', from: 'lhbat-pos', to: 'lmi-pwr', color: '#ef4444', label: 'B+ (Red)', type: 'power' },
      { id: 'lh-pwr-disp', from: 'lhbat-pos', to: 'disp-pwr', color: '#ef4444', label: 'B+ (Red)', type: 'power' },
      { id: 'lh-pwr-ecu', from: 'lhbat-pos', to: 'lh-ecu-pwr', color: '#ef4444', label: 'B+ (Red)', type: 'power' },
      { id: 'lh-pwr-pump', from: 'lhbat-pos', to: 'pump-pwr', color: '#ef4444', label: 'B+ (Red)', type: 'power' },
      { id: 'lh-pwr-slew', from: 'lhbat-pos', to: 'slew-pwr', color: '#ef4444', label: 'B+ (Red)', type: 'power' },
      // Ground distribution
      { id: 'lh-gnd-lic', from: 'lhbat-neg', to: 'lic-gnd', color: '#1f2937', label: 'GND (Black)', type: 'ground' },
      { id: 'lh-gnd-lmi', from: 'lhbat-neg', to: 'lmi-gnd', color: '#1f2937', label: 'GND (Black)', type: 'ground' },
      { id: 'lh-gnd-disp', from: 'lhbat-neg', to: 'disp-gnd', color: '#1f2937', label: 'GND (Black)', type: 'ground' },
      { id: 'lh-gnd-ecu', from: 'lhbat-neg', to: 'lh-ecu-gnd', color: '#1f2937', label: 'GND (Black)', type: 'ground' },
      { id: 'lh-gnd-pump', from: 'lhbat-neg', to: 'pump-gnd', color: '#1f2937', label: 'GND (Black)', type: 'ground' },
      { id: 'lh-gnd-slew', from: 'lhbat-neg', to: 'slew-gnd', color: '#1f2937', label: 'GND (Black)', type: 'ground' },
      // LMI sensor signals
      { id: 'lh-load-sig', from: 'lmi-load', to: 'load-sig', color: '#a855f7', label: 'Load Cell (Purple)', type: 'signal' },
      { id: 'lh-angle-sig', from: 'lmi-angle', to: 'angle-sig', color: '#06b6d4', label: 'Boom Angle (Cyan)', type: 'signal' },
      { id: 'lh-length-sig', from: 'lmi-length', to: 'length-sig', color: '#eab308', label: 'Boom Length (Yellow)', type: 'signal' },
      // Pump control
      { id: 'lh-mpump', from: 'pump-main', to: 'mpump-ctrl', color: '#f97316', label: 'Main Pump Ctrl (Orange)', type: 'signal' },
    ],
  },
  // Kubota Compact Equipment
  {
    id: 'kubota-compact',
    name: 'Kubota Compact Equipment',
    description: 'Kubota SVL/SSV/KX series compact track loaders and mini excavators with intelligent control',
    modules: [
      {
        id: 'kub-ecu',
        name: 'Kubota Engine ECU',
        shortName: 'ECU',
        x: 50,
        y: 180,
        width: 110,
        height: 130,
        color: 'hsl(25, 95%, 50%)',
        pins: [
          { id: 'kub-ecu-can-h', label: 'CAN H', side: 'right', position: 0.15 },
          { id: 'kub-ecu-can-l', label: 'CAN L', side: 'right', position: 0.28 },
          { id: 'kub-ecu-pwr', label: 'B+', side: 'top', position: 0.3 },
          { id: 'kub-ecu-gnd', label: 'GND', side: 'top', position: 0.7 },
          { id: 'kub-ecu-dpf', label: 'DPF', side: 'right', position: 0.50 },
          { id: 'kub-ecu-glw', label: 'GLOW', side: 'right', position: 0.65 },
          { id: 'kub-ecu-fuel', label: 'FUEL', side: 'bottom', position: 0.5 },
        ]
      },
      {
        id: 'kub-mcu',
        name: 'Machine Control Unit',
        shortName: 'MCU',
        x: 210,
        y: 180,
        width: 120,
        height: 130,
        color: 'hsl(210, 85%, 50%)',
        pins: [
          { id: 'kub-mcu-can-h', label: 'CAN H', side: 'left', position: 0.15 },
          { id: 'kub-mcu-can-l', label: 'CAN L', side: 'left', position: 0.28 },
          { id: 'kub-mcu-can-h-r', label: 'CAN H', side: 'right', position: 0.15 },
          { id: 'kub-mcu-can-l-r', label: 'CAN L', side: 'right', position: 0.28 },
          { id: 'kub-mcu-pwr', label: 'B+', side: 'top', position: 0.3 },
          { id: 'kub-mcu-gnd', label: 'GND', side: 'top', position: 0.7 },
          { id: 'kub-mcu-joy-l', label: 'JOY-L', side: 'bottom', position: 0.30 },
          { id: 'kub-mcu-joy-r', label: 'JOY-R', side: 'bottom', position: 0.70 },
        ]
      },
      {
        id: 'kub-display',
        name: 'Multi-Function Display',
        shortName: 'MFD',
        x: 380,
        y: 180,
        width: 100,
        height: 90,
        color: 'hsl(120, 65%, 45%)',
        pins: [
          { id: 'kub-mfd-can-h', label: 'CAN H', side: 'left', position: 0.25 },
          { id: 'kub-mfd-can-l', label: 'CAN L', side: 'left', position: 0.50 },
          { id: 'kub-mfd-pwr', label: 'B+', side: 'top', position: 0.35 },
          { id: 'kub-mfd-gnd', label: 'GND', side: 'top', position: 0.65 },
          { id: 'kub-mfd-aux', label: 'AUX', side: 'right', position: 0.5 },
        ]
      },
      {
        id: 'kub-hyd',
        name: 'Hydraulic Valve Block',
        shortName: 'HYD',
        x: 50,
        y: 380,
        width: 110,
        height: 110,
        color: 'hsl(280, 70%, 50%)',
        pins: [
          { id: 'kub-hyd-can-h', label: 'CAN H', side: 'right', position: 0.20 },
          { id: 'kub-hyd-can-l', label: 'CAN L', side: 'right', position: 0.38 },
          { id: 'kub-hyd-pwr', label: 'B+', side: 'top', position: 0.3 },
          { id: 'kub-hyd-gnd', label: 'GND', side: 'top', position: 0.7 },
          { id: 'kub-hyd-boom', label: 'BOOM', side: 'bottom', position: 0.25 },
          { id: 'kub-hyd-arm', label: 'ARM', side: 'bottom', position: 0.50 },
          { id: 'kub-hyd-bkt', label: 'BKT', side: 'bottom', position: 0.75 },
        ]
      },
      {
        id: 'kub-travel',
        name: 'Travel Control',
        shortName: 'TRVL',
        x: 210,
        y: 380,
        width: 110,
        height: 100,
        color: 'hsl(340, 75%, 50%)',
        pins: [
          { id: 'kub-trv-can-h', label: 'CAN H', side: 'left', position: 0.20 },
          { id: 'kub-trv-can-l', label: 'CAN L', side: 'left', position: 0.45 },
          { id: 'kub-trv-pwr', label: 'B+', side: 'top', position: 0.35 },
          { id: 'kub-trv-gnd', label: 'GND', side: 'top', position: 0.65 },
          { id: 'kub-trv-left', label: 'L-TRK', side: 'bottom', position: 0.35 },
          { id: 'kub-trv-right', label: 'R-TRK', side: 'bottom', position: 0.65 },
        ]
      },
      {
        id: 'kub-aux',
        name: 'Auxiliary Hydraulics',
        shortName: 'AUX',
        x: 380,
        y: 300,
        width: 90,
        height: 70,
        color: 'hsl(45, 90%, 50%)',
        pins: [
          { id: 'kub-aux-can-h', label: 'CAN H', side: 'left', position: 0.30 },
          { id: 'kub-aux-can-l', label: 'CAN L', side: 'left', position: 0.60 },
          { id: 'kub-aux-pwr', label: 'B+', side: 'top', position: 0.35 },
          { id: 'kub-aux-gnd', label: 'GND', side: 'top', position: 0.65 },
        ]
      },
      {
        id: 'kub-telematics',
        name: 'Kubota Telematics',
        shortName: 'TELEM',
        x: 380,
        y: 400,
        width: 100,
        height: 80,
        color: 'hsl(142, 70%, 45%)',
        pins: [
          { id: 'kub-tlm-can-h', label: 'CAN H', side: 'left', position: 0.25 },
          { id: 'kub-tlm-can-l', label: 'CAN L', side: 'left', position: 0.50 },
          { id: 'kub-tlm-pwr', label: 'B+', side: 'top', position: 0.35 },
          { id: 'kub-tlm-gnd', label: 'GND', side: 'top', position: 0.65 },
          { id: 'kub-tlm-gps', label: 'GPS', side: 'right', position: 0.5 },
        ]
      },
      {
        id: 'kub-joy-left',
        name: 'Left Joystick',
        shortName: 'JOY-L',
        x: 170,
        y: 520,
        width: 75,
        height: 50,
        color: 'hsl(180, 60%, 45%)',
        pins: [
          { id: 'kjoyl-sig', label: 'SIG', side: 'top', position: 0.5 },
        ]
      },
      {
        id: 'kub-joy-right',
        name: 'Right Joystick',
        shortName: 'JOY-R',
        x: 270,
        y: 520,
        width: 75,
        height: 50,
        color: 'hsl(180, 60%, 45%)',
        pins: [
          { id: 'kjoyr-sig', label: 'SIG', side: 'top', position: 0.5 },
        ]
      },
      {
        id: 'kub-battery',
        name: 'Battery 12V',
        shortName: '12V',
        x: 200,
        y: 50,
        width: 110,
        height: 55,
        color: 'hsl(0, 72%, 51%)',
        pins: [
          { id: 'kubbat-pos', label: '+', side: 'bottom', position: 0.3 },
          { id: 'kubbat-neg', label: '-', side: 'bottom', position: 0.7 },
        ]
      },
      {
        id: 'kub-gps',
        name: 'GPS Antenna',
        shortName: 'GPS',
        x: 510,
        y: 410,
        width: 70,
        height: 45,
        color: 'hsl(45, 93%, 47%)',
        pins: [
          { id: 'kubgps-sig', label: 'SIG', side: 'left', position: 0.5 },
        ]
      },
      {
        id: 'kub-boom-cyl',
        name: 'Boom Cylinder Sensor',
        shortName: 'BOOM',
        x: 30,
        y: 520,
        width: 70,
        height: 45,
        color: 'hsl(60, 70%, 45%)',
        pins: [
          { id: 'boom-sens', label: 'SENS', side: 'top', position: 0.5 },
        ]
      },
      {
        id: 'kub-arm-cyl',
        name: 'Arm Cylinder Sensor',
        shortName: 'ARM',
        x: 110,
        y: 520,
        width: 55,
        height: 45,
        color: 'hsl(60, 70%, 45%)',
        pins: [
          { id: 'arm-sens', label: 'SENS', side: 'top', position: 0.5 },
        ]
      },
    ],
    wires: [
      // CAN Bus network
      { id: 'kub-can-h-1', from: 'kub-ecu-can-h', to: 'kub-mcu-can-h', color: '#22c55e', label: 'CAN H (Green)', type: 'can' },
      { id: 'kub-can-l-1', from: 'kub-ecu-can-l', to: 'kub-mcu-can-l', color: '#22c55e', label: 'CAN L (Green/Wht)', type: 'can' },
      { id: 'kub-can-h-2', from: 'kub-mcu-can-h-r', to: 'kub-mfd-can-h', color: '#22c55e', label: 'CAN H (Green)', type: 'can' },
      { id: 'kub-can-l-2', from: 'kub-mcu-can-l-r', to: 'kub-mfd-can-l', color: '#22c55e', label: 'CAN L (Green/Wht)', type: 'can' },
      { id: 'kub-can-h-3', from: 'kub-hyd-can-h', to: 'kub-trv-can-h', color: '#22c55e', label: 'CAN H (Green)', type: 'can' },
      { id: 'kub-can-l-3', from: 'kub-hyd-can-l', to: 'kub-trv-can-l', color: '#22c55e', label: 'CAN L (Green/Wht)', type: 'can' },
      { id: 'kub-can-h-4', from: 'kub-mfd-can-h', to: 'kub-aux-can-h', color: '#22c55e', label: 'CAN H (Green)', type: 'can' },
      { id: 'kub-can-l-4', from: 'kub-mfd-can-l', to: 'kub-aux-can-l', color: '#22c55e', label: 'CAN L (Green/Wht)', type: 'can' },
      { id: 'kub-can-h-5', from: 'kub-aux-can-h', to: 'kub-tlm-can-h', color: '#22c55e', label: 'CAN H (Green)', type: 'can' },
      { id: 'kub-can-l-5', from: 'kub-aux-can-l', to: 'kub-tlm-can-l', color: '#22c55e', label: 'CAN L (Green/Wht)', type: 'can' },
      // Power distribution
      { id: 'kub-pwr-ecu', from: 'kubbat-pos', to: 'kub-ecu-pwr', color: '#ef4444', label: 'B+ (Red)', type: 'power' },
      { id: 'kub-pwr-mcu', from: 'kubbat-pos', to: 'kub-mcu-pwr', color: '#ef4444', label: 'B+ (Red)', type: 'power' },
      { id: 'kub-pwr-mfd', from: 'kubbat-pos', to: 'kub-mfd-pwr', color: '#ef4444', label: 'B+ (Red)', type: 'power' },
      { id: 'kub-pwr-hyd', from: 'kubbat-pos', to: 'kub-hyd-pwr', color: '#ef4444', label: 'B+ (Red)', type: 'power' },
      { id: 'kub-pwr-trv', from: 'kubbat-pos', to: 'kub-trv-pwr', color: '#ef4444', label: 'B+ (Red)', type: 'power' },
      { id: 'kub-pwr-aux', from: 'kubbat-pos', to: 'kub-aux-pwr', color: '#ef4444', label: 'B+ (Red)', type: 'power' },
      { id: 'kub-pwr-tlm', from: 'kubbat-pos', to: 'kub-tlm-pwr', color: '#ef4444', label: 'B+ (Red)', type: 'power' },
      // Ground distribution
      { id: 'kub-gnd-ecu', from: 'kubbat-neg', to: 'kub-ecu-gnd', color: '#1f2937', label: 'GND (Black)', type: 'ground' },
      { id: 'kub-gnd-mcu', from: 'kubbat-neg', to: 'kub-mcu-gnd', color: '#1f2937', label: 'GND (Black)', type: 'ground' },
      { id: 'kub-gnd-mfd', from: 'kubbat-neg', to: 'kub-mfd-gnd', color: '#1f2937', label: 'GND (Black)', type: 'ground' },
      { id: 'kub-gnd-hyd', from: 'kubbat-neg', to: 'kub-hyd-gnd', color: '#1f2937', label: 'GND (Black)', type: 'ground' },
      { id: 'kub-gnd-trv', from: 'kubbat-neg', to: 'kub-trv-gnd', color: '#1f2937', label: 'GND (Black)', type: 'ground' },
      { id: 'kub-gnd-aux', from: 'kubbat-neg', to: 'kub-aux-gnd', color: '#1f2937', label: 'GND (Black)', type: 'ground' },
      { id: 'kub-gnd-tlm', from: 'kubbat-neg', to: 'kub-tlm-gnd', color: '#1f2937', label: 'GND (Black)', type: 'ground' },
      // Signal connections
      { id: 'kub-joy-l', from: 'kub-mcu-joy-l', to: 'kjoyl-sig', color: '#06b6d4', label: 'Left Joystick (Cyan)', type: 'signal' },
      { id: 'kub-joy-r', from: 'kub-mcu-joy-r', to: 'kjoyr-sig', color: '#06b6d4', label: 'Right Joystick (Cyan)', type: 'signal' },
      { id: 'kub-boom', from: 'kub-hyd-boom', to: 'boom-sens', color: '#a855f7', label: 'Boom Sensor (Purple)', type: 'signal' },
      { id: 'kub-arm', from: 'kub-hyd-arm', to: 'arm-sens', color: '#a855f7', label: 'Arm Sensor (Purple)', type: 'signal' },
      { id: 'kub-gps-wire', from: 'kub-tlm-gps', to: 'kubgps-sig', color: '#eab308', label: 'GPS Coax (Yellow)', type: 'data' },
      { id: 'kub-mfd-aux', from: 'kub-mfd-aux', to: 'kub-aux-can-h', color: '#f97316', label: 'Aux Control (Orange)', type: 'signal' },
    ],
  },
];

const getPinPosition = (modules: Module[], moduleId: string, pinId: string): { x: number; y: number } => {
  const module = modules.find(m => m.id === moduleId);
  if (!module) return { x: 0, y: 0 };
  
  const pin = module.pins.find(p => p.id === pinId);
  if (!pin) return { x: module.x + module.width / 2, y: module.y + module.height / 2 };
  
  switch (pin.side) {
    case 'left':
      return { x: module.x, y: module.y + module.height * pin.position };
    case 'right':
      return { x: module.x + module.width, y: module.y + module.height * pin.position };
    case 'top':
      return { x: module.x + module.width * pin.position, y: module.y };
    case 'bottom':
      return { x: module.x + module.width * pin.position, y: module.y + module.height };
    default:
      return { x: module.x + module.width / 2, y: module.y + module.height / 2 };
  }
};

const getWirePath = (wire: WireConnection, modules: Module[]): string => {
  const fromPinId = wire.from;
  const toPinId = wire.to;
  
  const fromModule = modules.find(m => m.pins.some(p => p.id === fromPinId));
  const toModule = modules.find(m => m.pins.some(p => p.id === toPinId));
  
  if (!fromModule || !toModule) return '';
  
  const from = getPinPosition(modules, fromModule.id, fromPinId);
  const to = getPinPosition(modules, toModule.id, toPinId);
  
  const fromPin = fromModule.pins.find(p => p.id === fromPinId);
  const toPin = toModule.pins.find(p => p.id === toPinId);
  
  let cp1x = from.x, cp1y = from.y, cp2x = to.x, cp2y = to.y;
  
  if (fromPin?.side === 'right') cp1x = from.x + 40;
  if (fromPin?.side === 'left') cp1x = from.x - 40;
  if (fromPin?.side === 'top') cp1y = from.y - 40;
  if (fromPin?.side === 'bottom') cp1y = from.y + 40;
  
  if (toPin?.side === 'right') cp2x = to.x + 40;
  if (toPin?.side === 'left') cp2x = to.x - 40;
  if (toPin?.side === 'top') cp2y = to.y - 40;
  if (toPin?.side === 'bottom') cp2y = to.y + 40;
  
  return `M ${from.x} ${from.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${to.x} ${to.y}`;
};

export const WiringDiagramSVG = () => {
  const [selectedBrand, setSelectedBrand] = useState<string>('metso');
  const [selectedWire, setSelectedWire] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'full' | 'can' | 'power' | 'signals'>('full');
  const [isExporting, setIsExporting] = useState(false);
  const diagramRef = useRef<HTMLDivElement>(null);
  const printContentRef = useRef<HTMLDivElement>(null);

  const currentDiagram = brandDiagrams.find(b => b.id === selectedBrand) || brandDiagrams[0];
  const modules = currentDiagram.modules;
  const wires = currentDiagram.wires;

  const filteredWires = wires.filter(wire => {
    if (activeView === 'full') return true;
    if (activeView === 'can') return wire.type === 'can';
    if (activeView === 'power') return wire.type === 'power' || wire.type === 'ground';
    if (activeView === 'signals') return wire.type === 'signal' || wire.type === 'data';
    return true;
  });

  const getWireOpacity = (wireId: string) => {
    if (!selectedWire && !selectedModule) return 1;
    if (selectedWire === wireId) return 1;
    
    if (selectedModule) {
      const wire = wires.find(w => w.id === wireId);
      if (wire) {
        const fromModule = modules.find(m => m.pins.some(p => p.id === wire.from));
        const toModule = modules.find(m => m.pins.some(p => p.id === wire.to));
        if (fromModule?.id === selectedModule || toModule?.id === selectedModule) return 1;
      }
    }
    
    return 0.15;
  };

  const getModuleOpacity = (moduleId: string) => {
    if (!selectedWire && !selectedModule) return 1;
    if (selectedModule === moduleId) return 1;
    
    if (selectedWire) {
      const wire = wires.find(w => w.id === selectedWire);
      if (wire) {
        const fromModule = modules.find(m => m.pins.some(p => p.id === wire.from));
        const toModule = modules.find(m => m.pins.some(p => p.id === wire.to));
        if (fromModule?.id === moduleId || toModule?.id === moduleId) return 1;
      }
    }
    
    return 0.3;
  };

  const selectedWireInfo = selectedWire ? wires.find(w => w.id === selectedWire) : null;
  const selectedModuleInfo = selectedModule ? modules.find(m => m.id === selectedModule) : null;

  const generateImage = async () => {
    if (!diagramRef.current) return;
    
    setIsExporting(true);
    try {
      const canvas = await html2canvas(diagramRef.current, {
        scale: 2,
        backgroundColor: '#1a1a2e',
        logging: false,
      });
      
      const link = document.createElement('a');
      link.download = `${currentDiagram.name.toLowerCase().replace(/\s+/g, '-')}-wiring-diagram.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Card className="border-border/50 print:border-0 print:shadow-none">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Info className="h-5 w-5 text-primary print:hidden" />
            Interactive System Wiring Diagram
          </CardTitle>
          <div className="flex gap-2 print:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-2"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={generateImage}
              disabled={isExporting}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              {isExporting ? 'Generating...' : 'Export Image'}
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground print:hidden">
          Select equipment brand and click on modules or wires to highlight connections.
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-4 print:hidden">
          <div className="flex-1">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Equipment Brand</label>
            <Select value={selectedBrand} onValueChange={(v) => { setSelectedBrand(v); setSelectedWire(null); setSelectedModule(null); }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select brand" />
              </SelectTrigger>
              <SelectContent>
                {brandDiagrams.map(brand => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">{currentDiagram.description}</p>
          </div>
        </div>

        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as typeof activeView)} className="mb-4">
          <TabsList className="grid w-full grid-cols-4 max-w-md">
            <TabsTrigger value="full">Full System</TabsTrigger>
            <TabsTrigger value="can">CAN Bus</TabsTrigger>
            <TabsTrigger value="power">Power</TabsTrigger>
            <TabsTrigger value="signals">Signals</TabsTrigger>
          </TabsList>
        </Tabs>

        <div ref={diagramRef} className="relative bg-secondary/30 rounded-lg overflow-hidden border border-border/50 print:bg-white print:border-black">
          <svg 
            viewBox="0 0 650 720" 
            className="w-full h-auto"
            onClick={() => {
              setSelectedWire(null);
              setSelectedModule(null);
            }}
          >
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(220, 13%, 18%)" strokeWidth="0.5" />
              </pattern>
              
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            <rect width="650" height="720" fill="url(#grid)" />
            
            <text x="325" y="25" textAnchor="middle" fill="hsl(210, 20%, 95%)" fontSize="14" fontWeight="bold" fontFamily="Oswald, sans-serif" letterSpacing="0.05em">
              {currentDiagram.name.toUpperCase()} CONTROL MODULE INTERCONNECTION DIAGRAM
            </text>
            
            {filteredWires.map(wire => (
              <g key={wire.id}>
                <path
                  d={getWirePath(wire, modules)}
                  fill="none"
                  stroke={wire.color}
                  strokeWidth={selectedWire === wire.id ? 4 : 2.5}
                  strokeLinecap="round"
                  strokeDasharray={wire.type === 'can' ? 'none' : wire.type === 'ground' ? '5,3' : 'none'}
                  opacity={getWireOpacity(wire.id)}
                  filter={selectedWire === wire.id ? 'url(#glow)' : 'none'}
                  className="cursor-pointer transition-all duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedWire(wire.id);
                    setSelectedModule(null);
                  }}
                />
                <path
                  d={getWirePath(wire, modules)}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={12}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedWire(wire.id);
                    setSelectedModule(null);
                  }}
                />
              </g>
            ))}
            
            {modules.map(module => (
              <g 
                key={module.id}
                opacity={getModuleOpacity(module.id)}
                className="cursor-pointer transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedModule(module.id);
                  setSelectedWire(null);
                }}
              >
                <rect
                  x={module.x}
                  y={module.y}
                  width={module.width}
                  height={module.height}
                  rx={6}
                  fill="hsl(220, 13%, 14%)"
                  stroke={selectedModule === module.id ? module.color : 'hsl(220, 13%, 30%)'}
                  strokeWidth={selectedModule === module.id ? 3 : 2}
                  filter={selectedModule === module.id ? 'url(#glow)' : 'none'}
                />
                
                <rect
                  x={module.x}
                  y={module.y}
                  width={module.width}
                  height={30}
                  rx={6}
                  fill={module.color}
                />
                <rect
                  x={module.x}
                  y={module.y + 24}
                  width={module.width}
                  height={6}
                  fill={module.color}
                />
                
                <text
                  x={module.x + module.width / 2}
                  y={module.y + 20}
                  textAnchor="middle"
                  fill="hsl(220, 14%, 10%)"
                  fontSize="12"
                  fontWeight="bold"
                  fontFamily="Oswald, sans-serif"
                >
                  {module.shortName}
                </text>
                
                <text
                  x={module.x + module.width / 2}
                  y={module.y + module.height / 2 + 10}
                  textAnchor="middle"
                  fill="hsl(210, 20%, 70%)"
                  fontSize="9"
                  fontFamily="system-ui"
                >
                  {module.name.split(' ').slice(0, 2).join(' ')}
                </text>
                <text
                  x={module.x + module.width / 2}
                  y={module.y + module.height / 2 + 22}
                  textAnchor="middle"
                  fill="hsl(210, 20%, 70%)"
                  fontSize="9"
                  fontFamily="system-ui"
                >
                  {module.name.split(' ').slice(2).join(' ')}
                </text>
                
                {module.pins.map(pin => {
                  const pos = getPinPosition(modules, module.id, pin.id);
                  let textX = pos.x;
                  let textY = pos.y;
                  let anchor = 'middle';
                  
                  if (pin.side === 'left') { textX -= 8; anchor = 'end'; }
                  if (pin.side === 'right') { textX += 8; anchor = 'start'; }
                  if (pin.side === 'top') { textY -= 8; }
                  if (pin.side === 'bottom') { textY += 12; }
                  
                  return (
                    <g key={pin.id}>
                      <circle cx={pos.x} cy={pos.y} r={4} fill="hsl(220, 13%, 40%)" stroke="hsl(220, 13%, 50%)" strokeWidth={1} />
                      <text
                        x={textX}
                        y={textY}
                        textAnchor={anchor as any}
                        fill="hsl(210, 20%, 60%)"
                        fontSize="7"
                        fontFamily="monospace"
                      >
                        {pin.label}
                      </text>
                    </g>
                  );
                })}
              </g>
            ))}
            
            <g transform="translate(20, 695)">
              <text x="0" y="0" fill="hsl(210, 20%, 70%)" fontSize="9" fontWeight="bold">LEGEND:</text>
              
              <line x1="55" y1="-3" x2="80" y2="-3" stroke="#22c55e" strokeWidth="2" />
              <text x="85" y="0" fill="hsl(210, 20%, 60%)" fontSize="8">CAN</text>
              
              <line x1="115" y1="-3" x2="140" y2="-3" stroke="#ef4444" strokeWidth="2" />
              <text x="145" y="0" fill="hsl(210, 20%, 60%)" fontSize="8">Power</text>
              
              <line x1="185" y1="-3" x2="210" y2="-3" stroke="#1f2937" strokeWidth="2" strokeDasharray="4,2" />
              <text x="215" y="0" fill="hsl(210, 20%, 60%)" fontSize="8">Ground</text>
              
              <line x1="260" y1="-3" x2="285" y2="-3" stroke="#a855f7" strokeWidth="2" />
              <text x="290" y="0" fill="hsl(210, 20%, 60%)" fontSize="8">Signal</text>
              
              <line x1="330" y1="-3" x2="355" y2="-3" stroke="#f97316" strokeWidth="2" />
              <text x="360" y="0" fill="hsl(210, 20%, 60%)" fontSize="8">Data</text>
              
              <rect x="400" y="-8" width="12" height="10" rx="2" fill="hsl(220, 13%, 30%)" stroke="hsl(220, 13%, 40%)" strokeWidth="1" />
              <text x="416" y="0" fill="hsl(210, 20%, 60%)" fontSize="8">120Ω Term</text>
            </g>
          </svg>
        </div>

        {(selectedWireInfo || selectedModuleInfo) && (
          <div className="mt-4 p-4 bg-secondary/50 rounded-lg border border-border/50 animate-fade-in">
            {selectedWireInfo && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-4 h-1 rounded-full" 
                    style={{ backgroundColor: selectedWireInfo.color }}
                  />
                  <h4 className="font-semibold text-foreground">{selectedWireInfo.label}</h4>
                  <Badge variant="outline" className="text-xs">
                    {selectedWireInfo.type.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Connects: {modules.find(m => m.pins.some(p => p.id === selectedWireInfo.from))?.name} → {modules.find(m => m.pins.some(p => p.id === selectedWireInfo.to))?.name}
                </p>
              </div>
            )}
            {selectedModuleInfo && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-4 h-4 rounded" 
                    style={{ backgroundColor: selectedModuleInfo.color }}
                  />
                  <h4 className="font-semibold text-foreground">{selectedModuleInfo.name}</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Pins: {selectedModuleInfo.pins.map(p => p.label).join(', ')}
                </p>
                <div className="flex flex-wrap gap-1">
                  {wires.filter(w => {
                    const fromModule = modules.find(m => m.pins.some(p => p.id === w.from));
                    const toModule = modules.find(m => m.pins.some(p => p.id === w.to));
                    return fromModule?.id === selectedModuleInfo.id || toModule?.id === selectedModuleInfo.id;
                  }).map(w => (
                    <Badge 
                      key={w.id} 
                      variant="secondary" 
                      className="text-xs"
                      style={{ borderColor: w.color, borderWidth: 1 }}
                    >
                      {w.label}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-4 text-center">
          Click on any module or wire to see connection details. Click empty area to deselect.
        </p>
      </CardContent>
    </Card>
  );
};
