import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Splash from './src/screens/Splash';
import Onboarding from './src/screens/Onboarding';
import GetStarted from './src/screens/GetStarted';
import Login from './src/screens/Login';
import SignUp from './src/screens/SignUp';
import ForgotPassword from './src/screens/ForgotPassword';
import Home from './src/screens/Home';
import Messages from './src/screens/Messages';
import Schedule from './src/screens/Schedule';
import Profile from './src/screens/Profile';
import SeeAllScreen from './src/screens/SeeAllScreen';
import AmbulanceScreen from './src/screens/AmbulanceScreen';
import BottomTabBar from './src/components/bottomTab/BottomTabBar';

import { Colors } from './src/constants/Colors';
import { getLoginSession, clearLoginSession } from './src/utils/storage';
import { useAppNotification } from './src/hooks/useAppNotification';
import {
  RootStackParamList,
  MainTabParamList,
  SplashScreenProps,
  OnboardingScreenProps,
  GetStartedScreenProps,
  LoginScreenProps,
  SignUpScreenProps,
  ForgotPasswordScreenProps,
  SeeAllScreenNavProps,
  AmbulanceScreenNavProps,
} from './src/navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function HomeScreenWrapper({ navigation, route }: any) {
  const [sessionUser, setSessionUser] = React.useState<{ name: string; email: string } | null>(null);

  React.useEffect(() => {
    const fetchSession = async () => {
      const session = await getLoginSession();
      if (session) setSessionUser(session);
    };
    fetchSession();
  }, [route?.params]);

  const parentParams = route?.params || {};
  const userName = (parentParams?.userName && parentParams.userName !== 'User')
    ? parentParams.userName
    : (sessionUser?.name || '');
  const userEmail = (parentParams?.userEmail && !parentParams.userEmail.includes('@example.com'))
    ? parentParams.userEmail
    : (sessionUser?.email || '');

  const handleLogout = async () => {
    await clearLoginSession();
    navigation.reset({
      index: 0,
      routes: [{ name: 'GetStarted' }],
    });
  };

  return (
    <Home
      userName={userName}
      userEmail={userEmail}
      navigation={navigation}
      onLogout={handleLogout}
      onSeeAll={(category, query) => navigation.navigate('SeeAll', { category, query })}
      onAmbulancePress={() => navigation.navigate('Ambulance')}
      onNavigateToSchedule={() => navigation.navigate('Main', { screen: 'ScheduleTab' })}
      onNavigateToMessages={() => navigation.navigate('Main', { screen: 'MessagesTab' })}
      onNavigateToProfile={() => navigation.navigate('Main', { screen: 'ProfileTab' })}
    />
  );
}

function ProfileScreenWrapper({ navigation, route }: any) {
  const [sessionUser, setSessionUser] = React.useState<{ name: string; email: string } | null>(null);

  React.useEffect(() => {
    const fetchSession = async () => {
      const session = await getLoginSession();
      if (session) setSessionUser(session);
    };
    fetchSession();
  }, [route?.params]);

  const parentParams = route?.params || {};
  const userName = (parentParams?.userName && parentParams.userName !== 'User')
    ? parentParams.userName
    : (sessionUser?.name || '');
  const userEmail = (parentParams?.userEmail && !parentParams.userEmail.includes('@example.com'))
    ? parentParams.userEmail
    : (sessionUser?.email || '');

  const handleLogout = async () => {
    await clearLoginSession();
    navigation.reset({
      index: 0,
      routes: [{ name: 'GetStarted' }],
    });
  };

  return (
    <Profile
      userName={userName || 'User'}
      userEmail={userEmail || 'user@example.com'}
      onLogout={handleLogout}
      onNavigateToSchedule={() => navigation.navigate('Main', { screen: 'ScheduleTab' })}
    />
  );
}

