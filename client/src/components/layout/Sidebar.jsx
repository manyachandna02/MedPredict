// src/components/layout/Sidebar.jsx
import { Activity, LayoutDashboard, History, Settings, LogOut, Heart } from 'lucide-react';
import styles from '../../styles/Dashboard.module.css';

const NAV = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'predictor', label: 'Predictor', icon: Activity },
  { id: 'history',   label: 'History',   icon: History },
  { id: 'settings',  label: 'Settings',  icon: Settings },
];

const Sidebar = ({ activePage, onNavigate, user, onLogout }) => {
  return (
    <aside className={styles.sidebar}>
      <a href="/" className={styles.sidebarLogo}>
        <span className={styles.sidebarLogoIcon}>
          <Heart size={16} color="white" />
        </span>
        MedPredict
      </a>

      <nav className={styles.sidebarNav}>
        <div className={styles.sidebarSection}>Main</div>
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`${styles.sidebarLink} ${activePage === id ? styles.active : ''}`}
            onClick={() => onNavigate(id)}
          >
            <Icon size={17} className={styles.sidebarIcon} />
            {label}
          </button>
        ))}
      </nav>

      <div className={styles.sidebarBottom}>
        <div className={styles.sidebarUser}>
          <div className={styles.userAvatar}>
            {(user?.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{user?.name || 'Guest User'}</div>
            <div className={styles.userRole}>{user?.email || 'user@example.com'}</div>
          </div>
          <button
            onClick={onLogout}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-500)', lineHeight: 0 }}
            title="Logout"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
