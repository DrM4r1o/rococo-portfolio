import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import gsap from 'gsap';

import {
	guillocheSVG,
	roseSVG,
	needleNorthSVG,
	needleSouthSVG,
	NEEDLE_PIVOT,
} from '../components/Compass/dial-svg';

type Cardinal = 'N' | 'E' | 'S' | 'O';
type PerspectiveMode = 'cenital' | '3d';

const CARDINAL_LEAN: Record<Cardinal, [number, number]> = {
	N: [0, -1],
	E: [1, 0],
	S: [0, 1],
	O: [-1, 0],
};

interface Pose {
	px: number;
	py: number;
	pz: number;
	tx: number;
	ty: number;
	tz: number;
	ux: number;
	uy: number;
	uz: number;
}

const POSE_3D: Pose = { px: 0, py: 9.6, pz: 3.2, tx: 0, ty: 0, tz: 0, ux: 0, uy: 1, uz: 0 };
const POSE_CENITAL: Pose = { px: 0, py: 11.4, pz: 0.02, tx: 0, ty: 0, tz: 0, ux: 0, uy: 0, uz: -1 };

/** The needle SVG spans ~364 units in a 100x400 viewBox; map it onto ~4.1 scene units. */
const NEEDLE_SCALE = 4.1 / 364;
/** Extrusion depth expressed in SVG units so the scaled relief stays ~0.09 units thick. */
const NEEDLE_DEPTH = 0.09 / NEEDLE_SCALE;

function svgToImage(svg: string): Promise<HTMLImageElement> {
	const blob = new Blob([svg], { type: 'image/svg+xml' });
	const url = URL.createObjectURL(blob);
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => {
			URL.revokeObjectURL(url);
			resolve(img);
		};
		img.onerror = () => {
			URL.revokeObjectURL(url);
			reject(new Error('SVG image failed to load'));
		};
		img.src = url;
	});
}

/** Paints a Gjellebæk-inspired marble field (grey-green flame over cream). */
function paintMarbleField(ctx: CanvasRenderingContext2D, size: number, seed = 20260928): void {
	const base = ctx.createLinearGradient(0, 0, size, size);
	base.addColorStop(0, '#faf4e8');
	base.addColorStop(0.5, '#efe3cf');
	base.addColorStop(1, '#ddcdb6');
	ctx.fillStyle = base;
	ctx.fillRect(0, 0, size, size);

	let state = seed;
	const rand = () => {
		state = (state * 1664525 + 1013904223) % 4294967296;
		return state / 4294967296;
	};

	// Cool grey-green clouding — Gjellebæk marble reads as grey with green flame.
	for (let i = 0; i < 7; i++) {
		const px = rand() * size;
		const py = rand() * size;
		const r = size * (0.18 + rand() * 0.3);
		const patch = ctx.createRadialGradient(px, py, 0, px, py, r);
		patch.addColorStop(0, `rgba(150, 164, 154, ${0.05 + rand() * 0.08})`);
		patch.addColorStop(1, 'rgba(150, 164, 154, 0)');
		ctx.fillStyle = patch;
		ctx.fillRect(0, 0, size, size);
	}

	ctx.lineCap = 'round';

	// Broad green-grey flame veins.
	for (let i = 0; i < 20; i++) {
		const x0 = rand() * size;
		const y0 = rand() * size;
		ctx.beginPath();
		ctx.moveTo(x0, y0);
		ctx.bezierCurveTo(
			x0 + (rand() - 0.5) * 260,
			y0 + (rand() - 0.5) * 260,
			x0 + (rand() - 0.5) * 360,
			y0 + (rand() - 0.5) * 360,
			x0 + (rand() - 0.5) * 420,
			y0 + (rand() - 0.5) * 420
		);
		ctx.strokeStyle = `rgba(112, 130, 120, ${0.08 + rand() * 0.12})`;
		ctx.lineWidth = 0.8 + rand() * 1.8;
		ctx.stroke();
	}

	// Fine warm secondary veins that branch across the stone.
	for (let i = 0; i < 34; i++) {
		const x0 = rand() * size;
		const y0 = rand() * size;
		ctx.beginPath();
		ctx.moveTo(x0, y0);
		ctx.bezierCurveTo(
			x0 + (rand() - 0.5) * 180,
			y0 + (rand() - 0.5) * 180,
			x0 + (rand() - 0.5) * 240,
			y0 + (rand() - 0.5) * 240,
			x0 + (rand() - 0.5) * 300,
			y0 + (rand() - 0.5) * 300
		);
		ctx.strokeStyle = `rgba(150, 128, 96, ${0.03 + rand() * 0.07})`;
		ctx.lineWidth = 0.4 + rand() * 0.9;
		ctx.stroke();
	}

	const sheen = ctx.createRadialGradient(size * 0.35, size * 0.3, 20, size * 0.5, size * 0.5, size * 0.7);
	sheen.addColorStop(0, 'rgba(255,255,255,0.35)');
	sheen.addColorStop(1, 'rgba(255,255,255,0)');
	ctx.fillStyle = sheen;
	ctx.fillRect(0, 0, size, size);
}

