/**
 * ============================================================
 *  THEME ENGINE — ArtistHub
 *  Convierte un artistConfig.style en clases + CSS variables.
 *  Soporta templates: SOFT_TRAP | BRUTALIST | INDIE_VIBE | PINK_GOTH | TECHNO_MINIMAL | VAPORWAVE
 * ============================================================
 */
import { createContext, useContext } from 'react';

// ─────────────────────────────────────────────────────────────
//  DEFINICIONES DE TEMPLATES
// ─────────────────────────────────────────────────────────────
export const TEMPLATES = {

    // ── 1. SOFT TRAP (Trap / Hip-Hop / Pop) ──────────────────
    SOFT_TRAP: {
        label: 'Soft Trap',
        emoji: '🌙',
        demoKey: 'soft_trap',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap',
        headingFont: "'Poppins', sans-serif",
        bodyFont: "'Poppins', sans-serif",
        bodyClass: 'template-soft-trap',
        grain: false,
        classes: {
            heroName: 'font-black tracking-tight',
            card: 'rounded-3xl backdrop-blur-xl border border-white/[0.07] bg-white/[0.03]',
            badge: 'rounded-full backdrop-blur-sm',
            btn: 'rounded-2xl font-semibold',
            socialBtn: 'rounded-2xl backdrop-blur-md border border-white/[0.07] bg-white/[0.03]',
            iframeWrap: 'rounded-3xl overflow-hidden',
            statCard: 'rounded-2xl',
        },
    },

    // ── 2. BRUTALIST (Metal / Rock / Punk) ───────────────────
    BRUTALIST: {
        label: 'Brutalist',
        emoji: '🤘',
        demoKey: 'brutalist',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Metal+Mania&family=Share+Tech+Mono&family=Inter:wght@300;400;700&display=swap',
        headingFont: "'Metal Mania', cursive",
        bodyFont: "'Share Tech Mono', monospace",
        bodyClass: 'template-brutalist',
        grain: true,
        classes: {
            heroName: 'font-black tracking-wider uppercase glitch-heading',
            card: 'rounded-none border-2 border-white/20 bg-black/80',
            badge: 'rounded-none border',
            btn: 'rounded-none border-2 uppercase tracking-widest font-bold',
            socialBtn: 'rounded-none border border-white/25 bg-black/80',
            iframeWrap: 'rounded-none overflow-hidden border-2 border-white/20',
            statCard: 'rounded-none border border-white/20',
        },
    },

    // ── 3. INDIE VIBE (Indie / Folk / Alternativo) ───────────
    INDIE_VIBE: {
        label: 'Indie Vibe',
        emoji: '🎸',
        demoKey: 'indie_vibe',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=Inter:wght@300;400;500;600&display=swap',
        headingFont: "'Playfair Display', serif",
        bodyFont: "'Inter', sans-serif",
        bodyClass: 'template-indie-vibe',
        grain: true,
        classes: {
            heroName: 'font-black italic tracking-tight',
            card: 'rounded-xl border border-white/10 bg-white/[0.04]',
            badge: 'rounded-lg border',
            btn: 'rounded-xl font-medium',
            socialBtn: 'rounded-xl border border-white/15 bg-white/[0.03]',
            iframeWrap: 'rounded-xl overflow-hidden border border-white/15',
            statCard: 'rounded-lg',
        },
    },

    // ── 4. PINK GOTH (Sad Girl / Emo / Aesthetic / Hello Kitty Vibe) ─
    PINK_GOTH: {
        label: 'Pink Goth',
        emoji: '🎀',
        demoKey: 'pink_goth',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Creepster&family=Comfortaa:wght@300;700&display=swap',
        headingFont: "'Creepster', cursive",
        bodyFont: "'Comfortaa', sans-serif",
        bodyClass: 'template-pink-goth',
        grain: false,
        classes: {
            heroName: 'tracking-tighter pink-glow-text',
            card: 'rounded-[2.5rem] bg-white/5 border-2 border-pink-400/20 backdrop-blur-md text-pink-50',
            badge: 'rounded-full bg-pink-500/20 border border-pink-500/30 text-pink-200',
            btn: 'rounded-full font-bold bg-pink-500 hover:bg-pink-400 text-white shadow-[0_0_20px_rgba(236,72,153,0.4)]',
            socialBtn: 'rounded-2xl border-2 border-pink-400/10 bg-black/40 hover:border-pink-500/40 transition-all',
            iframeWrap: 'rounded-[2rem] overflow-hidden border-2 border-pink-400/20',
            statCard: 'rounded-3xl bg-pink-500/10 border border-pink-500/20',
        },
    },

    // ── 5. TECHNO MINIMAL (Berlin / Industrial / Minimal) ───────
    TECHNO_MINIMAL: {
        label: 'Techno',
        emoji: '🎛️',
        demoKey: 'techno',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;900&family=JetBrains+Mono:wght@300;400&family=Montserrat:wght@300;400;700&display=swap',
        headingFont: "'Orbitron', sans-serif",
        bodyFont: "'Montserrat', sans-serif",
        bodyClass: 'template-techno',
        grain: true,
        classes: {
            heroName: 'font-black tracking-[-0.02em] uppercase techno-scanline text-[clamp(2.5rem,8vw,6rem)]',
            card: 'rounded-none border border-lime-400/30 bg-black/90',
            badge: 'rounded-none border border-lime-400/50 text-lime-400 uppercase tracking-widest',
            btn: 'rounded-none bg-lime-400 text-black font-black uppercase tracking-tighter hover:bg-white transition-colors',
            socialBtn: 'rounded-none border border-white/5 hover:border-lime-400/50 bg-neutral-900',
            iframeWrap: 'rounded-none border border-lime-400/20',
            statCard: 'rounded-none border-l-4 border-lime-400 bg-neutral-900 p-4',
        },
    },

    // ── 6. VAPORWAVE (Retro / 80s / Synthwave / Aesthetic) ──────
    VAPORWAVE: {
        label: 'Vaporwave',
        emoji: '🏝️',
        demoKey: 'vaporwave',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Righteous&family=Fira+Code:wght@300;500&family=Montserrat:wght@300;400;700&display=swap',
        headingFont: "'Righteous', cursive",
        bodyFont: "'Montserrat', sans-serif",
        bodyClass: 'template-vaporwave',
        grain: true,
        classes: {
            heroName: 'font-normal italic vapor-text-gradient drop-shadow-[4px_4px_0_rgba(255,0,255,0.5)]',
            card: 'rounded-lg bg-indigo-900/40 border-2 border-cyan-400/30 backdrop-blur-xl',
            badge: 'rounded-md bg-fuchsia-500/20 border border-fuchsia-400/50 text-cyan-300',
            btn: 'rounded-md bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-white font-bold italic hover:hue-rotate-15 transition-all',
            socialBtn: 'rounded-lg border border-cyan-400/20 bg-indigo-950/80',
            iframeWrap: 'rounded-lg border-2 border-fuchsia-400/20',
            statCard: 'rounded-lg bg-cyan-400/5 border-b-2 border-fuchsia-500 p-3',
        },
    },
};

