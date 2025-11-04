const crypto = require('crypto');


function loadKey() {
  const raw = process.env.DATA_ENC_KEY || '';
  if (!raw) throw new Error('Missing DATA_ENC_KEY env var');

  const maybe = raw.trim();
  let keyBuf;

  if (maybe.startsWith('hex:')) {
    keyBuf = Buffer.from(maybe.slice(4), 'hex');
  } else if (maybe.startsWith('base64:')) {
    keyBuf = Buffer.from(maybe.slice(7), 'base64');
  } else if (/^[A-Fa-f0-9]{64}$/.test(maybe)) {
    keyBuf = Buffer.from(maybe, 'hex');
  } else {
    const b64 = maybe.replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
    keyBuf = Buffer.from(b64 + pad, 'base64');
  }

  if (keyBuf.length !== 32) {
    throw new Error(`DATA_ENC_KEY must decode to 32 bytes (got ${keyBuf.length})`);
  }
  return keyBuf;
}

const KEY = loadKey();
const ALG = 'aes-256-gcm';

function encrypt(plain = '') {
  if (plain == null || plain === '') return plain;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALG, KEY, iv);
  const ct = Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString('base64')}:${ct.toString('base64')}:${tag.toString('base64')}`;
}

function decrypt(blob = '') {
  if (blob == null || blob === '') return blob;
  if (typeof blob !== 'string' || !blob.startsWith('v1:')) return blob; 
  const [, ivB64, ctB64, tagB64] = blob.split(':');
  const iv = Buffer.from(ivB64, 'base64');
  const ct = Buffer.from(ctB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const decipher = crypto.createDecipheriv(ALG, KEY, iv);
  decipher.setAuthTag(tag);
  const pt = Buffer.concat([decipher.update(ct), decipher.final()]);
  return pt.toString('utf8');
}


function norm(s) { return String(s || '').trim().toLowerCase(); }
function hashDeterministic(s) { return crypto.createHash('sha256').update(norm(s)).digest('hex'); }

module.exports = { encrypt, decrypt, hashDeterministic, norm };
