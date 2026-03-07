import { ReactNode } from 'react';
import { EcosystemLayout } from './EcosystemLayout';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
}

export const AppLayout = ({ children, title }: AppLayoutProps) => {
  return (
    <EcosystemLayout title={title}>
      {children}
    </EcosystemLayout>
  );
};

export default AppLayout;
