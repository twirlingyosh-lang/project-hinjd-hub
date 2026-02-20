import { AppLayout } from '@/components/app/AppLayout';
import ReferralProgram from '@/components/ReferralProgram';

const ReferralPage = () => {
  return (
    <AppLayout title="Referral Program">
      <div className="p-4">
        <ReferralProgram />
      </div>
    </AppLayout>
  );
};

export default ReferralPage;
