export type HSL = { h: number; s: number; l: number };
export type RGB = { r: number; g: number; b: number };

/**
 * HEXのカラーコードをHSLに変換します。
 * @param hex - HEXのカラーコード（例: "#ff5733" または "#f53"）。
 * @returns HSLオブジェクト（h: 色相, s: 彩度, l: 明度）。
 */
export function hexToHsl(hex: string): HSL {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3)
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");

  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * HSL値をRGB値に変換します。
 * @param param0 - HSLオブジェクト（h: 色相, s: 彩度, l: 明度）。
 * @returns RGBオブジェクト（r: 赤, g: 緑, b: 青）。
 */
export function hslToRgb({ h, s, l }: HSL): RGB {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color);
  };
  return { r: f(0), g: f(8), b: f(4) };
}

export function rgbToHex({ r, g, b }: RGB): string {
  const toHex = (c: number) => c.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * HEX文字列をRGB値に変換します。
 * @param hex - HEXのカラーコード（例: "#ff5733" または "#f53"）。
 * @returns RGBオブジェクト（r: 赤, g: 緑, b: 青）。
 */
export function hexToRgbStruct(hex: string): RGB {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3)
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  return {
    r: parseInt(hex.substring(0, 2), 16),
    g: parseInt(hex.substring(2, 4), 16),
    b: parseInt(hex.substring(4, 6), 16),
  };
}

/**
 * 個体の型定義
 *
 * colors: 個体が持つHSLカラーの配列
 * fitness: 個体の適合度（基準色との調和の度合いを数値化したもの）
 */
export type Individual = {
    colors: HSL[];
    fitness: number
};

/**
 * 色進化クラス
 *
 * 遺伝的アルゴリズムを使用して、与えられた基準色に対して調和の取れたカラーパレットを生成します。
 */
export class ColorEvolver {

  // 個体の集団
  private population: Individual[] = [];
  // 個体の数
  private readonly popSize = 50;

  /**
   * コンストラクタ
   * @param baseColor - 基準色。
   */
  constructor(private baseColor: HSL) {}

  /**
   * 色の進化を実行します。
   *
   * @param generations - 進化させる世代数（デフォルトは100）。
   * @returns 最も適合度の高い個体。
   */
  public evolve(generations: number = 100): Individual {
    this.initPopulation();
    for (let i = 0; i < generations; i++) {
      this.evaluateFitness();
      this.population.sort((a, b) => b.fitness - a.fitness);

      const newPopulation: Individual[] = [
        this.cloneIndividual(this.population[0]),
        this.cloneIndividual(this.population[1]),
      ];

      while (newPopulation.length < this.popSize) {
        const parentA = this.tournamentSelection();
        const parentB = this.tournamentSelection();
        const child = this.crossover(parentA, parentB);
        this.mutate(child);
        newPopulation.push(child);
      }
      this.population = newPopulation;
    }
    this.evaluateFitness();
    this.population.sort((a, b) => b.fitness - a.fitness);
    return this.population[0];
  }

  /**
   * 初期集団をランダムに生成します。
   *
   * 各個体は、基準色に対して調和の取れた4つのランダムなHSLカラーを持ちます。
   */
  private initPopulation() {
    this.population = Array.from({ length: this.popSize }, () => ({
      colors: [
        this.randomHSL(),
        this.randomHSL(),
        this.randomHSL(),
        this.randomHSL(),
      ],
      fitness: 0,
    }));
  }

  /**
   * 個体の適合度を評価します。
   *
   * 適合度は、個体の色が基準色とどれだけ調和しているかを数値化します。
   * 色相の差が180度に近いほど高いスコアを与え、彩度と明度の差が小さいほどスコアを減点します。
   */
  private evaluateFitness() {
    this.population.forEach((ind) => {
      let score = 0;
      const allColors = [this.baseColor, ...ind.colors];
      const hues = allColors.map((c) => c.h);

      for (let i = 0; i < hues.length; i++) {
        for (let j = i + 1; j < hues.length; j++) {
          const diff = Math.min(
            Math.abs(hues[i] - hues[j]),
            360 - Math.abs(hues[i] - hues[j]),
          );
          if (Math.abs(diff - 180) < 15) score += 50;
          else if (Math.abs(diff - 120) < 15) score += 40;
          else if (Math.abs(diff - 150) < 15) score += 30;
          else if (diff < 15) score -= 20;
        }
      }

      ind.colors.forEach((c) => {
        score -= Math.abs(c.s - this.baseColor.s) * 0.4;
        score -= Math.abs(c.l - this.baseColor.l) * 0.4;
      });

      ind.fitness = score;
    });
  }

  /**
   * トーナメント選択を行います。
   * @returns 選択された個体。
   */
  private tournamentSelection(): Individual {
    let best = this.population[Math.floor(Math.random() * this.popSize)];
    for (let i = 1; i < 3; i++) {
      const comp = this.population[Math.floor(Math.random() * this.popSize)];
      if (comp.fitness > best.fitness) best = comp;
    }
    return best;
  }

  /**
   * 個体同士の交叉を行います。
   *
   * @param pA - 親個体A。
   * @param pB - 親個体B。
   * @returns 交叉された子個体。
   */
  private crossover(pA: Individual, pB: Individual): Individual {
    const childColors: HSL[] = [];
    for (let i = 0; i < 4; i++) {
      childColors.push(
        Math.random() < 0.5 ? { ...pA.colors[i] } : { ...pB.colors[i] },
      );
    }
    return { colors: childColors, fitness: 0 };
  }

  /**
   * 個体に対して突然変異を行います。
   * @param ind - 個体。
   */
  private mutate(ind: Individual) {
    ind.colors.forEach((c) => {
      if (Math.random() < 0.15) {
        c.h = (c.h + (Math.random() * 60 - 30) + 360) % 360;
      }
      if (Math.random() < 0.15) {
        c.s = Math.max(0, Math.min(100, c.s + (Math.random() * 20 - 10)));
      }
    });
  }

  /**
   * ランダムなHSL値を生成します。
   * @returns ランダムなHSL値。
   */
  private randomHSL(): HSL {
    return {
      h: Math.floor(Math.random() * 360),
      s: Math.floor(Math.random() * 60) + 20,
      l: Math.floor(Math.random() * 60) + 20,
    };
  }

  /**
   * 個体をクローンします。
   * @param ind - クローンする個体。
   * @returns クローンされた個体。
   */
  private cloneIndividual(ind: Individual): Individual {
    return { colors: ind.colors.map((c) => ({ ...c })), fitness: ind.fitness };
  }
}
