import handler from '../utils/handler'
import checkIn from '../policies/checkIn'
import jwt from 'jsonwebtoken'
import config from '../config.json'

// POST to getAuthToken with:
//   { user: String, password: String }
//
// Results with a body in the shape of:
//   { token: String }
//
// Once the received credentials are validated,
// returns a new signed JWT token.
//
export default handler(checkIn, async event => {
  let { email } = event.user

  let token = jwt.sign({ email }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  })

  return {
    body: {
      token
    }
  }
})
