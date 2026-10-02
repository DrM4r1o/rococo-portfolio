import { navigate } from 'astro:transitions/client';

type Cardinal = 'N' | 'E' | 'S' | 'O';

const ZONE_IDS: Record<Cardinal, string> = {
	N: 'ambient-zone-n',
	E: 'ambient-zone-e',
	S: 'ambient-zone-s',
	O: 'ambient-zone-o',
};

export function initCompassController(): () => void {
	const nodes = document.querySelectorAll<HTMLElement>('[data-cardinal]');
	const stage = document.getElementById('vitrine-canvas');
	const perspectiveToggle = document.getElementById('perspective-toggle');
	const perspIcon = document.getElementById('persp-icon');
	const perspText = document.getElementById('persp-text');

	const zones = new Map<Cardinal, HTMLElement>();
	(Object.keys(ZONE_IDS) as Cardinal[]).forEach((key) => {
		const el = document.getElementById(ZONE_IDS[key]);
		if (el) zones.set(key, el);
	});

	const is3D = () => document.documentElement.dataset.compassMode === '3d';
	let perspectiveMode: '3d' | 'cenital' = '3d';
	let currentFallbackRotation = 0;
	let isHoveringCardinal = false;
	const cleanups: Array<() => void> = [];

	function pointFallbackNeedle(deg: number): void {
		const needle = document.getElementById('rococo-needle');
		if (!needle) return;
		let mod = currentFallbackRotation % 360;
		if (mod < 0) mod += 360;
		let diff = deg - mod;
		if (diff > 180) diff -= 360;
		if (diff < -180) diff += 360;
		currentFallbackRotation += diff;
		needle.style.transform = `rotate(${currentFallbackRotation}deg)`;
	}

	function pointNeedle(deg: number): void {
		window.dispatchEvent(new CustomEvent('compass:point', { detail: { deg } }));
		if (!is3D()) pointFallbackNeedle(deg);
	}

	function activateZone(cardinal: Cardinal): void {
		document.body.classList.add('is-focused');
		zones.forEach((el, key) => el.classList.toggle('is-active', key === cardinal));
		window.dispatchEvent(new CustomEvent('compass:focus', { detail: { cardinal } }));
	}

	function deactivateZones(): void {
		document.body.classList.remove('is-focused');
		zones.forEach((el) => el.classList.remove('is-active'));
		window.dispatchEvent(new CustomEvent('compass:focus', { detail: { cardinal: null } }));
	}

	nodes.forEach((node) => {
		const cardinal = node.dataset.cardinal as Cardinal;
		const degrees = Number.parseInt(node.dataset.degrees ?? '0', 10);

		node.addEventListener('mouseenter', () => {
			isHoveringCardinal = true;
			pointNeedle(degrees);
			activateZone(cardinal);
		});

		node.addEventListener('mouseleave', () => {
			isHoveringCardinal = false;
			deactivateZones();
		});

		node.addEventListener('focus', () => {
			isHoveringCardinal = true;
			pointNeedle(degrees);
			activateZone(cardinal);
		});

		node.addEventListener('blur', () => {
			isHoveringCardinal = false;
			deactivateZones();
		});

		node.addEventListener('click', (event) => {
			event.stopPropagation();
			isHoveringCardinal = true;
			pointNeedle(degrees);

			if (node.dataset.action === 'origins') {
				deactivateZones();
				window.dispatchEvent(new CustomEvent('compass:origins', { detail: { open: true } }));
				return;
			}

			if (node.dataset.action === 'artesania') {
				deactivateZones();
				window.dispatchEvent(new CustomEvent('compass:artesania', { detail: { open: true } }));
				return;
			}

			activateZone(cardinal);
			const href = node.dataset.href;
			if (href) void navigate(href);
		});
	});

	if (stage) {
		const onStageMove = (event: MouseEvent) => {
			const rig =
				document.getElementById('compass-canvas') ??
				document.getElementById('perspective-rig') ??
				stage;
			const rect = rig.getBoundingClientRect();
			const centerX = rect.left + rect.width / 2;
			const centerY = rect.top + rect.height / 2;

			if (isHoveringCardinal) return;

			const rad = Math.atan2(event.clientY - centerY, event.clientX - centerX);
			let deg = (rad * 180) / Math.PI + 90;
			if (deg < 0) deg += 360;
			pointNeedle(deg);
		};
		stage.addEventListener('mousemove', onStageMove);
		cleanups.push(() => stage.removeEventListener('mousemove', onStageMove));
	}

	const onWindowClick = (event: MouseEvent) => {
		const target = event.target as HTMLElement;
		if (!target.closest('[data-cardinal]')) {
			isHoveringCardinal = false;
			deactivateZones();
		}
	};
	window.addEventListener('click', onWindowClick);
	cleanups.push(() => window.removeEventListener('click', onWindowClick));

	const onPerspectiveToggle = () => {
		perspectiveMode = perspectiveMode === '3d' ? 'cenital' : '3d';
		window.dispatchEvent(new CustomEvent('compass:perspective', { detail: { mode: perspectiveMode } }));

		if (perspectiveMode === 'cenital') {
			if (perspText) perspText.textContent = 'Cenital';
			if (perspIcon) perspIcon.textContent = 'filter_center_focus';
		} else {
			if (perspText) perspText.textContent = '15°';
			if (perspIcon) perspIcon.textContent = 'view_in_ar';
		}

		const fallbackBody = document.getElementById('compass-body');
		if (fallbackBody && !is3D()) {
			fallbackBody.style.transform =
				perspectiveMode === '3d' ? 'rotateX(15deg) rotateY(-4deg)' : 'rotateX(0deg) rotateY(0deg)';
		}
	};
	perspectiveToggle?.addEventListener('click', onPerspectiveToggle);
	cleanups.push(() => perspectiveToggle?.removeEventListener('click', onPerspectiveToggle));

	return () => {
		deactivateZones();
		cleanups.forEach((fn) => fn());
		cleanups.length = 0;
	};
}
