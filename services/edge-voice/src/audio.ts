// 8kHz mu-law decompression table
const muLawDecodeTable = new Int16Array(256);
for (let i = 0; i < 256; i++) {
  const mu = ~i;
  let sign = (mu & 0x80) ? -1 : 1;
  let exponent = (mu & 0x70) >> 4;
  let mantissa = (mu & 0x0f);
  let sample = sign * ((mantissa << 3) + 132) << exponent;
  muLawDecodeTable[i] = sample - 3328; // 3328 is the mu-law offset
}

/**
 * Decodes Twilio base64 mu-law (8kHz) to raw Int16 PCM (8kHz)
 */
export function decodeMuLaw(b64: string): Int16Array {
  const binaryString = atob(b64);
  const len = binaryString.length;
  const pcm = new Int16Array(len);
  
  for (let i = 0; i < len; i++) {
    const uint8 = binaryString.charCodeAt(i);
    pcm[i] = muLawDecodeTable[uint8];
  }
  return pcm;
}

/**
 * Creates a valid WAV file from Int16 PCM data.
 * Whisper (@cf/openai/whisper) requires a valid audio file format like WAV.
 */
export function createWavFile(pcmData: Int16Array, sampleRate: number = 8000): Uint8Array {
  const numChannels = 1;
  const byteRate = sampleRate * numChannels * 2;
  const blockAlign = numChannels * 2;
  
  const buffer = new ArrayBuffer(44 + pcmData.length * 2);
  const view = new DataView(buffer);
  
  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + pcmData.length * 2, true);
  writeString(view, 8, 'WAVE');
  
  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size
  view.setUint16(20, 1, true); // AudioFormat (PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // BitsPerSample
  
  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, pcmData.length * 2, true);
  
  // Write PCM samples
  let offset = 44;
  for (let i = 0; i < pcmData.length; i++) {
    view.setInt16(offset, pcmData[i], true);
    offset += 2;
  }
  
  return new Uint8Array(buffer);
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
