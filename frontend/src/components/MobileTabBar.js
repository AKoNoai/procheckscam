import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getBotCheckLinks } from '../utils/botCheckLinks';

const MobileTabBar = () => {
  const location = useLocation();

  const isHome = location.pathname === '/';
  const isReport = location.pathname === '/report';
  const isInsurance = location.pathname === '/insurance';
  const isMarket = location.pathname === '/marketplace' || location.pathname.startsWith('/marketplace/');
  const isBot = location.pathname === '/search';
  const botLinks = getBotCheckLinks();
  const botLink = botLinks.length > 0 ? botLinks[0].url : '';

  return (
    <nav className="mobile-tabbar" aria-label="Mobile Navigation">
      <div className="mobile-tabbar__inner">
        <Link
          to="/"
          className={`mobile-tabbar__item ${isHome ? 'is-active' : ''}`}
          aria-label="Trang Chủ"
        >
          <i className="fas fa-home" aria-hidden="true"></i>
          <span>Trang Chủ</span>
        </Link>

        <Link
          to="/marketplace"
          className={`mobile-tabbar__item ${isMarket ? 'is-active' : ''}`}
          aria-label="Chợ Buôn CS"
        >
          <i className="fas fa-store" aria-hidden="true"></i>
          <span>Chợ Buôn CS</span>
        </Link>

        <div className="mobile-tabbar__pluswrap" aria-hidden="false">
          <Link
            to="/report"
            className={`mobile-tabbar__plus ${isReport ? 'is-active' : ''}`}
            aria-label="Tố Cáo Lừa Đảo"
          >
            <i className="fas fa-plus" aria-hidden="true"></i>
          </Link>
        </div>

        <Link
          to="/insurance"
          className={`mobile-tabbar__item ${isInsurance ? 'is-active' : ''}`}
          aria-label="Bảo Hiểm CS"
        >
          <i className="fas fa-tag" aria-hidden="true"></i>
          <span>Bảo Hiểm CS</span>
        </Link>

        <a
          href={botLink || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className={`mobile-tabbar__item ${isBot ? 'is-active' : ''}`}
          aria-label="BOT Check"
          style={{ pointerEvents: botLink ? 'auto' : 'none', opacity: botLink ? 1 : 0.5 }}
        >
          <i className="fas fa-robot" aria-hidden="true"></i>
          <span>BOT Check</span>
        </a>
      </div>
    </nav>
  );
};

export default MobileTabBar;
