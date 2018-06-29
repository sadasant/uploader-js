import handler from '../utils/handler'
import checkIn from '../policies/checkIn'

export default handler(checkIn, async function verify(event) {
  let user = event.user
  if (!user.files || user.files === '[]') {
    throw `User "${user.email}" has not uploaded any file.`
  }
  return {
    statusCode: 200,
    files: JSON.parse(user.files)
  }
})
