/**
 * [INPUT]: 依赖 React 生命周期、OGL 的 Renderer/Program/Triangle/Mesh/Texture、按钮 data-tone、浏览器 WebGL2/Observer 能力与 styles.css 的六组 namespaced 光场及连续噪声 Token
 * [OUTPUT]: 对外提供 PrismaticBurst 视觉原语，以连续 value noise 和 1 DPR 运行可随宿主 tone 切换色谱的透明 OGL/GLSL 棱光射线场
 * [POS]: ui/src 的底层动效渲染器，由 PrismaticButton 负责受控配色、语义、交互与分层组装
 * [PROTOCOL]: 变更时更新此头部，然后检查 docs/DESIGN_SYSTEM.md
 */
import { useEffect, useRef } from "react";
import { Mesh, Program, Renderer, Texture, Triangle } from "ogl";

const VERTEX_SHADER = `#version 300 es
in vec2 position;
in vec2 uv;
out vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER_HIGH = `#version 300 es
precision highp float;
precision highp int;

out vec4 fragColor;

uniform vec2 uResolution;
uniform float uTime;
uniform float uIntensity;
uniform float uSpeed;
uniform int uAnimType;
uniform vec2 uMouse;
uniform int uColorCount;
uniform float uDistort;
uniform vec2 uOffset;
uniform sampler2D uGradient;
uniform float uNoiseAmount;
uniform int uRayCount;

float hash21(vec2 p) {
  float f = 52.9829189 * fract(dot(p, vec2(0.065, 0.005)));
  return fract(f);
}

float valueNoise21(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 blend = local * local * local * (local * (local * 6.0 - 15.0) + 10.0);
  float bottom = mix(hash21(cell), hash21(cell + vec2(1.0, 0.0)), blend.x);
  float top = mix(hash21(cell + vec2(0.0, 1.0)), hash21(cell + vec2(1.0, 1.0)), blend.x);
  return mix(bottom, top, blend.y);
}

mat2 rot30() {
  return mat2(0.8, -0.5, 0.5, 0.8);
}

float layeredNoise(vec2 fragPx) {
  vec2 p = fragPx * 0.035 + vec2(uTime * 0.45, -uTime * 0.31);
  vec2 q = rot30() * p;
  float n = 0.0;
  n += 0.40 * valueNoise21(q);
  n += 0.25 * valueNoise21(q * 2.0 + 17.0);
  n += 0.20 * valueNoise21(q * 4.0 + 47.0);
  n += 0.10 * valueNoise21(q * 8.0 + 113.0);
  n += 0.05 * valueNoise21(q * 16.0 + 191.0);
  return n;
}

vec3 rayDir(vec2 frag, vec2 res, vec2 offset, float dist) {
  float focal = res.y * max(dist, 1e-3);
  return normalize(vec3(2.0 * (frag - offset) - res, focal));
}

float edgeFade(vec2 frag, vec2 res, vec2 offset) {
  vec2 toC = frag - 0.5 * res - offset;
  float r = length(toC) / (0.5 * min(res.x, res.y));
  float x = clamp(r, 0.0, 1.0);
  float q = x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
  float s = q * 0.5;
  s = pow(s, 1.5);
  float tail = 1.0 - pow(1.0 - s, 2.0);
  s = mix(s, tail, 0.2);
  float dn = (layeredNoise(frag * 0.15) - 0.5) * 0.0015 * s;
  return clamp(s + dn, 0.0, 1.0);
}

mat3 rotX(float a) {
  float c = cos(a), s = sin(a);
  return mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c);
}

mat3 rotY(float a) {
  float c = cos(a), s = sin(a);
  return mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c);
}

mat3 rotZ(float a) {
  float c = cos(a), s = sin(a);
  return mat3(c, -s, 0.0, s, c, 0.0, 0.0, 0.0, 1.0);
}

vec3 sampleGradient(float t) {
  t = clamp(t, 0.0, 1.0);
  return texture(uGradient, vec2(t, 0.5)).rgb;
}

vec2 rot2(vec2 v, float a) {
  float s = sin(a), c = cos(a);
  return mat2(c, -s, s, c) * v;
}

