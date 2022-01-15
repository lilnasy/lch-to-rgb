// This software or document includes material copied from
// or derived from "CSS Color Module Level 4" Working Draft
// Copyright © 2021 W3C® (MIT, ERCIM, Keio, Beihang).
// https://github.com/w3c/csswg-drafts/blob/ef1feeb4d3046a7741a7240a263fe51bd0936906/css-color-4/conversions.js.

import { assert } from 'https://github.com/denoland/deno_std/raw/48a2496dbed39284dee5a42b309eaf5c4291a6d4/_util/assert.ts'

export interface Color {
	lightness: number
	chroma: number
	hue: number
}

/**
 * creates a new object with lightness, chroma, hue and opacity values
 * @param lightness luminance or brightness (0 to 100)
 * @param chroma vividness or saturation (at least 0, upwards limit depends on display and hue)
 * @param hue hue angle in degrees (0 to 360)
*/
export function LCHtoHexString ({lightness, chroma, hue}: Color): string {
	assert(0 <= lightness && lightness <= 100, 'Lightness must be between 0 and 100')
	assert(0 <= chroma, 'Chroma must be at least 0')
	const rgb = LCHtoRGB([lightness, chroma, hue])
	return toHexString(rgb)
}

// converts lch described colors to their rgb channel values and, if necessary, adapts colors
// that are outside the sRGB gamut to their less chromatic counterparts that are inside.
// the algorithm steps closer to the most chromatic color that is inside the gamut with each
// recursion, halving the amount by which it steps each time, until it is close enough ( when
// it is less than 0.1 units away from the actual chroma )
function LCHtoRGB (
        [lightness, chroma, hue]: number[],
        step = chroma / 2,
        adapting = false
): number[] {
	const rgb = sRGB(toLinearRGB(toD65(toD50(toXYZ(toLAB([lightness, chroma, hue]))))))
	// helpful logpoint: chroma: { chroma } rgb: { rgb.map( x => Math.round( 255 * x ) )] }
	// with this algorithm, colors very close to black and white may approach
	// the range [0,0,0] to [1,1,1] asymptotically with each half-step without
	// ever making it inside - so I've picked values that are outside the gamut
	// but still small enough that they get rounded to 0 or 255
        const inGamut = rgb.every( x => x >= -0.0001 ) && rgb.every( x => x <= 1.0001 )
        if (inGamut && adapting === false) return rgb
        else if (inGamut && step <= 0.1) return rgb
        else if (inGamut) return LCHtoRGB( [lightness, chroma + step, hue], step / 2, adapting = true)
	else return LCHtoRGB( [lightness, chroma - step, hue], step / 2, adapting = true)
}

function toLAB ([lightness, chroma, hue]: number[]): number[] {
	return [
		lightness,
		chroma * Math.cos(hue * Math.PI / 180),
		chroma * Math.sin(hue * Math.PI / 180)
	]
}

function toXYZ ([lightness, a, b]: number[]): number[] {
	const κ = 3 / 29
	const xyz = [
		((lightness + 16) / 116) + (a / 500),
		 (lightness + 16) / 116,
		((lightness + 16) / 116) - (b / 200)
	]
	return xyz.map( x => x > 2 * κ
				? x ** 3
				: κ ** 3 * (x * 116 - 16) )
}

/** converts xyz co-ordinates to D50-adapted xyz co-ordinates
https://web.archive.org/web/20211025225437/http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html */
function toD50([x, y, z]: number[]): number[] {
	return [ 
		x * 0.3457 / 0.3585,
		y,
		z * 0.2958 / 0.3585
	]
}

// Bradford chromatic adaptation from D50 to D65
function toD65([x, y, z]: number[]): number[] {
	return [
		 0.955473452704218200 * x - 0.023098536874261423 * y + 0.063259308661021700 * z,
		-0.028369706963208136 * x + 1.009995458005822600 * y + 0.021041398966943008 * z,
		 0.012314001688319899 * x - 0.020507696433477912 * y + 1.330365936608075300 * z
	]
}

function toLinearRGB ([x, y, z]: number[]): number[] {
	return [
		 3.24096994190452260 * x - 1.53738317757009400 * y - 0.49861076029300340 * z,
		-0.96924363628087960 * x + 1.87596750150772020 * y + 0.04155505740717559 * z,
		 0.05563007969699366 * x - 0.20397695888897652 * y + 1.05697151424287860 * z
	]
}

function sRGB (lrgb: number[]): number[] {
	const gamma = (val: number) => {
		const sign = val < 0 ? -1 : 1
		const abs = Math.abs(val)
		return (abs > 0.0031308) ? sign * (1.055 * Math.pow(abs, 1/2.4) - 0.055) : 12.92 * val
	}
	return lrgb.map(gamma)
}

function toHexString (rgb: number[]): string {
	const [r, g, b] = rgb.map( x => Math.round( 255 * x ) ).map( x => x.toString(16).padStart(2, '0') )
	return '#' + r + g + b
}
