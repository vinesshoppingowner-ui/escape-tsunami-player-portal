import SiteNav from '@/components/SiteNav';
import DashboardTab from '@/components/admin/DashboardTab';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SiteNav />
      <main className="max-w-5xl mx-auto px-5 pt-28 pb-20">
        <DashboardTab />
      </main>
    </div>
  );
}