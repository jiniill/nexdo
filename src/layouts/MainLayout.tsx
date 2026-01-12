import { Link, Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <aside style={{ width: 240, borderRight: '1px solid #e2e8f0', padding: 16 }}>
        <div style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 24 }}>
          NexDo
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Link to="/">Home</Link>
          <Link to="/inbox">Inbox</Link>
          <Link to="/today">Today</Link>
          <Link to="/project/q1-launch">Q1 Launch</Link>
          <Link to="/project/marketing">Marketing</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: 24, overflow: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
