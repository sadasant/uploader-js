import handler from '../utils/handler'
import checkIn from '../policies/checkIn'
import dynamoMapper from '../utils/dynamoMapper'
import { conflict, forbidden } from '../utils/httpCodes'

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
