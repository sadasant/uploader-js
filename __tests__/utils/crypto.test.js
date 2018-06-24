import { computeHash, makeToken } from '../../utils/crypto'

describe('crypto', () => {
  describe('computeHash', () => {
    it('should not break for a given password', async () => {
      let password = '123IsThisASecurePassword?'
      let { salt, hash } = await computeHash(password)
      expect(salt).toBeDefined()
      expect(hash).toBeDefined()
    })
  })
  describe('makeToken', () => {
    it('Should make a random token', async () => {
      let tokens = []
      // Is this a random check?
      for (let i = 0; i < 1000; i++) {
        let token = await makeToken()
        if (tokens.includes(token)) {
          throw 'Duplicated token'
        }
        tokens.push(token)
      }
    })
    it('Should make a hex token', async () => {
      let token = await makeToken()
      expect(token.match(/[^a-f0-9]/)).toEqual(null)
    })
  })
})
