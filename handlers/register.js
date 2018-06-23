import AWS from 'aws-sdk'
import { DataMapper } from '@aws/dynamodb-data-mapper'
import crypto from 'crypto-promise'
import handler from '../utils/handler'
import { User, UserMetadata } from '../models/User'
import config from '../config.json'

export async function computeHash(password) {
  let { byte_size, iterations } = config.crypto

  let salt = (await crypto.randomBytes(byte_size)).toString('base64')
  let derivedKey = await crypto.pbkdf2(
    password,
    salt,
    iterations,
    byte_size,
    'sha512'
  )

  return {
    salt,
    hash: derivedKey.toString('base64')
  }
}

export async function storeUser(email, password, salt) {
  let token = await crypto.randomBytes(config.crypto.byte_size)
  let hexToken = token.toString('hex')
  const client = new AWS.DynamoDB()
  const mapper = new DataMapper({ client })
  let user = Object.assign(new User(), {
    email,
    password,
    salt
  })
  user.metadata = Object.assign(new UserMetadata(), {
    verifyToken: hexToken
  })
  await mapper.put({ item: user })
  return token
}

export default handler(async function register(event) {
  let { email, password } = JSON.parse(event.body)
  let { salt, hash } = await computeHash(password)
  let token = await storeUser(email, hash, salt)
  return token
})
