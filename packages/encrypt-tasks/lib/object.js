export function isObject(obj) {
  return (
    obj &&
    typeof obj === "object" &&
    obj.constructor === Object
  )
}

export function objectIs({ regex, value }) {
  let str = typeof value == "string"
  return {
    match: str && value.match(regex),
    obj: isObject(value),
    str,
  }
}
