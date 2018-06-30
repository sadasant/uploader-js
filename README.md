## Fancy Uploader In JavaScript

Here's a fully working MVP for a file uploader that
I did to **learn about serverless** while taking advantage of
technologies that I already know and appreciate, like
_TDD, Webpack, Babel & Jest_. It was a bit challenging since I'm more
familiar with frameworks like Sails, Feathers, Express & Koa, where
you have to either provide the server and keep it running, or use
Heroku. At this point, I feel confident I can also work and deliver
products using Serverless! 🙌

This file uploader has the following features:
- Allows user registration and user verification.
- Further authentication powered by JWT tokens.
- All the files are private.
- Users can list their uploads, and remove them.
- Users can also generate temporary links to access these files.

![](https://i.imgur.com/Vj0mKLe.gif)

Here is a list of features that are probably only important for
developers:
- It's built with NodeJS 💐
- It uses the latest EcmaScript features I could think of at the
  moment.
- It's fully **unit tested** 💪
- As much documentation as possible.
- It desploys on AWS using serverless.
- It uses Prettier and Eslint, so no ugly code on sight 😍
- It runs lint and test validations on CircleCI on pull requests.

![](https://i.imgur.com/ozF8dOb.png)

_I know the `checkIn` policy needs some love, but I want to move to
another project._

## Index

- [How to build](#how-to-build)
  - [Gettting in the console](#getting-in-the-console)
  - [Installing the dependencies](#installing-the-dependencies)
  - [Initializing the repository](#initializing-the-repository)
- [I want to try it now!](#i-want-to-try-it-now)
- [My reasoning while building this](#my-reasoning-while-building-this)
  - [Design Decissions](#design-decissions)
  - [Disclaimer](#disclaimer)
  - [Now What](#now-what)
- [Resources](#resources)

## How to build

### Getting in the console

The first step is actually not with the repo, but with your AWS
account:
1. Get in the [AWS Console](https://console.aws.amazon.com/).
2. Go to the IAM section.
3. Create a user, give it `Programmatic access`.
4. Give it full `List`, `Read` & `Write` access to `CloudFormation`.
5. Give it `IAMFullAccess`.
6. Give it `AmazonDynamoDBFullAccess`.
7. Give it `AmazonAPIGatewayAdministrator`.
8. Give it `AmazonAPIGatewayAdministrator`.
9. Give it `CloudFrontFullAccess`.
10. Give it `AmazonS3FullAccess`.
11. Give it `AWSLambdaFullAccess`.

Now you're ready for the terminal.

### Installing the dependencies

You'll need NodeJS. So far, I like using
[nvm](https://github.com/creationix/nvm) since it gives you the
freedom to move back and forward between one version and another.
Just as they say in their README, you can install NVM with:

    curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash

You'll also need [serverless](https://serverless.com/). The quick
guide says:

    npm install -g serverless
    # Updating serverless from a previous version of serverless
    npm install -g serverless
    # Login to the serverless platform (optional)
    serverless login

It will ask you the credentials of an IAM user. Put the credentials of
the user you just created.

After that, I highly recommend reading the serverless CLI reference (I
tend to forget commands, even the most used ones): <https://serverless.com/framework/docs/providers/azure/cli-reference/>

### Initializing the repository

You can do it this way:
```
git clonse git@github.com:sadasant/uploader-js.git
```

Then `cd uploader-js`. Followed by `npm install`.

At this point, you're **ready**, this is yours now, play with it,
break it, submit issues back, learn with me! You can start by running
the tests:

    npm t

Or by deploying it yourself:

    serverless deploy --force

## I want to try it now!

I have this deployed (and open to the public, for a brief period of
time), in the following endpoints:

    POST - https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/register
    POST - https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/unregister
    POST - https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/getAuthToken
    POST - https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/getVerifyToken
    POST - https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/verify
    DELETE - https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/removeAccount
    GET - https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/listUploads
    GET - https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/shareUpload
    POST - https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/upload
    GET - https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/getUpload
    DELETE - https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/removeUpload

Let's use CURL to start using these endpoints right now (here is a
[curl crash
course](http://pewniak747.info/2012/10/27/curl-crash-course/), just in
case):

1. `POST register`: The registration process requires sending an email
and a password, which will result in a JSON object with a single
`verifyToken` property, which you will use to verify yourself. _I'm
mimicking the email verification processes_.

```bash
email="lurker@hotmail.com"
password="avocadoPower!1234"
verifyToken=$(curl \
  -d "{\"email\":\"$email", \"password\":\"$password\"}" \
  -H "Content-Type: application/json" \
  -X POST https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/register | \
  python3 -c "import sys, json; print(json.load(sys.stdin)['verifyToken'])")
echo "Your verification token is: $verifyToken"
```

2. `POST unregister`: As long as you haven't verified yourself, you
can unregister with:

```bash
email="lurker@hotmail.com"
curl \
  -d "{\"email\":\"$email"}' \
  -H "Content-Type: application/json" \
  -X POST https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/unregister
```

3. `POST getAuthToken`: Allows you to retrieve an authorization token
that you will be able to send to other endpoints on the
`Authorization` header. You need to send the `email` and the
`password`, and if all goes well, you'll receive a JSON object with a
singple property: `token`.

```bash
token=$(curl \
  -d "{\"email\":\"$email", \"password\":\"$password\"}" \
  -H "Content-Type: application/json" \
  -X POST https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/getAuthToken | \
  python3 -c "import sys, json; print(json.load(sys.stdin)['token'])")
```

4. `POST getVerifyToken`: Allows you to retrieve again your
`verifyToken`, in case you lost it. Requires sending the `user` and
`password` again.
 
5. `POST verify`: Allows you to verify yourself. Nothing special
happens afterwards. It's just a mimick of email verification.

```bash
curl \
  -d "{\"verifyToken\": \"$verifyToken\"}" \
  -H "Content-Type: application/json" \
  -H "Authorization: $token" \
  -X POST https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/verify
```

6. `DELETE removeAccount`: Allows you to remove your own account.

```bash
curl -H "Authorization: $token" \
  -X DELETE https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/removeAccount
```

7. `GET listUploads`: Will return a list of file names that have been
uploaded previously. Empty if no file names have been uploaded so far.

**NOTE:** You might need to re-generate another token by calling
`getAuthToken` again.

```bash
curl -H "Authorization: $token" \
  https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/listUploads
```

8. `GET shareUpload`: Will generate a shareable link to one of your
downloads. Requires you to send (in the query parameters) the `fileName`
you want to share, and optionally an `expiresAt` property with either
a valid string date of a date in the future, or the number of seconds
you want the shareable link to be active.

```bash
curl -H "Authorization: $token" \
  https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/shareUpload?fileName=isThisAFunMeme.jpg
```

9. `POST upload`: Allows you to upload files. You'll need to send a
JSON body with two properties: `fileName`, which will hold the name of
the file, and a `base64File` property that will hold the base64
represenation of the file contents. You can try it with an image that
comes with this repository, in the folder `misc`, as the following
example shows:

```bash
base64File="$(base64 -w 0 misc/isThisAFunMeme.jpg)"
curl \
  -d "{\"base64File\": \"$base64File\", \"fileName\": \"isThisAFunMeme.jpg\"}" \
  -H "Content-Type: application/json" \
  -H "Authorization: $token" \
  -X POST https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/upload
```

10. `GET getUpload`: Since you have an authorized token for your own
account, you can retrieve this file (base64 encoded) with a simple
call to this endpoint:

_**Note:** This was probably better called `getFile`, now that I think
of it._

```bash
base64File=$(curl -H "Authorization: $token" \
  https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/getUpload?fileName=isThisAFunMeme.jpg |  \
  python3 -c "import sys, json; print(json.load(sys.stdin)['base64File'])")
```

If you want to transform it to it's original form, you can do it in
the console with the following command:

    base64 -d <<< $base64File > isThisAFunMeme.jpg

If you are a console freak (and/or you happen to be in Debian), you can view it without
leaving the terminal by installing `sudo apt-get install caca-utils` and running:

    cacaview isThisAFunMeme.jpg

11. `DELETE removeUpload`: Finally, you can remove files previously
uploaded. You can call this endpoint as follows:

```bash
curl -H "Authorization: $token" \
  -X DELETE https://rvpujtrb06.execute-api.us-east-1.amazonaws.com/dev/removeUpload?fileName=isThisAFunMeme.jpg
```

## My reasoning while building this

My main goal with this repository was to learn how to deploy code
to AWS Lambdas using serverless. I decided to take a TDD approach,
and to focus on a folder structure and utilities that would be
powerful to extend for further purposes. It was very challenging to
navigate through the intricacies of these technologies, but I'm happy
to say that this code could be used as a stepping stone for building
any other service or API.

### Design Decissions

While working on this project, I took the liberty to make some design
decissions that I believe are correct but might not be for others
(based on opinions and experiences). I'm going to list them so I can
find them later more easily:

1. **Self Contained Utilities & Small Handlers:** AWS recommends the
business code to be detached from the handlers. I tried to follow this
approach by making multiple-purpose self-contained utilities that the
handlers could use to fulfil each one of their purposes, but I left
the business logic in the handlers. My position here is that each
handler should do just one thing, which should be small, and should
have a limited and short list of caveats also described in the
handlers. Since handlers have 100% unit test coverage, I believe this
approach to be decent. On the utilities side, on larger projects they
might be better separated in folders (and perhaps into separate
repositories if they grow enough).

2. **Bad RESTful API:** This API is bad at REST, but it could be
better with little tweaks. I decided to put my time into making sure I
could support a RESTful API using serverless and AWS Lambdas, so we
have some DELETE endpoints outside of the GET and POST endpoints. The
namings of these endpoints don't overlap, which is a key difference
with RESTful APIs. A project like this with the proper time invested
would have a RESTful API without trouble, and specially without having
to change the underlying ideas: it's just about defining the proper
methods at the `serverless.yml` file, and grouping the handlers that
share a common resource in a separate folder.

3. **Piping Handlers:** our `util/handler.js` allows our handlers to
be piped from and to one another. This for me is a key decission
point, since it allows us to compose handlers, thus permitting code
reutilization.

4. **Meta Authentication Policies:** The handlers I made allow an
authentication policy that is invoked within the execution of a
single endpoint, which might happen right afterwards AWS routes the
request through the authenticator. Both the authorize handler and
this authentication policy (called `checkIn`) call almost the same
code underneath. This causes a little overhead, but the benefit is
that we're able to have a centralized place where we do
authentication and user retrieval, which we can just pipe at the
beginning of the handlers we have to provide security and a ready to
use user in the same `event` object. It might be the case that AWS has
a way to do this more accordingly to AWS designs, but I am not aware
of it.

5. **TDD:** I decided to write the unit tests as early as possible. I
tried to do them before I wrote some endpoints, but more realistically
I ended up writing many of them in parallel. It proved to be a bit
challenging, because serverless and AWS functions have their own
complications which required further reading on the AWS docs and the
source code of the libraries that I'm using. I felt a bit blocked
while figuring out why these libraries were screaming, and then when
even though the tests passed, the endpoints didn't work. However, as
soon as I figured out how to make a couple work, fixing the rest of
them followed smoothly. I think it proves that environmental issues
should be able to be solved by inference, where the business logic can
remain as unedited as possible, and small centralized changes can
solve issues for accross the platform.

6. **No ORM:** Using DynamoDB feels hard because it's really different
to other No-SQL databases that are more popular (such as Mongo or
CouchDB), and also that it lacks the many ORMs that other databases
have. While looking at [Dynamoose](https://github.com/dynamoosejs/dynamoose),
I found out that [it required a local copy of DynamoDB to run unit
tests](https://github.com/dynamoosejs/dynamoose/issues/256). I browsed
for the alternatives and found this pos: [Introducing the Amazon
DynamoDB DataMapper for JavaScript](https://aws.amazon.com/blogs/developer/introducing-the-amazon-dynamodb-datamapper-for-javascript-developer-preview/#defining-a-model-without-typescript).
A library made by Amazon to make it easier to use the DynamoDB client.
It's beautiful and it works, and it pairs well with `aws-sdk-mock`, so
I used it :)

### Disclaimer

This API feels secure and robust, I think the file structure needs
work but sacrificing it to focus in the toolset was a decent
compromise, since the requirements were not very elaborated. The
handlers being small and 100% unit tested feels great, I ended up
writing endpoints that I didn't try live until I finished the rest of
the application. I think that my approach is decent. However, I didn't
put attention on several important things. Here's a list:

**Perhaps obvious things that I'm not including:**
- I know I could reuse the JWT token for the verification token, I
  don't think it adds any practical benefit over code reduction.
- I should have discovered this earlier: <https://github.com/dherault/serverless-offline>
- Automatically generated documentation. I've heard it's a thing in
  serverless/aws lambdas, but I haven't gotten myself there.
- Currently, a user can retrieve more than one jwt token and use them
  independently. In some applications, it makes sense to restrict
  tokens so that only the last one generated is the valid one.
- The database models don't have a migration strategy.
- I'm missing configurations based on the deploy environment.
- Information about the files is not stored in a separate table.
- Multipart uploads, we don't have this yet, but I've seen code about
  it.
- Password recovery. If users forget their password, they're locked!
  😬 🔒 ☠️
- I'm missing a user interface 🙈 I hope the fact that I'm using
  webpack highlights that I know a fair bit about building user
  interfaces.

![](https://i.imgur.com/hjofzYI.gif)

And, because we're all noobs at some point, here are some of the
things I haven't figured out so far:

- DynamoDB is super tricky. Setting up createdAt as a range key causes
  wreckage in my current way to update. I wasn't successful with
  dynamo-mappers or with dynamoose. I know I will be able to figure
  out why if I start digging up the queries that are sent directly to
  dynamo, and I match them with the documentation that Dynamo has, but
  this is time expensive.
- Why does serverless logs behaves so weird? I haven't figured out how
  to just get the last log, and it seems to loop over older logs, then
  newer, then somehow returns nothing a couple of times, then I get
  the mos recent logs.
 
### Now what

Up next, I want to focus on learning about PRobot, then I'd like to
revisit this to make a Golang copy of this repository. I actually
started with Golang, but it has been about 3 years without having
excuses to use Golang on my daily job, so I'm rusty! :(

## Resources

Here is a list of things I looked at while working on this repository:

- [LambdAuth](https://github.com/danilop/LambdAuth)
- [Building a REST API in Node.js with Lambda, API Gateway, DynamoDB, and Serverless framework](https://github.com/shekhargulati/hands-on-serverless-guide/blob/master/01-aws-lambda-serverless-framework/03-building-rest-api-in-nodejs-with-lambda-gateway-dynamodb-serverless.md)
- [Error Handling Patterns in Amazon API Gateway and AWS Lambda](https://aws.amazon.com/blogs/compute/error-handling-patterns-in-amazon-api-gateway-and-aws-lambda/)
- [Introducing the Amazon
DynamoDB DataMapper for JavaScript](https://aws.amazon.com/blogs/developer/introducing-the-amazon-dynamodb-datamapper-for-javascript-developer-preview/#defining-a-model-without-typescript)
- [Class: AWS.S3 on the docs for AWSJavaScriptSDK](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html)
- [Serverless File Uploads](https://www.netlify.com/blog/2016/11/17/serverless-file-uploads/)
- [Generate a Pre-signed Object URL Using the AWS SDK for Java](https://docs.aws.amazon.com/AmazonS3/latest/dev/ShareObjectPreSignedURLJavaSDK.html)
- [How to upload files to Amazon s3 using NodeJs, Lambda and Api
  Gateway](https://medium.com/@olotintemitope/how-to-upload-files-to-amazon-s3-using-nodejs-lambda-and-api-gateway-bae665127907)
- [Nodejs AWS SDK S3 Generate Presigned URL](https://stackoverflow.com/questions/38831829/nodejs-aws-sdk-s3-generate-presigned-url)
- [Serverless Authentication with JSON Web Tokens](https://yos.io/2017/09/03/serverless-authentication-with-jwt/)
- [Serverless JWT Auth Boilerplate](https://github.com/mcnamee/serverless-jwt-auth/blob/master/auth/VerifyToken.js)
