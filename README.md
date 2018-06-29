Resources:

- <https://github.com/danilop/LambdAuth/blob/master/LambdAuthCreateUser/index.js>
- <https://github.com/shekhargulati/hands-on-serverless-guide/blob/master/01-aws-lambda-serverless-framework/03-building-rest-api-in-nodejs-with-lambda-gateway-dynamodb-serverless.md>

Dynamoose and cloudformation:
- https://github.com/dynamoosejs/dynamoose/issues/151
- https://www.npmjs.com/package/dynamoose-to-cloudformation
The above sucks
- https://aws.amazon.com/blogs/developer/introducing-the-amazon-dynamodb-datamapper-for-javascript-developer-preview/#defining-a-model-without-typescript

S3
- <https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html>
- <https://stackoverflow.com/questions/40188287/aws-lambda-function-write-to-s3>
- <https://www.netlify.com/blog/2016/11/17/serverless-file-uploads/>
- <https://docs.aws.amazon.com/AmazonS3/latest/dev/ShareObjectPreSignedURLJavaSDK.html>
- <https://medium.com/@olotintemitope/how-to-upload-files-to-amazon-s3-using-nodejs-lambda-and-api-gateway-bae665127907>
- <https://stackoverflow.com/questions/38831829/nodejs-aws-sdk-s3-generate-presigned-url>

JWT:
- <https://yos.io/2017/09/03/serverless-authentication-with-jwt/>

Perhaps obvious things that I'm not including:
- This app is not very REST-friendly (I think it might be CRUD
  friendly, but that might be an overstatement).
- I'm missing configurations based on the deploy environment.
- A user interface that would access these endpoints.
- Files are not stored in a separate table.
- Multipart uploads.
- Password recovery.

curl -d '{"email":"sadasant@gmail.com", "password":"value2"}' -H "Content-Type: application/json" -X POST https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/register
serverless invoke -f register -d '{ "body": "{\"email\":\"sadasant@gmail.com\", \"password\":\"value2\"}" }'
curl -d '{"email":"sadasant@gmail.com", "password":"value2"}' -H "Content-Type: application/json" -X POST https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/register
