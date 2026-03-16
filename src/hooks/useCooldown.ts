'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';

const COOLDOWN_MS = 6000; // 6 seconds to be safe (10 RPM budget)

export function useCooldown() {
	const { lastRequestTime, setLastRequestTime } = useStore();
	const [remainingTime, setRemainingTime] = useState(0);

	useEffect(() => {
		if (!lastRequestTime) {
			setRemainingTime(0);
			return;
		}

		const updateCooldown = () => {
			const now = Date.now();
			const elapsed = now - lastRequestTime;
			const remaining = Math.max(0, COOLDOWN_MS - elapsed);
			
			setRemainingTime(Math.ceil(remaining / 1000));
		};

		updateCooldown();
		const interval = setInterval(updateCooldown, 1000);

		return () => clearInterval(interval);
	}, [lastRequestTime]);

	const startCooldown = () => {
		setLastRequestTime(Date.now());
	};

	return {
		isCooldownActive: remainingTime > 0,
		remainingTime,
		startCooldown
	};
}
