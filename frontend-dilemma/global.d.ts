/// <reference types="vite/client" />

// Типы для vite-imagetools с форматом webp
declare module "*.png?format=webp" {
  const src: string;
  export default src;
}

declare module "*.jpg?format=webp" {
  const src: string;
  export default src;
}

declare module "*.jpeg?format=webp" {
  const src: string;
  export default src;
}

declare module "*?format=webp" {
  const src: string;
  export default src;
}

declare module "*.mp3" {
  const src: string;
  export default src;
}

declare module "*.wav" {
  const src: string;
  export default src;
}
