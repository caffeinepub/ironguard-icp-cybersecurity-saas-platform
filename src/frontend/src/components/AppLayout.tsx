import { Outlet } from '@tanstack/react-router';
import GlobalLoadingScreen from './GlobalLoadingScreen';

export default function AppLayout() {
  return (
    <>
      <GlobalLoadingScreen />
      <div className="min-h-screen bg-background">
        <Outlet />
      </div>
    </>
  );
}
