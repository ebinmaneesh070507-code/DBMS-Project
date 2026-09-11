import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppLayout({ title, subtitle, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="app-shell">
      <div className="ambient-bg">
        <div className="ambient-blob b1" />
        <div className="ambient-blob b2" />
      </div>
      <Sidebar open={open} onClose={() => setOpen(false)} />
      {open && <div className="sidebar-scrim" onClick={() => setOpen(false)} />}
      <div className="app-main">
        <Topbar title={title} subtitle={subtitle} onMenuClick={() => setOpen(true)} />
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
