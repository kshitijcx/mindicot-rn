import PlayingCard from "@/components/PlayingCard";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
const cards = [
  "A♠️",
  "A♠️",
  "A♠️",
  "A♠️",
  "A♠️",
  "A♠️",
  "A♠️",
  "A♠️",
  "A♠️",
  "A♠️",
  "A♠️",
  "A♠️",
  "A♠️",
];
const GameScreen = () => {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "space-between",
        padding: 50,
        backgroundColor: "white",
      }}
    >
      <Text>GameScreen</Text>
      <View style={styles.cardContainer}>
        <ScrollView
          horizontal
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
        >
          {cards.map((item, index) => (
            <PlayingCard key={index} card={item} />
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};
export default GameScreen;

const styles = StyleSheet.create({
  cardContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
    backgroundColor: 'white',
    paddingHorizontal: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    alignItems: 'center',
    gap: 10,
  },
});
