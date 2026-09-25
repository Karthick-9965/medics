import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NavigatorScreenParams } from '@react-navigation/native';
import { SeeAllCategory } from '../screens/SeeAllScreen';

export type MainTabParamList = {
  HomeTab: { userName?: string; userEmail?: string } | undefined;
  MessagesTab: undefined;
  ScheduleTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  GetStarted: undefined;
  Login: { email?: string; password?: string } | undefined;
  SignUp: undefined;
  ForgotPassword: { email?: string } | undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  Home: { userName?: string; userEmail?: string } | undefined;
  SeeAll: { category: SeeAllCategory; query?: string };
  Ambulance: undefined;
};

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

export type SplashScreenProps = NativeStackScreenProps<RootStackParamList, 'Splash'>;
export type OnboardingScreenProps = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;
export type GetStartedScreenProps = NativeStackScreenProps<RootStackParamList, 'GetStarted'>;
export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
export type SignUpScreenProps = NativeStackScreenProps<RootStackParamList, 'SignUp'>;
export type ForgotPasswordScreenProps = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;
export type MainScreenProps = NativeStackScreenProps<RootStackParamList, 'Main'>;
export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type SeeAllScreenNavProps = NativeStackScreenProps<RootStackParamList, 'SeeAll'>;
export type AmbulanceScreenNavProps = NativeStackScreenProps<RootStackParamList, 'Ambulance'>;

export type MainTabScreenProps<T extends keyof MainTabParamList> = BottomTabScreenProps<
  MainTabParamList,
  T
>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
