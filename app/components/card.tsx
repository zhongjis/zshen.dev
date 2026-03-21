"use client";
import {
  motion,
  useReducedMotion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "motion/react";

import type { MouseEvent, PropsWithChildren, FC } from "react";

export const Card: FC<PropsWithChildren> = ({ children }) => {
  const prefersReducedMotion = useReducedMotion();
  const mouseX = useSpring(0, { stiffness: 500, damping: 100 });
  const mouseY = useSpring(0, { stiffness: 500, damping: 100 });
  const glowOpacity = useMotionValue(0);

  function onMouseMove({ currentTarget, clientX, clientY }: MouseEvent<HTMLDivElement>) {
    if (prefersReducedMotion) {
      return;
    }

    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
    glowOpacity.set(1);
  }

  function onMouseLeave() {
    glowOpacity.set(0);
  }

  const maskImage = useMotionTemplate`radial-gradient(240px at ${mouseX}px ${mouseY}px, white, transparent)`;
  const style = { maskImage, WebkitMaskImage: maskImage };

  return (
    <div
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="group relative overflow-hidden rounded-3xl border border-[#2a3349] bg-[#0f1422]/80 transition-all duration-500 [transition-timing-function:var(--ease-out-quint)] hover:-translate-y-1 hover:border-[#c59756]/55 hover:bg-[#141b2d]/90 motion-reduce:hover:translate-y-0"
    >
      <div className="pointer-events-none">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-white/[0.03] via-transparent to-transparent" />
        <motion.div
          className="absolute inset-0 z-10 bg-gradient-to-br from-[#dfb479]/45 via-[#8f6e3d]/10 to-transparent transition duration-700"
          style={{ ...style, opacity: prefersReducedMotion ? 0 : glowOpacity }}
        />
      </div>

      {children}
    </div>
  );
};