function makeMarbleTexture(): THREE.CanvasTexture {
	const size = 512;
	const canvas = document.createElement('canvas');
	canvas.width = canvas.height = size;
	const ctx = canvas.getContext('2d')!;
	paintMarbleField(ctx, size);

	const texture = new THREE.CanvasTexture(canvas);
	texture.colorSpace = THREE.SRGBColorSpace;
	texture.anisotropy = 4;
	return texture;
}

/**
 * Square instrument floor: Gjellebæk marble with a classical inlaid border and
 * corner rosettes, echoing the Marble Church's pavement.
 */
function makeFloorTexture(maxAnisotropy: number): THREE.CanvasTexture {
	const size = 1024;
	const canvas = document.createElement('canvas');
	canvas.width = canvas.height = size;
	const ctx = canvas.getContext('2d')!;
	ctx.imageSmoothingQuality = 'high';

	paintMarbleField(ctx, size, 77123);

	const c = size / 2;
	const gold = 'rgba(197, 168, 105, 0.9)';
	const goldSoft = 'rgba(197, 168, 105, 0.5)';
	const dark = 'rgba(74, 58, 30, 0.55)';
	// World half-size of the plate (must match the mesh extent).
	const worldHalf = 2.45;
	const toPx = (world: number) => (world / worldHalf) * (size / 2);

	// Inlaid border band hugging the square perimeter.
	ctx.lineJoin = 'round';
	ctx.strokeStyle = gold;
	ctx.lineWidth = Math.max(3, size * 0.006);
	const borderOuter = toPx(2.42);
	ctx.strokeRect(c - borderOuter, c - borderOuter, borderOuter * 2, borderOuter * 2);
	ctx.strokeStyle = goldSoft;
	ctx.lineWidth = Math.max(2, size * 0.003);
	const borderInner = toPx(2.34);
	ctx.strokeRect(c - borderInner, c - borderInner, borderInner * 2, borderInner * 2);

	// Subtle ring framing the dial well.
	const wellPx = toPx(2.32);
	ctx.strokeStyle = goldSoft;
	ctx.lineWidth = Math.max(2, size * 0.0035);
	ctx.beginPath();
	ctx.arc(c, c, wellPx + size * 0.011, 0, Math.PI * 2);
	ctx.stroke();

	// Corner rosettes with diamond inlays.
	const corner = toPx(1.98);
	for (const [sx, sy] of [
		[-1, -1],
		[1, -1],
		[-1, 1],
		[1, 1],
	] as const) {
		const px = c + sx * corner;
		const py = c + sy * corner;
		const r = size * 0.045;

		ctx.beginPath();
		ctx.moveTo(px, py - r);
		ctx.lineTo(px + r, py);
		ctx.lineTo(px, py + r);
		ctx.lineTo(px - r, py);
		ctx.closePath();
		ctx.fillStyle = 'rgba(255, 252, 245, 0.55)';
		ctx.fill();
		ctx.strokeStyle = gold;
		ctx.lineWidth = Math.max(2, size * 0.004);
		ctx.stroke();

		ctx.beginPath();
		ctx.arc(px, py, r * 0.34, 0, Math.PI * 2);
		ctx.fillStyle = dark;
		ctx.fill();
		ctx.strokeStyle = gold;
		ctx.lineWidth = Math.max(1.5, size * 0.003);
		ctx.stroke();
	}

	const texture = new THREE.CanvasTexture(canvas);
	texture.colorSpace = THREE.SRGBColorSpace;
	texture.anisotropy = maxAnisotropy;
	return texture;
}

