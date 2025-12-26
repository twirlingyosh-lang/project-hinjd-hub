import { useState } from 'react';
import HubView from '@/components/HubView';
import AggregateOppsApp from '@/components/AggregateOppsApp';

const Index = () => {
  const [view, setView] = useState<'hub' | 'app'>('hub');

  if (view === 'app') {
    return <AggregateOppsApp onNavigateToHub={() => setView('hub')} />;
  }

  return <HubView onNavigateToApp={() => setView('app')} />;
};

export default Index;
