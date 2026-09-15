export const fontOptions = [
  {
    id: 'instrument-italic', number: '01', name: 'Instrument Serif Italic',
    description: '克制的斜体，有一点手写的流动感。',
    style: "font-family:'Instrument Serif',serif;font-style:italic;font-weight:400;letter-spacing:-1px;",
    source: 'https://fontsource.org/fonts/instrument-serif',
  },
  {
    id: 'cormorant', number: '02', name: 'Cormorant Garamond Italic',
    description: '书卷气更强，像书籍扉页上的署名。',
    style: "font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:500;letter-spacing:-1.8px;",
    source: 'https://fontsource.org/fonts/cormorant-garamond',
  },
  {
    id: 'allura', number: '03', name: 'Allura',
    description: '连笔花体，最接近一枚个人签名。',
    style: "font-family:'Allura',cursive;font-style:normal;font-weight:400;letter-spacing:0;font-size:clamp(3.25rem,8vw,4.875rem);",
    source: 'https://fontsource.org/fonts/allura',
  },
  {
    id: 'caveat', number: '04', name: 'Caveat',
    description: '随性的手写字，轻松、有亲近感。',
    style: "font-family:'Caveat',cursive;font-style:normal;font-weight:400;letter-spacing:-1px;font-size:clamp(3rem,8vw,4.5rem);",
    source: 'https://fontsource.org/fonts/caveat',
  },
  {
    id: 'original', number: '05', name: 'Instrument Serif · 现有版本',
    description: '当前的直立衬线体，放在这里作对照。',
    style: "font-family:'Instrument Serif',serif;font-style:normal;font-weight:400;letter-spacing:-1.5px;",
    source: 'https://fontsource.org/fonts/instrument-serif',
  },
] as const;
