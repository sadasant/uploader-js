export default () => {
  let calls = []
  return {
    succeed(...x) {
      calls.push(['succeed', x])
    },
    fail(...x) {
      calls.push(['fail', x])
    },
    calls
  }
}
