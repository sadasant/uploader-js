import AWS from 'aws-sdk'
import crypto from 'crypto-promise'
import handler from '../utils/handler'
import config from '../config.json'
import { promisify } from 'util'

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
  let token = (await crypto.randomBytes(config.crypto.byte_size)).toString(
    'hex'
  )
  const dynamodb = new AWS.DynamoDB()
  const putItem = promisify(dynamodb.putItem)
  await putItem({
    TableName: config.dynamo.user_table,
    Item: {
      email: {
        S: email
      },
      password_hash: {
        S: password
      },
      password_salt: {
        S: salt
      },
      verified: {
        BOOL: false
      },
      verify_token: {
        S: token
      }
    },
    ConditionExpression: 'attribute_not_exists (email)'
  })
  return token
}

export default handler(async function register(event) {
  let { email, password } = JSON.parse(event.body)
  let { salt, hash } = await computeHash(password)
  let token = await storeUser(email, hash, salt)
  return token
})
