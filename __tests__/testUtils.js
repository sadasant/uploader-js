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
  password,
  files,
  verified = false,
  verifyToken
}) {
  let { hash, salt } = await computeHash(password)

  let user = {
    email: {
      S: email
    },
    passwordHash: {
      S: hash
    },
    passwordSalt: {
      S: salt
    },
    files: files
      ? {
          S: JSON.stringify(files)
        }
      : undefined,
    verified: {
      BOOL: verified
    },
    verifyToken: {
      S: verifyToken
    }
  }

  // Would love to use a more functional approach, but I haven't found
  // sufficient excuse to add a functional library.
  for (let k of Object.keys(user)) {
    if (user[k] === undefined) delete user[k]
  }

  return user
}
