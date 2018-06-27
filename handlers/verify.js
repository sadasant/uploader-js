import handler from '../utils/handler'
import checkIn from '../policies/checkIn'
import dynamoMapper from '../utils/dynamoMapper'

export default handler(checkIn, async function verify(event) {
  let { email, token } = event.body
  let user = event.user
  if (user.metadata.verified)
    throw `The email "${email}" has already been verified`
  if (user.metadata.verifyToken !== token) throw "The token doesn't match"
  user.metadata.verified = true
  let mapper = dynamoMapper()
  await mapper.update(user)
  return `User "${email}" has been verified`
})
