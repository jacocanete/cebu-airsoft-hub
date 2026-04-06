import { useEffect } from "react";
import { motion, useAnimation, useMotionValue } from "motion/react";

type OnHover = "speedUp" | "slowDown" | "pause" | "goBonkers";

interface CircularTextProps {
  text: string;
  spinDuration?: number;
  onHover?: OnHover;
  className?: string;
  fontSize?: number;
  radius?: number;
}

function getRotationTransition(duration: number, from: number, loop = true) {
  return {
    from,
    to: from + 360,
    ease: "linear" as const,
    duration,
    type: "tween" as const,
    repeat: loop ? Infinity : 0,
  };
}

function getTransition(duration: number, from: number) {
  return {
    rotate: getRotationTransition(duration, from),
    scale: {
      type: "spring" as const,
      damping: 20,
      stiffness: 300,
    },
  };
}

export function CircularText({
  text,
  spinDuration = 20,
  onHover = "speedUp",
  className = "",
  fontSize = 13,
  radius = 190,
}: CircularTextProps) {
  const letters = Array.from(text);
  const controls = useAnimation();
  const rotation = useMotionValue(0);

  useEffect(() => {
    const start = rotation.get();
    controls.start({
      rotate: start + 360,
      scale: 1,
      transition: getTransition(spinDuration, start),
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
          rotate: { type: "spring" as const, damping: 20, stiffness: 300 },
          scale: { type: "spring" as const, damping: 20, stiffness: 300 },
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
      transition: transitionConfig,
    });
  };

  const handleHoverEnd = () => {
    const start = rotation.get();
    controls.start({
      rotate: start + 360,
      scale: 1,
      transition: getTransition(spinDuration, start),
    });
  };

  const size = radius * 2;

  return (
    <motion.div
      className={`relative cursor-pointer select-none ${className}`}
      style={{
        width: size,
        height: size,
        rotate: rotation,
      }}
      initial={{ rotate: 0 }}
      animate={controls}
      onMouseEnter={handleHoverStart}
      onMouseLeave={handleHoverEnd}
    >
      {letters.map((letter, i) => {
        const angleDeg = (360 / letters.length) * i - 90; // start from top
        const angleRad = (angleDeg * Math.PI) / 180;
        const x = radius + radius * Math.cos(angleRad) - fontSize / 2;
        const y = radius + radius * Math.sin(angleRad) - fontSize / 2;

        return (
          <span
            key={`${i}-${letter}`}
            style={{
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
              textAlign: "center",
            }}
          >
            {letter}
          </span>
        );
      })}
    </motion.div>
  );
}
