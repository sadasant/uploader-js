import jwt from 'jsonwebtoken'
import config from '../config.json'
import { findUser } from '../models/User'
import { computeHash } from '../utils/crypto'

export default async event => {
  if (event.user) return
  let token = event.authorizationToken || (event.headers && event.headers.Authorization)

  // If we received a token, let's try to verify it
  if (token) {
    let decoded
    try {
      decoded = jwt.verify(token, config.jwt.secret)
    } catch (e) {
      throw 'Unauthorized'
    }
    let email = decoded.email
    event.user = await findUser({ email })
    return
  }

  // Otherwise, let's try to authenticate via user and password
  if (event.body) {
    let { email, password } = event.body
    let found = await findUser({ email })
    if (!found) {
      console.info(`Email "${email}" not found`)
      throw 'Unauthorized'
    }
    let { hash } = await computeHash(password, found.passwordSalt)
    if (found.passwordHash !== hash) {
      console.info('Invalid Password')
      throw 'Unauthorized'
    }
    event.user = found
    return
  }

  throw 'Unauthorized'
}
