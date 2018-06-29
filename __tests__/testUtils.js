import getAuthToken from '../handlers/getAuthToken'
import { computeHash } from '../utils/crypto'

export const authorizer = lambda => async event => {
  let result = await getAuthToken(event, {}).catch(console.info)
  expect(result.statusCode).toBe(200)
  event.authorizationToken = JSON.parse(result.body).token
  let response = await lambda(event, {})
  if (typeof response.body === 'string')
    response.body = JSON.parse(response.body)
  return response
}

export async function newUserItem({
  email,
  hash,
  salt,
  password,
  files,
  verified = false,
  verifyToken
}) {
  if (!hash && !salt) {
    let result = await computeHash(password)
    hash = result.hash
    salt = result.salt
  }
  return {
    email: {
      S: email
    },
    passwordHash: {
      S: hash
    },
    passwordSalt: {
      S: salt
    },
    files: files ? {
      S: JSON.stringify(files)
    } : undefined,
    verified: {
      BOOL: verified
    },
    verifyToken: {
      S: verifyToken
    }
  }
}
