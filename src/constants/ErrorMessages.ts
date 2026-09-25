export const ErrorMessages = {
  EMAIL_NOT_FOUND: 'No account registered with this email address.',
  WRONG_PASSWORD: 'The password you entered is incorrect.',
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists.',
  OTP_INCOMPLETE: 'Please enter all 4 digits of the code.',
  PASSWORDS_DO_NOT_MATCH: 'Passwords do not match.',
  email: {
    required: '*Email is required',
    invalid: '*Please enter a valid email address',
  },
  name: {
    required: '*Name is required',
    tooShort: '*Name must be at least 3 characters',
  },
  password: {
    required: '*Password is required',
    tooShort: '*Password must be at least 6 characters',
    needsUppercase: '*Password must contain at least one uppercase letter (A-Z)',
    needsNumber: '*Password must contain at least one number (0-9)',
    needsSpecial: '*Password must contain at least one special character (!@#$%^&*)',
    wrong: '*The password you entered is wrong',
    confirmRequired: '*Confirm password is required',
    mismatch: '*Passwords do not match',
  },
};
