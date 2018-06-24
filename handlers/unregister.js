import handler from '../utils/handler'
import DynamoMapper from '../utils/DynamoMapper'
import { User } from '../models/User'

export default handler(async function unregister(event) {
  let { email } = JSON.parse(event.body)
  let mapper = new DynamoMapper()
  for await (const user of mapper.query(User, { email })) {
    if (user.metadata.verified) {
      throw `The email "${email}" has been verified`
    }
    await mapper.delete(user)
    return `User "${email}" successfully removed`
  }
  return `Email "${email}" not found`
})
