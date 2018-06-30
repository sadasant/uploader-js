import handler from '../utils/handler'
import dynamoMapper from '../utils/dynamoMapper'
import checkIn from '../policies/checkIn'

export default handler(checkIn, async event => {
  let email = event.user.email
  let mapper = new dynamoMapper()
  await mapper.delete(event.user)
  return `User "${email}" successfully removed`
})
