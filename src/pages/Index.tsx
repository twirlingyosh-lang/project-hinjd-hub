import { useState } from 'react';
import HubView from '@/components/HubView';
import AggregateOppsApp from '@/components/AggregateOppsApp';
import BeltAssistant from '@/components/BeltAssistant';

const Index = () => {
  const [view, setView] = useState<'hub' | 'app'>('hub');

  return (
    <>
      {view === 'app' ? (
        <AggregateOppsApp onNavigateToHub={() => setView('hub')} />
      ) : (
        <HubView onNavigateToApp={() => setView('app')} />
      )}
      <BeltAssistant />
    </>
  );
};

export default Index;
