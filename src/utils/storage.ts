import AsyncStorage from '@react-native-async-storage/async-storage';

const USERS_KEY = '@users';
const SESSION_KEY = '@session';

export interface User {
  name: string;
  email: string;
  password?: string;
  phone?: string;
}

export const getUsers = async (): Promise<User[]> => {
  try {
    const usersJson = await AsyncStorage.getItem(USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  } catch (e) {
    console.error('Failed to load users from storage', e);
    return [];
  }
};

export const saveUser = async (user: User): Promise<boolean> => {
  try {
    const users = await getUsers();
    // Check if email already exists
    const exists = users.some(u => u.email.toLowerCase() === user.email.toLowerCase());
    if (exists) return false;

    users.push(user);
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    return true;
  } catch (e) {
    console.error('Failed to save user', e);
    return false;
  }
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const users = await getUsers();
  const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  return found || null;
};

export const getUserByPhone = async (phone: string): Promise<User | null> => {
  const users = await getUsers();
  const found = users.find(u => u.phone === phone);
  return found || null;
};

export const updateUserPassword = async (emailOrPhone: string, newPassword: string): Promise<boolean> => {
  try {
    const users = await getUsers();
    const index = users.findIndex(
      u => u.email.toLowerCase() === emailOrPhone.toLowerCase() || u.phone === emailOrPhone
    );
    if (index === -1) return false;

    users[index].password = newPassword;
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    return true;
  } catch (e) {
    console.error('Failed to update user password', e);
    return false;
  }
};

export const saveLoginSession = async (user: User): Promise<void> => {
  try {
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to save login session', e);
  }
};

export const getLoginSession = async (): Promise<User | null> => {
  try {
    const sessionJson = await AsyncStorage.getItem(SESSION_KEY);
    return sessionJson ? JSON.parse(sessionJson) : null;
  } catch (e) {
    console.error('Failed to retrieve login session', e);
    return null;
  }
};

export const clearLoginSession = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(SESSION_KEY);
  } catch (e) {
    console.error('Failed to clear login session', e);
  }
};
