import { ErrorMessages } from '../constants/ErrorMessages';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9]{10}$/;

export const validateEmail = (email: string): string => {
  if (!email) return ErrorMessages.email.required;
  if (!EMAIL_REGEX.test(email)) return ErrorMessages.email.invalid;
  return '';
};

export const validateName = (name: string): string => {
  if (!name) return ErrorMessages.name.required;
  if (name.length < 3) return ErrorMessages.name.tooShort;
  return '';
};

export const validatePassword = (password: string): string => {
  if (!password) return ErrorMessages.password.required;
  if (password.length < 6) return ErrorMessages.password.tooShort;
  return '';
};

export const validatePhone = (phone: string): string => {
  if (!phone) return ErrorMessages.phone.required;
  if (!PHONE_REGEX.test(phone)) return ErrorMessages.phone.invalid;
  return '';
};

export const isEmailValidFormat = (email: string): boolean => EMAIL_REGEX.test(email);
export const isPhoneValidFormat = (phone: string): boolean => PHONE_REGEX.test(phone);
