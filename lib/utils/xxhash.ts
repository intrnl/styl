// xxhash code adapted from https://github.com/Jason3S/xxhash

let PRIME32_1 = 2654435761;
let PRIME32_2 = 2246822519;
let PRIME32_3 = 3266489917;
let PRIME32_4 = 668265263;
let PRIME32_5 = 374761393;


let utf8Encoder = new TextEncoder;

export function xxhash (buffer: Uint8Array | string, seed = 0) {
  if (typeof buffer === 'string')
	buffer = utf8Encoder.encode(buffer);

 let acc = (seed + PRIME32_5) & 0xffffffff;
 let offset = 0;

  if (buffer.length >= 16) {
	  let lanes = [
		  (seed + PRIME32_1 + PRIME32_2) & 0xffffffff,
		  (seed + PRIME32_2) & 0xffffffff,
		  (seed + 0) & 0xffffffff,
		  (seed - PRIME32_1) & 0xffffffff,
	  ];

	  let limit = buffer.length - 16;
	  let lane = 0;
	  for (offset = 0; (offset & 0xfffffff0) <= limit; offset += 4) {
		  let lane0 = buffer[offset + 0] + (buffer[offset + 1] << 8);
		  let lane1 = buffer[offset + 2] + (buffer[offset + 3] << 8);
		  let laneP = lane0 * PRIME32_2 + (lane1 * PRIME32_2 << 16);
		  let acc = ((lanes[lane] + laneP) & 0xffffffff);
		  acc = (acc << 13) | (acc >>> 19);
		  let acc0 = acc & 0xffff;
		  let acc1 = acc >>> 16;
		  lanes[lane] = (acc0 * PRIME32_1 + (acc1 * PRIME32_1 << 16)) & 0xffffffff;
		  lane = (lane + 1) & 0x3;
	  }

	  acc = (((lanes[0] << 1)  | (lanes[0] >>> 31))
		   + ((lanes[1] << 7)  | (lanes[1] >>> 25))
		   + ((lanes[2] << 12) | (lanes[2] >>> 20))
		   + ((lanes[3] << 18) | (lanes[3] >>> 14))) & 0xffffffff;
  }

  acc = (acc + buffer.length) & 0xffffffff;

  let limit = buffer.length - 4;
  for (; offset <= limit; offset += 4) {
	  let i = offset;
	  let laneN0 = buffer[i + 0] + (buffer[i + 1] << 8);
	  let laneN1 = buffer[i + 2] + (buffer[i + 3] << 8);
	  let laneP = laneN0 * PRIME32_3 + (laneN1 * PRIME32_3 << 16);
	  acc = ((acc + laneP) & 0xffffffff);
	  acc = (acc << 17) | (acc >>> 15);
	  acc = (((acc & 0xffff) * PRIME32_4) + (((acc >>> 16) * PRIME32_4) << 16)) & 0xffffffff;
  }

  for (; offset < buffer.length; ++offset) {
	  let lane = buffer[offset];
	  acc = acc + lane * PRIME32_5;
	  acc = (acc << 11) | (acc >>> 21);
	  acc = (((acc & 0xffff) * PRIME32_1) + (((acc >>> 16) * PRIME32_1) << 16)) & 0xffffffff;
  }

  acc = acc ^ (acc >>> 15);
  acc = ((acc & 0xffff) * PRIME32_2 & 0xffffffff) + ((acc >>> 16) * PRIME32_2 << 16);
  acc = acc ^ (acc >>> 13);
  acc = ((acc & 0xffff) * PRIME32_3 & 0xffffffff) + ((acc >>> 16) * PRIME32_3 << 16);
  acc = acc ^ (acc >>> 16);

  return acc < 0 ? acc + 4294967296 : acc;
}