// ─────────────────────────────────────────────────────────────
//  getThemeDefinition — Procesa el config y devuelve el tema
// ─────────────────────────────────────────────────────────────
/**
 * @param {object} config - artistConfig completo
 * @returns {{ cssVars, classes, bodyClass, fontUrl, grain, templateDef }}
 */
export function getThemeDefinition(config: any) {
    const templateName = config.theme || config.style?.template || 'SOFT_TRAP';
    const templateDef = TEMPLATES[templateName as keyof typeof TEMPLATES] ?? TEMPLATES.SOFT_TRAP;
    
    // Colores por defecto del template
    const defaultColors: Record<string, { primary: string, bg: string, accent: string, text: string }> = {
        SOFT_TRAP: { primary: '#a855f7', bg: '#0a0a0a', accent: '#a855f7', text: '#ffffff' },
        BRUTALIST: { primary: '#ef4444', bg: '#000000', accent: '#ef4444', text: '#ffffff' },
        INDIE_VIBE: { primary: '#f59e0b', bg: '#1c1917', accent: '#f59e0b', text: '#fef3c7' },
        PINK_GOTH: { primary: '#ec4899', bg: '#0f0a0f', accent: '#ec4899', text: '#fdf2f8' },
        TECHNO_MINIMAL: { primary: '#84cc16', bg: '#0a0a0a', accent: '#84cc16', text: '#ffffff' },
        VAPORWAVE: { primary: '#22d3ee', bg: '#0f0f1a', accent: '#22d3ee', text: '#ffffff' },
    };
    
    const colors = config.style?.colors || defaultColors[templateName] || defaultColors.SOFT_TRAP;
    const fonts = { 
        heading: config.style?.fonts?.heading || templateDef.headingFont, 
        body: config.style?.fonts?.body || templateDef.bodyFont 
    };

    // CSS custom properties que se inyectarán en el div raíz
    const cssVars = {
        '--color-primary': colors.primary,
        '--color-bg': colors.bg,
        '--color-accent': colors.accent,
        '--color-text': colors.text,
        '--font-heading': fonts.heading,
        '--font-body': fonts.body,
    };

    return {
        cssVars,
        classes: templateDef.classes,
        bodyClass: templateDef.bodyClass,
        fontUrl: templateDef.fontUrl,
        grain: templateDef.grain,
        templateDef,
        config,
    };
}

// ─────────────────────────────────────────────────────────────
//  injectFonts — Carga Google Fonts dinámicamente
// ─────────────────────────────────────────────────────────────
const FONT_LINK_ID = 'artisthub-dynamic-font';

export function injectFonts(fontUrl: string) {
    let link = document.getElementById(FONT_LINK_ID) as HTMLLinkElement;
    if (!link) {
        link = document.createElement('link') as HTMLLinkElement;
        link.id = FONT_LINK_ID;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    }
    if (link.href !== fontUrl) link.href = fontUrl;
}

// ─────────────────────────────────────────────────────────────
//  React Context
// ─────────────────────────────────────────────────────────────
export const ThemeContext = createContext<any>(null);

/** Hook para acceder al tema desde cualquier componente */
export const useTheme = () => useContext(ThemeContext);
