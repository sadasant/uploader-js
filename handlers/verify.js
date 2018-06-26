import handler from '../utils/handler'
import { User } from '../models/User'
import DynamoMapper from '../utils/DynamoMapper'
import { computeHash } from '../utils/crypto'

export default handler(async function verify(event) {
  let { email, password, token } = JSON.parse(event.body)
  let mapper = new DynamoMapper()
  let found = null
  for await (const user of mapper.query(User, { email })) {
    found = user
  }
  if (!found) throw `Email "${email}" not found`
  if (found.metadata.verified)
    throw `The email "${email}" has already been verified`
  if (found.metadata.verifyToken !== token) throw "The token doesn't match"
  let { hash } = await computeHash(password, found.passwordSalt)
  if (found.passwordHash !== hash) throw "The password doesn't match"
  found.metadata.verified = true
  await mapper.update(found)
  return `User "${email}" has been verified`
})