/**
 * Soft, panel-free environment. RoomEnvironment-style sources contain bright
 * rectangular softboxes that show up as hard white squares on polished metal;
 * this warm vertical gradient keeps a gentle sheen without any sharp edges.
 */
function makeSoftEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
	const size = 256;
	const canvas = document.createElement('canvas');
	canvas.width = canvas.height = size;
	const ctx = canvas.getContext('2d')!;

	const gradient = ctx.createLinearGradient(0, 0, 0, size);
	gradient.addColorStop(0, '#fbf3e2');
	gradient.addColorStop(0.45, '#8fa79b');
	gradient.addColorStop(1, '#1b2b24');
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, size, size);

	const sheen = ctx.createRadialGradient(size * 0.5, size * 0.18, size * 0.02, size * 0.5, size * 0.3, size * 0.65);
	sheen.addColorStop(0, 'rgba(255, 246, 226, 0.35)');
	sheen.addColorStop(1, 'rgba(255, 246, 226, 0)');
	ctx.fillStyle = sheen;
	ctx.fillRect(0, 0, size, size);

	const texture = new THREE.CanvasTexture(canvas);
	texture.mapping = THREE.EquirectangularReflectionMapping;
	texture.colorSpace = THREE.SRGBColorSpace;

	const pmrem = new THREE.PMREMGenerator(renderer);
	const env = pmrem.fromEquirectangular(texture).texture;
	pmrem.dispose();
	texture.dispose();
	return env;
}

async function makeDialTexture(maxAnisotropy: number): Promise<THREE.CanvasTexture> {
	const dpr = Math.min(Math.max(window.devicePixelRatio || 1, 1), 2);
	const size = Math.round(1024 * dpr);
	const canvas = document.createElement('canvas');
	canvas.width = canvas.height = size;
	const ctx = canvas.getContext('2d')!;
	ctx.imageSmoothingQuality = 'high';
	const cx = size / 2;
	const cy = size / 2;
	const R = size / 2;
	const RES = size / 1024;

	const [guilloche, rose] = await Promise.all([svgToImage(guillocheSVG()), svgToImage(roseSVG())]);

	ctx.save();
	ctx.beginPath();
	ctx.arc(cx, cy, R, 0, Math.PI * 2);
	ctx.clip();

	const patina = ctx.createRadialGradient(cx, size * 0.42, 60, cx, cy, R);
	patina.addColorStop(0, '#2f5548');
	patina.addColorStop(0.5, '#1d382f');
	patina.addColorStop(1, '#0e1e18');
	ctx.fillStyle = patina;
	ctx.fillRect(0, 0, size, size);

	ctx.globalAlpha = 0.85;
	ctx.drawImage(guilloche, 0, 0, size, size);
	ctx.globalAlpha = 1;

	const roseSize = size * 0.58;
	ctx.drawImage(rose, cx - roseSize / 2, cy - roseSize / 2, roseSize, roseSize);

	const textAt = (
		angleDeg: number,
		radiusFrac: number,
		text: string,
		fontPx: number,
		weight = 700,
		outline = false
	) => {
		const a = (angleDeg * Math.PI) / 180;
		const x = cx + Math.sin(a) * R * radiusFrac;
		const y = cy - Math.cos(a) * R * radiusFrac;
		ctx.font = `${weight} ${fontPx * RES}px Cinzel, serif`;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		if (outline) {
			ctx.lineWidth = Math.max(2, fontPx * 0.1) * RES;
			ctx.strokeStyle = 'rgba(6, 16, 12, 0.85)';
			ctx.strokeText(text, x, y);
		}
		ctx.fillStyle = '#e6c987';
		ctx.fillText(text, x, y);
	};

	['N', 'E', 'S', 'O'].forEach((label, i) => textAt(i * 90, 0.74, label, 66, 700, true));
	textAt(0, 0.9, '360° · 0°', 30, 600);
	textAt(90, 0.9, '090°', 30, 600);
	textAt(180, 0.9, '180°', 30, 600);
	textAt(270, 0.9, '270°', 30, 600);
	textAt(45, 0.9, '045°', 20, 500);
	textAt(135, 0.9, '135°', 20, 500);
	textAt(225, 0.9, '225°', 20, 500);
	textAt(315, 0.9, '315°', 20, 500);

	ctx.restore();

	const texture = new THREE.CanvasTexture(canvas);
	texture.colorSpace = THREE.SRGBColorSpace;
	texture.anisotropy = maxAnisotropy;
	return texture;
}

