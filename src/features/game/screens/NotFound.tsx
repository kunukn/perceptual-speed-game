import { paths } from '@/app/paths';
import { AppHeader } from '@/components/layout/AppHeader';
import { Layout } from '@/components/layout/Layout';

export function NotFound() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Layout
      header={<AppHeader />}
      footer={
        <Button
          size="lg"
          variant="outline"
          className="w-60 max-w-full"
          onClick={() => navigate(paths.home)}
        >
          Home
        </Button>
      }
    >
      <p className="text-center text-lg text-slate-700">
        {t('common.notFound')}
      </p>
    </Layout>
  );
}
