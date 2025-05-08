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
  teamScores: { 1: number; 2: number };
  team: number;
  tensWon: { 1: number; 2: number };
  tricksWon: { 1: number; 2: number };
  gameOver: boolean;
}

interface GameBoardProps {
  initialGameData: any;
}

export default function GameBoard({ initialGameData }: GameBoardProps) {
  const [socket, setSocket] = useState<any>(null);
  const [gameState, setGameState] = useState<GameState>({
    hand: initialGameData.hand || [],
    currentTrick: [],
    turn: initialGameData.turn || '',
    trumpSuit: initialGameData.trumpSuit || '',
    teamScores: initialGameData.teamScores || { 1: 0, 2: 0 },
    team: initialGameData.team || 0,
    tensWon: initialGameData.tensWon || { 1: 0, 2: 0 },
    tricksWon: initialGameData.tricksWon || { 1: 0, 2: 0 },
    gameOver: false
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
        teamScores: state.teamScores,
        tensWon: state.tensWon,
        tricksWon: state.tricksWon
      }));
    });

    newSocket.on('gameOver', (data) => {
      console.log('GameBoard: Game over:', data);
      setGameState(prev => ({
        ...prev,
        gameOver: true
      }));
      alert(`Game Over! ${data.winReason === 'tie' ? "It's a tie!" : `Team ${data.winningTeam} wins by ${data.winReason}!`}`);
    });

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  const handleCardPress = (card: { suit: string; value: string }) => {
    if (socket && gameState.turn === socket.id && !gameState.gameOver) {
      console.log('Playing card:', card);
      socket.emit('playCard', card);
    }
  };

  const isCardPlayable = (card: { suit: string; value: string }) => {
    if (gameState.turn !== socket?.id || gameState.gameOver) return false;
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
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Mendicot Game</Text>
          <Text style={styles.trump}>Trump: {gameState.trumpSuit}</Text>
          <View style={styles.scoreContainer}>
            <View style={styles.teamScore}>
              <Text style={styles.score}>Team 1: {gameState.teamScores[1]}</Text>
              <Text style={styles.subScore}>Tens: {gameState.tensWon[1]}</Text>
              <Text style={styles.subScore}>Tricks: {gameState.tricksWon[1]}</Text>
            </View>
            <View style={styles.teamScore}>
              <Text style={styles.score}>Team 2: {gameState.teamScores[2]}</Text>
              <Text style={styles.subScore}>Tens: {gameState.tensWon[2]}</Text>
              <Text style={styles.subScore}>Tricks: {gameState.tricksWon[2]}</Text>
            </View>
          </View>
          <Text style={styles.team}>You are on Team {gameState.team}</Text>
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

        <View style={styles.handContainer}>
          <ScrollView horizontal contentContainerStyle={styles.hand}>
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
        </View>

        <Text style={styles.turn}>
          {gameState.gameOver 
            ? "Game Over!" 
            : gameState.turn === socket?.id 
              ? "Your turn" 
              : "Waiting for other players..."}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  trump: {
    fontSize: 18,
    marginTop: 5,
    textAlign: 'center',
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    gap: 40,
  },
  teamScore: {
    alignItems: 'center',
  },
  score: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subScore: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  team: {
    fontSize: 16,
    marginTop: 5,
    color: '#666',
  },
  trickArea: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 120,
    marginBottom: 20,
  },
  handContainer: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: 20,
  },
  hand: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  turn: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
}); 