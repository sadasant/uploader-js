import handler from '../utils/handler'
import checkIn from '../policies/checkIn'

export default handler(checkIn, async event => ({
  body: {
    verifyToken: event.user.verifyToken
  }
}))
