import lambda from '../../handlers/hello'

describe('hello', () => {
  it('returns what was given', async () => {
    let event = {
      body: 'Example Body'
    }
    let response = await lambda(event, {})
    expect(response).toEqual({
      statusCode: 200,
      body: JSON.stringify({
        message: 'Hello!',
        input: event
      })
    })
  })
})
