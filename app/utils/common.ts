function cx(...args: unknown[]) {
  return args
    .flat()
    .filter((x) => typeof x === 'string')
    .join(' ')
    .trim()
}

function isNil(value: unknown): value is null | undefined {
  return typeof value === 'undefined' || value === null
}

function safeJoin(delimiter = '', ...args: unknown[]) {
  return args
    .flat()
    .filter((x) => String(x) !== '' && !isNil(x))
    .join(delimiter)
}

export { cx, isNil, safeJoin }
