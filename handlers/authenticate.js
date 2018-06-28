import handler from '../utils/handler'
import checkIn from '../policies/checkIn'
import jwt from 'jsonwebtoken'
import config from '../config.json'

export default handler(checkIn, async function authenticate(event) {
  let { email, password } = event.user
  let token = jwt.sign({
    email,
    password
  }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  })
  return {
    token
  }
})
