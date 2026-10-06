import AsyncStorage from '@react-native-async-storage/async-storage';

const USERS_KEY = '@users';
const SESSION_KEY = '@session';

export interface User {
  name: string;
  email: string;
  password?: string;
}

export const getUsers = async (): Promise<User[]> => {
  try {
    const usersJson = await AsyncStorage.getItem(USERS_KEY);
    if (!usersJson) {
      const defaultUsers: User[] = [
        { name: 'User', email: 'user@telemed.com', password: 'password123' },
      ];
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    return JSON.parse(usersJson);
  } catch (e) {
    console.error('Failed to load users from storage', e);
    return [];
  }
};

export const saveUser = async (userOrName: User | string, email?: string, password?: string): Promise<boolean> => {
  try {
    const user: User = typeof userOrName === 'string'
      ? { name: userOrName, email: email || '', password: password || '' }
      : userOrName;

    const users = await getUsers();
    const exists = users.some((u) => u.email.toLowerCase() === user.email.toLowerCase());
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
  const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  return found || null;
};

export const getUserByNameOrEmail = async (identifier: string): Promise<User | null> => {
  const users = await getUsers();
  const clean = identifier.trim().toLowerCase();
  const found = users.find(
    (u) => u.email.toLowerCase() === clean || u.name.toLowerCase() === clean
  );
  return found || null;
};

export const updateUserPassword = async (email: string, newPassword: string): Promise<boolean> => {
  try {
    const users = await getUsers();
    const index = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
    if (index === -1) return false;

    users[index].password = newPassword;
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    return true;
  } catch (e) {
    console.error('Failed to update user password', e);
    return false;
  }
};

export const saveLoginSession = async (userOrName: User | string, email?: string): Promise<void> => {
  try {
    const user: User = typeof userOrName === 'string' ? { name: userOrName, email: email || '' } : userOrName;
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));

    // Synchronize active profile name & email
    try {
      const storedProfile = await AsyncStorage.getItem('@user_profile_data');
      const parsed = storedProfile ? JSON.parse(storedProfile) : {};
      await AsyncStorage.setItem(
        '@user_profile_data',
        JSON.stringify({
          ...parsed,
          name: user.name,
          email: user.email || parsed.email || `${user.name.toLowerCase().replace(/\s+/g, '')}@telemed.com`,
        })
      );
    } catch (e) {
      // ignore
    }
  } catch (e) {
    console.error('Failed to save login session', e);
  }
};

export const getLoginSession = async (): Promise<User | null> => {
  try {
    const sessionJson = await AsyncStorage.getItem(SESSION_KEY);
    return sessionJson ? JSON.parse(sessionJson) : null;
  } catch (e) {
    console.error('Failed to get login session', e);
    return null;
  }
};

export const clearLoginSession = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(SESSION_KEY);
    await AsyncStorage.removeItem('@user_profile_data');
  } catch (e) {
    console.error('Failed to clear login session', e);
  }
};
