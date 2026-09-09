export const ErrorMessages = {
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
