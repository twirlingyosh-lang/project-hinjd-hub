import { AppLayout } from '@/components/app/AppLayout';
import EquipmentDiagnostics from '@/components/EquipmentDiagnostics';

const EquipmentOppsPage = () => {
  return (
    <AppLayout title="Equipment Opps">
      <div className="h-[calc(100vh-140px)] flex flex-col">
        <EquipmentDiagnostics />
      </div>
    </AppLayout>
  );
};

export default EquipmentOppsPage;