function extrudeSVG(svg: string, depth: number, material: THREE.Material): THREE.Mesh | null {
	const loader = new SVGLoader();
	const data = loader.parse(svg);
	const geometries: THREE.BufferGeometry[] = [];

	for (const path of data.paths) {
		for (const shape of path.toShapes()) {
			geometries.push(
				new THREE.ExtrudeGeometry(shape, {
					depth,
					bevelEnabled: true,
					bevelThickness: depth * 0.3,
					bevelSize: depth * 0.3,
					bevelSegments: 2,
					curveSegments: 16,
				})
			);
		}
	}

	if (geometries.length === 0) return null;
	const merged = mergeGeometries(geometries, false);
	if (!merged) return null;

	merged.translate(-NEEDLE_PIVOT.x, -NEEDLE_PIVOT.y, 0);
	merged.scale(NEEDLE_SCALE, -NEEDLE_SCALE, NEEDLE_SCALE);
	merged.computeBoundingBox();
	merged.computeVertexNormals();

	const mesh = new THREE.Mesh(merged, material);
	mesh.castShadow = true;
	return mesh;
}

/**
 * Classical square frame (architrave/cornice) with a moulded bevel, echoing the
 * marble entablature of the Marble Church. Extruded flat so it lies on XZ.
 */
function makeSquareFrame(
	outerHalf: number,
	innerHalf: number,
	depth: number,
	material: THREE.Material
): THREE.Mesh {
	const shape = new THREE.Shape();
	shape.moveTo(-outerHalf, -outerHalf);
	shape.lineTo(outerHalf, -outerHalf);
	shape.lineTo(outerHalf, outerHalf);
	shape.lineTo(-outerHalf, outerHalf);
	shape.closePath();

	const hole = new THREE.Path();
	hole.moveTo(-innerHalf, -innerHalf);
	hole.lineTo(-innerHalf, innerHalf);
	hole.lineTo(innerHalf, innerHalf);
	hole.lineTo(innerHalf, -innerHalf);
	hole.closePath();
	shape.holes.push(hole);

	const geometry = new THREE.ExtrudeGeometry(shape, {
		depth,
		bevelEnabled: true,
		bevelThickness: depth * 0.35,
		bevelSize: Math.min(0.045, Math.max(0.01, (outerHalf - innerHalf) * 0.3)),
		bevelSegments: 2,
		curveSegments: 4,
	});
	geometry.rotateX(-Math.PI / 2);
	geometry.computeVertexNormals();

	const mesh = new THREE.Mesh(geometry, material);
	mesh.castShadow = true;
	mesh.receiveShadow = true;
	return mesh;
}

export class CompassScene {
	private container: HTMLElement;
	private renderer: THREE.WebGLRenderer;
	private scene = new THREE.Scene();
	private camera: THREE.PerspectiveCamera;
	private startTime = performance.now();

	private needlePivot = new THREE.Group();
	private pose: Pose = { ...POSE_3D };
	private lean = new THREE.Vector2(0, 0);
	private smoothLean = new THREE.Vector2(0, 0);
	private reducedMotion = false;
	private ro?: ResizeObserver;
	private disposed = false;

