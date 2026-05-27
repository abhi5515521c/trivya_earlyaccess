import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import Hls from 'hls.js';
import { RunActionButton } from './components/ui/RunActionButton';
import { IoCloseSharp } from 'react-icons/io5';
import { FaInbox } from 'react-icons/fa6';
import { RiBubbleChartFill } from 'react-icons/ri';
import { BsFileTextFill, BsSendFill, BsTagFill } from 'react-icons/bs';
import { TbClockHour12Filled } from 'react-icons/tb';
import './components/DomeGallery.css';


// The 30 tagline variations to pick randomly on every page refresh
const headings = [
  "Something interesting is coming to your cart.",
  "India’s next shopping habit is loading.",
  "The checkout experience is about to get uncomfortable.",
  "E-commerce got a little too comfortable.",
  "Before the next big sale… wait for this.",
  "Your cart is about to become self-aware.",
  "Built for people who don’t fall for shiny red percentages anymore.",
  "Online shopping is entering its “show me proof” era.",
  "The smartest thing in your cart won’t be the product.",
  "The internet perfected selling. Someone had to perfect verifying.",
  "A very inconvenient platform for fake pricing is arriving soon.",
  "The “trust me bro” era of pricing is ending.",
  "We checked the prices. Repeatedly.",
  "Your wallet has been requesting this feature for years.",
  "Calm down. Compare first.",
  "Coming soon for people who open 14 tabs before buying one thing.",
  "The market has enough sellers. This is for the buyers.",
  "Soon, screenshots of “crazy deals” may require context.",
  "Not another shopping app. Something more dangerous.",
  "Coming soon. Probably before the next “BIGGEST SALE EVER”.",
  "Designed for overthinkers. Financially responsible overthinkers.",
  "The cart is watching back this time.",
  "This might ruin online shopping forever.",
  "A disturbance in the e-commerce force is approaching.",
  "Some platforms sell products. This one watches the numbers.",
  "Your future self says wait for this.",
  "We saw the pricing patterns. You will too.",
  "Internet shopping, but with memory.",
  "A new tab is coming to stay permanently open.",
  "The next time a deal looks unbelievable… you’ll know why."
];

// Interactive floating code keywords
const keywords = [
  'verifyPrice()',
  'fetchHistory()',
  'discountAudit',
  'analyzeTrend()',
  'checkoutCheck',
  'walletHistory()',
  'platformData',
  'queryHistory()'
];

// --- DOOM SPHERE (megharammm/DoomSphere — exact port) ---
// Uses the real logos from /public/logos/ + the original DomeGallery CSS + styles.

// Logo images from DoomSphere/logos (served via Vite public/)
const DOME_LOGOS = [
  { src: '/logos/Logo (2).svg',                    alt: 'Amazon Logo' },
  { src: '/logos/Logo (3).svg',                    alt: 'Apple Logo' },
  { src: '/logos/Logo.svg',                        alt: 'Shopify Logo' },
  { src: '/logos/id7rUIs_FZ_1779825766781.svg',    alt: "L'Oreal Logo" },
  { src: '/logos/idFbyDkHrU_1779824763346.svg',    alt: 'Zomato Logo' },
  { src: '/logos/idLNQNZGf5_logos.svg',            alt: 'Samsung Logo' },
  { src: '/logos/idPSFKwZPP_logos.svg',            alt: 'ASOS Logo' },
  { src: '/logos/idRh1T_hmx_logos.svg',            alt: 'Blinkit Logo' },
  { src: '/logos/idV8p3xfy8_1779824575941.svg',    alt: 'Nykaa Logo' },
  { src: '/logos/idkH_jg1mm_logos.svg',            alt: 'JBL Logo' },
  { src: '/logos/idpysrhMtO_logos.svg',            alt: 'boAt Logo' },
  { src: '/logos/idWOzzLGDr_logos.svg',            alt: 'Logo' },
  { src: '/logos/idhMpU1D51_logos.png',            alt: 'Brand Logo' },
  { src: '/logos/idpprML2Di_logos.svg',            alt: 'Brand Logo' },
];

