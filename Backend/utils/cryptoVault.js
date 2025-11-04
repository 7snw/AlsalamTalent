
const crypto = require('crypto');

const DATA_KEY = Buffer.from(process.env.DATA_KEY_B64 || '', 'base64');
if (DATA_KEY.length !== 32) throw new Error('DATA_KEY_B64 must be 32 bytes (base64).');

const LOOKUP_KEY = Buffer.from(process.env.LOOKUP_KEY_B64 || '', 'base64');
if (LOOKUP_KEY.length < 16) throw new Error('LOOKUP_KEY_B64 must be at least 16 bytes (base64).');


const pack = (iv, ciphertext, tag) =>
  Buffer.from(`v1:${iv.toString('base64')}:${ciphertext.toString('base64')}:${tag.toString('base64')}`).toString('base64');

const unpack = (b64) => {
  const raw = Buffer.from(String(b64), 'base64').toString('utf8');
  const [v, ivB64, cB64, tB64] = raw.split(':');
  if (v !== 'v1') throw new Error('Bad blob version');
  return { iv: Buffer.from(ivB64, 'base64'), ciphertext: Buffer.from(cB64, 'base64'), tag: Buffer.from(tB64, 'base64') };
};

function encryptString(plaintext = '') {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', DATA_KEY, iv);
  const ciphertext = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return pack(iv, ciphertext, tag);
}

function decryptString(blob = '') {
  if (!blob) return '';
  const { iv, ciphertext, tag } = unpack(blob);
  const decipher = crypto.createDecipheriv('aes-256-gcm', DATA_KEY, iv);
  decipher.setAuthTag(tag);
  const out = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return out.toString('utf8');
}


function lookupHash(value = '') {
  const h = crypto.createHmac('sha256', LOOKUP_KEY).update(String(value).trim().toLowerCase()).digest('base64url');

  return h.slice(0, 43); 
}

module.exports = { encryptString, decryptString, lookupHash };
