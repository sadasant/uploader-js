import 'babel-polyfill'
import 'source-map-support/register'
export const hello = require('./handlers/hello').default
export const register = require('./handlers/register').default
export const unregister = require('./handlers/unregister').default
export const verify = require('./handlers/verify').default
