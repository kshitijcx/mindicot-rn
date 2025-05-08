import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { io } from 'socket.io-client';
import Card from './Card';

// Use the same IP address as in GameLobby.tsx
const SOCKET_URL = 'https://mindicot-be.onrender.com/'; // Replace X with your actual IP

interface GameState {
  hand: Array<{ suit: string; value: string }>;
  currentTrick: Array<{ playerId: string; card: { suit: string; value: string } }>;
  turn: string;
  trumpSuit: string;
}

export default function GameBoard() {
  const [socket, setSocket] = useState<any>(null);
  const [gameState, setGameState] = useState<GameState>({
    hand: [],
    currentTrick: [],
    turn: '',
    trumpSuit: '',
  });

  useEffect(() => {
    console.log('GameBoard: Attempting to connect to socket server at:', SOCKET_URL);
    const newSocket = io(SOCKET_URL);
    
    newSocket.on('connect', () => {
      console.log('GameBoard: Socket connected successfully!');
    });

    newSocket.on('connect_error', (error) => {
      console.log('GameBoard: Socket connection error:', error.message);
    });

    setSocket(newSocket);

    newSocket.on('gameState', (state) => {
      console.log('GameBoard: Received game state:', state);
      setGameState((prev) => ({
        ...prev,
        currentTrick: state.currentTrick,
        turn: state.turn,
      }));
    });

    newSocket.on('gameStart', (data) => {
      console.log('GameBoard: Game started with data:', data);
      setGameState({
        hand: data.hand,
        currentTrick: [],
        turn: data.turn,
        trumpSuit: data.trumpSuit,
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleCardPress = (card: { suit: string; value: string }) => {
    if (socket && gameState.turn === socket.id) {
      console.log('Playing card:', card);
      socket.emit('playCard', card);
    }
  };

  const isCardPlayable = (card: { suit: string; value: string }) => {
    if (gameState.turn !== socket?.id) return false;
    if (gameState.currentTrick.length === 0) return true;

    const leadSuit = gameState.currentTrick[0].card.suit;
    const hasLeadSuit = gameState.hand.some((c) => c.suit === leadSuit);
    
    if (hasLeadSuit) {
      return card.suit === leadSuit;
    }
    return true;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mendicot Game</Text>
        <Text style={styles.trump}>Trump: {gameState.trumpSuit}</Text>
      </View>

      <View style={styles.trickArea}>
        {gameState.currentTrick.map((play, index) => (
          <Card
            key={index}
            suit={play.card.suit}
            value={play.card.value}
            disabled={true}
          />
        ))}
      </View>

      <ScrollView horizontal style={styles.hand}>
        {gameState.hand.map((card, index) => (
          <Card
            key={index}
            suit={card.suit}
            value={card.value}
            onPress={() => handleCardPress(card)}
            disabled={!isCardPlayable(card)}
          />
        ))}
      </ScrollView>

      <Text style={styles.turn}>
        {gameState.turn === socket?.id ? "Your turn" : "Waiting for other players..."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  trump: {
    fontSize: 18,
    marginTop: 5,
  },
  trickArea: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 120,
    marginBottom: 20,
  },
  hand: {
    flexGrow: 0,
    marginBottom: 20,
  },
  turn: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
}); 