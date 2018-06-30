import handler from '../utils/handler'
import checkIn from '../policies/checkIn'

// POST to getVerifyToken with:
//   { user: String, password: String }
//
// Results with a body in the shape of:
//   { verifyToken: String }
//
// Once the received credentials are validated,
// returns the user's verifyToken
//
export default handler(checkIn, async event => ({
  body: {
    verifyToken: event.user.verifyToken
  }
}))
