import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type StylePreset = 'minimalistisch' | 'industrieel' | 'warm/luxe' | 'modern' | 'modern-luxe' | 'default';

interface StyleConfig {
  // Typography
  fontHeading: string;
  fontBody: string;
  // Spacing / layout
  sectionPadding: string;
  containerMaxWidth: string;
  // Card / surface
  cardStyle: string;
  borderRadius: string;
  // Button
  buttonStyle: string;
  // Heading sizes
  h1Size: string;
  h2Size: string;
  // Misc
  heroLayout: 'centered' | 'split' | 'fullbleed';
  imageStyle: string;
}

const presets: Record<StylePreset, StyleConfig> = {
  minimalistisch: {
    fontHeading: 'font-sans font-light tracking-widest uppercase',
    fontBody: 'font-sans font-light leading-relaxed',
    sectionPadding: 'py-24 px-8',
    containerMaxWidth: 'max-w-3xl mx-auto',
    cardStyle: 'bg-white border border-gray-100',
    borderRadius: 'rounded-none',
    buttonStyle: 'border border-current bg-transparent px-8 py-3 text-sm tracking-widest uppercase hover:bg-black hover:text-white transition-colors duration-300',
    h1Size: 'text-4xl md:text-6xl',
    h2Size: 'text-2xl md:text-3xl',
    heroLayout: 'centered',
    imageStyle: 'grayscale hover:grayscale-0 transition-all duration-700',
  },

  industrieel: {
    fontHeading: 'font-mono font-bold tracking-tight uppercase',
    fontBody: 'font-sans leading-relaxed',
    sectionPadding: 'py-16 px-6',
    containerMaxWidth: 'max-w-5xl mx-auto',
    cardStyle: 'bg-zinc-900 border border-zinc-700',
    borderRadius: 'rounded-sm',
    buttonStyle: 'bg-zinc-100 text-zinc-900 px-6 py-3 font-mono font-bold text-sm uppercase tracking-widest hover:bg-white transition-colors duration-200',
    h1Size: 'text-5xl md:text-7xl',
    h2Size: 'text-3xl md:text-4xl',
    heroLayout: 'split',
    imageStyle: 'contrast-125 brightness-90',
  },

  'warm/luxe': {
    fontHeading: 'font-serif font-normal tracking-normal',
    fontBody: 'font-sans leading-loose',
    sectionPadding: 'py-20 px-8',
    containerMaxWidth: 'max-w-4xl mx-auto',
    cardStyle: 'bg-amber-50 border border-amber-100',
    borderRadius: 'rounded-lg',
    buttonStyle: 'bg-brand-accent text-white px-8 py-4 font-serif text-base hover:opacity-90 transition-opacity duration-300 shadow-lg',
    h1Size: 'text-4xl md:text-5xl',
    h2Size: 'text-2xl md:text-4xl',
    heroLayout: 'fullbleed',
    imageStyle: 'brightness-95 saturate-110',
  },

  modern: {
    fontHeading: 'font-sans font-extrabold tracking-tight',
    fontBody: 'font-sans leading-relaxed',
    sectionPadding: 'py-20 px-6',
    containerMaxWidth: 'max-w-6xl mx-auto',
    cardStyle: 'bg-white shadow-xl',
    borderRadius: 'rounded-2xl',
    buttonStyle: 'bg-brand-primary text-white px-8 py-4 font-bold text-sm rounded-full hover:scale-105 transition-transform duration-200 shadow-md',
    h1Size: 'text-5xl md:text-7xl',
    h2Size: 'text-3xl md:text-5xl',
    heroLayout: 'split',
    imageStyle: '',
  },

  'modern-luxe': {
    fontHeading: 'font-sans font-bold tracking-tight',
    fontBody: 'font-sans leading-relaxed',
    sectionPadding: 'py-24 px-8',
    containerMaxWidth: 'max-w-5xl mx-auto',
    cardStyle: 'bg-white shadow-sm border border-gray-100',
    borderRadius: 'rounded-2xl',
    buttonStyle: 'inline-block px-8 py-4 font-semibold text-sm tracking-wide rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300',
    h1Size: 'text-5xl md:text-7xl',
    h2Size: 'text-3xl md:text-4xl',
    heroLayout: 'fullbleed',
    imageStyle: 'brightness-90',
  },

  default: {
    fontHeading: 'font-sans font-bold',
    fontBody: 'font-sans leading-relaxed',
    sectionPadding: 'py-16 px-6',
    containerMaxWidth: 'max-w-5xl mx-auto',
    cardStyle: 'bg-white shadow-md',
    borderRadius: 'rounded-xl',
    buttonStyle: 'bg-brand-primary text-white px-6 py-3 font-semibold hover:opacity-90 transition-opacity',
    h1Size: 'text-4xl md:text-6xl',
    h2Size: 'text-2xl md:text-4xl',
    heroLayout: 'centered',
    imageStyle: '',
  },
};

export function resolveStylePreset(instructions: string | null): StyleConfig {
  if (!instructions) return presets.default;
  
  let keyStr = instructions;
  try {
    const parsed = JSON.parse(instructions);
    if (parsed.preset) {
      keyStr = parsed.preset;
    }
  } catch (e) {
    // Not JSON, treat as raw string
  }

  const key = keyStr.toLowerCase().trim() as StylePreset;
  return presets[key] ?? presets.default;
}

export { type StyleConfig };
