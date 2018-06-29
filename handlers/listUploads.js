import handler from '../utils/handler'
import checkIn from '../policies/checkIn'
import { noContent } from '../utils/httpCodes'

export default handler(checkIn, async event => {
  let user = event.user
  if (!user.files || user.files === '[]') {
    return noContent(`User "${user.email}" has not uploaded any file.`)
  }
  return {
    statusCode: 200,
    files: JSON.parse(user.files)
  }
})
