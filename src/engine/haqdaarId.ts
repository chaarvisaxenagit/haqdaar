// Makes a Haqdaar ID on the device, e.g. "HQ-7K2M9QXA".
// No 0/O/1/I, so it is easy to read aloud.

const LETTERS = '23456789ABCDEFGHJKMNPQRSTUVWXYZ' // 31 characters

export function makeHaqdaarId(): string {
  let id = 'HQ-'
  while (id.length < 11) {
    const bytes = crypto.getRandomValues(new Uint8Array(16))
    for (const b of bytes) {
      // Only use bytes below 248 (= 31 x 8), so every character is equally likely.
      if (b < 248 && id.length < 11) id += LETTERS[b % 31]
    }
  }
  return id
}
