import { LCHtoHexString as convert } from './mod.ts'
import { assertEquals, assertThrows } from 'https://deno.land/std@0.121.0/testing/asserts.ts'

Deno.test({ name: 'zero lightness', fn: () => assertEquals( convert({lightness: 0, chroma: 15, hue: 20}) , '#000000' ) }) 
Deno.test({ name: 'maximum lightness', fn: () => assertEquals( convert({lightness: 100, chroma: 15, hue: 20}) , '#ffffff' ) }) 
Deno.test({ name: 'high chroma', fn: () => assertEquals( convert({lightness: 50, chroma: 1000, hue: 20}) , '#e8004e' ) }) 
Deno.test({ name: 'hue > 360', fn: () => assertEquals( convert({lightness: 50, chroma: 15, hue: 1000}) , convert({lightness: 50, chroma: 15, hue:280}) ) }) 
Deno.test({ name: 'hue < 0', fn: () => assertEquals( convert({lightness: 50, chroma: 15, hue: -1000}) , convert({lightness: 50, chroma: 15, hue: 80}) ) }) 
Deno.test({ name: 'error when lightness is negative', fn: () => assertThrows( () => convert({lightness: -1, chroma: 15, hue: 20}) ) }) 
Deno.test({ name: 'error when lightness is larger than 100', fn: () => assertThrows( () => convert({lightness: 101, chroma: 15, hue: 20}) ) }) 
Deno.test({ name: 'error when chroma is negative', fn: () => assertThrows( () => convert({lightness: 50, chroma: -1, hue: 20}) ) }) 
