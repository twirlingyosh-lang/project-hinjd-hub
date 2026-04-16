import { AppLayout } from '@/components/app/AppLayout';
import AggregateOppsApp from '@/components/AggregateOppsApp';
import { useNavigate } from 'react-router-dom';

const Base44AppPage = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <AggregateOppsApp onNavigateToHub={() => navigate('/app')} />
    </AppLayout>
  );
};

export default Base44AppPage;