const _DS_DEFAULTS = { maxVerticalRotationDeg: 5, segments: 35, autoRotationSpeed: 0.04 };
const _ds_clamp = (v: number, mn: number, mx: number) => Math.min(Math.max(v, mn), mx);
const _ds_wrap = (deg: number) => { const a = (((deg + 180) % 360) + 360) % 360; return a - 180; };

function _dsBuildItems(pool: { src: string; alt: string }[], seg: number) {
  const xCols = Array.from({ length: seg }, (_, i) => -37 + i * 2);
  const evenYs = [-4, -2, 0, 2, 4];
  const oddYs  = [-3, -1, 1, 3, 5];
  const coords = xCols.flatMap((x, c) => {
    const ys = c % 2 === 0 ? evenYs : oddYs;
    return ys.map(y => ({ x, y, sizeX: 2, sizeY: 2 }));
  });
  const totalSlots = coords.length;
  const used = Array.from({ length: totalSlots }, (_, i) => pool[i % pool.length]);
  // Fisher-Yates shuffle
  for (let i = used.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [used[i], used[j]] = [used[j], used[i]];
  }
  // Prevent adjacent duplicates
  for (let i = 1; i < used.length; i++) {
    if (used[i].src === used[i - 1].src) {
      for (let j = i + 1; j < used.length; j++) {
        if (used[j].src !== used[i].src) { [used[i], used[j]] = [used[j], used[i]]; break; }
      }
    }
  }
  return coords.map((c, i) => ({ ...c, src: used[i].src, alt: used[i].alt }));
}

function _DsGalleryItem({ it }: { it: { x: number; y: number; sizeX: number; sizeY: number; src: string; alt: string } }) {
  const [ratio, setRatio] = useState(2.0);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalWidth && naturalHeight) setRatio(naturalWidth / naturalHeight);
  };

  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth) setRatio(img.naturalWidth / img.naturalHeight);
  }, [it.src]);

  const normScale = useMemo(() => {
    if (!ratio || isNaN(ratio)) return 0.15;
    return Math.min(Math.max(0.15 * Math.sqrt(ratio), 0.08), 0.45);
  }, [ratio]);

  const needsInvert = useMemo(() => {
    if (!it.src) return false;
    return decodeURIComponent(it.src.toLowerCase()).includes('idwozzlgdr');
  }, [it.src]);

  return (
    <div
      className="item"
      style={{
        ['--offset-x' as string]: it.x,
        ['--offset-y' as string]: it.y,
        ['--item-size-x' as string]: it.sizeX,
        ['--item-size-y' as string]: it.sizeY,
      }}
    >
      <div className="item__image" aria-label={it.alt || 'Gallery image'}>
        <img
          ref={imgRef}
          src={it.src}
          onLoad={handleLoad}
          draggable={false}
          alt={it.alt}
          style={{
            transform: `scale(calc(var(--tile-zoom, 1.15) * ${normScale}))`,
            filter: `var(--image-filter, none) blur(var(--tile-blur, 0px))${needsInvert ? ' invert(1)' : ''}`,
          }}
        />
      </div>
    </div>
  );
}

