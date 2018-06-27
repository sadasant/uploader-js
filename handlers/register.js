import handler from '../utils/handler'
import { createUser } from '../models/User'
import { computeHash, makeToken } from '../utils/crypto'

export default handler(async function register(event) {
  let { email, password } = event.body
  let { salt, hash } = await computeHash(password)
  let token = await makeToken()
  await createUser({
    email,
    passwordHash: hash,
    passwordSalt: salt,
    verifyToken: token
  })
  return {
    body: {
      token
    }
  }
})