	constructor(container: HTMLElement) {
		this.container = container;
		this.renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true,
			powerPreference: 'high-performance',
		});
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		this.renderer.setClearAlpha(0);
		this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
		this.renderer.toneMappingExposure = 0.98;
		this.renderer.outputColorSpace = THREE.SRGBColorSpace;
		this.renderer.shadowMap.enabled = true;

		this.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
		this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	}

	async init(): Promise<void> {
		const { renderer, scene, container } = this;
		container.appendChild(renderer.domElement);
		renderer.domElement.style.width = '100%';
		renderer.domElement.style.height = '100%';
		renderer.domElement.style.display = 'block';

		scene.environment = makeSoftEnvironment(renderer);
		scene.environmentIntensity = 0.55;

		const hemi = new THREE.HemisphereLight(0xfff4e0, 0x14261f, 0.5);
		scene.add(hemi);

		const key = new THREE.DirectionalLight(0xfff2d8, 1.7);
		key.position.set(-3.5, 11, -2);
		key.castShadow = true;
		key.shadow.mapSize.set(1024, 1024);
		key.shadow.camera.near = 1;
		key.shadow.camera.far = 30;
		key.shadow.camera.left = -6;
		key.shadow.camera.right = 6;
		key.shadow.camera.top = 6;
		key.shadow.camera.bottom = -6;
		key.shadow.bias = -0.0005;
		key.shadow.radius = 4;
		scene.add(key);

		const rim = new THREE.DirectionalLight(0xa3d0c2, 0.55);
		rim.position.set(5, 4, 6);
		scene.add(rim);

		const marbleTexture = makeMarbleTexture();
		marbleTexture.wrapS = THREE.RepeatWrapping;
		marbleTexture.wrapT = THREE.RepeatWrapping;
		marbleTexture.repeat.set(2, 2);
		const marbleMat = new THREE.MeshStandardMaterial({
			map: marbleTexture,
			roughness: 0.52,
			metalness: 0.02,
			envMapIntensity: 0.35,
		});
		const bronzeMat = new THREE.MeshStandardMaterial({
			color: 0xc5a869,
			metalness: 1,
			roughness: 0.58,
			envMapIntensity: 0.5,
		});
		const patinaMat = new THREE.MeshStandardMaterial({ color: 0x24473c, roughness: 0.55, metalness: 0.35 });
		const emeraldMat = new THREE.MeshStandardMaterial({ color: 0x3a6459, roughness: 0.35, metalness: 0.4 });

		const pedestal = new THREE.Mesh(new RoundedBoxGeometry(5, 0.8, 5, 4, 0.16), marbleMat);
		pedestal.position.y = -0.4;
		pedestal.receiveShadow = true;
		pedestal.castShadow = true;
		scene.add(pedestal);

		const plinthLower = new THREE.Mesh(new RoundedBoxGeometry(5.5, 0.18, 5.5, 4, 0.06), marbleMat);
		plinthLower.position.y = -0.9;
		plinthLower.receiveShadow = true;
		plinthLower.castShadow = true;
		scene.add(plinthLower);

		const plinthFillet = new THREE.Mesh(new RoundedBoxGeometry(5.28, 0.06, 5.28, 4, 0.03), bronzeMat);
		plinthFillet.position.y = -0.78;
		plinthFillet.receiveShadow = true;
		scene.add(plinthFillet);

		const shadowCatcher = new THREE.Mesh(
			new THREE.PlaneGeometry(20, 20),
			new THREE.ShadowMaterial({ opacity: 0.38 })
		);
		shadowCatcher.rotation.x = -Math.PI / 2;
		shadowCatcher.position.y = -0.805;
		shadowCatcher.receiveShadow = true;
		scene.add(shadowCatcher);

		const floorMat = new THREE.MeshStandardMaterial({
			map: makeFloorTexture(renderer.capabilities.getMaxAnisotropy()),
			roughness: 0.48,
			metalness: 0.12,
			envMapIntensity: 0.5,
		});
		const floor = new THREE.Mesh(new THREE.BoxGeometry(4.9, 0.06, 4.9), floorMat);
		floor.position.y = 0.0;
		floor.receiveShadow = true;
		scene.add(floor);

		const floorEdge = makeSquareFrame(2.49, 2.44, 0.05, bronzeMat);
		floorEdge.position.y = 0.03;
		scene.add(floorEdge);

		const well = new THREE.Mesh(new THREE.CylinderGeometry(2.32, 2.32, 0.34, 96), patinaMat);
		well.position.y = 0.14;
		well.receiveShadow = true;
		scene.add(well);

		const bezel = new THREE.Mesh(new THREE.TorusGeometry(2.3, 0.075, 24, 120), bronzeMat);
		bezel.rotation.x = Math.PI / 2;
		bezel.position.y = 0.34;
		scene.add(bezel);

		await document.fonts.ready;
		const dialTexture = await makeDialTexture(renderer.capabilities.getMaxAnisotropy());
		const dialMat = new THREE.MeshStandardMaterial({
			map: dialTexture,
			roughness: 0.5,
			metalness: 0.28,
			envMapIntensity: 0.7,
		});
		const dial = new THREE.Mesh(new THREE.CircleGeometry(2.22, 128), dialMat);
		dial.rotation.x = -Math.PI / 2;
		dial.position.y = 0.325;
		scene.add(dial);

		const needleMatNorth = new THREE.MeshStandardMaterial({
			color: 0xe2c282,
			metalness: 1,
			roughness: 0.38,
			envMapIntensity: 0.8,
			side: THREE.DoubleSide,
		});
		const needleMatSouth = new THREE.MeshStandardMaterial({
			color: 0x8a6a3c,
			metalness: 1,
			roughness: 0.55,
			envMapIntensity: 0.7,
			side: THREE.DoubleSide,
		});

		const assembly = new THREE.Group();
		assembly.rotation.x = -Math.PI / 2;
		const north = extrudeSVG(needleNorthSVG, NEEDLE_DEPTH, needleMatNorth);
		const south = extrudeSVG(needleSouthSVG, NEEDLE_DEPTH, needleMatSouth);
		if (north) assembly.add(north);
		if (south) assembly.add(south);

		const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.46, 0.22, 48), bronzeMat);
		hub.castShadow = true;
		const hubCore = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.26, 40), emeraldMat);
		hubCore.position.y = 0.06;
		const hubPearl = new THREE.Mesh(
			new THREE.SphereGeometry(0.06, 20, 20),
			new THREE.MeshStandardMaterial({ color: 0xfffcf7, emissive: 0xfff3d6, emissiveIntensity: 0.6 })
		);
		hubPearl.position.y = 0.2;

		this.needlePivot.position.y = 0.34;
		this.needlePivot.add(assembly);
		this.needlePivot.add(hub);
		this.needlePivot.add(hubCore);
		this.needlePivot.add(hubPearl);
		scene.add(this.needlePivot);

		this.applyPose(true);
		this.resize();

		this.ro = new ResizeObserver(() => this.resize());
		this.ro.observe(container);

		gsap.ticker.add(this.tick);
		document.documentElement.dataset.compassMode = '3d';
	}

	private tick = (): void => {
		if (this.disposed) return;
		const damp = this.reducedMotion ? 1 : 0.08;
		this.smoothLean.lerp(this.lean, damp);

		if (!this.reducedMotion) {
			this.camera.up.set(this.pose.ux, this.pose.uy, this.pose.uz);
			this.camera.position.set(
				this.pose.px + this.smoothLean.x * 0.6,
				this.pose.py,
				this.pose.pz + this.smoothLean.y * 0.6
			);
			this.camera.lookAt(
				this.pose.tx + this.smoothLean.x * 0.32,
				this.pose.ty,
				this.pose.tz + this.smoothLean.y * 0.32
			);
		}

		const t = (performance.now() - this.startTime) / 1000;
		if (!this.reducedMotion) {
			this.needlePivot.position.y = 0.34 + Math.sin(t * 0.8) * 0.004;
		}

		this.renderer.render(this.scene, this.camera);
	};

	pointNeedle(deg: number, animate = true): void {
		const target = -THREE.MathUtils.degToRad(deg);
		if (this.reducedMotion || !animate) {
			this.needlePivot.rotation.y = target;
			return;
		}
		const current = this.needlePivot.rotation.y;
		const delta = Math.atan2(Math.sin(target - current), Math.cos(target - current));
		gsap.to(this.needlePivot.rotation, {
			y: current + delta,
			duration: 1.1,
			ease: 'power3.out',
			overwrite: true,
		});
	}

	setFocus(cardinal: Cardinal | null): void {
		if (!cardinal || this.reducedMotion) {
			this.lean.set(0, 0);
			return;
		}
		const [x, z] = CARDINAL_LEAN[cardinal];
		this.lean.set(x, z);
	}

	setPerspective(mode: PerspectiveMode): void {
		const target = mode === 'cenital' ? POSE_CENITAL : POSE_3D;
		if (this.reducedMotion) {
			Object.assign(this.pose, target);
			this.applyPose(true);
			return;
		}
		gsap.to(this.pose, {
			...target,
			duration: 1.15,
			ease: 'power3.inOut',
			overwrite: true,
		});
	}

	private applyPose(immediate = false): void {
		if (immediate || this.reducedMotion) {
			this.camera.up.set(this.pose.ux, this.pose.uy, this.pose.uz);
			this.camera.position.set(this.pose.px, this.pose.py, this.pose.pz);
			this.camera.lookAt(this.pose.tx, this.pose.ty, this.pose.tz);
		}
	}

	private resize(): void {
		const { clientWidth: w, clientHeight: h } = this.container;
		if (w === 0 || h === 0) return;
		this.camera.aspect = w / h;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(w, h, false);
	}

	dispose(): void {
		this.disposed = true;
		gsap.ticker.remove(this.tick);
		this.ro?.disconnect();
		this.scene.traverse((obj) => {
			if (obj instanceof THREE.Mesh) {
				obj.geometry.dispose();
				const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
				mats.forEach((m) => m.dispose());
			}
		});
		this.scene.environment?.dispose();
		this.renderer.forceContextLoss();
		this.renderer.dispose();
		this.renderer.domElement.remove();
	}
}

