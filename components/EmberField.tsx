"use client";

import type { MotionValue } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/lib/useMedia";

/*
 * A bed of live coals, rendered in one fragment shader.
 * - Voronoi lumps of charcoal whose cracks glow; heat travels slowly through
 *   the bed and each lump breathes on its own clock.
 * - Grey ash crusts the cooler lumps; distance haze and heat shimmer.
 * - Sparks rise in four parallax layers, cooling as they climb.
 * - Your pointer is breath: move over the coals and they flare.
 * - Scroll lifts the camera: the bed sinks, sparks fill the frame.
 */

const VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uP;
uniform vec2 uPtr;
uniform float uHeat;
uniform float uIntro;
uniform sampler2D uTex;
uniform vec2 uCover;
uniform float uReady;

float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
vec2 h22(vec2 p){float n=h21(p);return vec2(n,h21(p+n));}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1.,0.)),u.x),mix(h21(i+vec2(0.,1.)),h21(i+vec2(1.,1.)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.03+vec2(17.1,9.3);a*=.5;}return v;}

vec3 ramp(float t){
  t=clamp(t,0.,1.2);
  vec3 c=mix(vec3(0.),vec3(.36,.022,0.),smoothstep(.02,.3,t));
  c=mix(c,vec3(.93,.21,.02),smoothstep(.25,.58,t));
  c=mix(c,vec3(1.,.55,.13),smoothstep(.55,.82,t));
  c=mix(c,vec3(1.,.86,.6),smoothstep(.82,1.05,t));
  return c;
}

vec3 sparks(vec2 p,float t,float dens,float bedY,vec2 ptr,float heat){
  vec3 acc=vec3(0.);
  for(int L=0;L<3;L++){
    float fl=float(L);
    float sc=3.2+fl*3.4;
    vec2 q=p*sc;
    // every column climbs at its own pace, so the field never reads as rain
    float col=floor(q.x);
    float spd=(.09+fl*.03)*(.55+.9*h21(vec2(col,fl*7.1)));
    q.y-=t*spd*sc+h21(vec2(col,3.3+fl))*9.;
    q.x+=sin(q.y*.8+col*1.7+t*.9)*.32;
    vec2 id=floor(q);vec2 f=fract(q)-.5;
    float r=h21(id+fl*19.3);
    float nearPtr=exp(-dot(p-ptr,p-ptr)*3.);
    float show=step(r,dens+heat*nearPtr*.6);
    vec2 o=(h22(id*1.7+fl)-.5)*.62;
    vec2 d=f-o;d.y*=.6;
    float sz=mix(1700.,700.,fl/2.)*(.6+.8*h21(id+4.2));
    float b=exp(-dot(d,d)*sz);
    // each spark flares and dies on its own clock
    float life=fract(t*(.35+r*.5)+r*13.);
    float env=smoothstep(0.,.15,life)*(1.-smoothstep(.55,1.,life));
    float above=max(0.,p.y-bedY);
    float cool=exp(-above*(1.15-fl*.25));
    acc+=ramp(.7+.4*r*cool)*b*env*show*(.35+.65*cool)*1.5;
  }
  return acc;
}

// big out-of-focus embers drifting in front of the lens
vec3 bokeh(vec2 p,float t,float amt){
  vec3 acc=vec3(0.);
  vec2 q=p*1.6;
  q.y-=t*.045;
  q.x+=sin(q.y*1.3+t*.3)*.25;
  vec2 id=floor(q);vec2 f=fract(q)-.5;
  float r=h21(id+71.3);
  vec2 o=(h22(id*2.3)-.5)*.5;
  float d=length(f-o);
  float disc=smoothstep(.16,.11,d)*(.55+.45*smoothstep(.0,.13,d));
  float pulse=.5+.5*sin(t*(.6+r)+r*20.);
  acc+=vec3(1.,.42,.1)*disc*step(r,amt)*pulse*.22;
  return acc;
}

