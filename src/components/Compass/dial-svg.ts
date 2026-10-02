/**
 * SVG sources shared between the procedural Three.js dial texture and the
 * CSS/SVG fallback. Kept as plain strings so they can be rendered into a
 * canvas (texture) without depending on document fonts.
 */

const BRONZE = '#c5a869';

export const GUILLOCHE_VIEWBOX = 500;

/**
 * Astronomical guilloché: concentric rings, cardinal ticks, diagonal marks and
 * rococo volutes. Text/numeral engraving is intentionally omitted — it is
 * painted separately on the canvas so web fonts can be applied.
 */
export const guillocheSVG = (stroke = BRONZE): string => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${GUILLOCHE_VIEWBOX} ${GUILLOCHE_VIEWBOX}" fill="none">
  <circle cx="250" cy="250" opacity="0.4" r="242" stroke="${stroke}" stroke-width="0.7"></circle>
  <circle cx="250" cy="250" r="236" stroke="${stroke}" stroke-dasharray="2 4" stroke-width="1.2"></circle>
  <circle cx="250" cy="250" r="226" stroke="${stroke}" stroke-width="0.8"></circle>
  <circle cx="250" cy="250" r="212" stroke="${stroke}" stroke-dasharray="1 7" stroke-width="1.5"></circle>
  <circle cx="250" cy="250" r="198" stroke="${stroke}" stroke-width="0.8"></circle>
  <circle cx="250" cy="250" r="182" stroke="${stroke}" stroke-dasharray="4 6" stroke-width="1.2"></circle>
  <circle cx="250" cy="250" opacity="0.5" r="140" stroke="${stroke}" stroke-dasharray="2 3" stroke-width="0.6"></circle>
  <g opacity="0.85" stroke="${stroke}">
    <line stroke-width="2.5" x1="250" x2="250" y1="12" y2="42"></line>
    <line stroke-width="2.5" x1="250" x2="250" y1="458" y2="488"></line>
    <line stroke-width="2.5" x1="12" x2="42" y1="250" y2="250"></line>
    <line stroke-width="2.5" x1="458" x2="488" y1="250" y2="250"></line>
    <line stroke-width="1.8" x1="104" x2="124" y1="104" y2="124"></line>
    <line stroke-width="1.8" x1="396" x2="376" y1="104" y2="124"></line>
    <line stroke-width="1.8" x1="104" x2="124" y1="396" y2="376"></line>
    <line stroke-width="1.8" x1="396" x2="376" y1="396" y2="376"></line>
    <line stroke-width="1" x1="138" x2="150" y1="56" y2="78"></line>
    <line stroke-width="1" x1="362" x2="350" y1="56" y2="78"></line>
    <line stroke-width="1" x1="138" x2="150" y1="444" y2="422"></line>
    <line stroke-width="1" x1="362" x2="350" y1="444" y2="422"></line>
    <line stroke-width="1" x1="56" x2="78" y1="138" y2="150"></line>
    <line stroke-width="1" x1="444" x2="422" y1="138" y2="150"></line>
    <line stroke-width="1" x1="56" x2="78" y1="362" y2="350"></line>
    <line stroke-width="1" x1="444" x2="422" y1="362" y2="350"></line>
  </g>
  <path d="M 250,75 C 247,95 240,110 230,120 C 242,118 247,112 250,105 C 253,112 258,118 270,120 C 260,110 253,95 250,75 Z" fill="${stroke}" opacity="0.6"></path>
  <path d="M 250,425 C 247,405 240,390 230,380 C 242,382 247,388 250,395 C 253,388 258,382 270,380 C 260,390 253,405 250,425 Z" fill="${stroke}" opacity="0.6"></path>
  <path d="M 75,250 C 95,247 110,240 120,230 C 118,242 112,247 105,250 C 112,253 118,258 120,270 C 110,260 95,253 75,250 Z" fill="${stroke}" opacity="0.6"></path>
  <path d="M 425,250 C 405,247 390,240 380,230 C 382,242 388,247 395,250 C 388,253 382,258 380,270 C 390,260 405,253 425,250 Z" fill="${stroke}" opacity="0.6"></path>
