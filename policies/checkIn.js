import jwt from 'jsonwebtoken'
import config from '../config.json'
import { findUser } from '../models/User'
import { computeHash } from '../utils/crypto'

// checkIn,
// Our Authentication / User Retrieval policy
//
// This is a function that does one of two things:
// 1. Either validates the received authorizationToken,
// 2. Or tries to use the received user and password from the event's body.
//
// In both schenarios, once the data is received and is confirmed to be correct,
// this function assigns the found (and verified) user to the event object as the
// user property.
//
// If anything bad happens, this function throws "Unauthorized".
// I couldn't make it send back more verbose errors, and apparently other people
// have been experiencing the same: https://www.npmjs.com/package/file-type#supported-file-types
//
export default async event => {
  if (event.user) return
  let token =
    event.authorizationToken || (event.headers && event.headers.Authorization)

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
