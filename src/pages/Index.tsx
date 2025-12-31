import { useState } from 'react';
import HubView from '@/components/HubView';
import AggregateOppsApp from '@/components/AggregateOppsApp';
import AggregateOppsDemo from '@/components/AggregateOppsDemo';
import BeltAssistant from '@/components/BeltAssistant';
import { useSubscription } from '@/hooks/useSubscription';

const Index = () => {
  const [view, setView] = useState<'hub' | 'app'>('hub');
  const { hasAccess, loading } = useSubscription();

  const renderAppView = () => {
    // Show demo for non-subscribers
    if (!hasAccess) {
      return <AggregateOppsDemo onNavigateToHub={() => setView('hub')} />;
    }
    return <AggregateOppsApp onNavigateToHub={() => setView('hub')} />;
  };

  return (
    <>
      {view === 'app' ? (
        renderAppView()
      ) : (
        <HubView onNavigateToApp={() => setView('app')} />
      )}
      <BeltAssistant />
    </>
  );
};

export default Index;
