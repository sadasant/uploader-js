import handler from '../utils/handler'
import dynamoMapper from '../utils/dynamoMapper'
import { User } from '../models/User'
import { conflict, notFound } from '../utils/httpCodes'

// POST to unregister with:
//   { email: String }
//
// Results with a body in the shape of:
//   { message: String }
//
// Removes an unverified user from the database.
//
export default handler(async event => {
  let { email } = event.body
  let mapper = new dynamoMapper()
  for await (let user of mapper.query(User, { email })) {
    if (user.verified)
      return conflict(`The email "${email}" has been previously verified`)
    await mapper.delete(user)
    return `User "${email}" successfully removed`
  }
  return notFound(`Email "${email}" not found`)
})
