/**
 * lanyard.js — PT Bisa Media Grup
 * Full-viewport interactive 3D physics lanyard card using Three.js
 * Renders without clipping across the entire screen while maintaining
 * exact DOM-anchored rest position and lanyard strap physics.
 *
 * Usage:
 * initLanyard(container, options) -> destroy()
 */
(function (G) {
  'use strict';

  const CZ = { portrait: [1.6, 2.25], landscape: [2.25, 1.6] };
  const AN = { left: 0.27, center: 0.5, right: 0.73 };
  const TH = 0.018, BV = 0.007, JN = 4, NW = 1 / 0.05, MS = 1 / 960, IT = 2, SP = 72, FV = 24;
  const SR = 0.36, RR = 0.095, RT = 0.0135, ER = 0.036, CH = 0.15, FW = 1024, FS = 9;

  const FIN = {
    glossy: { roughness: 0.42, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.06, foil: 0, anisotropy: 0 },
    matte: { roughness: 0.85, metalness: 0, clearcoat: 0, clearcoatRoughness: 0.6, foil: 0, anisotropy: 0 },
    holographic: { roughness: 0.3, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.04, foil: 1, anisotropy: 0 },
    metallic: { roughness: 0.36, metalness: 0.75, clearcoat: 0.5, clearcoatRoughness: 0.18, foil: 0, anisotropy: 0.7 }
  };

  const MT = {
    silver: { color: '#d9dce2', roughness: 0.16 },
    gold: { color: '#e4b965', roughness: 0.2 },
    graphite: { color: '#4d4f55', roughness: 0.28 }
  };

  const BC = [0, 0.07, 0.93, 1];
  const BB = [-0.95, -0.28, 0.28, 0.95];

  const cl = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const mx = (a, b, t) => a + (b - a) * t;

  const pCo = (v, fb) => {
    try {
      const c = document.createElement('canvas').getContext('2d');
      c.fillStyle = '#000';
      c.fillStyle = v;
      const r = c.fillStyle;
      if (r.startsWith('#')) {
        const n = parseInt(r.slice(1), 16);
        return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
      }
      const p = r.match(/[\d.]+/g);
      return p && p.length >= 3 ? [+p[0] / 255, +p[1] / 255, +p[2] / 255] : fb;
    } catch (_) {
      return fb;
    }
  };

  const lm = r => 0.2126 * r[0] + 0.7152 * r[1] + 0.0722 * r[2];
  const css = (r, a = 1) => `rgba(${Math.round(r[0] * 255)},${Math.round(r[1] * 255)},${Math.round(r[2] * 255)},${a})`;

  const seed = s => {
    let st = s >>> 0;
    return () => {
      st = (st + 0x6d2b79f5) >>> 0;
      let t = st;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  const rr = (p, x, y, w, h, r) => {
    const k = r * 0.4477;
    p.moveTo(x + r, y);
    p.lineTo(x + w - r, y);
    p.bezierCurveTo(x + w - k, y, x + w, y + k, x + w, y + r);
    p.lineTo(x + w, y + h - r);
    p.bezierCurveTo(x + w, y + h - k, x + w - k, y + h, x + w - r, y + h);
    p.lineTo(x + r, y + h);
    p.bezierCurveTo(x + k, y + h, x, y + h - k, x, y + h - r);
    p.lineTo(x, y + r);
    p.bezierCurveTo(x, y + k, x + k, y, x + r, y);
  };

  const li = (m, u) => {
    if (!u) return Promise.resolve(null);
    if (m.has(u)) return m.get(u);
    const p = new Promise(res => {
      const i = new Image();
      if (!u.startsWith('data:')) i.crossOrigin = 'anonymous';
      i.decoding = 'async';
      i.onload = () => res(i);
      i.onerror = () => res(null);
      i.src = u;
    });
    m.set(u, p);
    return p;
  };

  const cLay = (o, cr) => {
    const [W, H] = CZ[o] || CZ.portrait;
    const r = mx(0.03, Math.min(W, H) * 0.2, cl(cr, 0, 1));
    const sl = { width: 0.34, height: 0.07, y: H / 2 - 0.13 };
    const rY = H / 2 - 0.055;
    return { width: W, height: H, radius: r, slot: sl, ringY: rY, hangY: rY + RR };
  };

  function bCard(T, l) {
    const { width: W, height: H, radius: r, slot: sl } = l;
    const o = new T.Shape();
    rr(o, -W / 2 + BV, -H / 2 + BV, W - BV * 2, H - BV * 2, Math.max(r - BV, 0.005));
    const h = new T.Path();
    rr(h, -sl.width / 2 - BV, sl.y - sl.height / 2 - BV, sl.width + BV * 2, sl.height + BV * 2, sl.height / 2 + BV);
    o.holes.push(h);

    const bd = new T.ExtrudeGeometry(o, {
      depth: TH,
      bevelEnabled: true,
      bevelThickness: BV,
      bevelSize: BV,
      bevelSegments: 5,
      curveSegments: 24
    });
    bd.translate(0, 0, -TH / 2);

    const fc = new T.ShapeGeometry(o, 24);
    const ps = fc.getAttribute('position');
    const uv = fc.getAttribute('uv');
    for (let i = 0; i < ps.count; i++) {
      uv.setXY(i, (ps.getX(i) + W / 2) / W, (ps.getY(i) + H / 2) / H);
    }
    uv.needsUpdate = true;
    return { body: bd, face: fc };
  }

  function bClamp(T, w) {
    const cw = w * 1.16;
    const sh = new T.Shape();
    rr(sh, -cw / 2 + 0.014, -CH / 2 + 0.014, cw - 0.028, CH - 0.028, 0.024);
    const g = new T.ExtrudeGeometry(sh, {
      depth: 0.02,
      bevelEnabled: true,
      bevelThickness: 0.014,
      bevelSize: 0.014,
      bevelSegments: 6,
      curveSegments: 10
    });
    g.translate(0, 0, -0.01);
    return g;
  }

  function bBand(T, n) {
    const c = BC.length;
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.BufferAttribute(new Float32Array(n * c * 3), 3));
    g.setAttribute('normal', new T.BufferAttribute(new Float32Array(n * c * 3), 3));
    g.setAttribute('uv', new T.BufferAttribute(new Float32Array(n * c * 2), 2));
    const idx = [];
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < c - 1; j++) {
        const a = i * c + j;
        idx.push(a, a + c, a + 1, a + 1, a + c, a + c + 1);
      }
    }
    g.setIndex(idx);
    return g;
  }

  function bEnv(T, r) {
    const sc = new T.Scene();
    sc.background = new T.Color(0.035, 0.035, 0.04);
    const g = new T.PlaneGeometry(1, 1);
    const ms = [];
    const p = (v, pos, sc2, rot = 0) => {
      const m = new T.MeshBasicMaterial({ color: new T.Color(v, v, v), side: T.DoubleSide });
      ms.push(m);
      const mk = new T.Mesh(g, m);
      mk.position.set(...pos);
      mk.scale.set(sc2[0], sc2[1], 1);
      mk.lookAt(0, 0, 0);
      mk.rotateZ(rot);
      sc.add(mk);
    };
    p(2.6, [0, 4.5, 8], [9, 4]);
    p(6, [-5.5, 0.5, 7], [0.9, 14]);
    p(4, [5, -0.5, 8], [0.6, 14]);
    p(3.5, [0, -1, 9], [24, 0.35], Math.PI / 3);
    p(2.5, [1, 2.5, 9], [24, 0.2], Math.PI / 3);
    p(1.4, [0, 6, -6], [12, 4]);
    p(0.5, [0, -7, 1], [16, 6]);
    p(0.9, [8, 0, -2], [4, 10]);

    const pm = new T.PMREMGenerator(r);
    const tg = pm.fromScene(sc, 0.035);
    pm.dispose();
    g.dispose();
    ms.forEach(m => m.dispose());
    return tg;
  }

  function bGrain(T) {
    const sz = 128;
    const cv = document.createElement('canvas');
    cv.width = cv.height = sz;
    const ct = cv.getContext('2d');
    const rn = seed(7);
    const fl = Float32Array.from({ length: sz * sz }, () => rn());
    const ht = (x, y) => {
      let s = 0;
      for (let j = -1; j <= 1; j++) {
        for (let i = -1; i <= 1; i++) {
          s += fl[((y + j + sz) % sz) * sz + ((x + i + sz) % sz)];
        }
      }
      return (s / 9) * 1.6;
    };
    const ig = ct.createImageData(sz, sz);
    for (let y = 0; y < sz; y++) {
      for (let x = 0; x < sz; x++) {
        const nx = ht(x - 1 + sz, y) - ht(x + 1, y);
        const ny = ht(x, y - 1 + sz) - ht(x, y + 1);
        const l = Math.hypot(nx, ny, 1);
        const i = (y * sz + x) * 4;
        ig.data[i] = (nx / l * 0.5 + 0.5) * 255;
        ig.data[i + 1] = (ny / l * 0.5 + 0.5) * 255;
        ig.data[i + 2] = (1 / l * 0.5 + 0.5) * 255;
        ig.data[i + 3] = 255;
      }
    }
    ct.putImageData(ig, 0, 0);
    const t = new T.CanvasTexture(cv);
    t.wrapS = t.wrapT = T.RepeatWrapping;
    t.repeat.set(5, 7);
    return t;
  }

  function bWeave(T) {
    const sz = 128, th = 8;
    const rn = seed(19);
    const fb = Float32Array.from({ length: sz * sz }, () => rn());
    const pf = f => Math.sqrt(Math.max(0, 1 - 4 * f * f));
    const ht = (x, y) => {
      const px = ((x % sz) + sz) % sz, py = ((y % sz) + sz) % sz;
      const u = (px / sz) * th, v = (py / sz) * th;
      const cu = Math.floor(u), cv = Math.floor(v);
      const fu = u - cu - 0.5, fv = v - cv - 0.5;
      const lf = (cu + cv) % 2 === 0;
      const wp = pf(fu) * (0.55 + 0.45 * Math.cos(fv * Math.PI * (lf ? 1 : 0.6)));
      const wf = pf(fv) * (0.55 + 0.45 * Math.cos(fu * Math.PI * (lf ? 0.6 : 1)));
      return (lf ? Math.max(wp, wf * 0.7) : Math.max(wf, wp * 0.7)) + fb[py * sz + px] * 0.08;
    };
    const d = new Uint8Array(sz * sz * 4);
    for (let y = 0; y < sz; y++) {
      for (let x = 0; x < sz; x++) {
        const nx = (ht(x - 1, y) - ht(x + 1, y)) * 1.6;
        const ny = (ht(x, y - 1) - ht(x, y + 1)) * 1.6;
        const l = Math.hypot(nx, ny, 1);
        const i = (y * sz + x) * 4;
        d[i] = (nx / l * 0.5 + 0.5) * 255;
        d[i + 1] = (ny / l * 0.5 + 0.5) * 255;
        d[i + 2] = (1 / l * 0.5 + 0.5) * 255;
        d[i + 3] = 255;
      }
    }
    const t = new T.DataTexture(d, sz, sz);
    t.wrapS = t.wrapT = T.RepeatWrapping;
    t.magFilter = T.LinearFilter;
    t.minFilter = T.LinearMipmapLinearFilter;
    t.generateMipmaps = true;
    t.needsUpdate = true;
    return t;
  }

  const dFit = (ct, im, w, h, ft) => {
    const s = (ft === 'contain' ? Math.min : Math.max)(w / im.width, h / im.height);
    ct.drawImage(im, (w - im.width * s) / 2, (h - im.height * s) / 2, im.width * s, im.height * s);
  };

  const pFace = (cv, im, co, ft) => {
    const ct = cv.getContext('2d');
    ct.fillStyle = css(co);
    ct.fillRect(0, 0, cv.width, cv.height);
    if (im) dFit(ct, im, cv.width, cv.height, ft);
  };

  const pStr = (cv, im, co) => {
    const ac = 192;
    const al = im ? Math.max(64, Math.round((im.width / im.height) * ac)) : ac * 2;
    cv.width = ac;
    cv.height = al;
    const ct = cv.getContext('2d');
    ct.fillStyle = css(co);
    ct.fillRect(0, 0, ac, al);
    if (im) {
      ct.save();
      ct.translate(ac, 0);
      ct.rotate(Math.PI / 2);
      ct.drawImage(im, 0, 0, al, ac);
      ct.restore();
      return al / ac;
    }
    const ik = lm(co) > 0.5 ? [0, 0, 0] : [1, 1, 1];
    ct.fillStyle = css(ik, 0.05);
    for (let y = 0; y < al; y += 4) ct.fillRect(0, y, ac, 1);
    ct.fillStyle = css(ik, 0.2);
    for (let y = 0; y < al; y += 14) {
      ct.fillRect(ac * 0.075, y, 2, 8);
      ct.fillRect(ac * 0.925 - 2, y, 2, 8);
    }
    return al / ac;
  };

  const mkSim = T => {
    const V = () => Array.from({ length: JN + 1 }, () => new T.Vector3());
    return {
      nodes: V(),
      prev: V(),
      vels: V(),
      lens: new Float64Array(JN),
      imp: new Float64Array(JN),
      rest: 1,
      anchor: new T.Vector3(),
      body: {
        pos: new T.Vector3(),
        pPos: new T.Vector3(),
        vel: new T.Vector3(),
        quat: new T.Quaternion(),
        pQuat: new T.Quaternion(),
        ang: new T.Vector3(),
        mass: 1,
        invI: new T.Vector3(1, 1, 1),
        hang: new T.Vector3()
      },
      grab: null,
      turn: 0,
      twist: 0,
      twR: 0,
      calm: 0
    };
  };

  const mkSc = T => ({
    a: new T.Vector3(),
    b: new T.Vector3(),
    c: new T.Vector3(),
    d: new T.Vector3(),
    e: new T.Vector3(),
    f: new T.Vector3(),
    g: new T.Vector3(),
    pin: new T.Vector3(),
    q: new T.Quaternion(),
    r: new T.Quaternion()
  });

  const aII = (sc, body, v, o) => {
    sc.r.copy(body.quat).invert();
    o.copy(v).applyQuaternion(sc.r);
    o.set(o.x * body.invI.x, o.y * body.invI.y, o.z * body.invI.z);
    return o.applyQuaternion(body.quat);
  };

  const rB = (q, w) => {
    const { x: qx, y: qy, z: qz, w: qw } = q;
    q.x += 0.5 * (w.x * qw + w.y * qz - w.z * qy);
    q.y += 0.5 * (w.y * qw + w.z * qx - w.x * qz);
    q.z += 0.5 * (w.z * qw + w.x * qy - w.y * qx);
    q.w += 0.5 * (-w.x * qx - w.y * qy - w.z * qz);
    q.normalize();
  };

  const bW = (sc, body, r, n) => {
    const rn = sc.c.crossVectors(r, n);
    return 1 / body.mass + rn.dot(aII(sc, body, rn, sc.d));
  };

  const pB = (sc, body, r, imp) => {
    body.pos.addScaledVector(imp, 1 / body.mass);
    rB(body.quat, aII(sc, body, sc.e.crossVectors(r, imp), sc.f));
  };

  const sSeg = (sc, sim, i, h, ph) => {
    const { nodes, body } = sim;
    const a = nodes[i];
    const wa = i === 0 ? 0 : NW;
    const last = i === JN - 1;
    const r = sc.g;
    let b = nodes[i + 1];
    if (last) {
      r.copy(body.hang).applyQuaternion(body.quat);
      b = sc.b.copy(body.pos).add(r);
    }
    const dl = sc.a.subVectors(b, a);
    const ln = dl.length();
    const st = ln - sim.rest;
    if (st <= 0 || ln < 1e-9) return;
    const nm = dl.divideScalar(ln);
    const wb = last ? bW(sc, body, r, nm) : NW;
    const rt = (ln - sim.lens[i]) / h;
    const tn = ph.hold * Math.tanh(ph.stiffness * st / ph.hold) + ph.spring * st + ph.bd * Math.max(0, rt);
    const rm = tn * h * h - sim.imp[i];
    if (rm <= 0) return;
    const lm = Math.min(st / (wa + wb), rm);
    sim.imp[i] += lm;
    if (wa) a.addScaledVector(nm, lm * wa);
    if (last) pB(sc, body, r, nm.multiplyScalar(-lm));
    else b.addScaledVector(nm, -lm * wb);
  };

  const pH = (T, sim, lay, intro) => {
    const { nodes, prev, vels, body, anchor } = sim;
    nodes[0].copy(anchor);
    for (let i = 1; i <= JN; i++) {
      nodes[i].copy(nodes[i - 1]);
      if (intro) nodes[i].x += sim.rest;
      else nodes[i].y -= sim.rest;
    }
    body.quat.identity();
    if (intro) body.quat.setFromAxisAngle(new T.Vector3(0, 0, 1), Math.PI / 2);
    body.hang.set(0, lay.hangY, 0);
    const of = new T.Vector3().copy(body.hang).applyQuaternion(body.quat);
    body.pos.copy(nodes[JN]).sub(of);
    body.pPos.copy(body.pos);
    body.pQuat.copy(body.quat);
    body.vel.set(0, 0, 0);
    body.ang.set(0, 0, 0);
    for (let i = 0; i <= JN; i++) {
      prev[i].copy(nodes[i]);
      vels[i].set(0, 0, 0);
    }
    sim.lens.fill(sim.rest);
    sim.turn = 0;
    sim.twist = 0;
    sim.twR = 0;
    sim.calm = 0;
  };

  const cS = (sim, lay, len) => {
    sim.rest = len / JN;
    const { width: W, height: H } = lay;
    const t = TH + BV * 2;
    sim.body.mass = 1;
    sim.body.invI.set(12 / (H * H + t * t), 12 / (W * W + t * t), 12 / (W * W + H * H));
    sim.body.hang.set(0, lay.hangY, 0);
  };

  const step = (T, sc, sim, dt, ph, tm) => {
    const steps = Math.max(1, Math.ceil(dt / MS - 1e-6));
    const h = dt / steps;
    const { nodes, prev, vels, body } = sim;
    const wX = ph.breeze * (Math.sin(tm * 0.53) * 0.7 + Math.sin(tm * 1.31 + 1.7) * 0.3) * 3;
    const wZ = ph.breeze * Math.sin(tm * 0.37 + 0.6) * 2;
    const nd = Math.exp(-ph.nd * h);
    const ld = Math.exp(-ph.ld * h);
    const ad = Math.exp(-ph.ad * h);

    for (let s = 0; s < steps; s++) {
      for (let i = 1; i < JN; i++) {
        const v = vels[i];
        v.y -= ph.gravity * h;
        v.x += wX * h;
        v.z += wZ * h;
        prev[i].copy(nodes[i]);
        nodes[i].addScaledVector(v, h);
      }
      body.pPos.copy(body.pos);
      body.pQuat.copy(body.quat);
      const q = body.quat;

      if (sim.grab) {
        const tn = sc.q.copy(sim.grab.rot).multiply(sc.r.copy(q).invert());
        if (tn.w < 0) tn.set(-tn.x, -tn.y, -tn.z, -tn.w);
        const tq = sc.a.set(tn.x, tn.y, tn.z).multiplyScalar(2 * ph.grip);
        tq.addScaledVector(body.ang, -ph.gd);
        body.ang.addScaledVector(aII(sc, body, tq, sc.b), h);
      }

      const up = sc.a.set(0, 1, 0).applyQuaternion(q);
      const fr = sc.b.set(-up.x * up.z, -up.y * up.z, 1 - up.z * up.z);
      if (fr.lengthSq() > 1e-3) {
        const fc = sc.d.set(0, 0, 1).applyQuaternion(q);
        const rw = Math.atan2(sc.e.crossVectors(fr, fc).dot(up), fr.dot(fc));
        let td = rw - sim.twR;
        if (td > Math.PI) td -= Math.PI * 2;
        else if (td < -Math.PI) td += Math.PI * 2;
        sim.twist += td;
        sim.twR = rw;
      }

      if (!sim.grab) {
        const sp = body.ang.dot(up);
        body.ang.addScaledVector(up, (ph.twist * (sim.turn - sim.twist) - ph.td * sp) * h);
      }

      body.vel.y -= ph.gravity * h;
      body.vel.x += wX * 0.35 * h;
      body.vel.z += wZ * 0.35 * h;
      body.pos.addScaledVector(body.vel, h);
      rB(body.quat, sc.f.copy(body.ang).multiplyScalar(h));
      sim.imp.fill(0);

      const pin = sc.pin;
      if (sim.grab) pin.lerpVectors(sim.grab.from, sim.grab.target, (s + 1) / steps);

      for (let it = 0; it < IT; it++) {
        for (let i = 0; i < JN; i++) sSeg(sc, sim, i, h, ph);
        if (sim.grab) {
          const gb = sim.grab;
          const r2 = sc.g.copy(gb.local).applyQuaternion(body.quat);
          const dl = sc.a.copy(pin).sub(body.pos).sub(r2);
          const di = dl.length();
          if (di > 1e-9) {
            const effDi = Math.min(di, 6.0);
            const nm = dl.divideScalar(di);
            pB(sc, body, r2, nm.multiplyScalar(effDi / bW(sc, body, r2, nm)));
          }
        }
      }

      for (let i = 1; i < JN; i++) {
        vels[i].subVectors(nodes[i], prev[i]).divideScalar(h).multiplyScalar(nd);
      }
      body.vel.subVectors(body.pos, body.pPos).divideScalar(h);

      const dq = sc.q.copy(body.pQuat).invert().premultiply(body.quat);
      body.ang.set(dq.x, dq.y, dq.z).multiplyScalar((2 / h) * (dq.w < 0 ? -1 : 1));

      const nm2 = sc.a.set(0, 0, 1).applyQuaternion(body.quat);
      const ac = body.vel.dot(nm2);
      const al = sc.b.copy(body.vel).addScaledVector(nm2, -ac);
      al.multiplyScalar(1 / (1 + ph.air * al.length() * h));
      body.vel.copy(al).addScaledVector(nm2, ac / (1 + ph.broad * Math.abs(ac) * h)).multiplyScalar(ld);
      body.ang.multiplyScalar(ad / (1 + ph.sa * body.ang.length() * h));

      if (body.vel.lengthSq() > 3600) body.vel.setLength(60);
      if (body.ang.lengthSq() > 1600) body.ang.setLength(40);

      nodes[JN].copy(body.hang).applyQuaternion(body.quat).add(body.pos);
      for (let i = 0; i < JN; i++) sim.lens[i] = nodes[i].distanceTo(nodes[i + 1]);
    }

    if (sim.grab) sim.grab.from.copy(sim.grab.target);
    let en = body.vel.lengthSq() + body.ang.lengthSq() * 0.3;
    for (let i = 1; i < JN; i++) en += vels[i].lengthSq() * 0.05;
    sim.calm = en < 2e-4 ? sim.calm + dt : 0;
  };

  G.initLanyard = function (container, opts) {
    const T = G.THREE;
    if (!T) {
      console.error('[Lanyard] THREE.js not found');
      return null;
    }

    // Clean up any existing lanyard instance on this container
    if (container && typeof container._lanyardDestroy === 'function') {
      try { container._lanyardDestroy(); } catch (_) {}
      container._lanyardDestroy = null;
    }

    const s = Object.assign({
      frontImage: null,
      backImage: null,
      strapImage: null,
      imageFit: 'cover',
      cardColor: '#ffffff',
      orientation: 'portrait',
      finish: 'glossy',
      cornerRadius: 0.28,
      size: 0.68,
      anchor: 'center',
      strapLength: 0.38,
      strapColor: '#1e3a8a',
      strapWidth: 0.55,
      metal: 'silver',
      gravity: 1,
      damping: 0.5,
      elasticity: 0.4,
      breeze: 0.35,
      showStrap: true,
      interactive: true,
      intro: true,
      fullscreen: true
    }, opts);

    let rdr;
    try {
      rdr = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch (e) {
      console.error('[Lanyard] WebGL error', e);
      return null;
    }

    rdr.setClearColor(0, 0);
    rdr.outputColorSpace = T.SRGBColorSpace || 2402;
    rdr.toneMapping = T.ACESFilmicToneMapping;
    rdr.toneMappingExposure = 1;

    // Viewport-wide canvas attached to body to prevent any clipping across the entire screen
    const cv = rdr.domElement;
    cv.className = 'lanyard-viewport-canvas';
    cv.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:90;touch-action:none;';
    cv.setAttribute('aria-hidden', 'true');

    // Remove any leftover canvas from a previous run
    const existingCv = document.querySelector('.lanyard-viewport-canvas');
    if (existingCv && existingCv.parentNode) {
      existingCv.parentNode.removeChild(existingCv);
    }
    document.body.appendChild(cv);

    // Make sure container placeholder in DOM does not capture pointer clicks
    if (container) {
      container.style.pointerEvents = 'none';
    }

    const ani = Math.min(8, rdr.capabilities.getMaxAnisotropy());
    const scene = new T.Scene(), env = bEnv(T, rdr);
    scene.environment = env.texture;

    const cam = new T.PerspectiveCamera(FV, 1, 0.1, 200);
    const kl = new T.DirectionalLight(0xffffff, 1.6);
    kl.position.set(-2.5, 4, 6);
    const fl = new T.DirectionalLight(0xffffff, 0.35);
    fl.position.set(3, -1, 4);
    scene.add(kl, fl);

    const iC = new Map(), imgs = { front: null, back: null, strap: null };
    const fCv = document.createElement('canvas'), bCv = document.createElement('canvas'), sCv = document.createElement('canvas');

    const mkT = c => {
      const t = new T.CanvasTexture(c);
      t.colorSpace = T.SRGBColorSpace || 2402;
      t.anisotropy = ani;
      return t;
    };

    const fT = mkT(fCv), bT = mkT(bCv), sT = mkT(sCv);
    sT.wrapS = T.ClampToEdgeWrapping;
    sT.wrapT = T.RepeatWrapping;

    const grn = bGrain(T), wv = bWeave(T);
    const fU = {
      foilStrength: { value: 0 },
      foilAspect: { value: 1.4 },
      foilKey: { value: new T.Vector3() },
      foilFill: { value: new T.Vector3() },
      foilTop: { value: new T.Vector3() }
    };

    const iF = sh => {
      Object.assign(sh.uniforms, fU);
      sh.fragmentShader = 'uniform float foilStrength;\n' +
        sh.fragmentShader.replace(
          '#include <opaque_fragment>',
          `if(foilStrength>0.0){float f=clamp(dot(normalize(normal),normalize(vViewPosition)),0.0,1.0);outgoingLight=mix(outgoingLight,outgoingLight*0.7+vec3(0.3,0.5,0.8)*f,foilStrength*0.5);}\n#include <opaque_fragment>`
        );
    };

    const fM = new T.MeshPhysicalMaterial({ map: fT, normalMap: grn, normalScale: new T.Vector2(0.06, 0.06) });
    const bM = new T.MeshPhysicalMaterial({ map: bT, normalMap: grn, normalScale: new T.Vector2(0.06, 0.06) });
    fM.onBeforeCompile = iF;
    bM.onBeforeCompile = iF;

    const eM = new T.MeshPhysicalMaterial();
    const mM = new T.MeshStandardMaterial({ metalness: 1 });
    const bnM = new T.MeshPhysicalMaterial({
      map: sT,
      normalMap: wv,
      normalScale: new T.Vector2(0.7, 0.7),
      roughness: 0.68,
      sheen: 1,
      sheenRoughness: 0.42,
      sheenColor: new T.Color(0.32, 0.32, 0.34),
      side: T.DoubleSide
    });

    const cGp = new T.Group();
    cGp.frustumCulled = false;
    const bMsh = new T.Mesh(undefined, eM);
    const fMsh = new T.Mesh(undefined, fM);
    const rkMsh = new T.Mesh(undefined, bM);
    const ring = new T.Mesh(new T.TorusGeometry(RR, RT, 18, 72), mM);
    ring.rotation.y = Math.PI / 2 - 0.7;

    // Invisible larger hit proxy to make clicking/dragging effortless
    const hitProxy = new T.Mesh(
      new T.PlaneGeometry(CZ.portrait[0] + 0.3, CZ.portrait[1] + 0.4),
      new T.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
    );
    hitProxy.position.set(0, 0, 0);

    cGp.add(bMsh, fMsh, rkMsh, ring, hitProxy);
    scene.add(cGp);

    const bnGeo = bBand(T, SP);
    const bn = new T.Mesh(bnGeo, bnM);
    bn.frustumCulled = false;
    scene.add(bn);

    const clGp = new T.Group();
    clGp.frustumCulled = false;
    const clM = new T.Mesh(bClamp(T, SR), mM);
    clM.position.y = ER + CH / 2 - 0.004;
    const eyl = new T.Mesh(new T.TorusGeometry(ER, 0.0105, 14, 40), mM);
    clGp.add(clM, eyl);
    scene.add(clGp);

    const sim = mkSim(T), sc = mkSc(T);
    const ctl = [], mth = new T.Vector3(), tck = new T.Vector3();
    const crv = new T.CatmullRomCurve3(ctl, false, 'centripetal');
    const vw = { width: 1, height: 1 };

    let lay = cLay('portrait', 0.28);
    let ap = {}, sW = SR, tR = 2, raf = 0, lt = performance.now(), tm = 0;
    let vs = true, alive = true, placed = false, hov = false, press = null, iT = 0;
    let lastRect = { left: -9999, top: -9999, width: 0, height: 0 };
    let unitPerPx = 0.010101;
    let strapRestLen = 1.082;

    const rm = window.matchMedia?.('(prefers-reduced-motion:reduce)').matches ?? false;

    // Calculate scale factor from container placeholder so card size and position match pixel-perfectly
    const updateScaleConstants = () => {
      const refW = Math.max(10, container?.clientWidth || 220);
      const refH = Math.max(10, container?.clientHeight || 350);
      const refAsp = refW / refH;
      let refVH = lay.height / cl(s.size, 0.15, 0.9);
      const mW = lay.width / 0.72;
      if (refVH * refAsp < mW) refVH = mW / refAsp;
      unitPerPx = refVH / refH;

      const cT_orig = refVH / 2 - refVH * mx(0.12, 0.42, cl(s.strapLength, 0, 1));
      const hT_orig = cT_orig + (lay.hangY - lay.height / 2);
      strapRestLen = (refVH / 2 + 0.2) - hT_orig;
    };

    const pFs = () => {
      const co = pCo(s.cardColor, [1, 1, 1]);
      const W = FW, H = Math.round(FW * lay.height / lay.width);
      if (fCv.width !== W || fCv.height !== H) {
        fCv.width = W;
        fCv.height = H;
        bCv.width = W;
        bCv.height = H;
        fT.dispose();
        bT.dispose();
      }
      pFace(fCv, imgs.front, co, s.imageFit);
      pFace(bCv, imgs.back || imgs.front, co, s.imageFit);
      fT.needsUpdate = true;
      bT.needsUpdate = true;
      start();
    };

    const rS = () => {
      tR = pStr(sCv, imgs.strap, pCo(s.strapColor, [0.07, 0.07, 0.07]));
      wv.repeat.set(2, 2 * tR);
      sT.dispose();
      sT.needsUpdate = true;
      start();
    };

    const updateAnchorPos = forceReset => {
      if (!container || !alive) return;
      const r = container.getBoundingClientRect();
      const isHidden = (r.width === 0 && r.height === 0) || getComputedStyle(container).display === 'none';

      if (isHidden) {
        if (cv.style.display !== 'none') cv.style.display = 'none';
        vs = false;
        return;
      } else {
        if (cv.style.display === 'none') {
          cv.style.display = 'block';
          vs = true;
          start();
        }
      }

      // Exact DOM anchor on the screen:
      const anchorPxX = r.left + r.width * (AN[s.anchor] ?? 0.5);
      const anchorPxY = r.top - (0.2 / unitPerPx);

      const targetX = (anchorPxX - vw.width / 2) * unitPerPx;
      const targetY = -(anchorPxY - vw.height / 2) * unitPerPx;

      if (forceReset || !placed) {
        sim.anchor.set(targetX, targetY, 0);
        cS(sim, lay, strapRestLen);
        pH(T, sim, lay, s.intro && !rm);
        placed = true;
      } else {
        const dx = targetX - sim.anchor.x;
        const dy = targetY - sim.anchor.y;
        if (Math.abs(dx) > 0.0001 || Math.abs(dy) > 0.0001) {
          sim.anchor.set(targetX, targetY, 0);
          for (let i = 0; i <= JN; i++) {
            sim.nodes[i].x += dx;
            sim.nodes[i].y += dy;
            sim.prev[i].x += dx;
            sim.prev[i].y += dy;
          }
          sim.body.pos.x += dx;
          sim.body.pos.y += dy;
          sim.body.pPos.x += dx;
          sim.body.pPos.y += dy;
          start();
        }
      }
      lastRect = { left: r.left, top: r.top, width: r.width, height: r.height };
    };

    const fV = () => {
      vw.width = Math.max(1, window.innerWidth || document.documentElement.clientWidth || 1024);
      vw.height = Math.max(1, window.innerHeight || document.documentElement.clientHeight || 768);
      updateScaleConstants();

      const asp = vw.width / vw.height;
      const vH = vw.height * unitPerPx;

      cam.aspect = asp;
      cam.position.set(0, 0, (vH / 2) / Math.tan((FV * Math.PI) / 360));
      cam.lookAt(0, 0, 0);
      cam.updateProjectionMatrix();
      cam.updateMatrixWorld();

      fU.foilKey.value.set(-2.5, 4, 6).normalize().transformDirection(cam.matrixWorldInverse);
      fU.foilFill.value.set(3, -1, 4).normalize().transformDirection(cam.matrixWorldInverse);
      fU.foilTop.value.set(0.5, 4.5, 8).normalize().transformDirection(cam.matrixWorldInverse);

      updateAnchorPos(!placed);
    };

    const apply = () => {
      bn.visible = clGp.visible = s.showStrap !== false;
      const lk = `${s.orientation}|${s.cornerRadius}`;
      if (lk !== ap.lk) {
        lay = cLay(s.orientation, s.cornerRadius);
        const g = bCard(T, lay);
        bMsh.geometry?.dispose();
        fMsh.geometry?.dispose();
        rkMsh.geometry?.dispose();
        bMsh.geometry = g.body;
        fMsh.geometry = g.face;
        rkMsh.geometry = g.face.clone();
        fMsh.position.z = TH / 2 + BV + 0.0006;
        rkMsh.rotation.y = Math.PI;
        rkMsh.position.z = -(TH / 2 + BV + 0.0006);
        ring.position.set(0, lay.ringY, 0);
        hitProxy.geometry?.dispose();
        hitProxy.geometry = new T.PlaneGeometry(lay.width + 0.3, lay.height + 0.4);
        ap.fk = '';
      }

      const fk = `${lk}|${s.size}|${s.anchor}|${s.strapLength}|${vw.width}|${vw.height}`;
      if (fk !== ap.fk) {
        fV();
      }

      const ik = `${s.frontImage}|${s.backImage}|${s.strapImage}`;
      if (ik !== ap.ik) {
        const tk = ++iT;
        Promise.all([li(iC, s.frontImage), li(iC, s.backImage), li(iC, s.strapImage)]).then(([fr, bk, st]) => {
          if (!alive || tk !== iT) return;
          imgs.front = fr;
          imgs.back = bk;
          imgs.strap = st;
          pFs();
          rS();
        });
      }

      const fk2 = `${lk}|${s.cardColor}|${s.imageFit}`;
      if (fk2 !== ap.fk2) pFs();
      if (s.strapColor !== ap.sC) rS();

      const fn = FIN[s.finish] || FIN.glossy;
      const co = pCo(s.cardColor, [1, 1, 1]);
      [fM, bM].forEach(m => {
        m.roughness = fn.roughness;
        m.metalness = fn.metalness;
        m.clearcoat = fn.clearcoat;
        m.clearcoatRoughness = fn.clearcoatRoughness;
        m.anisotropy = fn.anisotropy;
      });
      fU.foilStrength.value = fn.foil;
      fU.foilAspect.value = lay.height / lay.width;
      eM.color.setRGB(co[0] * 0.92, co[1] * 0.92, co[2] * 0.92, T.SRGBColorSpace || 2402);
      eM.roughness = Math.min(fn.roughness, 0.35);
      eM.metalness = fn.metalness;
      eM.clearcoat = 1;
      eM.clearcoatRoughness = 0.08;

      const ml = MT[s.metal] || MT.silver;
      mM.color.set(ml.color);
      mM.roughness = ml.roughness;
      sW = SR * cl(s.strapWidth, 0.4, 2);
      if (sW !== ap.sW) {
        clM.geometry?.dispose();
        clM.geometry = bClamp(T, sW);
      }

      ap = { lk, fk, ik, fk2, sC: s.strapColor, sW };
      start();
    };

    const pts = Array.from({ length: SP }, () => new T.Vector3());
    const sds = Array.from({ length: SP }, () => new T.Vector3());
    const bds = BB.map(a => [Math.cos(a), Math.sin(a)]);
    const wk = {
      tan: new T.Vector3(),
      toC: new T.Vector3(),
      basis: new T.Matrix4(),
      up: new T.Vector3(),
      across: new T.Vector3(),
      facing: new T.Vector3(),
      end: new T.Vector3()
    };

    const uBand = () => {
      const hng = sim.nodes[JN];
      const reach = ER + CH + 0.05;
      let guide = JN - 1;
      while (guide > 0 && sim.nodes[guide].distanceTo(hng) < reach * 1.1) guide--;
      const ax = wk.up.subVectors(sim.nodes[guide], hng);
      if (ax.lengthSq() < 1e-8) ax.set(0, 1, 0).applyQuaternion(sim.body.quat);
      ax.normalize();

      mth.copy(hng).addScaledVector(ax, reach);
      tck.copy(hng).addScaledVector(ax, ER + CH * 0.35);
      ctl.length = 0;
      for (let i = 0; i <= guide; i++) ctl.push(sim.nodes[i]);
      ctl.push(mth, tck);
      crv.updateArcLengths();
      for (let i = 0; i < SP; i++) crv.getPointAt(i / (SP - 1), pts[i]);

      const ln = crv.getLength();
      const hd = 1 - mth.distanceTo(tck) / Math.max(ln, 0.001);
      const pos = bnGeo.getAttribute('position');
      const nor = bnGeo.getAttribute('normal');
      const uv = bnGeo.getAttribute('uv');
      const cols = BC.length;
      const rL = sim.rest * JN;
      const rps = rL / (sW * tR);
      const W = sW / Math.pow(Math.max(1, ln / Math.max(rL, 0.001)), 0.35);
      const { tan, toC, across, facing } = wk;

      for (let i = 0; i < SP; i++) {
        tan.subVectors(pts[Math.min(SP - 1, i + 1)], pts[Math.max(0, i - 1)]);
        if (tan.lengthSq() < 1e-12) tan.set(0, -1, 0);
        tan.normalize();

        toC.subVectors(cam.position, pts[i]).normalize();
        const sd = sds[i].crossVectors(toC, tan);
        if (sd.lengthSq() < 1e-10) sd.copy(i > 0 ? sds[i - 1] : sc.a.set(1, 0, 0));
        sd.normalize();
        if (i > 0 && sd.dot(sds[i - 1]) < 0) sd.negate();

        const ag = -sim.twist * Math.pow(Math.min(1, (i / (SP - 1)) / hd), 1.3);
        facing.crossVectors(tan, sd);
        across.copy(sd).multiplyScalar(Math.cos(ag)).addScaledVector(facing, Math.sin(ag));
        facing.crossVectors(tan, across);

        const p = pts[i];
        const v = (1 - i / (SP - 1)) * rps;
        for (let c = 0; c < cols; c++) {
          const k = i * cols + c;
          const of = (BC[c] - 0.5) * W;
          const [bc, bs] = bds[c];
          pos.setXYZ(k, p.x + across.x * of, p.y + across.y * of, p.z + across.z * of);
          nor.setXYZ(k, facing.x * bc + across.x * bs, facing.y * bc + across.y * bs, facing.z * bc + across.z * bs);
          uv.setXY(k, BC[c], v);
        }
      }

      wk.end.copy(across);
      pos.needsUpdate = true;
      nor.needsUpdate = true;
      uv.needsUpdate = true;

      across.copy(wk.end).addScaledVector(ax, -wk.end.dot(ax)).normalize();
      facing.crossVectors(across, ax).normalize();
      wk.basis.makeBasis(across, ax, facing);
      clGp.quaternion.setFromRotationMatrix(wk.basis);
      clGp.position.copy(hng);
    };

    const gPh = () => {
      const g = 40 * cl(s.gravity, 0, 3);
      const w = Math.max(g, 20);
      const sp = cl(s.elasticity, 0, 1);
      const se = cl(s.damping, 0, 1);
      return {
        gravity: g,
        hold: w * mx(2.2, 5.5, sp),
        stiffness: w * 10 * JN,
        spring: w * mx(0.1, 0.4, sp) * JN,
        bd: w * mx(0.3, 0.08, sp) * JN,
        ld: 0.25 * Math.pow(16, se),
        ad: 0.5 * Math.pow(12, se),
        nd: 2,
        air: 0.15,
        broad: 0.5,
        sa: 0.03,
        twist: 30,
        td: 3,
        grip: 40,
        gd: 6,
        breeze: rm ? 0 : cl(s.breeze, 0, 1)
      };
    };

    const render = () => {
      cGp.position.copy(sim.body.pos);
      cGp.quaternion.copy(sim.body.quat);
      uBand();
      rdr.render(scene, cam);
    };

    const tick = now => {
      raf = 0;
      if (!alive) return;

      // Track DOM position to follow page scroll, resize, or layout shifts seamlessly
      if (container) {
        const r = container.getBoundingClientRect();
        if (
          Math.abs(r.left - lastRect.left) > 0.5 ||
          Math.abs(r.top - lastRect.top) > 0.5 ||
          Math.abs(r.width - lastRect.width) > 0.5 ||
          Math.abs(r.height - lastRect.height) > 0.5
        ) {
          updateAnchorPos(false);
        }
      }

      const dt = Math.min(1 / 30, Math.max(1 / 240, (now - lt) / 1000));
      lt = now;
      tm += dt;
      const ph = gPh();
      step(T, sc, sim, dt, ph, tm);

      const b = sim.body;
      if (!Number.isFinite(b.pos.x + b.pos.y + b.pos.z + b.quat.w)) {
        sim.grab = null;
        pH(T, sim, lay, false);
      }

      render();

      const rst = sim.calm > 1.2 && !sim.grab && ph.breeze === 0;
      if (vs && !rst) {
        raf = requestAnimationFrame(tick);
      }
    };

    const start = () => {
      if (raf || !vs || !alive) return;
      sim.calm = 0;
      lt = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const ray = new T.Raycaster(), ptr = new T.Vector2();

    const toP = ev => {
      const clientX = ev.clientX !== undefined ? ev.clientX : (ev.touches && ev.touches[0] ? ev.touches[0].clientX : 0);
      const clientY = ev.clientY !== undefined ? ev.clientY : (ev.touches && ev.touches[0] ? ev.touches[0].clientY : 0);
      ptr.set((clientX / vw.width) * 2 - 1, -(clientY / vw.height) * 2 + 1);
      ray.setFromCamera(ptr, cam);
    };

    const pick = () => {
      cGp.position.copy(sim.body.pos);
      cGp.quaternion.copy(sim.body.quat);
      cGp.updateMatrixWorld(true);
      clGp.updateMatrixWorld(true);
      const hits = ray.intersectObjects([bMsh, fMsh, rkMsh, ring, clM, eyl, hitProxy], false);
      return hits[0] || null;
    };

    const setCursor = v => {
      document.body.style.cursor = v;
      cv.style.cursor = v;
    };

    const flip = pt => {
      const b = sim.body;
      const up = sc.a.set(0, 1, 0).applyQuaternion(b.quat);
      let d = sim.turn > 0 ? -1 : 1;
      if (sim.turn === 0) {
        const aw = sc.c.subVectors(pt, cam.position).normalize();
        d = sc.b.subVectors(pt, b.pos).cross(aw).dot(up) < 0 ? -1 : 1;
      }
      sim.turn = sim.turn === 0 ? Math.PI * d : 0;
      b.ang.addScaledVector(up, FS * d);
    };

    const onDragMove = ev => {
      if (!sim.grab) return;
      toP(ev);
      if (press) {
        const clientX = ev.clientX !== undefined ? ev.clientX : (ev.touches && ev.touches[0] ? ev.touches[0].clientX : 0);
        const clientY = ev.clientY !== undefined ? ev.clientY : (ev.touches && ev.touches[0] ? ev.touches[0].clientY : 0);
        if (Math.hypot(clientX - press.x, clientY - press.y) > 6) {
          press = null;
        }
      }
      ray.ray.at(sim.grab.reach, sim.grab.target);
      start();
    };

    const onDragEnd = ev => {
      if (!sim.grab) return;
      sim.grab = null;

      if (press && performance.now() - press.time < 450) {
        flip(press.pt);
      }
      press = null;

      window.removeEventListener('pointermove', onDragMove, true);
      window.removeEventListener('pointerup', onDragEnd, true);
      window.removeEventListener('pointercancel', onDragEnd, true);
      window.removeEventListener('touchmove', onDragMove, { capture: true });
      window.removeEventListener('touchend', onDragEnd, { capture: true });
      window.removeEventListener('touchcancel', onDragEnd, { capture: true });

      setCursor('');
      start();
    };

    const startDrag = (ev, h) => {
      if (sim.grab || !s.interactive) return;
      toP(ev);
      if (!h) h = pick();
      if (!h) return;

      const clientX = ev.clientX !== undefined ? ev.clientX : (ev.touches && ev.touches[0] ? ev.touches[0].clientX : 0);
      const clientY = ev.clientY !== undefined ? ev.clientY : (ev.touches && ev.touches[0] ? ev.touches[0].clientY : 0);

      sim.grab = {
        local: h.point.clone().sub(sim.body.pos).applyQuaternion(sim.body.quat.clone().invert()),
        rot: sim.body.quat.clone(),
        reach: h.distance,
        from: h.point.clone(),
        target: h.point.clone()
      };
      press = { x: clientX, y: clientY, time: performance.now(), pt: h.point.clone() };

      setCursor('grabbing');
      window.addEventListener('pointermove', onDragMove, true);
      window.addEventListener('pointerup', onDragEnd, true);
      window.addEventListener('pointercancel', onDragEnd, true);
      window.addEventListener('touchmove', onDragMove, { capture: true, passive: false });
      window.addEventListener('touchend', onDragEnd, { capture: true });
      window.addEventListener('touchcancel', onDragEnd, { capture: true });

      if (ev.cancelable) ev.preventDefault();
      ev.stopPropagation();
      start();
    };

    const onGlobalPointerDown = ev => {
      if (!s.interactive || (ev.button !== undefined && ev.button > 0) || sim.grab) return;
      toP(ev);
      const h = pick();
      if (h) {
        startDrag(ev, h);
      }
    };

    const onHoverCheck = ev => {
      if (!s.interactive || sim.grab) return;
      if (ev.pointerType === 'touch') return;
      toP(ev);
      const h = pick();
      const isHov = !!h;
      if (isHov !== hov) {
        hov = isHov;
        setCursor(isHov ? 'grab' : '');
      }
    };

    // Global capture listener ensures clicking card is caught immediately
    window.addEventListener('pointerdown', onGlobalPointerDown, true);
    window.addEventListener('pointermove', onHoverCheck, { passive: true });
    window.addEventListener('touchstart', onGlobalPointerDown, { passive: false });

    const onScroll = () => {
      updateAnchorPos(false);
      start();
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const onResize = () => {
      vw.width = Math.max(1, window.innerWidth || document.documentElement.clientWidth);
      vw.height = Math.max(1, window.innerHeight || document.documentElement.clientHeight);
      rdr.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      rdr.setSize(vw.width, vw.height, false);
      apply();
      render();
    };
    window.addEventListener('resize', onResize);

    const ro = new ResizeObserver(() => {
      updateAnchorPos(false);
    });
    if (container) ro.observe(container);

    const io = new IntersectionObserver(([e]) => {
      vs = e.isIntersecting;
      if (vs) start();
    });
    if (container) io.observe(container);

    const onV = () => {
      if (!document.hidden) start();
    };
    document.addEventListener('visibilitychange', onV);

    // Initial setup: apply() creates 3D geometries and loads textures
    onResize();

    const destroyFn = function destroy() {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointerdown', onGlobalPointerDown, true);
      window.removeEventListener('pointermove', onHoverCheck);
      window.removeEventListener('pointermove', onDragMove, true);
      window.removeEventListener('pointerup', onDragEnd, true);
      window.removeEventListener('pointercancel', onDragEnd, true);
      window.removeEventListener('touchstart', onGlobalPointerDown);
      window.removeEventListener('touchmove', onDragMove, { capture: true });
      window.removeEventListener('touchend', onDragEnd, { capture: true });
      window.removeEventListener('touchcancel', onDragEnd, { capture: true });
      document.removeEventListener('visibilitychange', onV);

      ro.disconnect();
      io.disconnect();

      [bMsh, fMsh, rkMsh, ring, clM, eyl, bn, hitProxy].forEach(m => {
        try { m?.geometry?.dispose?.(); } catch (_) {}
      });
      [fM, bM, eM, mM, bnM].forEach(m => {
        try { m?.dispose?.(); } catch (_) {}
      });
      [fT, bT, sT, grn, wv].forEach(t => {
        try { t?.dispose?.(); } catch (_) {}
      });
      try { env?.dispose?.(); } catch (_) {}
      try { rdr?.dispose?.(); } catch (_) {}

      if (cv.parentNode) cv.parentNode.removeChild(cv);
      if (container && container._lanyardDestroy === destroyFn) {
        container._lanyardDestroy = null;
      }
      setCursor('');
    };

    if (container) {
      container._lanyardDestroy = destroyFn;
    }

    return destroyFn;
  };
})(window);
