import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const Card = ({ suit, rank, onPress, disabled = false }) => {
  // Set color based on suit
  const isRed = suit === '♥' || suit === '♦';
  const cardColor = isRed ? '#D32F2F' : '#000000';
  
  // Format rank for display (e.g., '10' stays as '10', but 'A' becomes 'A')
  const displayRank = rank.toString();
  
  return (
    <TouchableOpacity
      style={[styles.card, disabled && styles.disabled]}
      onPress={() => !disabled && onPress && onPress({ suit, rank })}
      disabled={disabled}
      activeOpacity={disabled ? 1 : 0.7}
    >
      <View style={styles.cornerTop}>
        <Text style={[styles.rank, { color: cardColor }]}>{displayRank}</Text>
        <Text style={[styles.suit, { color: cardColor }]}>{suit}</Text>
      </View>
      
      <Text style={[styles.centerSuit, { color: cardColor }]}>{suit}</Text>
      
      <View style={[styles.cornerBottom]}>
        <Text style={[styles.suit, { color: cardColor }]}>{suit}</Text>
        <Text style={[styles.rank, { color: cardColor }]}>{displayRank}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 70,
    height: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    margin: 4,
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    position: 'relative',
  },
  disabled: {
    opacity: 0.6,
  },
  cornerTop: {
    position: 'absolute',
    top: 3,
    left: 3,
    alignItems: 'center',
  },
  cornerBottom: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    alignItems: 'center',
    transform: [{ rotate: '180deg' }],
  },
  rank: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  suit: {
    fontSize: 12,
  },
  centerSuit: {
    fontSize: 26,
    fontWeight: 'bold',
  },
});

export default Card;