
// https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
export function RGBToHex(r: number, g: number, b: number) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// https://www.30secondsofcode.org/js/s/hsl-to-rgb
export function HSLToRGB(h: number, s: number, l: number) {
    s /= 100;
    l /= 100;
    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) =>
        l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return { r: Math.floor(255 * f(0)), g: Math.floor(255 * f(8)), b: Math.floor(255 * f(4)) }
};