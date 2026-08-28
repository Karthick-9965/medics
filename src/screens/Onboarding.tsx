import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
 
const { width, height } = Dimensions.get('window');
 
interface OnboardingProps {
  onFinish: () => void;
}
 
const ONBOARDING_DATA = [
  {
    id: '1',
    title: 'Consult only with a doctor you trust',
    image: require('../assets/doctor1.png'),
  },
  {
    id: '2',
    title: 'Find a lot of specialist doctors in one place',
    image: require('../assets/doctor2.png'),
  },
  {
    id: '3',
    title: 'Get connect our Online Consultation',
    image: require('../assets/doctor3.png'),
  },
];
 
export default function Onboarding({ onFinish }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
 
  const handleNext = () => {
    if (currentStep < ONBOARDING_DATA.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onFinish();
    }
  };
 
  const currentData = ONBOARDING_DATA[currentStep];
 
  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View />
        <TouchableOpacity onPress={onFinish}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>
 
      {/* Doctor Image Container */}
      <View style={styles.imageContainer}>
        <Image
          source={currentData.image}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
 
      {/* Floating Description Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{currentData.title}</Text>
 
        <View style={styles.cardFooter}>
          {/* Pagination Indicators */}
          <View style={styles.indicatorContainer}>
            {ONBOARDING_DATA.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  index === currentStep
                    ? styles.indicatorActive
                    : styles.indicatorInactive,
                ]}
              />
            ))}
          </View>
 
          {/* Next Button */}
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Ionicons name="arrow-forward" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipText: {
    color: '#8e8e93',
    fontSize: 16,
    fontWeight: '500',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  image: {
    width: width * 0.85,
    height: height * 0.45,
  },
  card: {
    backgroundColor: '#F5F8F7',
    marginHorizontal: 20,
    marginBottom: 30,
    padding: 24,
    borderRadius: 24,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    // Android shadow
    elevation: 3,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A3B32',
    lineHeight: 30,
    marginBottom: 28,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicator: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  indicatorActive: {
    width: 20,
    backgroundColor: '#138A72',
  },
  indicatorInactive: {
    width: 6,
    backgroundColor: '#D1E6E2',
  },
  nextButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#138A72',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#138A72',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
});
 