// Adapted from Nate Wiley's public CodePen “Particle Orb CSS”.
// Source: https://codepen.io/natewiley/pen/GgONKy
import type { CSSProperties } from "react";

const PARTICLE_COUNT = 300;

type ParticleVars = CSSProperties & {
	"--delay": string;
	"--hue": string;
	"--lightness": string;
	"--neg-z": string;
	"--y": string;
	"--z": string;
};

function seededAngle(index: number, salt: number) {
	const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
	return Math.floor((value - Math.floor(value)) * 360);
}

function particleStyle(index: number): ParticleVars {
	const z = seededAngle(index, 1);

	return {
		"--delay": `${index * 0.01 - 5.2}s`,
		"--hue": `${124 + (42 / PARTICLE_COUNT) * index}`,
		"--lightness": `${54 + (index % 5) * 5}%`,
		"--neg-z": `${-z}deg`,
		"--y": `${seededAngle(index, 2)}deg`,
		"--z": `${z}deg`,
	};
}

export default function ParticleOrbCSS() {
	return (
		<div className="particle-orb" aria-hidden="true">
			{Array.from({ length: PARTICLE_COUNT }, (_, index) => (
				<span
					className="particle-orb-dot"
					key={index}
					style={particleStyle(index + 1)}
				/>
			))}
		</div>
	);
}
