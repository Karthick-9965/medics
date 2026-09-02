import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Splash from './src/screens/Splash';
import Onboarding from './src/screens/Onboarding';
import GetStarted from './src/screens/GetStarted';
import Login from './src/screens/Login';
import SignUp from './src/screens/SignUp';
import ForgotPassword from './src/screens/ForgotPassword';
import Home from './src/screens/Home';
import { Colors } from './src/constants/Colors';
import { getLoginSession, clearLoginSession } from './src/utils/storage';
import { useAppNotification } from './src/hooks/useAppNotification';

type Screen = 'splash' | 'onboarding' | 'getstarted' | 'login' | 'signup' | 'forgotpassword' | 'home';

export default function App() {
  useAppNotification();
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [userName, setUserName] = useState('');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return (
          <Splash
            onFinish={async () => {
              const session = await getLoginSession();
              if (session) {
                setUserName(session.name);
                setCurrentScreen('home');
              } else {
                setCurrentScreen('onboarding');
              }
            }}
          />
        );
      case 'onboarding':
        return <Onboarding onFinish={() => setCurrentScreen('getstarted')} />;
      case 'getstarted':
        return (
          <GetStarted
            onLogin={() => setCurrentScreen('login')}
            onSignUp={() => setCurrentScreen('signup')}
          />
        );
      case 'login':
        return (
          <Login
            onBack={() => setCurrentScreen('getstarted')}
            onLoginSuccess={(name) => {
              setUserName(name);
              setCurrentScreen('home');
            }}
            onSignUpLink={() => setCurrentScreen('signup')}
            onForgotPassword={() => setCurrentScreen('forgotpassword')}
          />
        );
      case 'signup':
        return (
          <SignUp
            onBack={() => setCurrentScreen('getstarted')}
            onSignUpSuccess={(name) => {
              setCurrentScreen('login');
            }}
            onLoginLink={() => setCurrentScreen('login')}
          />
        );
      case 'forgotpassword':
        return (
          <ForgotPassword
            onBackToLogin={() => setCurrentScreen('login')}
            onResetSuccess={() => setCurrentScreen('login')}
          />
        );
      case 'home':
        return (
          <Home
            userName={userName}
            onLogout={async () => {
              await clearLoginSession();
              setUserName('');
              setCurrentScreen('getstarted');
            }}
          />
        );
      default:
        return (
          <Splash
            onFinish={async () => {
              const session = await getLoginSession();
              if (session) {
                setUserName(session.name);
                setCurrentScreen('home');
              } else {
                setCurrentScreen('onboarding');
              }
            }}
          />
        );
    }
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        {renderScreen()}
        <StatusBar style={currentScreen === 'splash' ? 'light' : 'auto'} />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
});
