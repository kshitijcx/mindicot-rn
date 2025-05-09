import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Card from './Card';

const PlayerHand = ({ cards, onPlayCard, enabled = true }) => {
  // Sort cards by suit and rank
  const sortedCards = [...cards].sort((a, b) => {
    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    
    if (a.suit !== b.suit) {
      return suits.indexOf(a.suit) - suits.indexOf(b.suit);
    }
    
    return ranks.indexOf(a.rank.toString()) - ranks.indexOf(b.rank.toString());
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Hand {!enabled && "(Wait for your turn)"}</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {sortedCards.map((card, index) => (
          <Card
            key={`${card.suit}-${card.rank}-${index}`}
            suit={card.suit}
            rank={card.rank}
            onPress={onPlayCard}
            disabled={!enabled}
          />
        ))}
        {cards.length === 0 && (
          <Text style={styles.emptyText}>No cards in hand</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderTopWidth: 1,
    borderTopColor: '#444',
    paddingBottom: 20, // Extra padding at bottom for safe area
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  scrollContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#ccc',
    fontSize: 16,
    padding: 20,
  }
});

export default PlayerHand;