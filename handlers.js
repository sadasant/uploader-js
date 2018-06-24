import 'babel-polyfill'
import 'source-map-support/register'
export const hello = require('./handlers/hello').default
export const register = require('./handlers/register').default
