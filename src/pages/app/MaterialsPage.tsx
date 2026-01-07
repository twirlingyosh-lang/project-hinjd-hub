import { useState } from 'react';
import { AppLayout } from '@/components/app/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, Calculator, Info } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const aggregateTypes = [
  { value: 'gravel', label: 'Gravel', density: 1.5 },
  { value: 'sand', label: 'Sand', density: 1.6 },
  { value: 'crushed-stone', label: 'Crushed Stone', density: 1.4 },
  { value: 'limestone', label: 'Limestone', density: 1.5 },
  { value: 'granite', label: 'Granite', density: 1.6 },
  { value: 'recycled', label: 'Recycled Aggregate', density: 1.3 },
];

const crusherTypes = [
  { value: 'jaw', label: 'Jaw Crusher' },
  { value: 'cone', label: 'Cone Crusher' },
  { value: 'impact', label: 'Impact Crusher' },
  { value: 'vsi', label: 'VSI Crusher' },
  { value: 'hsi', label: 'HSI Crusher' },
];

const MaterialsPage = () => {
  const navigate = useNavigate();
  const [yardage, setYardage] = useState('');
  const [aggregateType, setAggregateType] = useState('');
  const [crusherType, setCrusherType] = useState('');
  const [feedSize, setFeedSize] = useState('');
  const [productSize, setProductSize] = useState('');

  const handleCalculate = () => {
    if (!yardage || !aggregateType) {
      toast.error('Please fill in yardage and aggregate type');
      return;
    }

    // Store in localStorage for calculator
    const materialData = {
      yardage: parseFloat(yardage),
      aggregateType,
      crusherType,
      feedSize: feedSize ? parseFloat(feedSize) : null,
      productSize: productSize ? parseFloat(productSize) : null,
      timestamp: Date.now(),
    };
    localStorage.setItem('currentMaterial', JSON.stringify(materialData));
    
    toast.success('Material data saved');
    navigate('/app/calculator');
  };

  const selectedAggregate = aggregateTypes.find(a => a.value === aggregateType);

  return (
    <AppLayout title="Materials">
      <div className="p-4 space-y-6">
        <Tabs defaultValue="yardage" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="yardage">Yardage</TabsTrigger>
            <TabsTrigger value="crusher">Crusher Setup</TabsTrigger>
          </TabsList>

          <TabsContent value="yardage" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Material Volume</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="yardage">Cubic Yards</Label>
                  <Input
                    id="yardage"
                    type="number"
                    placeholder="Enter yardage"
                    value={yardage}
                    onChange={(e) => setYardage(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Aggregate Type</Label>
                  <Select value={aggregateType} onValueChange={setAggregateType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select aggregate type" />
                    </SelectTrigger>
                    <SelectContent>
                      {aggregateTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedAggregate && (
                  <div className="p-3 bg-secondary/50 rounded-lg flex items-center gap-2">
                    <Info size={16} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Density: {selectedAggregate.density} tons/yd³
                    </span>
                  </div>
                )}

                {yardage && selectedAggregate && (
                  <div className="p-4 bg-primary/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">Estimated Weight</p>
                    <p className="text-2xl font-bold text-primary">
                      {(parseFloat(yardage) * selectedAggregate.density).toFixed(1)} tons
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="crusher" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Crusher Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Crusher Type</Label>
                  <Select value={crusherType} onValueChange={setCrusherType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select crusher type" />
                    </SelectTrigger>
                    <SelectContent>
                      {crusherTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="feedSize">Feed Size (in)</Label>
                    <Input
                      id="feedSize"
                      type="number"
                      placeholder="Max feed"
                      value={feedSize}
                      onChange={(e) => setFeedSize(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="productSize">Product Size (in)</Label>
                    <Input
                      id="productSize"
                      type="number"
                      placeholder="Target size"
                      value={productSize}
                      onChange={(e) => setProductSize(e.target.value)}
                    />
                  </div>
                </div>

                <Link to="/app/equipment" className="block">
                  <Button variant="outline" className="w-full gap-2">
                    View Equipment Specs
                    <ArrowRight size={16} />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Button onClick={handleCalculate} className="w-full gap-2" size="lg">
          <Calculator size={18} />
          Continue to Calculator
        </Button>
      </div>
    </AppLayout>
  );
};

export default MaterialsPage;
