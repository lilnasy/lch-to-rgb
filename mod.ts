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

function LCHtoRGB ([lightness, chroma, hue]: number[]): number[] {
	
	const Δ = 0.1
	
	if (chroma <= 0) return [0, 0, 0]
	
	const rgb = sRGB(toLinearRGB(toD65(toD50(toXYZ(toLAB([lightness, chroma, hue]))))))
	
	// logpoint: { new Map([ [chroma, rgb] ]) }
	
	return rgb.every( x => x >= 0 ) ? rgb : LCHtoRGB([lightness, chroma - Δ, hue])
}

function toLAB ([lightness, chroma, hue]: number[]): number[] {
	
	return [
		lightness,
		chroma * Math.cos(hue * Math.PI / 180),
		chroma * Math.sin(hue * Math.PI / 180)
	]
}

function toXYZ ([lightness, a, b]: number[]): number[] {
	
	const κ = (3 / 29) ** 3
	const ε = 6 / 29
	
	const xyz = [
		((lightness + 16) / 116) + (a / 500),
		 (lightness + 16) / 116,
		((lightness + 16) / 116) - (b / 200)
	]
	
	return xyz.map( x => x > ε
				? x ** 3
				: κ * (x * 116 - 16) )
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
		 3.1338561 * x - 1.6168667 * y - 0.4906146 * z,
		-0.9787684 * x + 1.9161415 * y + 0.0334540 * z,
		 0.0719453 * x - 0.2289914 * y + 1.4052427 * z
	]
}

function sRGB (lrgb: number[]): number[] {

	const gamma = (val: number) => {
		const sign = val < 0 ? -1 : 1
		const abs = Math.abs(val)
		return (abs > 0.0031308) ? sign * (1.055 * Math.pow(abs, 1/2.4) - 0.055) : 12.92 * val
	}
	
	return lrgb.map(gamma).map( x => Math.round( 255 * x ) )
}

function toHexString (rgb: number[]): string {
	
	const [r, g, b] = rgb.map( x => x.toString(16).padStart(2, '0') )
	
	return '#' + r + g + b
}
