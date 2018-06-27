import handler from '../utils/handler'
import dynamoMapper from '../utils/dynamoMapper'
import { User } from '../models/User'

export default handler(async function unregister(event) {
  let { email } = event.body
  let mapper = new dynamoMapper()
  for await (const user of mapper.query(User, { email })) {
    if (user.metadata.verified) {
      throw `The email "${email}" has been verified`
    }
    await mapper.delete(user)
    return `User "${email}" successfully removed`
  }
  return `Email "${email}" not found`
})
