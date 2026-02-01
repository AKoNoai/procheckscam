import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import './Banner.css';

const Banner = () => {
  const [banners, setBanners] = useState([]);
  const [modes, setModes] = useState({}); // id -> 'cover' | 'no-upscale'
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [visibleCount, setVisibleCount] = useState(3); // number of banners to show (1 on mobile)
  const cycleTimerRef = useRef(null);
  const fadeDuration = 400; // ms (matches CSS)
  const visibleDuration = 2000; // ms (2s)

  useEffect(() => {
    const updateVisibleCount = () => {
      // mobile breakpoint: <=576px show 1 banner, otherwise show 3
      const w = window.innerWidth || document.documentElement.clientWidth;
      setVisibleCount(w <= 576 ? 1 : 3);
    };
    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  const fetchBanners = useCallback(async () => {
    try {
      const res = await api.get('/banners');
      const list = res.data.data || [];
      setBanners(list);
    } catch (e) {
      setBanners([]);
    }
  }, []);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/') fetchBanners();
  }, [fetchBanners, location.pathname]);







  const clearCycleTimer = useCallback(() => {
    if (cycleTimerRef.current) {
      clearTimeout(cycleTimerRef.current);
      cycleTimerRef.current = null;
    }
  }, []);

  const startCycle = useCallback(() => {
    clearCycleTimer();
    // show visibleDuration, then fade out, switch, fade in
    cycleTimerRef.current = setTimeout(() => {
      setVisible(false);
      // after fadeDuration, switch index and show
      cycleTimerRef.current = setTimeout(() => {
        setCurrentIndex((i) => (banners.length ? (i + 1) % banners.length : 0));
        setVisible(true);
        // schedule next cycle
        startCycle();
      }, fadeDuration);
    }, visibleDuration);
  }, [banners, clearCycleTimer, fadeDuration, visibleDuration]);

  const handleImgLoad = (id, e) => {
    try {
      const img = e.target;
      const naturalW = img.naturalWidth || 0;
      const parentW = img.parentElement ? img.parentElement.clientWidth : img.clientWidth;
      // If source is significantly smaller than display area, avoid upscaling
      if (naturalW && parentW && naturalW < parentW * 0.9) {
        setModes((m) => ({ ...m, [id]: 'no-upscale' }));
      } else {
        setModes((m) => ({ ...m, [id]: 'cover' }));
      }
    } catch (err) {
      setModes((m) => ({ ...m, [id]: 'cover' }));
    }
  };

  useEffect(() => {
    // restart cycle when banners change (reset index and visibility)
    clearCycleTimer();
    setCurrentIndex(0);
    setVisible(true);
    if (location.pathname === '/' && banners.length > 0) startCycle();
    return () => clearCycleTimer();
  }, [startCycle, clearCycleTimer, location.pathname, banners.length]);

  // Only render banners on home page
  if (location.pathname !== '/') return null;

  if (!banners.length) return null;

  const items = [];
  const count = Math.min(visibleCount, banners.length);
  for (let i = 0; i < count; i++) {
    items.push(banners[(currentIndex + i) % banners.length]);
  }

  return (
    <div className="banner-ads-wrapper banner-row-centered">
      {items.map((item) => {
        const mode = modes[item._id] || 'cover';
        return (
          <a
            key={item._id}
            href={item.link || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className={`banner-ads-item ${mode} ${visible ? 'visible' : 'hidden'}`}
            aria-hidden={!visible}
          >
            <img src={item.imageUrl} alt={item.title || 'Banner'} onLoad={(e) => handleImgLoad(item._id, e)} />
          </a>
        );
      })}
    </div>
  );
};

export default Banner;
