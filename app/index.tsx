import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import GameBoard from '../components/GameBoard';
import GameLobby from '../components/GameLobby';

export default function GameScreen() {
  const [gameStarted, setGameStarted] = useState(false);

  return (
    <View style={styles.container}>
      {!gameStarted ? (
        <GameLobby onGameStart={() => setGameStarted(true)} />
      ) : (
        <GameBoard />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
