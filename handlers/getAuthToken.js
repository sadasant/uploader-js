import handler from '../utils/handler'
import checkIn from '../policies/checkIn'
import jwt from 'jsonwebtoken'
import config from '../config.json'

export default handler(checkIn, async event => {
  let { email } = event.user

  let token = jwt.sign({ email }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  })

  return {
    body: {
      token
    }
  }
})