function DoomSphere() {
  const rootRef  = useRef<HTMLDivElement>(null);
  const sphereRef = useRef<HTMLDivElement>(null);
  const rotY = useRef(0);

  const items = useMemo(() => _dsBuildItems(DOME_LOGOS, _DS_DEFAULTS.segments), []);

  const applyTransform = (yDeg: number) => {
    if (sphereRef.current)
      sphereRef.current.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(0deg) rotateY(${yDeg}deg)`;
  };

  // ResizeObserver — matches original radius-fitting logic exactly (fit=0.80, minRadius=600)
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ro = new ResizeObserver(entries => {
      const { width: w, height: h } = entries[0].contentRect;
      const aspect = w / h;
      const basis = aspect >= 1.3 ? w : Math.min(w, h);
      let radius = basis * 0.80;
      radius = Math.min(radius, h * 2.5);
      radius = _ds_clamp(Math.round(radius), 250, Infinity);
      const viewerPad = Math.max(8, Math.round(Math.min(w, h) * 0.25));
      root.style.setProperty('--radius', `${radius}px`);
      root.style.setProperty('--viewer-pad', `${viewerPad}px`);
      root.style.setProperty('--overlay-blur-color', '#000000');
      root.style.setProperty('--tile-radius', '24px');
      root.style.setProperty('--image-filter', 'grayscale(1)');
      root.style.setProperty('--tile-opacity', '0.90');
      root.style.setProperty('--tile-blur', '3px');
      root.style.setProperty('--tile-zoom', '1.45');
      root.style.setProperty('--tile-crop', '0%');
      applyTransform(rotY.current);
    });
    ro.observe(root);
    return () => ro.disconnect();
  }, []);

  // Auto-rotation RAF loop — perfectly smooth 60fps independent of refresh rate
  useEffect(() => {
    let rafId: number;
    let last = performance.now();
    const step = (now: number) => {
      const dt = now - last;
      last = now;
      // 0.04 speed at 60fps (16.66ms per frame) is approx 0.0024 deg/ms
      rotY.current = _ds_wrap(rotY.current + 0.0024 * dt);
      applyTransform(rotY.current);
      rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div
      ref={rootRef}
      className="sphere-root"
      style={{
        ['--segments-x' as string]: _DS_DEFAULTS.segments,
        ['--segments-y' as string]: _DS_DEFAULTS.segments,
        ['--overlay-blur-color' as string]: '#000000',
        ['--tile-radius' as string]: '24px',
        ['--image-filter' as string]: 'grayscale(1)',
        ['--tile-opacity' as string]: 0.90,
        ['--tile-blur' as string]: '3px',
        ['--tile-zoom' as string]: 1.45,
        ['--tile-crop' as string]: '0%',
        width: '100%',
        height: '100%',
      }}
    >
      <main className="sphere-main">
        <div className="stage">
          <div ref={sphereRef} className="sphere">
            {items.map((it, i) => (
              <_DsGalleryItem key={`${it.x},${it.y},${i}`} it={it} />
            ))}
          </div>
        </div>
        <div className="overlay" />
        <div className="overlay overlay--blur" />
        <div className="edge-fade edge-fade--top" />
        <div className="edge-fade edge-fade--bottom" />
      </main>
    </div>
  );
}

// --- CINEMATIC INTERACTIVE BACKGROUND COMPONENT ---
function CinematicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, active: false });

  // Set up HLS Video playback
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = 'https://stream.mux.com/kimF2ha9zLrX64H00UgLGPflCzNtl1T0215MlAmeOztv8.m3u8';
    } else if (Hls.isSupported()) {
      hls = new Hls({
        maxMaxBufferLength: 10,
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource('https://stream.mux.com/kimF2ha9zLrX64H00UgLGPflCzNtl1T0215MlAmeOztv8.m3u8');
      hls.attachMedia(video);
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1/4th resolution scaled up with CSS blur for high performance and smooth blending
    const scale = 0.25;
    const handleResize = () => {
      canvas.width = window.innerWidth * scale;
      canvas.height = window.innerHeight * scale;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX * scale;
      mouseRef.current.targetY = e.clientY * scale;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('mouseleave', handleMouseLeave);

    // Initial blob settings with organic motion properties
    const blobs = [
      {
        baseXP: 0.25,
        baseYP: 0.3,
        radiusP: 0.55,
        colorStart: 'rgba(58, 29, 93, 0.25)', // Soft electric violet
        colorEnd: 'rgba(58, 29, 93, 0)',
        angle: Math.random() * Math.PI * 2,
        speed: 0.0018,
        orbitRadiusP: 0.15,
        x: canvas.width * 0.25,
        y: canvas.height * 0.3,
        targetX: canvas.width * 0.25,
        targetY: canvas.height * 0.3,
        vx: 0,
        vy: 0,
      },
      {
        baseXP: 0.75,
        baseYP: 0.45,
        radiusP: 0.65,
        colorStart: 'rgba(28, 26, 58, 0.28)', // Muted indigo
        colorEnd: 'rgba(28, 26, 58, 0)',
        angle: Math.random() * Math.PI * 2,
        speed: 0.0012,
        orbitRadiusP: 0.18,
        x: canvas.width * 0.75,
        y: canvas.height * 0.45,
        targetX: canvas.width * 0.75,
        targetY: canvas.height * 0.45,
        vx: 0,
        vy: 0,
      },
      {
        baseXP: 0.4,
        baseYP: 0.7,
        radiusP: 0.6,
        colorStart: 'rgba(15, 23, 42, 0.3)', // Dark blue glow
        colorEnd: 'rgba(15, 23, 42, 0)',
        angle: Math.random() * Math.PI * 2,
        speed: 0.0015,
        orbitRadiusP: 0.12,
        x: canvas.width * 0.4,
        y: canvas.height * 0.7,
        targetX: canvas.width * 0.4,
        targetY: canvas.height * 0.7,
        vx: 0,
        vy: 0,
      },
      {
        baseXP: 0.62,
        baseYP: 0.25,
        radiusP: 0.5,
        colorStart: 'rgba(26, 26, 32, 0.35)', // Charcoal/Graphite
        colorEnd: 'rgba(26, 26, 32, 0)',
        angle: Math.random() * Math.PI * 2,
        speed: 0.001,
        orbitRadiusP: 0.2,
        x: canvas.width * 0.62,
        y: canvas.height * 0.25,
        targetX: canvas.width * 0.62,
        targetY: canvas.height * 0.25,
        vx: 0,
        vy: 0,
      },
      {
        baseXP: 0.5,
        baseYP: 0.5,
        radiusP: 0.75,
        colorStart: 'rgba(45, 45, 48, 0.14)', // Subtle silver haze
        colorEnd: 'rgba(45, 45, 48, 0)',
        angle: Math.random() * Math.PI * 2,
        speed: 0.0008,
        orbitRadiusP: 0.08,
        x: canvas.width * 0.5,
        y: canvas.height * 0.5,
        targetX: canvas.width * 0.5,
        targetY: canvas.height * 0.5,
        vx: 0,
        vy: 0,
      }
    ];

    let animationFrameId: number;

    const render = () => {
      // Clear canvas (so video behind it is visible)
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mouse = mouseRef.current;
      
      // Interpolate mouse coordinates for organic lag
      mouse.x += (mouse.targetX - mouse.x) * 0.1;
      mouse.y += (mouse.targetY - mouse.y) * 0.1;

      // Soft volumetric glow behind hero text
      const centerGlow = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) * 0.8
      );
      centerGlow.addColorStop(0, 'rgba(45, 45, 55, 0.18)');
      centerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = centerGlow;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) * 0.8, 0, Math.PI * 2);
      ctx.fill();

      // Update and render blobs
      blobs.forEach((blob) => {
        const baseX = canvas.width * blob.baseXP;
        const baseY = canvas.height * blob.baseYP;
        const orbitRadius = Math.min(canvas.width, canvas.height) * blob.orbitRadiusP;
        const radius = Math.min(canvas.width, canvas.height) * blob.radiusP;

        // Animate drifting path (Lissajous curves)
        blob.angle += blob.speed;
        const orbitX = baseX + Math.cos(blob.angle) * orbitRadius;
        const orbitY = baseY + Math.sin(blob.angle * 1.5) * orbitRadius;

        if (mouse.active) {
          const dx = mouse.x - blob.x;
          const dy = mouse.y - blob.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const repulsionRadius = Math.min(canvas.width, canvas.height) * 0.65;

          if (dist < repulsionRadius) {
            const force = (repulsionRadius - dist) / repulsionRadius;
            // Warping factor
            blob.targetX = orbitX - (dx / (dist || 1)) * force * 45;
            blob.targetY = orbitY - (dy / (dist || 1)) * force * 45;
          } else {
            blob.targetX = orbitX;
            blob.targetY = orbitY;
          }
        } else {
          blob.targetX = orbitX;
          blob.targetY = orbitY;
        }

        // Spring velocity math
        blob.vx += (blob.targetX - blob.x) * 0.015;
        blob.vy += (blob.targetY - blob.y) * 0.015;
        blob.vx *= 0.88;
        blob.vy *= 0.88;
        blob.x += blob.vx;
        blob.y += blob.vy;

        // Render blob radial gradient
        const radGrad = ctx.createRadialGradient(
          blob.x, blob.y, 0,
          blob.x, blob.y, radius
        );
        radGrad.addColorStop(0, blob.colorStart);
        radGrad.addColorStop(1, blob.colorEnd);

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-[#020204]">
      {/* Background Video with low opacity */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-15"
      />
      {/* Blurred interactive canvas blobs on top */}
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover filter blur-[60px]"
        style={{ transform: 'scale(1.2)' }}
      />
      {/* Cinematic Grain Overlay */}
      <div className="grain-overlay" />
    </div>
  );
}



// --- HERO COMPONENT ---
interface HeroProps {
  heading: string;
  onGetEarlyAccess: () => void;
}

function Hero({ heading, onGetEarlyAccess }: HeroProps) {
  return (
    <section className="relative flex-1 flex flex-col items-center justify-center px-6">
      <div className="relative z-20 text-center max-w-5xl mx-auto flex flex-col items-center justify-center w-full gap-12">
        
        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-white/80 text-[10px] md:text-[11px] font-medium tracking-[0.15em] mb-4 font-sans"
        >
          Drop your email to enter the next era of e-commerce.
        </motion.p>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{ fontFamily: "'Instrument Serif', serif" }}
          className="text-4xl sm:text-5xl md:text-[64px] font-medium tracking-[-0.01em] leading-[1.1] mb-6 bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent max-w-4xl px-2"
        >
          {heading}
        </motion.h1>

        {/* CTA Area */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="min-h-[50px] mt-2 flex items-center justify-center w-full"
        >
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            onClick={onGetEarlyAccess}
            className="px-10 py-3.5 text-[14px] font-semibold border border-white/10 rounded-full hover:border-white/30 hover:bg-white/[0.04] transition-all duration-300 text-white/90 backdrop-blur-sm cursor-pointer font-sans shadow-[0_0_20px_rgba(255,255,255,0.01)] hover:shadow-[0_0_25px_rgba(255,255,255,0.04)]"
          >
            Get early access
          </motion.button>
        </motion.div>

      </div>
    </section>
  );
}

// --- MAIN APP COMPONENT ---
function App() {
  const [heading, setHeading] = useState(headings[0]);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [transparencyWish, setTransparencyWish] = useState('');
  const [buttonStatus, setButtonStatus] = useState<'idle' | 'running' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, active: false });

  // Custom waitlist verification steps for Trivya's theme
  const TRIVYA_STEPS = [
    { id: 1, label: 'Securing Waitlist Spot', icon: FaInbox },
    { id: 2, label: 'Verifying Pricing Metadata', icon: RiBubbleChartFill },
    { id: 3, label: 'Checking Discount History', icon: BsTagFill },
    { id: 4, label: 'Auditing Platform Feeds', icon: TbClockHour12Filled },
    { id: 5, label: 'Generating Access Token', icon: BsFileTextFill },
    { id: 6, label: 'Sending Confirmation Mail', icon: BsSendFill },
  ];

  // Pick random heading on refresh
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * headings.length);
    setHeading(headings[randomIndex]);
  }, []);

  // Set up high performance interactive mouse crosshair canvas loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('mouseleave', handleMouseLeave);

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mouse = mouseRef.current;
      
      // Easing mouse trail movement
      mouse.x += (mouse.targetX - mouse.x) * 0.15;
      mouse.y += (mouse.targetY - mouse.y) * 0.15;

      if (mouse.active) {
        // Draw horizontal line
        ctx.beginPath();
        ctx.moveTo(0, mouse.y);
        ctx.lineTo(canvas.width, mouse.y);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw vertical line
        ctx.beginPath();
        ctx.moveTo(mouse.x, 0);
        ctx.lineTo(mouse.x, canvas.height);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw radial grid intersection light flare
        const gradient = ctx.createRadialGradient(
          mouse.x, mouse.y, 0,
          mouse.x, mouse.y, 100
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.04)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 100, 0, Math.PI * 2);
        ctx.fill();

        // Draw center crosshair dot
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();
      }

      // Smooth DOM updates of floating label coords
      if (labelRef.current) {
        if (mouse.active) {
          labelRef.current.style.opacity = '0.7';
          labelRef.current.style.transform = `translate3d(${mouse.x + 15}px, ${mouse.y - 25}px, 0)`;
        } else {
          labelRef.current.style.opacity = '0';
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Update floating code keyword periodically
  useEffect(() => {
    let keywordIndex = 0;
    const interval = setInterval(() => {
      if (labelRef.current) {
        keywordIndex = (keywordIndex + 1) % keywords.length;
        const textNode = labelRef.current.querySelector('.keyword-text');
        if (textNode) {
          textNode.textContent = keywords[keywordIndex];
        }
      }
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (buttonStatus !== 'idle') return;

    if (!name.trim()) {
      setError("Please tell us what to call you.");
      return;
    }
    if (!role) {
      setError("Please select who you are.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!transparencyWish.trim()) {
      setError("Please tell us what you wish platforms were transparent about.");
      return;
    }

    setError(null);
    setButtonStatus('running');

    try {
      const response = await fetch('/api/early-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          persona: role,
          email: email.trim(),
          feedback: transparencyWish.trim(),
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setButtonStatus('idle');
        if (response.status === 409) {
          setError("Email already registered");
        } else if (data && data.message) {
          setError(data.message);
        } else {
          setError("Something went wrong. Please try again.");
        }
        return;
      }

      // Success - let the steps animation play through (7.2s)
      setTimeout(() => {
        setButtonStatus('done');
        
        // Close the modal after showing "Access Confirmed" for 2.5 seconds
        setTimeout(() => {
          setModalOpen(false);
          // Reset states after modal is completely closed
          setTimeout(() => {
            setName('');
            setRole('');
            setEmail('');
            setTransparencyWish('');
            setButtonStatus('idle');
          }, 300);
        }, 2500);
      }, 7200);

    } catch (err) {
      console.error('Error submitting early access form:', err);
      setButtonStatus('idle');
      setError("Unable to connect to the server. Please check your connection.");
    }
  };

  const canClose = buttonStatus !== 'running';

  return (
    <main className="relative bg-black h-screen w-screen flex flex-col overflow-hidden selection:bg-white selection:text-black shrink-0">
      <CinematicBackground />
      
      {/* Interactive Cursor Grid lines canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* Floating text following the cursor */}
      <div
        ref={labelRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 15,
          opacity: 0,
          transition: 'opacity 0.2s ease',
        }}
        className="hidden md:flex font-mono text-[9px] text-white/60 uppercase tracking-widest items-center gap-2 select-none"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        <span className="keyword-text">verifyPrice()</span>
      </div>

      <Hero heading={heading} onGetEarlyAccess={() => setModalOpen(true)} />

      {/* Main Page Dimming Overlay when Modal is Open */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
            className="fixed inset-0 bg-black/95 z-40 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* GLASSMORPHIC MODAL FLOW */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">

            {/* ── Layer 1: DoomSphere (NO filter/backdrop-filter ancestor — preserve-3d requires this) ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
              style={{
                position: 'fixed',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 0,
              }}
            >
              <DoomSphere />
            </motion.div>

            {/* ── Layer 2: Thin dark overlay (click-to-close, sits above sphere) ── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (canClose) setModalOpen(false); }}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.38)',
                backdropFilter: 'blur(3px)',
                WebkitBackdropFilter: 'blur(3px)',
                cursor: 'pointer',
                zIndex: 1,
              }}
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-[480px] max-h-[90dvh] overflow-y-auto rounded-2xl bg-zinc-950/85 border border-zinc-800/60 shadow-[0_0_60px_rgba(168,85,247,0.15)] backdrop-blur-2xl p-6 sm:p-8 md:p-10 text-left z-10 flex flex-col gap-6 scrollbar-hide"
            >
              {/* Subtle inner purple accent glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[40px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/5 rounded-full blur-[40px] pointer-events-none" />

              {/* Close Button */}
              {canClose && (
                <button
                  onClick={() => setModalOpen(false)}
                  className="absolute top-5 right-5 text-zinc-400 hover:text-white transition-colors duration-200 cursor-pointer animate-pulse hover:animate-none"
                >
                  <IoCloseSharp className="w-5 h-5" />
                </button>
              )}

              {/* Title & Subtitle */}
              <div className="flex flex-col gap-1.5 pr-6">
                <h2 className="text-xl font-bold tracking-tight text-white font-sans flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  Get Early Access
                </h2>
                <p className="text-[13px] text-zinc-400 leading-relaxed font-sans">
                  Be among the first to experience transparent pricing.
                  <br />
                  No fake urgency. No manipulated discounts.
                  <br />
                  Only verified price history.
                </p>
              </div>

              {/* Submission Form */}
              <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
                {/* Name Field */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase font-sans">
                    What should we call you?
                  </label>
                  <input
                    type="text"
                    required
                    disabled={buttonStatus !== 'idle'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full bg-zinc-900/30 border border-zinc-800/80 rounded-lg py-2.5 px-3.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all text-sm font-sans"
                  />
                </div>

                {/* Dropdown Field */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase font-sans">
                    Who are you?
                  </label>
                  <div className="relative">
                    <select
                      required
                      disabled={buttonStatus !== 'idle'}
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full appearance-none bg-zinc-900/30 border border-zinc-800/80 rounded-lg py-2.5 px-3.5 pr-10 text-zinc-100 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all text-sm font-sans cursor-pointer bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22rgba(161,161,170,0.5)%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_14px_center] bg-no-repeat"
                    >
                      <option value="" disabled hidden className="bg-zinc-950 text-zinc-500">Select your role</option>
                      <option value="Student" className="bg-zinc-950 text-zinc-100">Student</option>
                      <option value="Employee" className="bg-zinc-950 text-zinc-100">Employee</option>
                      <option value="Business Owner" className="bg-zinc-950 text-zinc-100">Business Owner</option>
                      <option value="Creator / Freelancer" className="bg-zinc-950 text-zinc-100">Creator / Freelancer</option>
                      <option value="Other" className="bg-zinc-950 text-zinc-100">Other</option>
                    </select>
                  </div>
                </div>

                {/* Email Field */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase font-sans">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    disabled={buttonStatus !== 'idle'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-zinc-900/30 border border-zinc-800/80 rounded-lg py-2.5 px-3.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all text-sm font-sans"
                  />
                </div>

                {/* Textarea Field */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase font-sans">
                    What’s one thing you wish shopping platforms were more transparent about?
                  </label>
                  <textarea
                    required
                    disabled={buttonStatus !== 'idle'}
                    value={transparencyWish}
                    onChange={(e) => setTransparencyWish(e.target.value)}
                    placeholder="e.g. historical price charts, hidden platform markups..."
                    className="w-full bg-zinc-900/30 border border-zinc-800/80 rounded-lg py-2.5 px-3.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all text-sm font-sans h-20 resize-none animate-none"
                  />
                </div>

                {/* Error Banner */}
                {error && (
                  <p className="text-xs text-rose-500 font-medium font-sans">
                    {error}
                  </p>
                )}

                {/* Submit Action Button */}
                <div className="mt-4 flex items-center justify-center">
                  <RunActionButton
                    steps={TRIVYA_STEPS}
                    status={buttonStatus}
                    onReset={() => setButtonStatus('idle')}
                    text="Join Early Access"
                  />
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}


export default App;
