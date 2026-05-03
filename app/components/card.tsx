"use client";
import {
	motion,
	useMotionTemplate,
	useMotionValue,
	useReducedMotion,
	useSpring,
} from "motion/react";

import type { FC, MouseEvent, PropsWithChildren } from "react";

export const Card: FC<PropsWithChildren> = ({ children }) => {
	const prefersReducedMotion = useReducedMotion();
	const mouseX = useSpring(0, { stiffness: 500, damping: 100 });
	const mouseY = useSpring(0, { stiffness: 500, damping: 100 });
	const glowOpacity = useMotionValue(0);

	function onMouseMove({
		currentTarget,
		clientX,
		clientY,
	}: MouseEvent<HTMLDivElement>) {
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

	function onFocusWithin() {
		if (prefersReducedMotion) {
			return;
		}

		glowOpacity.set(0.75);
	}

	function onBlurWithin() {
		glowOpacity.set(0);
	}

	const maskImage = useMotionTemplate`radial-gradient(260px at ${mouseX}px ${mouseY}px, white, transparent)`;
	const style = { maskImage, WebkitMaskImage: maskImage };

	return (
		<div
			onMouseMove={onMouseMove}
			onMouseLeave={onMouseLeave}
			onFocusCapture={onFocusWithin}
			onBlurCapture={onBlurWithin}
			className="editorial-card group transition-all duration-500 [transition-timing-function:var(--ease-out-quint)] hover:-translate-y-1 hover:border-accent motion-reduce:hover:translate-y-0"
		>
			<div className="pointer-events-none">
				<motion.div
					className="absolute inset-0 z-10 bg-[radial-gradient(circle,var(--accent-soft),transparent_62%)] transition duration-700"
					style={{ ...style, opacity: prefersReducedMotion ? 0 : glowOpacity }}
				/>
			</div>

			{children}
		</div>
	);
};
