import { getVerifiedUser } from '../models/User'

export default async function checkIn(event) {
  let { email, password } = event.body
  event.user = await getVerifiedUser(email, password)
}
