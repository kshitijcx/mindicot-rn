import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
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
    gameResult: null, // Added to store game result message
    myTurn: false,
    currentTurn: null
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
        gameResult: null,
        myTurn: false,
        currentTurn: null
      });
    });

    // Clean up socket on unmount
    return () => {
      if (socketConnection) {
        socketConnection.disconnect();
      }
    };
  }, []);

  // Helper function to convert server-side player ID to player index in currentTrick
  const getPlayerIndexFromId = (playerId) => {
    if (!socket) return -1;
    
    // Find the index of this player in the game
    if (socket.id === playerId) {
      return gameState.playerIndex;
    }
    
    // For other players, we need to base it on the order of connection
    // This is a simplification and might need adjustment based on your server's player tracking
    if (gameState.playerIndex === 0) {
      // If I'm player 0, other players are 1, 2, 3
      // This is a simplified approach - ideally server would send actual indices
      const knownPlayers = gameState.currentTrick
        .filter(p => p.playerId !== socket.id)
        .map(p => p.playerId);
        
      if (!knownPlayers.includes(playerId)) {
        // First time seeing this player
        return knownPlayers.length + 1;
      } else {
        // We've seen this player before
        return knownPlayers.indexOf(playerId) + 1;
      }
    }
    
    // Similar logic for other player indices
    // This is imperfect and should be replaced with server-sent indices
    return -1;
  };

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
        currentTrick: [],
        // Don't set myTurn here, we'll get it from current_turn event
      }));
      
      // Request current turn information
      socket.emit('get_current_turn');
    });

    socket.on('card_played', ({ playerId, card, nextTurn }) => {
      console.log('Card played', playerId, card, 'Next turn:', nextTurn);
      
      setGameState(prev => {
        // Figure out the player index for this card
        const playerIndex = gameState.currentTrick.length === 0 ? 
          (prev.currentTurn !== null ? prev.currentTurn : 0) : 
          (prev.currentTurn !== null ? prev.currentTurn : 0);
          
        // Add card to current trick with player index
        const updatedTrick = [...prev.currentTrick, { 
          playerIndex, 
          card: { suit: card.suit, rank: card.rank } 
        }];
        
        // Update current turn if provided
        const newCurrentTurn = nextTurn !== undefined ? nextTurn : prev.currentTurn;
        
        // Check if it's my turn now
        const isMyTurn = newCurrentTurn === prev.playerIndex;
        
        console.log(`Card played, next player: ${newCurrentTurn}, my index: ${prev.playerIndex}, my turn: ${isMyTurn}`);
        
        return {
          ...prev,
          currentTrick: updatedTrick,
          currentTurn: newCurrentTurn,
          myTurn: isMyTurn
        };
      });
    });

    socket.on('trick_complete', ({ tricksWon, tensCount, nextTurn }) => {
      console.log('Trick complete', tricksWon, tensCount, 'Next turn:', nextTurn);
      
      setGameState(prev => {
        // Update current turn if provided
        const newCurrentTurn = nextTurn !== undefined ? nextTurn : prev.currentTurn;
        
        // Check if it's my turn now
        const isMyTurn = newCurrentTurn === prev.playerIndex;
        
        return {
          ...prev,
          tricksWon,
          tensCount,
          currentTrick: [], // Clear the trick
          currentTurn: newCurrentTurn,
          myTurn: isMyTurn
        };
      });
    });
    
    // Add event listener for current turn updates
    socket.on('current_turn', (turnIndex) => {
      console.log('Current turn received:', turnIndex);
      setGameState(prev => ({
        ...prev,
        currentTurn: turnIndex,
        myTurn: turnIndex === prev.playerIndex
      }));
    });

    // Fixed game_over event handler
    socket.on('game_over', (result) => {
      console.log('Game over', result);
      
      // Extract the relevant information from the result object
      const { outcome, winner, message, finalStats } = result;
      
      // Update game state with game over information
      setGameState(prev => ({
        ...prev,
        gameOver: true,
        winner: outcome === 'tie' ? 'Tie' : winner,
        gameResult: message,
        tricksWon: finalStats.tricksWon,
        tensCount: finalStats.tensCount,
        myTurn: false // Nobody's turn when game is over
      }));
      
      // Show game over alert
      Alert.alert(
        "Game Over",
        message,
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
        gameResult: null,
        myTurn: false,
        currentTurn: null
      }));
    });

    socket.on('invalid_move', (error) => {
      console.log('Invalid move', error);
      Alert.alert("Invalid Move", error);
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
      socket.off('current_turn');
      socket.off('game_over');
      socket.off('game_reset');
      socket.off('invalid_move');
      socket.off('error');
    };
  }, [socket, gameState.playerIndex]);

  // Join game handler
  const handleJoinGame = () => {
    if (!socket || !connected) return;
    socket.emit('join_game');
    
    // Request the current turn state immediately after joining
    setTimeout(() => {
      if (socket && connected) {
        socket.emit('get_current_turn');
      }
    }, 1000); // Small delay to ensure join has happened
  };

  // Play card handler
  const handlePlayCard = (card) => {
    if (!socket || !gameState.gameStarted || !gameState.myTurn || gameState.gameOver) return;
    socket.emit('play_card', card);
    
    // Remove card from hand locally for immediate feedback
    setGameState(prev => ({
      ...prev,
      hand: prev.hand.filter(c => !(c.suit === card.suit && c.rank === card.rank)),
      myTurn: false // Set myTurn to false until server confirms next turn
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
      
      <View style={{marginBottom: 30}}>
        <Image source={require('../assets/images/game-icon.png')} style={{width: 100, height: 100}} resizeMode="contain" />
      </View>

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

  // Render game over screen
  const renderGameOver = () => {
    const myTeam = getMyTeam();
    return (
      <SafeAreaView style={styles.gameContainer}>
        <View style={styles.gameOverContainer}>
          <Text style={styles.gameOverTitle}>Game Over</Text>
          
          <Text style={styles.gameOverText}>{gameState.gameResult}</Text>
          
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>
              Team {myTeam}: {gameState.tricksWon[myTeam]} tricks, {gameState.tensCount[myTeam]} tens
            </Text>
            <Text style={styles.scoreText}>
              Team {1-myTeam}: {gameState.tricksWon[1-myTeam]} tricks, {gameState.tensCount[1-myTeam]} tens
            </Text>
          </View>
          
          <Text style={styles.waitingText}>
            Waiting for players to reconnect...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render game screen
  const renderGame = () => {
    // If game is over, show game over screen instead
    if (gameState.gameOver) {
      return renderGameOver();
    }
  
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
          <Text style={styles.debugText}>
            Current Turn Player: {gameState.currentTurn !== null ? gameState.currentTurn : 'Unknown'}
          </Text>
        </View>
        
        <GameTable 
          currentTrick={gameState.currentTrick}
          playerIndex={gameState.playerIndex}
          currentTurn={gameState.currentTurn}
        />
        
        <PlayerHand 
          cards={gameState.hand} 
          onPlayCard={handlePlayCard}
          enabled={gameState.myTurn}
          currentTrick={gameState.currentTrick}
          trumpSuit={gameState.trumpSuit}
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
  debugText: {
    color: '#BBB',
    fontSize: 12,
    fontStyle: 'italic',
  },
  // Game over screen styles
  gameOverContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 20,
  },
  gameOverTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFC107',
    marginBottom: 20,
  },
  gameOverText: {
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
    marginBottom: 30,
  },
  scoreContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 40,
    width: '100%',
  },
  scoreText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 5,
  },
  waitingText: {
    color: '#BBB',
    fontSize: 14,
    fontStyle: 'italic',
  }
});