let scene: CompassScene | null = null;
let generation = 0;

window.addEventListener('compass:point', ((e: CustomEvent<{ deg: number }>) => {
	scene?.pointNeedle(e.detail.deg);
}) as EventListener);
window.addEventListener('compass:focus', ((e: CustomEvent<{ cardinal: Cardinal | null }>) => {
	scene?.setFocus(e.detail.cardinal);
}) as EventListener);
window.addEventListener('compass:perspective', ((e: CustomEvent<{ mode: PerspectiveMode }>) => {
	scene?.setPerspective(e.detail.mode);
}) as EventListener);

export async function mountCompass3D(): Promise<void> {
	if (scene) {
		window.dispatchEvent(new CustomEvent('compass:ready'));
		return;
	}
	const container = document.getElementById('compass-canvas');
	if (!container) {
		window.dispatchEvent(new CustomEvent('compass:unavailable'));
		return;
	}

	const gen = ++generation;
	try {
		const instance = new CompassScene(container);
		await instance.init();
		if (gen !== generation) {
			instance.dispose();
			return;
		}
		scene = instance;
		document.documentElement.classList.remove('compass-fallback-active');
		window.dispatchEvent(new CustomEvent('compass:ready'));
	} catch (error) {
		console.warn('Compass WebGL unavailable, using 2D fallback.', error);
		document.documentElement.classList.add('compass-fallback-active');
		window.dispatchEvent(new CustomEvent('compass:unavailable'));
	}
}

export function unmountCompass3D(): void {
	generation++;
	if (!scene) return;
	scene.dispose();
	scene = null;
	delete document.documentElement.dataset.compassMode;
}
