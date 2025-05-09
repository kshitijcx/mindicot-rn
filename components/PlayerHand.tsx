import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Card from './Card';

interface Card {
  suit: string;
  rank: string | number;
}

interface TrickPlay {
  playerIndex: number;
  card: Card;
}

interface PlayerHandProps {
  cards: Card[];
  onPlayCard: (card: Card) => void;
  enabled?: boolean;
  currentTrick?: TrickPlay[];
  trumpSuit?: string | null;
}

const PlayerHand: React.FC<PlayerHandProps> = ({ 
  cards, 
  onPlayCard, 
  enabled = true, 
  currentTrick = [], 
  trumpSuit = null 
}) => {
  // Sort cards by suit and rank
  const sortedCards = [...cards].sort((a, b) => {
    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    
    if (a.suit !== b.suit) {
      return suits.indexOf(a.suit) - suits.indexOf(b.suit);
    }
    
    return ranks.indexOf(a.rank.toString()) - ranks.indexOf(b.rank.toString());
  });

  // Determine if a card is playable based on game rules
  const isCardPlayable = (card: Card): boolean => {
    // If it's not your turn, no cards are playable
    if (!enabled) return false;

    // If no cards have been played in the current trick, all cards are playable
    if (currentTrick.length === 0) return true;

    // Get the suit of the first card played in the current trick
    const leadingSuit = currentTrick[0].card.suit;

    // If the card matches the leading suit or is a trump, it's playable
    if (card.suit === leadingSuit || card.suit === trumpSuit) return true;

    // Check if player has any cards of the leading suit
    const hasLeadingSuit = cards.some(c => c.suit === leadingSuit);
    
    // If player has no cards of the leading suit, all cards are playable
    if (!hasLeadingSuit) return true;

    // Otherwise, only cards matching the leading suit or trump are playable
    return false;
  };

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
            disabled={!isCardPlayable(card)}
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
    backgroundColor: '#F5F5F5',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  scrollContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
});

export default PlayerHand;