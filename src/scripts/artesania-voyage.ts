import gsap from 'gsap';

const SECTION_ID = 'artesania-voyage';
const HASH = '#artesania';
/** Reverse progress at which the chrome (header/footer) starts fading back in. */
const CHROME_REVEAL_PROGRESS = 0.6;

export function initArtesaniaVoyage(): () => void {
	const section = document.getElementById(SECTION_ID);
	const returnButton = document.getElementById('artesania-return');
	if (!section || !returnButton) return () => {};

	const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const root = document.documentElement;

	const stage = document.getElementById('vitrine-canvas');
	const scrollRegion = section.querySelector<HTMLElement>('.artesania-scroll');
	const backdrop = section.querySelector<HTMLElement>('.artesania-backdrop');
	const chrome = [
		document.querySelector<HTMLElement>('header.theatrical-target'),
		document.getElementById('footer-accordion'),
	].filter((el): el is HTMLElement => el !== null);
	const items = gsap.utils.toArray<HTMLElement>(section.querySelectorAll('.artesania-item'));

	const timeline = gsap.timeline({
		paused: true,
		defaults: { ease: 'power3.inOut' },
		onUpdate: () => {
			if (!isOpen && !chromeRevealed && timeline.progress() <= CHROME_REVEAL_PROGRESS) {
				revealChrome();
			}
		},
		onReverseComplete: () => {
			document.body.style.overflow = '';
			if (!chromeRevealed) revealChrome();
			if (stage) gsap.set(stage, { clearProps: 'all' });
			focusCompass();
		},
	});

	if (stage) {
		timeline.to(stage, { yPercent: -120, scale: 0.9, autoAlpha: 0, filter: 'blur(14px)', duration: 1.15 }, 0);
	}
	timeline
		.to(backdrop, { autoAlpha: 1, duration: 0.9, ease: 'power2.out' }, 0)
		.to(section, { autoAlpha: 1, yPercent: 0, filter: 'blur(0px)', duration: 1, ease: 'power3.out' }, 0.22)
		.to(items, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out', stagger: 0.07 }, 0.5);

	if (reducedMotion) timeline.timeScale(60);

	gsap.set(section, { autoAlpha: 0, yPercent: 10, filter: 'blur(12px)' });
	gsap.set(items, { autoAlpha: 0, y: 26 });
	if (backdrop) gsap.set(backdrop, { autoAlpha: 0 });

	let isOpen = false;
	let closing = false;
	let savedState: unknown;
	let stateNeutralized = false;
	let chromeTimer: number | null = null;
	let chromeRevealed = false;

	const clearChromeTimer = (): void => {
		if (chromeTimer !== null) {
			window.clearTimeout(chromeTimer);
			chromeTimer = null;
		}
	};

	const lockChrome = (): void => {
		clearChromeTimer();
		chrome.forEach((el) => {
			el.removeAttribute('hidden');
			el.setAttribute('inert', '');
		});
		chromeTimer = window.setTimeout(
			() => {
				chromeTimer = null;
				chrome.forEach((el) => el.setAttribute('hidden', ''));
			},
			reducedMotion ? 0 : 600
		);
	};

	const revealChrome = (): void => {
		chromeRevealed = true;
		clearChromeTimer();
		chrome.forEach((el) => el.removeAttribute('hidden'));
		if (chrome[0]) void chrome[0].offsetHeight;
		delete root.dataset.compassView;
		chrome.forEach((el) => el.removeAttribute('inert'));
	};

	const cleanHref = () => `${location.pathname}${location.search}`;

	const neutralizeCurrentEntry = (): void => {
		if (stateNeutralized) return;
		savedState = history.state;
		stateNeutralized = true;
		history.replaceState(null, '', cleanHref());
	};

	const restoreCurrentEntry = (): void => {
		if (!stateNeutralized) return;
		stateNeutralized = false;
		history.replaceState(savedState ?? null, '', cleanHref());
		savedState = undefined;
	};

	const focusCompass = (): void => {
		document.querySelector<HTMLElement>('[data-cardinal="S"]')?.focus({ preventScroll: true });
	};

	const applyOpen = (): void => {
		if (isOpen) return;
		isOpen = true;
		closing = false;
		chromeRevealed = false;
		root.dataset.compassView = 'artesania';
		document.body.style.overflow = 'hidden';
		section.removeAttribute('inert');
		section.setAttribute('aria-hidden', 'false');
		stage?.setAttribute('inert', '');
		if (scrollRegion) scrollRegion.scrollTop = 0;
		lockChrome();
		timeline.restart();
		window.requestAnimationFrame(() => returnButton.focus({ preventScroll: true }));
	};

	const applyClose = (): void => {
		if (!isOpen) return;
		isOpen = false;
		closing = false;
		chromeRevealed = false;
		section.setAttribute('inert', '');
		section.setAttribute('aria-hidden', 'true');
		stage?.removeAttribute('inert');
		timeline.reverse();
	};

	const enter = (): void => {
		if (isOpen) return;
		neutralizeCurrentEntry();
		history.pushState(null, '', `${cleanHref()}${HASH}`);
		applyOpen();
	};

	const exit = (): void => {
		if (!isOpen || closing) return;
		closing = true;
		history.back();
	};

	const onPopState = (): void => {
		const wantsArtesania = location.hash === HASH;
		if (wantsArtesania && !isOpen) {
			applyOpen();
		} else if (!wantsArtesania && isOpen) {
			applyClose();
			restoreCurrentEntry();
		}
	};

	const onKeyDown = (event: KeyboardEvent): void => {
		if (event.key === 'Escape' && isOpen) {
			event.preventDefault();
			exit();
		}
	};

	const onArtesaniaEvent = (event: Event): void => {
		const detail = (event as CustomEvent<{ open: boolean }>).detail;
		if (detail?.open) enter();
		else exit();
	};

	returnButton.addEventListener('click', exit);
	window.addEventListener('popstate', onPopState);
	window.addEventListener('keydown', onKeyDown);
	window.addEventListener('compass:artesania', onArtesaniaEvent);

	return () => {
		isOpen = false;
		timeline.kill();
		if (stateNeutralized) restoreCurrentEntry();
		document.body.style.overflow = '';
		revealChrome();
		section.setAttribute('inert', '');
		section.setAttribute('aria-hidden', 'true');
		stage?.removeAttribute('inert');

		returnButton.removeEventListener('click', exit);
		window.removeEventListener('popstate', onPopState);
		window.removeEventListener('keydown', onKeyDown);
		window.removeEventListener('compass:artesania', onArtesaniaEvent);

		if (stage) gsap.set(stage, { clearProps: 'all' });
		gsap.set(items, { clearProps: 'all' });
		gsap.set(section, { autoAlpha: 0, yPercent: 10, filter: 'blur(12px)' });
	};
}
