import { AppLayout } from '@/components/app/AppLayout';

const Base44AppPage = () => {
  return (
    <AppLayout>
      <div className="w-full h-[calc(100vh-4rem)]">
        <iframe
          src="https://preview--cox-aggs-27e91ba7.base44.app"
          className="w-full h-full border-0"
          title="Cox Aggs App"
          allow="clipboard-write; clipboard-read"
        />
      </div>
    </AppLayout>
  );
};

export default Base44AppPage;
