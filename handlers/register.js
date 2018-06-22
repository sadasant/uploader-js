import AWS from 'aws-sdk'
import crypto from 'crypto-promise'
import handler from '../util/handler'
import config from '../config.json'
import { promisify } from 'util'

const dynamodb = new AWS.DynamoDB()
const putItem = promisify(dynamodb.putItem)
const ses = new AWS.SES()

async function computeHash(password) {
  let { byte_size, iterations } = config.crypto

  let salt = (await crypto.randomBytes(byte_size)).toString('base64')
  let derivedKey = await crypto.pbkdf2(password, salt, iterations, byte_size)

  return {
    salt,
    hash: derivedKey.toString('base64')
  }
}

async function storeUser(email, password, salt) {
  let token = (await crypto.randomBytes(config.byte_size)).toString('hex')
  await dynamodb.putItem({
    TableName: config.dynamo.user_table,
    Item: {
      email: {
        S: email
      },
      passwordHash: {
        S: password
      },
      passwordSalt: {
        S: salt
      },
      verified: {
        BOOL: false
      },
      verifyToken: {
        S: token
      }
    },
    ConditionExpression: 'attribute_not_exists (email)'
  })
  return token
}

export default handler(async (event, context) => {
  let { email, password } = JSON.parse(event.body)
  let { salt, hash } = await computeHash(password)
})