function MessagesScreenWrapper({ navigation }: any) {
  return (
    <Messages
      navigation={navigation}
      onNavigateToSchedule={() => navigation.navigate('Main', { screen: 'ScheduleTab' })}
      onNavigateToAmbulance={() => navigation.navigate('Ambulance')}
      onNavigateToPharmacy={() => navigation.navigate('SeeAll', { category: 'pharmacy' })}
    />
  );
}

function ScheduleScreenWrapper({ navigation }: any) {
  return (
    <Schedule
      navigation={navigation}
      onNavigateToMessages={() => navigation.navigate('Main', { screen: 'MessagesTab' })}
      onNavigateToAmbulance={() => navigation.navigate('Ambulance')}
      onNavigateToPharmacy={() => navigation.navigate('SeeAll', { category: 'pharmacy' })}
    />
  );
}

function renderTabBar(props: any) {
  return <BottomTabBar {...props} />;
}

function MainTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={renderTabBar}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="HomeTab" component={HomeScreenWrapper} />
      <Tab.Screen name="MessagesTab" component={MessagesScreenWrapper} />
      <Tab.Screen name="ScheduleTab" component={ScheduleScreenWrapper} />
      <Tab.Screen name="ProfileTab" component={ProfileScreenWrapper} />
    </Tab.Navigator>
  );
}

function SplashScreen({ navigation }: SplashScreenProps) {
  return (
    <Splash
      onFinish={async () => {
        const session = await getLoginSession();
        if (session) {
          navigation.replace('Main', {
            screen: 'HomeTab',
            params: { userName: session.name, userEmail: session.email },
          });
        } else {
          navigation.replace('Onboarding');
        }
      }}
    />
  );
}

function OnboardingScreen({ navigation }: OnboardingScreenProps) {
  return <Onboarding onFinish={() => navigation.replace('GetStarted')} />;
}

function GetStartedScreen({ navigation }: GetStartedScreenProps) {
  return (
    <GetStarted
      onLogin={() => navigation.navigate('Login')}
      onSignUp={() => navigation.navigate('SignUp')}
    />
  );
}

function LoginScreen({ navigation, route }: LoginScreenProps) {
  return (
    <Login
      initialEmail={route.params?.email || ''}
      initialPassword={route.params?.password || ''}
      onBack={() => navigation.goBack()}
      onLoginSuccess={(name, email) => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main', params: { screen: 'HomeTab', params: { userName: name, userEmail: email } } }],
        });
      }}
      onSignUpLink={() => navigation.navigate('SignUp')}
      onForgotPassword={() => navigation.navigate('ForgotPassword')}
    />
  );
}

function SignUpScreen({ navigation }: SignUpScreenProps) {
  return (
    <SignUp
      onBack={() => navigation.goBack()}
      onSignUpSuccess={() => navigation.navigate('Login')}
      onLoginLink={() => navigation.navigate('Login')}
    />
  );
}

function ForgotPasswordScreen({ navigation }: ForgotPasswordScreenProps) {
  return (
    <ForgotPassword
      onBackToLogin={() => navigation.goBack()}
      onResetSuccess={(resetEmail, newPassword) => {
        navigation.navigate('Login', { email: resetEmail, password: newPassword });
      }}
    />
  );
}

function SeeAllScreenWrapper({ navigation, route }: SeeAllScreenNavProps) {
  return (
    <SeeAllScreen
      category={route.params.category}
      initialQuery={route.params.query}
      onBack={() => navigation.goBack()}
      onEmergencyPress={() => navigation.navigate('Ambulance')}
      onNavigateToSchedule={() => navigation.navigate('Main', { screen: 'ScheduleTab' })}
    />
  );
}

function AmbulanceScreenWrapper({ navigation }: AmbulanceScreenNavProps) {
  return <AmbulanceScreen onBack={() => navigation.goBack()} />;
}

export default function App() {
  useAppNotification();

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: Colors.white },
          }}
        >
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="GetStarted" component={GetStartedScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen name="Home" component={MainTabNavigator} />
          <Stack.Screen name="SeeAll" component={SeeAllScreenWrapper} />
          <Stack.Screen name="Ambulance" component={AmbulanceScreenWrapper} />
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
