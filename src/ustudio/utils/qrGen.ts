// @ts-nocheck -- ported as-is from the original AI Studio project
/* Gerador de QR Code embutido (modo byte, correção M, versões 1–10). Sem dependências. */
export const QRGen = (() => {
  const ECC = [0, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26]; // palavras de correção por bloco (nível M)
  const BLK = [0, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5]; // número de blocos (nível M)
  const mul = (x: number, y: number) => {
    let z = 0;
    for (let i = 7; i >= 0; i--) {
      z = (z << 1) ^ ((z >>> 7) * 0x11d);
      z ^= ((y >>> i) & 1) * x;
    }
    return z;
  };
  const divisor = (d: number) => {
    const r = Array(d - 1)
      .fill(0)
      .concat([1]);
    let root = 1;
    for (let i = 0; i < d; i++) {
      for (let j = 0; j < r.length; j++) {
        r[j] = mul(r[j], root);
        if (j + 1 < r.length) r[j] ^= r[j + 1];
      }
      root = mul(root, 2);
    }
    return r;
  };
  const remainder = (data: number[], div: number[]) => {
    const r = div.map(() => 0);
    for (const b of data) {
      const f = b ^ (r.shift() ?? 0);
      r.push(0);
      div.forEach((c, i) => (r[i] ^= mul(c, f)));
    }
    return r;
  };
  const rawModules = (v: number) => {
    let r = (16 * v + 128) * v + 64;
    if (v >= 2) {
      const n = Math.floor(v / 7) + 2;
      r -= (25 * n - 10) * n - 55;
      if (v >= 7) r -= 36;
    }
    return r;
  };
  const dataCap = (v: number) => Math.floor(rawModules(v) / 8) - ECC[v] * BLK[v];

  function encode(text: string) {
    const bytes = Array.from(new TextEncoder().encode(text));
    let ver = 1;
    while (ver <= 10 && dataCap(ver) < bytes.length + (ver < 10 ? 2 : 3)) ver++;
    if (ver > 10) throw new Error('Texto longo demais para o QR');
    const cap = dataCap(ver),
      bits: number[] = [];
    const put = (val: number, len: number) => {
      for (let i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1);
    };
    put(4, 4);
    put(bytes.length, ver < 10 ? 8 : 16);
    bytes.forEach((b) => put(b, 8));
    put(0, Math.min(4, cap * 8 - bits.length));
    put(0, (8 - (bits.length % 8)) % 8);
    for (let p = 0xec; bits.length < cap * 8; p ^= 0xec ^ 0x11) put(p, 8);
    const data: number[] = [];
    for (let i = 0; i < bits.length; i += 8) data.push(parseInt(bits.slice(i, i + 8).join(''), 2));

    // blocos + Reed-Solomon + intercalação
    const nb = BLK[ver],
      eccLen = ECC[ver],
      raw = Math.floor(rawModules(ver) / 8);
    const shortN = nb - (raw % nb),
      shortLen = Math.floor(raw / nb),
      div = divisor(eccLen),
      blocks: number[][] = [];
    for (let i = 0, k = 0; i < nb; i++) {
      const dat = data.slice(k, k + shortLen - eccLen + (i < shortN ? 0 : 1));
      k += dat.length;
      const ecc = remainder(dat, div);
      if (i < shortN) dat.push(0);
      blocks.push(dat.concat(ecc));
    }
    const out: number[] = [];
    for (let i = 0; i < blocks[0].length; i++) {
      blocks.forEach((b, j) => {
        if (i !== shortLen - eccLen || j >= shortN) out.push(b[i]);
      });
    }

    // matriz
    const size = ver * 4 + 17,
      M: boolean[][] = [],
      F: boolean[][] = [];
    for (let i = 0; i < size; i++) {
      M.push(Array(size).fill(false));
      F.push(Array(size).fill(false));
    }
    const set = (x: number, y: number, v: boolean) => {
      M[y][x] = v;
      F[y][x] = true;
    };
    for (let i = 0; i < size; i++) {
      set(6, i, i % 2 === 0);
      set(i, 6, i % 2 === 0);
    }
    const finder = (x: number, y: number) => {
      for (let dy = -4; dy <= 4; dy++)
        for (let dx = -4; dx <= 4; dx++) {
          const d = Math.max(Math.abs(dx), Math.abs(dy)),
            xx = x + dx,
            yy = y + dy;
          if (xx >= 0 && xx < size && yy >= 0 && yy < size) set(xx, yy, d !== 2 && d !== 4);
        }
    };
    finder(3, 3);
    finder(size - 4, 3);
    finder(3, size - 4);
    if (ver > 1) {
      const n = Math.floor(ver / 7) + 2,
        step = Math.ceil((ver * 4 + 4) / (n * 2 - 2)) * 2,
        pos = [6];
      for (let p = size - 7; pos.length < n; p -= step) pos.splice(1, 0, p);
      pos.forEach((y, i) =>
        pos.forEach((x, j) => {
          if ((i === 0 && j === 0) || (i === 0 && j === n - 1) || (i === n - 1 && j === 0)) return;
          for (let dy = -2; dy <= 2; dy++)
            for (let dx = -2; dx <= 2; dx++)
              set(x + dx, y + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
        })
      );
    }
    const formatBits = (mask: number) => {
      const d = (0 << 3) | mask;
      let r = d;
      for (let i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537);
      const b = ((d << 10) | r) ^ 0x5412,
        g = (i: number) => ((b >>> i) & 1) !== 0;
      for (let i = 0; i <= 5; i++) set(8, i, g(i));
      set(8, 7, g(6));
      set(8, 8, g(7));
      set(7, 8, g(8));
      for (let i = 9; i < 15; i++) set(14 - i, 8, g(i));
      for (let i = 0; i < 8; i++) set(size - 1 - i, 8, g(i));
      for (let i = 8; i < 15; i++) set(8, size - 15 + i, g(i));
      set(8, size - 8, true);
    };
    formatBits(0);
    if (ver >= 7) {
      let r = ver;
      for (let i = 0; i < 12; i++) r = (r << 1) ^ ((r >>> 11) * 0x1f25);
      const b = (ver << 12) | r;
      for (let i = 0; i < 18; i++) {
        const v = ((b >>> i) & 1) !== 0,
          a = size - 11 + (i % 3),
          c = Math.floor(i / 3);
        set(a, c, v);
        set(c, a, v);
      }
    }
    // dados em zigue-zague
    let bi = 0;
    for (let right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (let vert = 0; vert < size; vert++)
        for (let j = 0; j < 2; j++) {
          const x = right - j,
            up = ((right + 1) & 2) === 0,
            y = up ? size - 1 - vert : vert;
          if (!F[y][x] && bi < out.length * 8) {
            M[y][x] = ((out[bi >>> 3] >>> (7 - (bi & 7))) & 1) !== 0;
            bi++;
          }
        }
    }
    // máscara (escolhe a de menor penalidade)
    const maskFn = [
      (x: number, y: number) => (x + y) % 2 === 0,
      (x: number, y: number) => y % 2 === 0,
      (x: number, y: number) => x % 3 === 0,
      (x: number, y: number) => (x + y) % 3 === 0,
      (x: number, y: number) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
      (x: number, y: number) => ((x * y) % 2) + ((x * y) % 3) === 0,
      (x: number, y: number) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
      (x: number, y: number) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
    ];
    const apply = (m: number) => {
      for (let y = 0; y < size; y++)
        for (let x = 0; x < size; x++) if (!F[y][x] && maskFn[m](x, y)) M[y][x] = !M[y][x];
    };
    const penalty = () => {
      let p = 0,
        dark = 0;
      for (let y = 0; y < size; y++)
        for (const horiz of [true, false]) {
          let run = 1;
          for (let i = 1; i < size; i++) {
            const a = horiz ? M[y][i] : M[i][y],
              b = horiz ? M[y][i - 1] : M[i - 1][y];
            if (a === b) {
              run++;
              if (run === 5) p += 3;
              else if (run > 5) p++;
            } else run = 1;
          }
        }
      for (let y = 0; y < size - 1; y++)
        for (let x = 0; x < size - 1; x++) {
          const c = M[y][x];
          if (c === M[y][x + 1] && c === M[y + 1][x] && c === M[y + 1][x + 1]) p += 3;
        }
      for (const r of M)
        for (const c of r) if (c) dark++;
      p += Math.floor(Math.abs(dark * 20 - size * size * 10) / (size * size)) * 10;
      return p;
    };
    let best = 0,
      bestP = Infinity;
    for (let m = 0; m < 8; m++) {
      apply(m);
      formatBits(m);
      const p = penalty();
      if (p < bestP) {
        bestP = p;
        best = m;
      }
      apply(m);
    }
    apply(best);
    formatBits(best);
    return M;
  }

  /* Devolve um <svg> com zona silenciosa de 4 módulos */
  function svg(text: string) {
    const M = encode(text),
      n = M.length,
      q = 4;
    let d = '';
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++) if (M[y][x]) d += `M${x + q} ${y + q}h1v1h-1z`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n + q * 2} ${
      n + q * 2
    }" shape-rendering="crispEdges" role="img" aria-label="QR code Pix"><rect width="100%" height="100%" fill="#fff"/><path d="${d}" fill="#000"/></svg>`;
  }
  return { encode, svg };
})();
