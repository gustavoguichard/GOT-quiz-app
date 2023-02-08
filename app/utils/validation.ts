export function validateEmail(
  email: FormDataEntryValue | null,
  isEmailInUse?: boolean,
) {
  if (email === null) {
    return 'Email cannot be empty'
  } else if (typeof email !== 'string') {
    return 'Email must be a string'
  } else if (isEmailInUse) {
    return 'Email already exists'
  }
}

export function validatePassword(password: FormDataEntryValue | null) {
  if (password === null) {
    return 'Password cannot be empty'
  } else if (password.length < 7) {
    return 'Password must be at least 7 characters long'
  } else if (typeof password !== 'string') {
    return 'Password must be a string'
  }
}

export function validateUsername(username: FormDataEntryValue | null) {
  if (username === null) {
    return 'Username cannot be empty'
  } else if (typeof username !== 'string') {
    return 'Username must be a string'
  }
}
