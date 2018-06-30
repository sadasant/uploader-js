import crypto from 'crypto-promise'
import config from '../config.json'

// computeHash will encrypt the given sting with
// the given salt, using PBKDF2.
// This code is inspired by https://github.com/danilop/LambdAuth
//
export async function computeHash(str, salt) {
  let { byte_size, iterations } = config.crypto

  salt = salt || (await crypto.randomBytes(byte_size)).toString('base64')
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