void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  float asp=uRes.x/uRes.y;
  vec2 p=vec2((uv.x-.5)*asp,uv.y);
  float t=uTime;
  vec2 ptr=vec2((uPtr.x-.5)*asp,uPtr.y);
  float rise=smoothstep(0.,.9,uP);

  // night above, warming toward the coals
  vec3 sky=mix(vec3(.07,.033,.02),vec3(.016,.018,.032),clamp(uv.y*.7+rise*.5,0.,1.));
  vec3 col=sky;

  // the photograph of the coals, cover-fitted, sinking as the camera lifts
  vec2 tuv=(uv-.5)*uCover+.5;
  tuv.y+=rise*1.05;
  // heat shimmer, strongest just above the glow
  float sh=noise(vec2(tuv.x*9.,tuv.y*5.-t*1.1))-.5;
  tuv.x+=sh*.0035;
  vec3 ph=texture2D(uTex,clamp(tuv,0.,1.)).rgb;
  float inside=(1.-smoothstep(.86,1.02,tuv.y))*uReady;

  // where the photo glows, the fire is alive: let it breathe
  float red=clamp((ph.r-ph.b)*1.6,0.,1.);
  float hot=smoothstep(.18,.7,red)*smoothstep(.12,.5,ph.r);
  float breathe=fbm(tuv*vec2(7.,5.)+vec2(t*.07,-t*.12));
  float flick=noise(tuv*40.+t*2.3);
  float near=exp(-dot(p-ptr,p-ptr)*5.);
  float ign=smoothstep(0.,1.,uIntro*1.6-length(vec2(p.x*.5,uv.y-.25))*.8);
  vec3 c=ph*(.55+.45*ign);
  c+=ph*hot*((breathe-.45)*1.25+(flick-.5)*.25)*ign;
  // your breath brightens the coals under the cursor
  c+=hot*ramp(.6+red*.5)*(uHeat*near*1.4+uHeat*.12);
  // deepen the ash so the glow carries the frame
  c=mix(c,c*c*1.7,.42);
  c=mix(c,c*vec3(1.05,.95,.88),.5);
  col=mix(col,c,inside);

  float glow=exp(-max(0.,uv.y-(.55-rise*1.1))*3.5);
  col+=vec3(.5,.13,.03)*glow*.18*uIntro;
  float smoke=fbm(vec2(p.x*1.4,uv.y*1.1-t*.1)+vec2(0.,t*.035));
  col+=vec3(.16,.1,.08)*smoothstep(.5,.9,smoke)*glow*.45*uIntro;

  float bedY=.42-rise*1.1;
  float dens=mix(.07,.36,rise);
  vec3 sp=sparks(p,t,dens,bedY,ptr,uHeat);
  col+=sp*uIntro;
  col+=bokeh(p,t,.18)*uIntro*(1.-rise*.85);

  float vig=smoothstep(1.3,.25,length((uv-vec2(.5,.45))*vec2(asp*.8,1.)));
  col*=mix(.5,1.,vig);
  col=col/(1.+col*.18);
  col+=(h21(gl_FragCoord.xy+fract(t*.73)*91.7)-.5)*.028;
  gl_FragColor=vec4(max(col,0.),1.);
}`;

type Props = { progress?: MotionValue<number>; className?: string; fallback?: ReactNode; src: string; aspect: number };

export default function EmberField({ progress, className, fallback, src, aspect }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);
  const reduce = usePrefersReducedMotion();
  const prog = useRef(progress);
  prog.current = progress;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: "high-performance" });
    if (!gl) {
      setFailed(true);
      return;
    }
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
      return s;
    };
    let prog0: WebGLProgram;
    try {
      prog0 = gl.createProgram()!;
      gl.attachShader(prog0, sh(gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog0, sh(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog0);
      if (!gl.getProgramParameter(prog0, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog0) ?? "link");
    } catch (e) {
      console.warn("[kaa] ember shader failed, using photo", e);
      setFailed(true);
      return;
    }
    gl.useProgram(prog0);
    // one big triangle covering the screen (counter-clockwise)
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog0, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (n: string) => gl.getUniformLocation(prog0, n);
    const uRes = U("uRes"), uTime = U("uTime"), uP = U("uP"), uPtr = U("uPtr"), uHeat = U("uHeat"), uIntro = U("uIntro"), uCover = U("uCover"), uReady = U("uReady");
    gl.uniform1i(U("uTex"), 0);

    // the coals themselves are a photograph; the shader makes them live
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([18, 10, 8, 255]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    let ready = 0;
    const img = new window.Image();
    img.decoding = "async";
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      ready = performance.now();
      kick();
    };
    img.src = src;

    // render below native resolution on big screens: embers are soft anyway
    const resize = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const scale = w * h > 1_400_000 ? 0.7 : 0.85;
      canvas.width = Math.max(1, Math.round(w * dpr * scale));
      canvas.height = Math.max(1, Math.round(h * dpr * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // pointer = breath
    const ptr = { x: 0.5, y: 0.25, tx: 0.5, ty: 0.25 };
    let heat = 0;
    let lastMove = performance.now();
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      if (e.clientY < r.top || e.clientY > r.bottom) return;
      const x = (e.clientX - r.left) / r.width, y = 1 - (e.clientY - r.top) / r.height;
      const now = performance.now();
      const dt = Math.max(8, now - lastMove);
      const speed = Math.hypot(x - ptr.tx, y - ptr.ty) / (dt / 1000);
      heat = Math.min(1, heat + Math.min(0.12, speed * 0.02));
      ptr.tx = x;
      ptr.ty = y;
      lastMove = now;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) kick();
    });
    io.observe(canvas);
    const onVis = () => !document.hidden && kick();
    document.addEventListener("visibilitychange", onVis);
    const onLost = (e: Event) => {
      e.preventDefault();
      setFailed(true);
    };
    canvas.addEventListener("webglcontextlost", onLost);

    const start = performance.now();
    let raf = 0;
    let last = start;
    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const time = reduce ? 9 : (now - start) / 1000;
      heat *= Math.exp(-dt * 1.1);
      ptr.x += (ptr.tx - ptr.x) * Math.min(1, dt * 6);
      ptr.y += (ptr.ty - ptr.y) * Math.min(1, dt * 6);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, time + 40);
      gl.uniform1f(uP, prog.current?.get() ?? 0);
      gl.uniform2f(uPtr, ptr.x, ptr.y);
      gl.uniform1f(uHeat, reduce ? 0 : heat);
      gl.uniform1f(uIntro, reduce ? 1 : Math.min(1, time / 2.6));
      const ca = canvas.width / canvas.height;
      gl.uniform2f(uCover, ca > aspect ? 1 : ca / aspect, ca > aspect ? aspect / ca : 1);
      gl.uniform1f(uReady, ready ? (reduce ? 1 : Math.min(1, (now - ready) / 900)) : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const loop = (now: number) => {
      raf = 0;
      if (!visible || document.hidden) return;
      draw(now);
      if (!reduce) raf = requestAnimationFrame(loop);
    };
    function kick() {
      if (!raf) raf = requestAnimationFrame(loop);
    }
    kick();
    // reduced motion: one still frame, redrawn only when scroll moves the camera
    const unsub = reduce ? prog.current?.on("change", () => kick()) : undefined;

    return () => {
      cancelAnimationFrame(raf);
      unsub?.();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVis);
      canvas.removeEventListener("webglcontextlost", onLost);
      // free GPU objects but keep the context: StrictMode remounts reuse this canvas
      gl.deleteBuffer(buf);
      gl.deleteTexture(tex);
      img.onload = null;
      gl.deleteProgram(prog0);
    };
  }, [reduce, src, aspect]);

  if (failed) return <>{fallback}</>;
  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
