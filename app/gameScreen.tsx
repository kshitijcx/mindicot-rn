import PlayingCard from "@/components/PlayingCard";
import { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

const initialCards = [
  "A♠️",
  "A♠️",
  "A♠️",
  "K♠️",
  "A♠️",
  "A♠️",
  "A♠️",
  "Q♠️",
  "A♠️",
  "A♠️",
  "A♠️",
  "10♠️",
  "A♠️",
];

type PlayerNumber = 1 | 2 | 3 | 4;

const GameScreen = () => {
  const [cards, setCards] = useState(initialCards);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const currentPlayer: PlayerNumber = 2;

  const handleCardSelect = (card: string, index: number) => {
    setSelectedCard(card);
    setCards(prevCards => prevCards.filter((_, i) => i !== index));
  };

  const getTurnIndicator = (playerNum: PlayerNumber) => {
    if (currentPlayer !== playerNum) return null;
    return "⚫";
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Player */}
      <View style={styles.topPlayer}>
        <Text style={styles.playerText}>
          Player 3 {getTurnIndicator(3)}
        </Text>
      </View>

      {/* Middle Section */}
      <View style={styles.middleSection}>
        {/* Left Player */}
        <View style={styles.sidePlayer}>
          <Text style={styles.playerText}>
            Player 2 {getTurnIndicator(2)}
          </Text>
        </View>

        {/* Center Area */}
        <View style={[
          styles.centerArea,
          selectedCard && { backgroundColor: '#90EE90' } // Light green when card is selected
        ]}>
          {selectedCard && (
            <View style={styles.selectedCardContainer}>
              <PlayingCard card={selectedCard} />
            </View>
          )}
        </View>

        {/* Right Player */}
        <View style={styles.sidePlayer}>
          <Text style={styles.playerText}>
            Player 4 {getTurnIndicator(4)}
          </Text>
        </View>
      </View>

      {/* Bottom Player with Cards */}
      <View style={styles.cardContainer}>
        <View style={styles.playerInfo}>
          <Text style={styles.playerText}>
            Player 1 {getTurnIndicator(1)}
          </Text>
          <Text style={styles.cardCount}>{cards.length} cards</Text>
        </View>
        <ScrollView
          horizontal
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
        >
          {cards.map((item, index) => (
            <PlayingCard 
              key={index} 
              card={item} 
              onPress={() => handleCardSelect(item, index)}
            />
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default GameScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  topPlayer: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  middleSection: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  sidePlayer: {
    width: 100,
    alignItems: 'center',
  },
  centerArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  selectedCardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    alignItems: 'center',
    gap: 10,
  },
  playerText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  cardCount: {
    fontSize: 14,
    color: '#666',
  },
});
