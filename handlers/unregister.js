import handler from '../utils/handler'
import dynamoMapper from '../utils/dynamoMapper'
import { User } from '../models/User'
import { conflict, notFound } from '../utils/httpCodes'

export default handler(async function unregister(event) {
  let { email } = event.body
  let mapper = new dynamoMapper()
  for await (let user of mapper.query(User, { email })) {
    if (user.verified) return conflict(`The email "${email}" has been verified`)
    await mapper.delete(user)
    return `User "${email}" successfully removed`
  }
  return notFound(`Email "${email}" not found`)
})
