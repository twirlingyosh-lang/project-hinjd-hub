/// <reference types="vite-imagetools/client" />

declare module '*?format=webp' {
  const src: string;
  export default src;
}

declare module '*?format=webp&w=*' {
  const src: string;
  export default src;
}