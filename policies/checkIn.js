import { getVerifiedUser, findUser } from '../models/User'
import jwt from 'jsonwebtoken'
import config from '../config.json'

export default async function checkIn(event) {
  let { email, password, token } = event.body
  if (token) {
    let decoded = jwt.verify(token, config.jwt.secret)
    let email = decoded.email
    event.user = await findUser({ email })
  } else {
    event.user = await getVerifiedUser(email, password)
  }
}
