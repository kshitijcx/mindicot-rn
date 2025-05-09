import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import io from 'socket.io-client';
import GameTable from '../components/GameTable';
import PlayerHand from '../components/PlayerHand';

export default function App() {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [gameState, setGameState] = useState({
    playerIndex: null,
    playerCount: 0,
    hand: [],
    trumpSuit: null,
    currentTrick: [],
    tricksWon: [0, 0],
    tensCount: [0, 0],
    gameStarted: false,
    gameOver: false,
    winner: null,
    myTurn: false
  });

  // Initialize socket connection
  useEffect(() => {
    // Connect to the socket.io server
    const socketConnection = io("https://mindicot-be.onrender.com");
    
    socketConnection.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
      setSocket(socketConnection);
    });

    socketConnection.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
      
      // Reset game state
      setGameState({
        playerIndex: null,
        playerCount: 0,
        hand: [],
        trumpSuit: null,
        currentTrick: [],
        tricksWon: [0, 0],
        tensCount: [0, 0],
        gameStarted: false,
        gameOver: false,
        winner: null,
        myTurn: false
      });
    });

    // Clean up socket on unmount
    return () => {
      if (socketConnection) {
        socketConnection.disconnect();
      }
    };
  }, []);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    socket.on('joined', ({ playerIndex, playerCount }) => {
      console.log(`Joined as player ${playerIndex}`);
      setGameState(prev => ({
        ...prev,
        playerIndex,
        playerCount
      }));
    });

    socket.on('player_count', ({ count }) => {
      console.log(`Player count updated: ${count}`);
      setGameState(prev => ({
        ...prev,
        playerCount: count
      }));
    });

    socket.on('game_start', ({ playerIndex, hand, trump }) => {
      console.log('Game started!', hand, trump);
      setGameState(prev => ({
        ...prev,
        playerIndex,
        hand: hand.map(card => ({ suit: card.suit, rank: card.rank })),
        trumpSuit: trump,
        gameStarted: true,
        myTurn: playerIndex === 0, // First player starts
        currentTrick: []
      }));
    });

    socket.on('card_played', ({ playerId, card }) => {
      console.log('Card played', playerId, card);
      setGameState(prev => {
        // Add card to current trick
        const updatedTrick = [...prev.currentTrick, { playerId, card }];
        
        // Calculate if it's my turn
        // The next player is determined by trick length (player after the last one who played)
        const nextPlayerIndex = (updatedTrick.length) % 4;
        const isMyTurn = nextPlayerIndex === prev.playerIndex;
        
        console.log(`Card played, next player: ${nextPlayerIndex}, my index: ${prev.playerIndex}, my turn: ${isMyTurn}`);
        
        return {
          ...prev,
          currentTrick: updatedTrick,
          myTurn: isMyTurn
        };
      });
    });

    socket.on('trick_complete', ({ tricksWon, tensCount }) => {
      console.log('Trick complete', tricksWon, tensCount);
      
      // The server needs to tell us who won the trick and gets to play next
      // Since we don't have that info, we'll use a Socket.io emit to get current turn
      socket.emit('get_current_turn');
      
      setGameState(prev => ({
        ...prev,
        tricksWon,
        tensCount,
        currentTrick: [],
        // We'll update myTurn when we receive the current_turn event
      }));
    });
    
    // Add new event listener for current turn updates
    socket.on('current_turn', (turnIndex) => {
      console.log('Current turn received:', turnIndex);
      setGameState(prev => ({
        ...prev,
        myTurn: turnIndex === prev.playerIndex
      }));
    });

    socket.on('game_over', ({ winner, finalStats }) => {
      console.log('Game over', winner, finalStats);
      setGameState(prev => ({
        ...prev,
        gameOver: true,
        winner,
        tricksWon: finalStats.tricksWon,
        tensCount: finalStats.tensCount
      }));
      
      Alert.alert(
        "Game Over",
        `${winner} has won the game!`,
        [{ text: "OK" }]
      );
    });

    socket.on('game_reset', () => {
      console.log('Game reset');
      setGameState(prev => ({
        ...prev,
        hand: [],
        trumpSuit: null,
        currentTrick: [],
        tricksWon: [0, 0],
        tensCount: [0, 0],
        gameStarted: false,
        gameOver: false,
        winner: null,
        myTurn: false
      }));
    });

    socket.on('invalid_move', (error) => {
      console.log('Invalid move', error);
      Alert.alert("Invalid Move", error.message);
    });

    socket.on('error', ({ message }) => {
      console.log('Error', message);
      Alert.alert("Error", message);
    });

    return () => {
      socket.off('joined');
      socket.off('player_count');
      socket.off('game_start');
      socket.off('card_played');
      socket.off('trick_complete');
      socket.off('game_over');
      socket.off('game_reset');
      socket.off('invalid_move');
      socket.off('error');
    };
  }, [socket]);

  // Join game handler
  const handleJoinGame = () => {
    if (!socket || !connected) return;
    socket.emit('join_game');
  };

  // Play card handler
  const handlePlayCard = (card) => {
    if (!socket || !gameState.gameStarted || !gameState.myTurn || gameState.gameOver) return;
    socket.emit('play_card', card);
    
    // Remove card from hand locally for immediate feedback
    setGameState(prev => ({
      ...prev,
      hand: prev.hand.filter(c => !(c.suit === card.suit && c.rank === card.rank)),
      myTurn: false
    }));
  };

  // Get my team index
  const getMyTeam = () => {
    return gameState.playerIndex !== null ? gameState.playerIndex % 2 : null;
  };

  // Render lobby screen
  const renderLobby = () => (
    <View style={styles.container}>
      <Text style={styles.title}>Mendicot Card Game</Text>
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          {connected 
            ? `Connected! ${gameState.playerCount}/4 players joined` 
            : 'Connecting to server...'}
        </Text>
      </View>
      
      <TouchableOpacity 
        style={[
          styles.joinButton, 
          (!connected || gameState.playerIndex !== null) && styles.disabledButton
        ]}
        disabled={!connected || gameState.playerIndex !== null}
        onPress={handleJoinGame}
      >
        <Text style={styles.buttonText}>
          {gameState.playerIndex !== null ? 'Waiting for players...' : 'Join Game'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Render game screen
  const renderGame = () => {
    const myTeam = getMyTeam();
    return (
      <SafeAreaView style={styles.gameContainer}>
        <View style={styles.statusBar}>
          <Text style={styles.statusText}>
            Trump: <Text style={styles.highlight}>{gameState.trumpSuit}</Text>
          </Text>
          <Text style={styles.statusText}>
            Score: <Text style={styles.highlight}>
              Team {myTeam}: {gameState.tricksWon[myTeam]} tricks, {gameState.tensCount[myTeam]} tens | 
              Team {1-myTeam}: {gameState.tricksWon[1-myTeam]} tricks, {gameState.tensCount[1-myTeam]} tens
            </Text>
          </Text>
          <Text style={[styles.statusText, gameState.myTurn ? styles.yourTurn : {}]}>
            {gameState.myTurn ? "Your Turn!" : "Waiting for other player..."}
          </Text>
        </View>
        
        <GameTable 
          currentTrick={gameState.currentTrick}
          playerIndex={gameState.playerIndex}
        />
        
        <PlayerHand 
          cards={gameState.hand} 
          onPlayCard={handlePlayCard}
          enabled={gameState.myTurn}
        />
      </SafeAreaView>
    );
  };

  return (
    <>
      <StatusBar barStyle="dark-content" />
      {gameState.gameStarted ? renderGame() : renderLobby()}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  gameContainer: {
    flex: 1,
    backgroundColor: '#2c8c3c', // card table green
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  infoContainer: {
    marginBottom: 30,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
    width: '100%',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
  joinButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#A5D6A7',
    elevation: 0,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  statusBar: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    flexDirection: 'column',
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    marginVertical: 2,
  },
  highlight: {
    fontWeight: 'bold',
    color: '#FFC107',
  },
  yourTurn: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});