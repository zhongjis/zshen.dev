"use client";

import { useEffect } from "react";

const hashRoutes = new Map([
	["#index", "/"],
	["#consulting", "/consulting"],
	["#sparks", "/thoughts"],
	["#misc", "/elsewhere"],
]);

export function HashRouteNormalizer() {
	useEffect(() => {
		const destination = hashRoutes.get(window.location.hash);

		if (destination) {
			window.location.replace(destination);
		}
	}, []);

	return null;
}
