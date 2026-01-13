import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useUIStore } from '../../store';
import { Inspector } from './Inspector';
import { AppContextMenu } from './AppContextMenu';

export function MainLayout() {
  const inspectorOpen = useUIStore((s) => s.inspectorOpen);

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-white text-slate-800">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-white">
        <Outlet />
      </main>

      {/* Right Inspector */}
      {inspectorOpen && <Inspector />}

      <AppContextMenu />
    </div>
  );
}
