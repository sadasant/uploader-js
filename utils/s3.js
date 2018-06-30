import AWS from 'aws-sdk'
import config from '../config.json'

// Here is a bunch of wrappers around
// AWS S3 methods, because these methods aren't promises.

export const uploadFile = (fileName, body) =>
  new Promise((resolve, reject) => {
    let s3 = new AWS.S3()
    s3.putObject(
      {
        Bucket: config.s3.buckets.files,
        Key: fileName,
        Body: body
      },
      (err, data) => {
        if (err) reject(err)
        else resolve(data)
      }
    )
  })

export const downloadFile = fileName =>
  new Promise((resolve, reject) => {
    let s3 = new AWS.S3()
    s3.getObject(
      {
        Bucket: config.s3.buckets.files,
        Key: fileName
      },
      (err, data) => {
        if (err) reject(err)
        else resolve(data)
      }
    )
  })

export const removeFile = fileName =>
  new Promise((resolve, reject) => {
    let s3 = new AWS.S3()
    s3.deleteObject(
      {
        Bucket: config.s3.buckets.files,
        Key: fileName
      },
      (err, data) => {
        if (err) reject(err)
        else resolve(data)
      }
    )
  })

export const shareFile = (fileName, expiresAt) => {
  let s3 = new AWS.S3()
  return s3.getSignedUrl('getObject', {
    Bucket: config.s3.buckets.files,
    Key: fileName,
    Expires: expiresAt
  })
}
