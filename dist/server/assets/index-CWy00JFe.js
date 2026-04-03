import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Swords, ShoppingBag, CalendarDays, Users } from "lucide-react";
import { useEffect, useRef } from "react";
import { useAnimation, useMotionValue, motion } from "motion/react";
function getRotationTransition(duration, from, loop = true) {
  return {
    from,
    to: from + 360,
    ease: "linear",
    duration,
    type: "tween",
    repeat: loop ? Infinity : 0
  };
}
function getTransition(duration, from) {
  return {
    rotate: getRotationTransition(duration, from),
    scale: {
      type: "spring",
      damping: 20,
      stiffness: 300
    }
  };
}
function CircularText({
  text,
  spinDuration = 20,
  onHover = "speedUp",
  className = "",
  fontSize = 13,
  radius = 190
}) {
  const letters = Array.from(text);
  const controls = useAnimation();
  const rotation = useMotionValue(0);
  useEffect(() => {
    const start = rotation.get();
    controls.start({
      rotate: start + 360,
      scale: 1,
      transition: getTransition(spinDuration, start)
    });
  }, [spinDuration, text, controls, rotation]);
  const handleHoverStart = () => {
    const start = rotation.get();
    if (!onHover) return;
    let transitionConfig;
    let scaleVal = 1;
    switch (onHover) {
      case "slowDown":
        transitionConfig = getTransition(spinDuration * 2, start);
        break;
      case "speedUp":
        transitionConfig = getTransition(spinDuration / 4, start);
        break;
      case "pause":
        transitionConfig = {
          rotate: { type: "spring", damping: 20, stiffness: 300 },
          scale: { type: "spring", damping: 20, stiffness: 300 }
        };
        scaleVal = 1;
        break;
      case "goBonkers":
        transitionConfig = getTransition(spinDuration / 20, start);
        scaleVal = 0.8;
        break;
      default:
        transitionConfig = getTransition(spinDuration, start);
    }
    controls.start({
      rotate: start + 360,
      scale: scaleVal,
      transition: transitionConfig
    });
  };
  const handleHoverEnd = () => {
    const start = rotation.get();
    controls.start({
      rotate: start + 360,
      scale: 1,
      transition: getTransition(spinDuration, start)
    });
  };
  const size = radius * 2;
  return /* @__PURE__ */ jsx(
    motion.div,
    {
      className: `relative cursor-pointer select-none ${className}`,
      style: {
        width: size,
        height: size,
        rotate: rotation
      },
      initial: { rotate: 0 },
      animate: controls,
      onMouseEnter: handleHoverStart,
      onMouseLeave: handleHoverEnd,
      children: letters.map((letter, i) => {
        const angleDeg = 360 / letters.length * i - 90;
        const angleRad = angleDeg * Math.PI / 180;
        const x = radius + radius * Math.cos(angleRad) - fontSize / 2;
        const y = radius + radius * Math.sin(angleRad) - fontSize / 2;
        return /* @__PURE__ */ jsx(
          "span",
          {
            style: {
              position: "absolute",
              left: x,
              top: y,
              fontSize,
              fontWeight: 900,
              lineHeight: 1,
              fontFamily: "var(--font-barlow-condensed), sans-serif",
              letterSpacing: "0.05em",
              transform: `rotate(${angleDeg + 90}deg)`,
              transformOrigin: "center center",
              display: "inline-block",
              width: fontSize,
              height: fontSize,
              textAlign: "center"
            },
            children: letter
          },
          i
        );
      })
    }
  );
}
function LetterGlitch({
  glitchColors = ["#e90003", "#2a2a2a", "#a9a9a9"],
  glitchSpeed = 60,
  centerVignette = false,
  outerVignette = true,
  smooth = true,
  className = "",
  characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789"
}) {
  const canvasRef = useRef(null);
  const animationRef = useRef(0);
  const letters = useRef([]);
  const grid = useRef({ columns: 0, rows: 0 });
  const context = useRef(null);
  const lastGlitchTime = useRef(Date.now());
  const glitchColorsRef = useRef(glitchColors);
  glitchColorsRef.current = glitchColors;
  const charactersRef = useRef(characters);
  charactersRef.current = characters;
  const fontSize = 16;
  const charWidth = 10;
  const charHeight = 20;
  const getRandomChar = () => {
    const chars = Array.from(charactersRef.current);
    return chars[Math.floor(Math.random() * chars.length)];
  };
  const getRandomColor = () => glitchColorsRef.current[Math.floor(Math.random() * glitchColorsRef.current.length)];
  const hexToRgb = (hex) => {
    const shorthand = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthand, (_, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };
  const interpolateColor = (start, end, factor) => {
    return `rgb(${Math.round(start.r + (end.r - start.r) * factor)}, ${Math.round(
      start.g + (end.g - start.g) * factor
    )}, ${Math.round(start.b + (end.b - start.b) * factor)})`;
  };
  const initializeLetters = (columns, rows) => {
    grid.current = { columns, rows };
    letters.current = Array.from({ length: columns * rows }, () => ({
      char: getRandomChar(),
      color: getRandomColor(),
      targetColor: getRandomColor(),
      colorProgress: 1
    }));
  };
  const drawLetters = () => {
    const ctx = context.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas || letters.current.length === 0) return;
    const { width, height } = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, width, height);
    ctx.font = `${fontSize}px monospace`;
    ctx.textBaseline = "top";
    letters.current.forEach((letter, index) => {
      const x = index % grid.current.columns * charWidth;
      const y = Math.floor(index / grid.current.columns) * charHeight;
      ctx.fillStyle = letter.color;
      ctx.fillText(letter.char, x, y);
    });
  };
  const updateLetters = () => {
    if (!letters.current.length) return;
    const updateCount = Math.max(1, Math.floor(letters.current.length * 0.05));
    for (let i = 0; i < updateCount; i++) {
      const index = Math.floor(Math.random() * letters.current.length);
      if (!letters.current[index]) continue;
      letters.current[index].char = getRandomChar();
      letters.current[index].targetColor = getRandomColor();
      if (!smooth) {
        letters.current[index].color = letters.current[index].targetColor;
        letters.current[index].colorProgress = 1;
      } else {
        letters.current[index].colorProgress = 0;
      }
    }
  };
  const handleSmoothTransitions = () => {
    let needsRedraw = false;
    letters.current.forEach((letter) => {
      if (letter.colorProgress < 1) {
        letter.colorProgress += 0.05;
        if (letter.colorProgress > 1) letter.colorProgress = 1;
        const startRgb = hexToRgb(letter.color);
        const endRgb = hexToRgb(letter.targetColor);
        if (startRgb && endRgb) {
          letter.color = interpolateColor(startRgb, endRgb, letter.colorProgress);
          needsRedraw = true;
        }
      }
    });
    if (needsRedraw) drawLetters();
  };
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = parent.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    if (context.current) {
      context.current.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    const columns = Math.ceil(rect.width / charWidth);
    const rows = Math.ceil(rect.height / charHeight);
    initializeLetters(columns, rows);
    drawLetters();
  };
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    context.current = canvas.getContext("2d");
    resizeCanvas();
    const animate = () => {
      const now = Date.now();
      if (now - lastGlitchTime.current >= glitchSpeed) {
        updateLetters();
        drawLetters();
        lastGlitchTime.current = now;
      }
      if (smooth) handleSmoothTransitions();
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        cancelAnimationFrame(animationRef.current);
        resizeCanvas();
        animationRef.current = requestAnimationFrame(animate);
      }, 100);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [glitchSpeed, smooth]);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className,
      style: { position: "relative", width: "100%", height: "100%", overflow: "hidden" },
      children: [
        /* @__PURE__ */ jsx("canvas", { ref: canvasRef, style: { display: "block", width: "100%", height: "100%" } }),
        outerVignette && /* @__PURE__ */ jsx(
          "div",
          {
            style: {
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background: "radial-gradient(circle, rgba(0,0,0,0) 40%, rgba(0,0,0,1) 100%)"
            }
          }
        ),
        centerVignette && /* @__PURE__ */ jsx(
          "div",
          {
            style: {
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background: "radial-gradient(circle, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 60%)"
            }
          }
        )
      ]
    }
  );
}
function Hero() {
  return /* @__PURE__ */ jsxs("section", { className: "relative overflow-hidden border-b border-border", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-x-0 top-0 h-[2px] bg-primary z-10" }),
    /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-0 opacity-[0.18]", children: /* @__PURE__ */ jsx(
      LetterGlitch,
      {
        glitchColors: ["#e90003", "#3a3a3a", "#a9a9a9"],
        glitchSpeed: 55,
        outerVignette: true,
        centerVignette: false,
        smooth: true
      }
    ) }),
    /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-7xl px-4 sm:px-6 relative", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-12 py-16 sm:py-20 lg:flex-row lg:items-center lg:justify-between lg:gap-0 lg:py-0 lg:min-h-[640px]", children: [
      /* @__PURE__ */ jsxs("div", { className: "w-full max-w-xl lg:py-24", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-5 inline-flex items-center gap-2 border border-primary/30 bg-primary/10 px-3 py-1", children: [
          /* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-primary" }),
          /* @__PURE__ */ jsx("span", { className: "label-military text-primary", children: "Cebu Airsoft Community" })
        ] }),
        /* @__PURE__ */ jsxs("h1", { className: "text-5xl font-black tracking-tight text-foreground sm:text-6xl lg:text-7xl uppercase leading-[0.9] mb-6", children: [
          "One home",
          /* @__PURE__ */ jsx("br", {}),
          /* @__PURE__ */ jsx("span", { className: "text-primary", children: "for Cebu" }),
          /* @__PURE__ */ jsx("br", {}),
          "airsoft."
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-base text-muted-foreground leading-relaxed mb-8 max-w-md", children: "Discuss, buy, sell, and play. Detachment Reaper is the community hub for airsoft players in Cebu — find games near you, gear up from fellow players, and connect with your team." }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3", children: [
          /* @__PURE__ */ jsxs(
            Link,
            {
              to: "/register",
              className: "inline-flex items-center gap-2 rounded bg-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/85 glow-red",
              children: [
                "Join the community",
                /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            Link,
            {
              to: "/events",
              className: "inline-flex items-center gap-2 rounded border border-border px-5 py-2.5 text-xs font-semibold uppercase tracking-widest transition-colors hover:bg-accent hover:border-primary/50",
              children: "Find a game"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs(
        "div",
        {
          className: "relative flex-shrink-0 flex items-center justify-center lg:py-16",
          style: { width: 560, height: 560 },
          children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "pointer-events-none absolute inset-0 z-0",
                style: {
                  background: "radial-gradient(circle at 50% 50%, oklch(0.45 0.27 25 / 22%) 0%, transparent 65%)"
                }
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center z-10", children: /* @__PURE__ */ jsx(
              CircularText,
              {
                text: "Detachment Reaper - Cebu Airsoft Community - ",
                spinDuration: 22,
                onHover: "speedUp",
                radius: 130,
                fontSize: 26,
                className: "text-primary/80"
              }
            ) }),
            /* @__PURE__ */ jsx(
              "img",
              {
                src: "/hero-logo.png",
                alt: "Detachment Reaper",
                width: 560,
                height: 560,
                className: "h-[560px] w-auto object-contain drop-shadow-[0_0_48px_oklch(0.45_0.27_25_/_0.5)] pointer-events-none relative z-20"
              }
            )
          ]
        }
      )
    ] }) })
  ] });
}
const STATS = [
  { label: "Operators", barWidth: "w-16", rotation: "-rotate-1" },
  { label: "Games Hosted", barWidth: "w-20", rotation: "rotate-[0.5deg]" },
  { label: "Gear Listings", barWidth: "w-14", rotation: "-rotate-[0.8deg]" },
  { label: "Active Units", barWidth: "w-[72px]", rotation: "rotate-1" }
];
function StatsBar() {
  return /* @__PURE__ */ jsx("section", { className: "border-b border-border bg-card", children: /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-7xl px-4 sm:px-6", children: /* @__PURE__ */ jsx("dl", { className: "grid grid-cols-2 divide-x divide-y divide-border sm:grid-cols-4 sm:divide-y-0", children: STATS.map((stat) => /* @__PURE__ */ jsxs(
    "div",
    {
      className: "flex flex-col items-center justify-center px-6 py-7 gap-2",
      children: [
        /* @__PURE__ */ jsxs("dt", { className: "flex flex-col items-center gap-1.5", children: [
          /* @__PURE__ */ jsx(
            "span",
            {
              className: `relative block h-5 ${stat.barWidth} ${stat.rotation}`,
              "aria-label": "redacted",
              style: {
                background: "linear-gradient(180deg, #d4d4d4 0%, #e8e8e8 40%, #c8c8c8 100%)",
                clipPath: "polygon(0% 15%, 1% 0%, 3% 8%, 5% 2%, 7% 10%, 9% 1%, 11% 7%, 13% 0%, 15% 9%, 17% 2%, 100% 2%, 99% 20%, 98% 5%, 97% 18%, 96% 3%, 95% 15%, 94% 2%, 93% 12%, 92% 0%, 91% 10%, 90% 0%, 90% 85%, 91% 100%, 93% 92%, 95% 100%, 97% 88%, 99% 100%, 100% 80%, 100% 100%, 0% 100%, 0% 85%)",
                boxShadow: "0 2px 4px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.3)"
              }
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono tracking-widest text-muted-foreground/30 uppercase", children: "[redacted]" })
        ] }),
        /* @__PURE__ */ jsx("dd", { className: "label-military", children: stat.label })
      ]
    },
    stat.label
  )) }) }) });
}
const FEATURES = [
  {
    icon: Swords,
    title: "Forum",
    description: "Discuss tactics, share gear reviews, post memes, and connect with the Cebu airsoft community.",
    href: "/feed",
    cta: "Browse discussions"
  },
  {
    icon: ShoppingBag,
    title: "Marketplace",
    description: "Buy and sell rifles, pistols, gear, and accessories. Set up your own shop and list what you're selling.",
    href: "/marketplace",
    cta: "Browse listings"
  },
  {
    icon: CalendarDays,
    title: "Game Events",
    description: "Find upcoming games in Cebu. Check the location, entrance fee, and RSVP so the organizer knows you're in.",
    href: "/events",
    cta: "See upcoming games"
  },
  {
    icon: Users,
    title: "Groups & Teams",
    description: "Register your team or airsoft group. Get a group profile, badge your members, and build your squad's presence.",
    href: "/groups",
    cta: "Browse groups"
  }
];
function FeaturesGrid() {
  return /* @__PURE__ */ jsxs("section", { className: "mx-auto max-w-7xl px-4 py-20 sm:px-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-12", children: [
      /* @__PURE__ */ jsx("p", { className: "label-military text-primary mb-2", children: "Platform" }),
      /* @__PURE__ */ jsx("h2", { className: "text-3xl font-black uppercase tracking-tight text-foreground sm:text-4xl", children: "Everything the community needs" }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 text-muted-foreground max-w-md", children: "Built specifically for Cebu airsoft players. No more scattered group chats." })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4 border border-border", children: FEATURES.map((feature) => {
      const Icon = feature.icon;
      return /* @__PURE__ */ jsxs(
        "div",
        {
          className: "group flex flex-col gap-5 bg-card p-6 transition-colors hover:bg-accent",
          children: [
            /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center border border-primary/30 bg-primary/10", children: /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5 text-primary", strokeWidth: 1.5 }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 flex-1", children: [
              /* @__PURE__ */ jsx("h3", { className: "font-bold uppercase tracking-wide text-foreground text-sm", children: feature.title }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground leading-relaxed", children: feature.description })
            ] }),
            /* @__PURE__ */ jsxs(
              Link,
              {
                to: feature.href,
                className: "inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primary transition-colors hover:text-primary/80",
                children: [
                  feature.cta,
                  /* @__PURE__ */ jsx(ArrowRight, { className: "h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" })
                ]
              }
            )
          ]
        },
        feature.title
      );
    }) })
  ] });
}
function CtaBanner() {
  return /* @__PURE__ */ jsxs("section", { className: "relative overflow-hidden border-t border-border bg-card", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-x-0 top-0 h-[2px] bg-primary" }),
    /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-4 py-20 sm:px-6 text-center", children: [
      /* @__PURE__ */ jsx("p", { className: "label-military text-primary mb-3", children: "Ready to deploy?" }),
      /* @__PURE__ */ jsx("h2", { className: "text-3xl font-black uppercase tracking-tight text-foreground sm:text-4xl", children: "Lock in. Gear up. Play." }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 text-muted-foreground max-w-sm mx-auto", children: "Create a free account and start connecting with Cebu's airsoft community." }),
      /* @__PURE__ */ jsxs("div", { className: "mt-8 flex flex-wrap justify-center gap-3", children: [
        /* @__PURE__ */ jsxs(
          Link,
          {
            to: "/register",
            className: "inline-flex items-center gap-2 rounded bg-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/85 glow-red",
            children: [
              "Create an account",
              /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/feed",
            className: "inline-flex items-center gap-2 rounded border border-border px-5 py-2.5 text-xs font-semibold uppercase tracking-widest transition-colors hover:bg-accent hover:border-primary/50",
            children: "Browse as guest"
          }
        )
      ] })
    ] })
  ] });
}
function HomePage() {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
    /* @__PURE__ */ jsx(Hero, {}),
    /* @__PURE__ */ jsx(StatsBar, {}),
    /* @__PURE__ */ jsx(FeaturesGrid, {}),
    /* @__PURE__ */ jsx(CtaBanner, {})
  ] });
}
export {
  HomePage as component
};
