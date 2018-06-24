import crypto from 'crypto-promise'
import config from '../config.json'

export async function computeHash(str) {
  let { byte_size, iterations } = config.crypto

  let salt = (await crypto.randomBytes(byte_size)).toString('base64')
  let derivedKey = await crypto.pbkdf2(
    str,
    salt,
    iterations,
    byte_size,
    'sha512'
  )

  return {
    salt,
    hash: derivedKey.toString('base64')
  }
}

export async function makeToken() {
  return (await crypto.randomBytes(config.crypto.byte_size)).toString('hex')
}
