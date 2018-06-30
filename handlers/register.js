import emailValidator from 'email-validator'
import handler from '../utils/handler'
import { User, findUser } from '../models/User'
import { computeHash, makeToken } from '../utils/crypto'
import { badRequest, conflict } from '../utils/httpCodes'
import dynamoMapper from '../utils/dynamoMapper'
import { make } from '../utils/lang'

// POST to register with:
//   { user: String, password: String }
//
// Results with a body in the shape of:
//   { verifyToken: String }
//
// Creates a new user in the database
// and returns a verification token.
//
export default handler(async event => {
  let { email, password } = event.body

  if (!emailValidator.validate(email))
    return badRequest(`Invalid Email "${email}"`)

  let user = await findUser({ email }).catch()
  if (user) return conflict(`The email "${email}" has already been registered`)

  let { salt, hash } = await computeHash(password)
  let verifyToken = await makeToken()

  try {
    let user = make(User, {
      email,
      passwordHash: hash,
      passwordSalt: salt,
      verifyToken
    })
    let mapper = dynamoMapper()
    await mapper.put({ item: user })
  } catch (e) {
    console.info(`Failed to create user "${email}"`, e.message)
    throw `Failed to create user "${email}"`
  }

  return {
    body: {
      verifyToken
    }
  }
})
