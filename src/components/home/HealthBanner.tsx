import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { Colors } from '../../constants/Colors';

const bannerDoctor = require('../../assets/images/home/banner-doctor.png');

export default function HealthBanner() {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Early protection for{'\n'}your family health</Text>
          <TouchableOpacity style={styles.button} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Learn more</Text>
          </TouchableOpacity>
        </View>
        <Image source={bannerDoctor} style={styles.image} resizeMode="contain" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  container: {
    backgroundColor: '#E8F6F4',
    borderRadius: 16,
    height: 135,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    paddingLeft: 18,
    paddingVertical: 18,
    justifyContent: 'center',
    zIndex: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.black,
    lineHeight: 22,
    marginBottom: 12,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  image: {
    width: 140,
    height: 135,
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
});
