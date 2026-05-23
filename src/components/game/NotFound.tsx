import { AppHeader } from '@/components/layout/AppHeader';
import { Layout } from '@/components/layout/Layout';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <Layout
      header={<AppHeader />}
      footer={
        <Button
          size="lg"
          variant="outline"
          className="w-60 max-w-full"
          onClick={() => navigate('/')}
        >
          Home
        </Button>
      }
    >
      <p className="text-center text-lg text-slate-700">Not found</p>
    </Layout>
  );
}
