import handler from '../utils/handler'
import dynamoMapper from '../utils/dynamoMapper'
import checkIn from '../policies/checkIn'

// DELETE to removeAccount
// With headers:
//   Authorization: Authorization Token
//
// Results with a body in the shape of:
//   { message: String }
//
// Once the received credentials are validated,
// removes the user from the database.
//
export default handler(checkIn, async event => {
  let email = event.user.email
  let mapper = new dynamoMapper()
  await mapper.delete(event.user)
  return `User "${email}" successfully removed`
})
