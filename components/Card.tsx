import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CardProps {
  suit: string;
  value: string;
  onPress?: () => void;
  disabled?: boolean;
}

export default function Card({ suit, value, onPress, disabled }: CardProps) {
  const isRed = suit === '♥' || suit === '♦';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.container, disabled && styles.disabled]}
    >
      <View style={styles.card}>
        <Text style={[styles.value, isRed && styles.redText]}>{value}</Text>
        <Text style={[styles.suit, isRed && styles.redText]}>{suit}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 5,
  },
  card: {
    width: 60,
    height: 90,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  suit: {
    fontSize: 24,
  },
  redText: {
    color: 'red',
  },
  disabled: {
    opacity: 0.5,
  },
}); 