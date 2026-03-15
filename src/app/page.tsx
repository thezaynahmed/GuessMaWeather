'use client';

import { useState, useEffect, useRef, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { Wind, Droplets, Eye, CloudLightning, CloudRain, Sun, Cloud, Moon, Clock, MoonStar, SunMedium, LogOut } from 'lucide-react';
import { format } from 'date-fns';

// --- Constants ---
const WEATHER_CACHE_KEY = 'guessmaweather_cache';
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// --- Haptics Utility ---
const triggerHaptic = (pattern: number | number[] = 50) => {
  if (typeof window !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

type WeatherResponse = {
  current: {
    temperature_2m: number;
    weather_code: number;
    wind_speed_10m: number;
    relative_humidity_2m: number;
    visibility: number;
    is_day: number;
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
  };
};

type LocationData = {
  city: string;
  region: string;
  country_name: string;
  latitude: number;
  longitude: number;
};

type Visitor = {
  name: string;
  location: string;
  time: number;
};

// --- Logic ---
const getWeatherInfo = (code: number, isDay: number) => {
  if (code === 0) return { type: isDay ? 'clear' : 'night', titleLong: isDay ? 'Sunny' : 'Clear', icon: isDay ? Sun : Moon, tidbit: isDay ? 'Direct sun outside, grab some shades.' : 'Clear night, look up at the stars!' };
  if (code >= 1 && code <= 3) return { type: 'cloudy', titleLong: 'Cloudy', icon: Cloud, tidbit: 'Mix of sun and clouds. Comfortable for a walk.' };
  if (code >= 45 && code <= 48) return { type: 'fog', titleLong: 'Fog', icon: Cloud, tidbit: 'Low visibility expected. Drive carefully!' };
  if (code >= 51 && code <= 67) return { type: 'rain', titleLong: 'Rain', icon: CloudRain, tidbit: 'It\'s raining. Don\'t forget your umbrella!' };
  if (code >= 71 && code <= 77) return { type: 'snow', titleLong: 'Snow', icon: Cloud, tidbit: 'Snow falling. Bundle up and stay warm.' };
  if (code >= 80 && code <= 82) return { type: 'rain', titleLong: 'Showers', icon: CloudRain, tidbit: 'Rain showers passing through. Take cover when needed.' };
  if (code >= 95 && code <= 99) return { type: 'storm', titleLong: 'Thunderstorm', icon: CloudLightning, tidbit: 'Severe storm warning. Seek shelter and stay safe!' };
  return { type: isDay ? 'clear' : 'night', titleLong: isDay ? 'Sunny' : 'Clear', icon: isDay ? Sun : Moon, tidbit: isDay ? 'Beautiful weather today!' : 'Clear night outside.' };
};

const getThemeColors = (isDarkMode: boolean, code: number, isDay: number) => {
  if (isDarkMode) {
    return { 
      background: 'linear-gradient(180deg, #101217 0%, #171b26 100%)', 
      text: '#ffffff', 
      cardBgClass: 'glass-panel-dark',
      inputClass: 'apple-input',
      btnClass: 'apple-btn' 
    };
  } else {
    // Light mode dynamic base gradients (Classic iOS Weather App colors)
    let background = 'linear-gradient(180deg, #5fc3ff 0%, #a2def0 100%)'; 
    let text = '#000000';
    let cardBgClass = 'glass-panel';
    let inputClass = 'apple-input-light';
    let btnClass = 'apple-btn-light';
    
    if (code === 0) { 
      if (isDay) {
        background = 'linear-gradient(180deg, #4da4ff 0%, #8acfff 100%)';
        text = '#00254d';
        cardBgClass = 'glass-panel';
      } else {
        background = 'linear-gradient(180deg, #10162A 0%, #202e52 100%)';
        text = '#ffffff';
        cardBgClass = 'glass-panel-dark';
        inputClass = 'apple-input';
        btnClass = 'apple-btn';
      }
    } else if (code >= 1 && code <= 3) { 
      if (isDay) {
         background = 'linear-gradient(180deg, #81a8c9 0%, #bcdbe6 100%)';
         text = '#132130';
         cardBgClass = 'glass-panel';
      } else {
         background = 'linear-gradient(180deg, #2c3643 0%, #3e4c5e 100%)';
         text = '#ffffff';
         cardBgClass = 'glass-panel-dark';
         inputClass = 'apple-input';
         btnClass = 'apple-btn';
      }
    } else if (code >= 45 && code <= 48) { 
      background = 'linear-gradient(180deg, #9bb0be 0%, #c5d8e6 100%)'; 
      text = '#1a222e';
      cardBgClass = 'glass-panel';
    } else if (code >= 51 && code <= 67) { 
      background = isDay ? 'linear-gradient(180deg, #4a6c8c 0%, #7d9cb8 100%)' : 'linear-gradient(180deg, #1d2733 0%, #2f4052 100%)'; 
      text = '#ffffff'; 
      cardBgClass = 'glass-panel-dark';
      inputClass = 'apple-input';
      btnClass = 'apple-btn';
    } else if (code >= 71 && code <= 77) { 
      background = isDay ? 'linear-gradient(180deg, #8fb9cc 0%, #cedce6 100%)' : 'linear-gradient(180deg, #2b3b47 0%, #465f73 100%)'; 
      text = isDay ? '#192b38' : '#ffffff'; 
      cardBgClass = isDay ? 'glass-panel' : 'glass-panel-dark';
      inputClass = isDay ? 'apple-input-light' : 'apple-input';
      btnClass = isDay ? 'apple-btn-light' : 'apple-btn';
    } else if (code >= 80 && code <= 82) { 
      background = isDay ? 'linear-gradient(180deg, #4a6c8c 0%, #7d9cb8 100%)' : 'linear-gradient(180deg, #1d2733 0%, #2f4052 100%)'; 
      text = '#ffffff';
      cardBgClass = 'glass-panel-dark';
      inputClass = 'apple-input';
      btnClass = 'apple-btn';
    } else if (code >= 95 && code <= 99) { 
      background = 'linear-gradient(180deg, #242940 0%, #353c5e 100%)'; 
      text = '#ffffff'; 
      cardBgClass = 'glass-panel-dark';
      inputClass = 'apple-input';
      btnClass = 'apple-btn';
    }
    
    return { background, text, cardBgClass, inputClass, btnClass };
  }
};

// --- Weather Scene Component (memoized to prevent re-renders on parent state changes) ---
const WeatherScene = memo(function WeatherScene({ type, count = 30 }: { type: string, count?: number }) {
  const elements = useMemo(() => Array.from({ length: count }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 2 + Math.random() * 3,
    size: Math.random() * 0.5 + 0.5,
  })), [count]);

  if (type === 'rain') {
    return (
      <>
        {elements.map((el) => (
          <div key={el.id} className="rain-drop" style={{ left: `${el.left}vw`, animationDelay: `-${el.delay}s`, animationDuration: `${el.duration * 0.3}s`, height: `${el.size * 50}px`, willChange: 'transform' }} />
        ))}
      </>
    );
  } else if (type === 'snow') {
    return (
      <>
        {elements.map((el) => (
          <div key={el.id} className="snow-flake" style={{ left: `${el.left}vw`, animationDelay: `-${el.delay}s`, animationDuration: `${el.duration * 2}s`, width: `${el.size * 8}px`, height: `${el.size * 8}px`, opacity: el.size, willChange: 'transform' }} />
        ))}
      </>
    );
  } else if (type === 'night') {
    return (
      <>
        {elements.slice(0, 40).map((el) => (
          <div key={el.id} className="star" style={{ left: `${el.left}vw`, top: `${Math.random() * 60}vh`, animationDelay: `-${el.delay}s`, animationDuration: `${el.duration * 1.5}s`, width: `${el.size * 4}px`, height: `${el.size * 4}px`, willChange: 'transform, opacity' }} />
        ))}
      </>
    );
  } else if (type === 'cloudy' || type === 'fog') {
    return (
      <>
        {elements.slice(0, 5).map((el) => (
          <div key={el.id} className="cloud-bubble" style={{ top: `${Math.random() * 30}vh`, animationDelay: `-${el.delay * 4}s`, animationDuration: `${el.duration * 20}s`, width: `${el.size * 300 + 200}px`, height: `${el.size * 100 + 50}px`, willChange: 'transform' }} />
        ))}
      </>
    );
  } else if (type === 'storm') {
    return (
       <>
         {elements.map((el) => <div key={el.id} className="rain-drop" style={{ left: `${el.left}vw`, animationDelay: `-${el.delay}s`, animationDuration: `${el.duration * 0.2}s`, height: `${el.size * 80}px`, willChange: 'transform' }} />)}
         <motion.div animate={{ opacity: [0, 0.8, 0, 0, 0, 1, 0] }} transition={{ duration: 7, repeat: Infinity, times: [0, 0.05, 0.1, 0.15, 0.8, 0.85, 0.9] }} className="absolute inset-0 bg-white" />
       </>
    )
  }
  return null;
});

export default function WeatherApp() {
  const [mounted, setMounted] = useState(false);
  const [userName, setUserName] = useState('');
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showDashboard, setShowDashboard] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [location, setLocation] = useState<LocationData | null>(null);
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [visitors, setVisitors] = useState<Visitor[]>([]);

  const dashboardRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const onboardCardRef = useRef<HTMLDivElement>(null);
  const tempRef = useRef<HTMLHeadingElement>(null);
  const cityRef = useRef<HTMLHeadingElement>(null);

  // Initialize from LocalStorage
  useEffect(() => {
    setMounted(true);
    const storedName = localStorage.getItem('guessmaweather_username');
    const storedTheme = localStorage.getItem('guessmaweather_theme');
    
    if (storedTheme) {
      setIsDarkMode(storedTheme === 'dark');
    }
    
    if (storedName) {
      setUserName(storedName);
      setHasOnboarded(true);
      setShowDashboard(true);
      fetchData(storedName);
    }
  }, []);

  const fetchVisitors = async () => {
    try {
      const res = await fetch('/api/visitors');
      const data = await res.json();
      setVisitors(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchData = async (name: string) => {
    setLoading(true);
    setError(null);
    try {
      // Check localStorage cache first (10-min TTL)
      const cached = localStorage.getItem(WEATHER_CACHE_KEY);
      if (cached) {
        try {
          const { data, location: cachedLoc, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL_MS) {
            setWeather(data);
            setLocation(cachedLoc);
            // Still register visitor but skip API calls
            await fetch('/api/visitors', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, location: `${cachedLoc.city}, ${cachedLoc.country_name}` }),
            }).catch(() => {}); // Non-critical
            return;
          }
        } catch { /* Invalid cache, continue to fetch */ }
      }

      const ipRes = await fetch('https://ipapi.co/json/');
      if (!ipRes.ok) throw new Error('Location service unavailable. You may be behind a VPN or ad-blocker.');
      const ipData = await ipRes.json();
      if (ipData.error) throw new Error(`Location error: ${ipData.reason || 'Could not detect location.'}`);

      const locData: LocationData = {
        city: ipData.city,
        region: ipData.region,
        country_name: ipData.country_name,
        latitude: ipData.latitude,
        longitude: ipData.longitude,
      };
      setLocation(locData);

      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${ipData.latitude}&longitude=${ipData.longitude}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m,visibility,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
      const weatherRes = await fetch(weatherUrl);
      if (!weatherRes.ok) throw new Error('Weather service temporarily unavailable.');
      const weatherData = await weatherRes.json();
      setWeather(weatherData);

      // Cache the result
      localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({
        data: weatherData,
        location: locData,
        timestamp: Date.now(),
      }));

      // Register visitor (non-critical, fire-and-forget)
      fetch('/api/visitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, location: `${ipData.city}, ${ipData.country_name}` }),
      }).catch(() => {});
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(msg);
      console.error('fetchData error:', err);
    } finally {
      setLoading(false);
      fetchVisitors();
    }
  };

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;
    triggerHaptic([30, 50, 30]);
    
    localStorage.setItem('guessmaweather_username', userName);
    
    // Animate card out then switch immediately
    if (onboardCardRef.current) {
      gsap.to(onboardCardRef.current, {
        scale: 0.85,
        opacity: 0,
        y: -60,
        filter: 'blur(30px)',
        duration: 0.4,
        ease: 'power3.inOut',
        onComplete: () => {
          setHasOnboarded(true);
          setShowDashboard(true);
        }
      });
    } else {
      setHasOnboarded(true);
      setShowDashboard(true);
    }
    
    fetchData(userName);
  };

  const handleLogout = () => {
    triggerHaptic();
    localStorage.removeItem('guessmaweather_username');
    setHasOnboarded(false);
    setShowDashboard(false);
    setUserName('');
    setWeather(null);
  };

  const toggleTheme = () => {
    triggerHaptic(20);
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('guessmaweather_theme', newTheme ? 'dark' : 'light');
  };

  // WORLD-CLASS GSAP Dashboard Entry Animation
  useEffect(() => {
    if (showDashboard && weather && hasOnboarded) {
      // Must give React a moment to fully construct the large dashboard DOM tree
      // and attach all the refs correctly from the layout shift before GSAP binds
      const timer = setTimeout(() => {
        const masterTl = gsap.timeline({ defaults: { ease: 'power4.out' } });

        // 1. City name reveal with typewriter
        if (cityRef.current) {
          masterTl.fromTo(cityRef.current,
            { opacity: 0, y: 20, scale: 0.9 },
            { opacity: 1, y: 0, scale: 1, duration: 0.8 },
            0
          );
        }

        // 2. Left column elements cascade in from left with stagger
        if (leftColRef.current) {
          const leftChildren = leftColRef.current.querySelectorAll('[data-animate]');
          masterTl.fromTo(leftChildren,
            { x: -60, opacity: 0, rotateY: 15 },
            { x: 0, opacity: 1, rotateY: 0, duration: 1.0, stagger: 0.12 },
            0.15
          );
        }

        // 3. Temperature counter animation (counts up from 0)
        if (tempRef.current && weather.current) {
          const targetTemp = Math.round(weather.current.temperature_2m);
          const tempObj = { val: 0 };
          masterTl.fromTo(tempRef.current,
            { opacity: 0, scale: 0.5, y: 40 },
            { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: 'elastic.out(1, 0.6)' },
            0.3
          );
          masterTl.to(tempObj, {
            val: targetTemp,
            duration: 1.8,
            ease: 'power2.out',
            onUpdate: () => {
              if (tempRef.current) {
                tempRef.current.textContent = `${Math.round(tempObj.val)}°`;
              }
            }
          }, 0.4);
        }

        // 4. Right column glass cards drop in with spring physics
        if (dashboardRef.current) {
          const rightCards = dashboardRef.current.querySelectorAll('[data-card]');
          masterTl.fromTo(rightCards,
            { y: 80, opacity: 0, scale: 0.92 },
            { 
              y: 0, opacity: 1, scale: 1, 
              duration: 1.2, 
              stagger: 0.15, 
              ease: 'elastic.out(1, 0.75)' 
            },
            0.4
          );
        }

        // 5. Weekly forecast items float up individually
        if (dashboardRef.current) {
          const forecastCards = dashboardRef.current.querySelectorAll('[data-forecast]');
          masterTl.fromTo(forecastCards,
            { y: 40, opacity: 0, scale: 0.85 },
            { 
              y: 0, opacity: 1, scale: 1, 
              duration: 0.8, 
              stagger: 0.08, 
              ease: 'back.out(1.7)' 
            },
            0.8
          );
        }
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [showDashboard, weather, hasOnboarded]);

  if (!mounted) return null;

  const { current } = weather || {};
  const weatherInfo = current ? getWeatherInfo(current.weather_code, current.is_day) : getWeatherInfo(0, 1);
  const colors = current ? getThemeColors(isDarkMode, current.weather_code, current.is_day) : getThemeColors(isDarkMode, 0, 1);

  return (
    <div 
      className={`relative min-h-screen w-full flex justify-center overflow-x-hidden font-sans transition-colors duration-1000 ease-in-out ${!hasOnboarded ? (isDarkMode ? 'apple-mesh-bg-dark' : 'apple-mesh-bg') : ''}`} 
      style={hasOnboarded ? { background: colors.background, color: colors.text } : { color: '#ffffff' }}
    >
      {/* Dynamic Background Visuals */}
      {hasOnboarded && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden mix-blend-screen opacity-50">
           <WeatherScene type={weatherInfo.type} count={weatherInfo.type === 'snow' ? 100 : 40} />
        </div>
      )}

      <AnimatePresence mode="wait">
        {!hasOnboarded ? (
          <motion.div 
            key="onboarding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(20px)' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="w-full flex flex-col items-center justify-center min-h-screen relative z-10 p-6"
          >
            {/* Floating ambient orbs behind card */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div
                animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0], scale: [1, 1.2, 0.9, 1] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-[20%] left-[15%] w-72 h-72 rounded-full opacity-30"
                style={{ background: 'radial-gradient(circle, rgba(79,140,255,0.5) 0%, transparent 70%)' }}
              />
              <motion.div
                animate={{ x: [0, -25, 35, 0], y: [0, 30, -30, 0], scale: [1, 0.8, 1.1, 1] }}
                transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute bottom-[20%] right-[10%] w-96 h-96 rounded-full opacity-20"
                style={{ background: 'radial-gradient(circle, rgba(83,52,131,0.6) 0%, transparent 70%)' }}
              />
              <motion.div
                animate={{ x: [0, 15, -15, 0], y: [0, -20, 10, 0] }}
                transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-[50%] right-[30%] w-40 h-40 rounded-full opacity-25"
                style={{ background: 'radial-gradient(circle, rgba(77,164,255,0.4) 0%, transparent 70%)' }}
              />
            </div>

            {/* Main Card */}
            <div ref={onboardCardRef} className="glass-panel-dark p-12 rounded-[2.5rem] max-w-lg w-full relative overflow-hidden">
              {/* Shimmer effect on card */}
              <motion.div
                animate={{ x: ['-200%', '200%'] }}
                transition={{ duration: 4, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
                className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 pointer-events-none"
              />

              {/* Floating weather icons */}
              <div className="flex justify-center gap-6 mb-8">
                {[Sun, Cloud, CloudRain, Moon, Wind].map((Icon, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 0.4, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                  >
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 2 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <Icon className="w-8 h-8 opacity-50" strokeWidth={1.2} />
                    </motion.div>
                  </motion.div>
                ))}
              </div>

              {/* Title with stagger animation */}
              <motion.h1 
                className="text-5xl font-extrabold mb-3 tracking-tight text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                Guess Ma Weather
              </motion.h1>
              
              <motion.p 
                className="text-center opacity-60 mb-10 text-sm leading-relaxed font-medium max-w-xs mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                Real-time weather intelligence delivered through a spatial glass interface.
              </motion.p>

              <form onSubmit={handleOnboard} className="flex flex-col gap-5">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <input 
                    type="text" 
                    placeholder="Enter your first name..." 
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                    maxLength={30}
                    className="w-full bg-white/8 border border-white/15 rounded-2xl px-6 py-4 text-white placeholder-white/30 focus:outline-none focus:border-white/40 focus:bg-white/12 transition-all duration-300 font-medium text-lg"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  className="flex items-start gap-3 text-[11px] text-white/40 px-1"
                >
                  <Eye className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>Your name will appear in the Live Visitors feed temporarily.</span>
                </motion.div>

                <motion.button 
                  disabled={loading || !userName.trim()}
                  className="mt-3 w-full font-bold tracking-wide rounded-2xl px-6 py-4 transition-all duration-300 disabled:opacity-40 disabled:pointer-events-none text-lg relative overflow-hidden group"
                  style={{ 
                    background: userName.trim() ? 'linear-gradient(135deg, #4da4ff, #533483)' : 'rgba(255,255,255,0.1)',
                    color: '#ffffff',
                    boxShadow: userName.trim() ? '0 8px 30px rgba(77,164,255,0.3)' : 'none'
                  }}
                  whileHover={{ scale: 1.02, boxShadow: '0 12px 40px rgba(77,164,255,0.4)' }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  <span className="relative z-10">{loading ? 'Detecting Your Location...' : 'Enter Dashboard →'}</span>
                  {userName.trim() && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                    />
                  )}
                </motion.button>
              </form>
            </div>

            {/* Bottom tagline */}
            <motion.p
              className="mt-8 text-white/25 text-xs font-medium tracking-widest uppercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 1 }}
            >
              Powered by Open-Meteo • Glassmorphism UI
            </motion.p>
          </motion.div>
        ) : (
          <div className="relative z-10 w-full max-w-7xl min-h-screen px-6 py-8 md:py-12 mx-auto flex flex-col">
            
            {/* Top Navigation */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center mb-8 gap-4"
            >
              <div 
                className={`w-12 h-12 rounded-full flex flex-col justify-center items-center cursor-pointer hover:scale-105 active:scale-95 transition-all ${colors.cardBgClass}`}
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5" strokeWidth={2} />
              </div>
              
              {/* Push title to fill exact space for symmetry if desired, or let it flow */}
              <div className="flex-1 flex justify-center lg:justify-end xl:pr-32">
                 <h2 ref={cityRef} className="text-2xl lg:text-3xl font-bold tracking-tight opacity-90">{location?.city || 'Locating...'}</h2>
              </div>
              
              <div 
                className={`w-12 h-12 rounded-full flex flex-col justify-center items-center cursor-pointer hover:scale-105 active:scale-95 transition-all ${colors.cardBgClass}`}
                onClick={toggleTheme}
              >
                {isDarkMode ? <SunMedium className="w-6 h-6" strokeWidth={2} /> : <MoonStar className="w-6 h-6" strokeWidth={2} />}
              </div>
            </motion.div>

            {error ? (
               <div className="flex-1 flex items-center justify-center">
                 <div className="text-center max-w-md">
                    <Cloud className="w-16 h-16 mb-6 opacity-40 mx-auto" />
                    <h3 className="text-xl font-bold mb-3 opacity-90">Unable to Load Weather</h3>
                    <p className="text-sm opacity-60 mb-6 leading-relaxed">{error}</p>
                    <button 
                      onClick={() => fetchData(userName)}
                      className="px-8 py-3 rounded-2xl font-bold text-sm bg-white/15 hover:bg-white/25 transition-all hover:scale-105 active:scale-95"
                    >
                      Try Again
                    </button>
                 </div>
               </div>
            ) : loading && !weather ? (
               <div className="flex-1 flex items-center justify-center">
                 <div className="animate-pulse font-medium opacity-60 flex flex-col items-center">
                    <Cloud className="w-12 h-12 mb-4 opacity-50" />
                    Assembling glass layout...
                 </div>
               </div>
            ) : (
              <div className="flex-1 flex flex-col lg:grid lg:grid-cols-2 gap-10 xl:gap-20 pb-10">
                
                {/* Left Column: Sticky centered weather hero */}
                <div ref={leftColRef} className="flex flex-col items-center lg:items-start text-center lg:text-left lg:sticky lg:top-[20vh] lg:self-start lg:h-fit py-8">
                  <div 
                    data-animate
                    className={`px-6 py-2.5 rounded-full text-sm font-semibold mb-6 tracking-wide shadow-lg inline-flex items-center gap-2 ${colors.cardBgClass}`}
                  >
                    <weatherInfo.icon className="w-4 h-4" />
                    {format(new Date(), 'EEEE, d MMMM')}
                  </div>
                  
                  <div data-animate className="text-3xl lg:text-4xl font-bold opacity-90 mb-2">{weatherInfo.titleLong}</div>

                  <h1 
                    ref={tempRef}
                    className="text-[10rem] md:text-[12rem] lg:text-[14rem] leading-none font-bold tracking-tighter mb-8"
                    style={{ textShadow: isDarkMode ? '0 20px 40px rgba(0,0,0,0.5)' : '0 20px 40px rgba(0,0,0,0.1)' }}
                  >
                    {Math.round(current?.temperature_2m || 0)}°
                  </h1>

                  <div data-animate className="max-w-md w-full text-center lg:text-left">
                    <h3 className="font-bold text-2xl mb-3">Daily Summary</h3>
                    <p className="text-lg font-medium opacity-80 leading-relaxed">
                      {weatherInfo.tidbit} Today, the temperature is felt in the range from 
                      +{Math.round(weather?.daily?.temperature_2m_min[0] || 0)}° to 
                      +{Math.round(weather?.daily?.temperature_2m_max[0] || 0)}°.
                    </p>
                  </div>
                </div>

                {/* Right Column: Glass Bento Grid */}
                <div ref={dashboardRef} className="flex flex-col justify-center gap-8">
                  
                  {/* Glass Bento Metrics */}
                  <motion.div 
                    data-card
                    whileHover={{ scale: 1.015, y: -4 }}
                    whileTap={{ scale: 0.99 }}
                    className={`grid grid-cols-3 gap-4 rounded-[2.5rem] p-8 lg:p-10 transition-all cursor-pointer ${colors.cardBgClass}`}
                    onClick={() => triggerHaptic(15)}
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Wind className="w-10 h-10 opacity-70 mb-5" strokeWidth={1.5} />
                      <div className="font-bold text-2xl lg:text-3xl">{current?.wind_speed_10m}</div>
                      <div className="text-sm lg:text-base opacity-60 mt-1">km/h</div>
                    </div>
                    <div className="flex flex-col items-center justify-center border-l border-r border-black/10 dark:border-white/10 mx-[-1rem]">
                      <Droplets className="w-10 h-10 opacity-70 mb-5" strokeWidth={1.5} />
                      <div className="font-bold text-2xl lg:text-3xl">{current?.relative_humidity_2m}%</div>
                      <div className="text-sm lg:text-base opacity-60 mt-1">Humidity</div>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <Eye className="w-10 h-10 opacity-70 mb-5" strokeWidth={1.5} />
                      <div className="font-bold text-2xl lg:text-3xl">{(current?.visibility || 0) / 1000}</div>
                      <div className="text-sm lg:text-base opacity-60 mt-1">km</div>
                    </div>
                  </motion.div>

                  {/* Glass Weekly Forecast */}
                  <div data-card>
                    <h3 className="font-bold text-xl mb-4 ml-2">Weekly forecast</h3>
                    <div className="grid grid-cols-5 gap-4">
                      {weather?.daily.time.slice(1, 6).map((day, idx) => {
                         const dateStr = format(new Date(day), 'd MMM');
                         const maxTemp = Math.round(weather.daily.temperature_2m_max[idx+1]);
                         const cCode = weather.daily.weather_code[idx+1];
                         const DayInfo = getWeatherInfo(cCode, 1);
                         const DayIcon = DayInfo.icon;

                         return (
                            <motion.div 
                              data-forecast
                              whileHover={{ y: -8, scale: 1.05 }}
                              key={day} 
                              className={`flex flex-col items-center justify-between rounded-3xl py-6 cursor-pointer transition-all ${colors.cardBgClass}`} 
                              onClick={() => triggerHaptic(20)}
                            >
                              <div className="font-bold text-xl mb-4">{maxTemp}°</div>
                              <DayIcon className="w-8 h-8 mb-4 opacity-80" strokeWidth={1.5} />
                              <div className="text-xs font-semibold opacity-70 uppercase tracking-wider">{dateStr}</div>
                            </motion.div>
                         );
                      })}
                    </div>
                  </div>

                  {/* Glass Live Visitor Feed */}
                  <div data-card className={`rounded-[2.5rem] p-8 lg:p-10 ${colors.cardBgClass}`}>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-xl">Live Visitors</h3>
                      <div className="flex items-center gap-2 text-sm font-semibold opacity-80 bg-black/10 dark:bg-white/10 px-3 py-1 rounded-full">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Live Core
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <AnimatePresence>
                        {visitors.map((v, i) => (
                          <motion.div 
                            initial={{ opacity: 0, x: -20, scale: 0.95 }} 
                            animate={{ opacity: 1, x: 0, scale: 1 }} 
                            exit={{ opacity: 0, x: 20, scale: 0.95 }}
                            transition={{ duration: 0.4, delay: i * 0.05 }}
                            key={`${v.time}-${i}`} 
                            className="flex justify-between items-center py-4 px-5 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 cursor-default"
                          >
                            <div className="flex items-center gap-5">
                              <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl shadow-inner bg-white/20 dark:bg-black/30 backdrop-blur-md">
                                {v.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-lg">{v.name}</span>
                                <span className="text-[14px] opacity-60 mt-1">{v.location}</span>
                              </div>
                            </div>
                            <div className="text-[14px] opacity-60 font-semibold flex items-center">
                               <Clock className="w-4 h-4 mr-2 opacity-70" />
                               {format(v.time, 'h:mm a')}
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      {visitors.length === 0 && !loading && (
                        <div className="text-sm opacity-50 text-center py-6 font-medium">
                          Waiting for visitors...
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