float bendAngle(vec3 q, float t) {
  float a = 0.8 * sin(q.x * 0.55 + t * 0.6)
    + 0.7 * sin(q.y * 0.50 - t * 0.5)
    + 0.6 * sin(q.z * 0.60 + t * 0.7);
  return a;
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  float t = uTime * uSpeed;
  float jitterAmp = 0.1 * clamp(uNoiseAmount, 0.0, 1.0);
  vec3 dir = rayDir(frag, uResolution, uOffset, 1.0);
  float marchT = 0.0;
  vec3 col = vec3(0.0);
  float n = layeredNoise(frag);
  vec4 c = cos(t * 0.2 + vec4(0.0, 33.0, 11.0, 0.0));
  mat2 M2 = mat2(c.x, c.y, c.z, c.w);
  float amp = clamp(uDistort, 0.0, 50.0) * 0.15;

  mat3 rot3dMat = mat3(1.0);
  if (uAnimType == 1) {
    vec3 ang = vec3(t * 0.31, t * 0.21, t * 0.17);
    rot3dMat = rotZ(ang.z) * rotY(ang.y) * rotX(ang.x);
  }

  mat3 hoverMat = mat3(1.0);
  if (uAnimType == 2) {
    vec2 m = uMouse * 2.0 - 1.0;
    vec3 ang = vec3(m.y * 0.6, m.x * 0.6, 0.0);
    hoverMat = rotY(ang.y) * rotX(ang.x);
  }

  for (int i = 0; i < 6; ++i) {
    vec3 P = marchT * dir;
    P.z -= 2.0;
    float rad = length(P);
    vec3 Pl = P * (10.0 / max(rad, 1e-6));

    if (uAnimType == 0) {
      Pl.xz *= M2;
    } else if (uAnimType == 1) {
      Pl = rot3dMat * Pl;
    } else {
      Pl = hoverMat * Pl;
    }

    float stepLen = min(rad - 0.3, n * jitterAmp) + 0.1;
    float grow = smoothstep(0.35, 3.0, marchT);
    float a1 = amp * grow * bendAngle(Pl * 0.6, t);
    float a2 = 0.5 * amp * grow * bendAngle(Pl.zyx * 0.5 + 3.1, t * 0.9);
    vec3 Pb = Pl;
    Pb.xz = rot2(Pb.xz, a1);
    Pb.xy = rot2(Pb.xy, a2);

    float rayPattern = smoothstep(
      0.5,
      0.7,
      sin(Pb.x + cos(Pb.y) * cos(Pb.z))
        * sin(Pb.z + sin(Pb.y) * cos(Pb.x + t))
    );

    if (uRayCount > 0) {
      float ang = atan(Pb.y, Pb.x);
      float comb = 0.5 + 0.5 * cos(float(uRayCount) * ang);
      comb = pow(comb, 3.0);
      rayPattern *= smoothstep(0.15, 0.95, comb);
    }

    vec3 spectralDefault = 1.0 + vec3(
      cos(marchT * 3.0 + 0.0),
      cos(marchT * 3.0 + 1.0),
      cos(marchT * 3.0 + 2.0)
    );
    float tRay = fract(marchT * 0.8);
    vec3 userGradient = 2.0 * sampleGradient(tRay);
    vec3 spectral = (uColorCount > 0) ? userGradient : spectralDefault;
    vec3 base = (0.05 / (0.4 + stepLen))
      * smoothstep(5.0, 0.0, rad)
      * spectral;

    col += base * rayPattern;
    marchT += stepLen;
  }

  col *= edgeFade(frag, uResolution, uOffset);
  col *= uIntensity;

  float luminance = dot(col, vec3(0.299, 0.587, 0.114));
  float alpha = clamp(luminance, 0.0, 1.0);
  fragColor = vec4(clamp(col, 0.0, 1.0), alpha);
}
`;

const PALETTE_TOKEN_SUFFIXES = [
  "ray-1-rgb",
  "ray-2-rgb",
  "ray-3-rgb",
  "ray-4-rgb",
  "ray-5-rgb",
  "ray-6-rgb",
] as const;
const FALLBACK_PALETTES = {
  green: [[26, 74, 53], [15, 169, 88], [45, 106, 79], [34, 197, 94], [22, 101, 52], [21, 128, 61]],
  blue: [[30, 58, 95], [37, 99, 235], [49, 95, 145], [56, 189, 248], [30, 58, 138], [29, 78, 216]],
  violet: [[50, 21, 83], [109, 40, 217], [76, 29, 149], [139, 92, 246], [91, 33, 182], [124, 58, 237]],
  amber: [[69, 26, 3], [217, 119, 6], [146, 64, 14], [245, 158, 11], [120, 53, 15], [180, 83, 9]],
  rose: [[76, 23, 46], [225, 29, 72], [159, 18, 57], [244, 63, 94], [136, 19, 55], [190, 24, 73]],
  cyan: [[8, 51, 68], [6, 182, 212], [14, 116, 144], [34, 211, 238], [21, 94, 117], [8, 145, 178]],
} as const;
type PaletteTone = keyof typeof FALLBACK_PALETTES;

function isPaletteTone(value: string | undefined): value is PaletteTone {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(FALLBACK_PALETTES, value);
}

function readNumber(style: CSSStyleDeclaration, token: string, fallback: number): number {
  const value = Number.parseFloat(style.getPropertyValue(token));
  return Number.isFinite(value) ? value : fallback;
}

function readPalette(style: CSSStyleDeclaration, tone: PaletteTone): Uint8Array {
  const data = new Uint8Array(PALETTE_TOKEN_SUFFIXES.length * 4);

  PALETTE_TOKEN_SUFFIXES.forEach((suffix, index) => {
    const token = `--prismatic-button-${tone}-${suffix}`;
    const parsed = style.getPropertyValue(token).trim().split(/\s+/u).map(Number);
    const channels = parsed.length === 3 && parsed.every(Number.isFinite) ? parsed : FALLBACK_PALETTES[tone][index];
    data[index * 4] = channels[0];
    data[index * 4 + 1] = channels[1];
    data[index * 4 + 2] = channels[2];
    data[index * 4 + 3] = 255;
  });

  return data;
}

function createWebGlCanvas(): HTMLCanvasElement | null {
  const canvas = document.createElement("canvas");
  const attributes: WebGLContextAttributes = {
    alpha: true,
    depth: true,
    stencil: false,
    antialias: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
    powerPreference: "default",
  };

  try {
    return canvas.getContext("webgl2", attributes) ? canvas : null;
  } catch {
    return null;
  }
}

function PrismaticBurst() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = createWebGlCanvas();
    if (!container || !canvas) return undefined;

    const initialStyle = window.getComputedStyle(container);
    const renderer = new Renderer({
      canvas,
      dpr: readNumber(initialStyle, "--prismatic-button-render-dpr", 1),
      alpha: true,
      antialias: false,
      premultipliedAlpha: false,
      powerPreference: "default",
    });
    const gl = renderer.gl;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
    Object.assign(canvas.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      mixBlendMode: "normal",
      pointerEvents: "none",
    });
    canvas.setAttribute("aria-hidden", "true");
    container.appendChild(canvas);

    const gradientTexture = new Texture(gl, {
      image: new Uint8Array([255, 255, 255, 255]),
      width: 1,
      height: 1,
      generateMipmaps: false,
      flipY: false,
    });
    gradientTexture.minFilter = gl.LINEAR;
    gradientTexture.magFilter = gl.LINEAR;
    gradientTexture.wrapS = gl.CLAMP_TO_EDGE;
    gradientTexture.wrapT = gl.CLAMP_TO_EDGE;

    const program = new Program(gl, {
      vertex: VERTEX_SHADER,
      fragment: FRAGMENT_SHADER_HIGH,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uResolution: { value: [1, 1] },
        uTime: { value: 0 },
        uIntensity: { value: 15 },
        uSpeed: { value: 0.4 },
        uAnimType: { value: 1 },
        uMouse: { value: [0.5, 0.5] },
        uColorCount: { value: PALETTE_TOKEN_SUFFIXES.length },
        uDistort: { value: 30 },
        uOffset: { value: [0, 0] },
        uGradient: { value: gradientTexture },
        uNoiseAmount: { value: 0.45 },
        uRayCount: { value: 18 },
      },
    });
    const geometry = new Triangle(gl);
    const mesh = new Mesh(gl, { geometry, program });
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let animationFrame = 0;
    let elapsedSeconds = 0;
    let lastTimestamp = performance.now();
    let visible = true;

    const syncParameters = () => {
      const style = window.getComputedStyle(container);
      const requestedTone = paletteHost?.dataset.tone;
      const tone: PaletteTone = isPaletteTone(requestedTone) ? requestedTone : "green";
      const palette = readPalette(style, tone);
      gradientTexture.image = palette;
      gradientTexture.width = PALETTE_TOKEN_SUFFIXES.length;
      gradientTexture.height = 1;
      gradientTexture.minFilter = gl.LINEAR;
      gradientTexture.magFilter = gl.LINEAR;
      gradientTexture.wrapS = gl.CLAMP_TO_EDGE;
      gradientTexture.wrapT = gl.CLAMP_TO_EDGE;
      gradientTexture.flipY = false;
      gradientTexture.generateMipmaps = false;
      gradientTexture.format = gl.RGBA;
      gradientTexture.type = gl.UNSIGNED_BYTE;
      gradientTexture.needsUpdate = true;
      program.uniforms.uColorCount.value = PALETTE_TOKEN_SUFFIXES.length;
      program.uniforms.uIntensity.value = readNumber(style, "--prismatic-button-intensity", 15);
      program.uniforms.uSpeed.value = readNumber(style, "--prismatic-button-speed", 0.4);
      program.uniforms.uDistort.value = readNumber(style, "--prismatic-button-distort", 30);
      program.uniforms.uNoiseAmount.value = readNumber(style, "--prismatic-button-noise-amount", 0.45);
      program.uniforms.uRayCount.value = Math.max(0, Math.floor(readNumber(style, "--prismatic-button-ray-count", 18)));
    };

    const render = (time: number) => {
      program.uniforms.uTime.value = time;
      renderer.render({ scene: mesh });
    };

    const stop = () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    };

    const tick = (timestamp: number) => {
      const delta = Math.max(0, timestamp - lastTimestamp) * 0.001;
      lastTimestamp = timestamp;
      elapsedSeconds += delta;
      render(elapsedSeconds);
      animationFrame = requestAnimationFrame(tick);
    };

    const syncActivity = () => {
      stop();
      if (reducedMotion.matches || !visible || document.hidden) {
        render(6.4);
        return;
      }
      lastTimestamp = performance.now();
      animationFrame = requestAnimationFrame(tick);
    };

    const resize = () => {
      renderer.setSize(container.clientWidth || 1, container.clientHeight || 1);
      program.uniforms.uResolution.value = [gl.drawingBufferWidth, gl.drawingBufferHeight];
      render(reducedMotion.matches ? 6.4 : elapsedSeconds);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      syncActivity();
    }, { threshold: 0.01 });
    intersectionObserver.observe(container);
    const paletteHost = container.closest<HTMLElement>('[data-slot="prismatic-button"]');
    const paletteObserver = new MutationObserver(() => {
      syncParameters();
      render(reducedMotion.matches ? 6.4 : elapsedSeconds);
    });
    paletteObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });
    if (paletteHost) {
      paletteObserver.observe(paletteHost, { attributes: true, attributeFilter: ["class", "style", "data-tone"] });
    }

    const handleVisibility = () => syncActivity();
    const handleMotion = () => syncActivity();
    document.addEventListener("visibilitychange", handleVisibility);
    reducedMotion.addEventListener("change", handleMotion);

    syncParameters();
    resize();
    syncActivity();

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      paletteObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      reducedMotion.removeEventListener("change", handleMotion);
      geometry.remove();
      program.remove();
      gl.deleteTexture(gradientTexture.texture);
      if (canvas.parentNode === container) container.removeChild(canvas);
    };
  }, []);

  return <div ref={containerRef} aria-hidden className="relative size-full overflow-hidden" />;
}

export { PrismaticBurst };
