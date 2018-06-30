import handler from '../utils/handler'
import checkIn from '../policies/checkIn'
import dynamoMapper from '../utils/dynamoMapper'
import { conflict, forbidden } from '../utils/httpCodes'

// POST to verify with:
//   { verifyToken: String }
// With headers:
//   Authorization: Authorization Token
//
// Results with a body in the shape of:
//   { message: String }
//
// Once the received credentials are validated,
// returns a base64 encoded version of the requested
// file.
//
// Fails if the user is not found on the database,
// or if the user has already been verified.
//
export default handler(checkIn, async event => {
  let { verifyToken } = event.body
  let user = event.user
  let email = user.email

  if (user.verified)
    return conflict(`The email "${email}" has already been verified`)

  if (user.verifyToken !== verifyToken)
    return forbidden(`The token doesn't match`)
  user.verified = true
  let mapper = dynamoMapper()
  await mapper.update(user)

  return `User "${email}" has been verified`
})