</svg>`;

export const ROSE_VIEWBOX = 300;

/** Faceted rosa de los vientos, engraved in aged gold. */
export const roseSVG = (light = '#ffdca8'): string => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ROSE_VIEWBOX} ${ROSE_VIEWBOX}">
  <defs>
    <linearGradient id="rose-light" x1="0%" x2="100%" y1="0%" y2="100%">
      <stop offset="0%" stop-color="#fff0d0"></stop>
      <stop offset="100%" stop-color="${light}"></stop>
    </linearGradient>
    <linearGradient id="rose-dark" x1="0%" x2="100%" y1="0%" y2="100%">
      <stop offset="0%" stop-color="#9a7b4f"></stop>
      <stop offset="100%" stop-color="#553f1f"></stop>
    </linearGradient>
  </defs>
  <g opacity="0.55" fill="none" stroke="${light}">
    <circle cx="150" cy="150" r="130" stroke-dasharray="3 3" stroke-width="0.8"></circle>
    <circle cx="150" cy="150" r="95" stroke-width="0.6"></circle>
    <circle cx="150" cy="150" r="55" stroke-dasharray="2 4" stroke-width="1.2"></circle>
  </g>
  <polygon fill="url(#rose-light)" points="150,20 158,142 150,150 142,142"></polygon>
  <polygon fill="url(#rose-dark)" points="150,20 150,150 142,142"></polygon>
  <polygon fill="url(#rose-light)" points="150,280 158,158 150,150 142,158"></polygon>
  <polygon fill="url(#rose-dark)" points="150,280 150,150 158,158"></polygon>
  <polygon fill="url(#rose-light)" points="280,150 158,158 150,150 158,142"></polygon>
  <polygon fill="url(#rose-dark)" points="280,150 150,150 158,158"></polygon>
  <polygon fill="url(#rose-light)" points="20,150 142,158 150,150 142,142"></polygon>
  <polygon fill="url(#rose-dark)" points="20,150 150,150 142,142"></polygon>
  <polygon fill="#ffdca8" opacity="0.6" points="238,62 156,144 150,150 144,144"></polygon>
  <polygon fill="#ffdca8" opacity="0.6" points="62,238 156,156 150,150 144,156"></polygon>
  <polygon fill="#ffdca8" opacity="0.6" points="238,238 156,156 150,150 156,144"></polygon>
  <polygon fill="#ffdca8" opacity="0.6" points="62,62 144,144 150,150 144,156"></polygon>
</svg>`;

/**
 * Rococo needle. North (bronze gilt) and south (aged bronze counterweight) are
 * exported separately so each can receive its own metal material when
 * extruded. Viewbox is 100x400 with the pivot at (50, 200).
 */
export const NEEDLE_VIEWBOX = { w: 100, h: 400 };
export const NEEDLE_PIVOT = { x: 50, y: 200 };

export const needleNorthSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 400">
  <path d="M 50,16 L 59,105 C 65,115 72,130 65,145 C 59,158 53,165 50,185 L 50,16 Z" fill="#c5a869"></path>
  <path d="M 50,16 L 41,105 C 35,115 28,130 35,145 C 41,158 47,165 50,185 L 50,16 Z" fill="#9a7b4f"></path>
  <path d="M 44,85 C 44,70 56,70 56,85 C 56,92 50,100 50,100 C 50,100 44,92 44,85 Z" fill="#24473c"></path>
  <circle cx="50" cy="115" r="4.5" fill="#faf4e8"></circle>
  <circle cx="49" cy="113.5" r="1.5" fill="#ffffff"></circle>
</svg>`;

export const needleSouthSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 400">
  <path d="M 50,215 L 56,260 C 62,280 66,305 58,335 C 54,350 51,365 50,380 L 50,215 Z" fill="#755a31"></path>
  <path d="M 50,215 L 44,260 C 38,280 34,305 42,335 C 46,350 49,365 50,380 L 50,215 Z" fill="#463114"></path>
  <circle cx="50" cy="340" r="10.5" fill="#c5a869"></circle>
  <circle cx="50" cy="340" r="4.5" fill="#24473c"></circle>
</svg>`;
