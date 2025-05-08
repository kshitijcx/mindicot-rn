import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { io } from 'socket.io-client';

const SOCKET_URL = 'https://mindicot-be.onrender.com/';

interface GameLobbyProps {
  onGameStart: () => void;
}

export default function GameLobby({ onGameStart }: GameLobbyProps) {
  const [socket, setSocket] = useState<any>(null);
  const [waitingStatus, setWaitingStatus] = useState({
    playersConnected: 0,
    playersNeeded: 4
  });

  useEffect(() => {
    console.log('Attempting to connect to socket server at:', SOCKET_URL);
    const newSocket = io(SOCKET_URL);

    newSocket.on('connect', () => {
      console.log('Socket connected successfully!');
    });

    newSocket.on('connect_error', (error) => {
      console.log('Socket connection error:', error.message);
    });

    setSocket(newSocket);

    newSocket.on('waitingForPlayers', (status) => {
      console.log('Received waitingForPlayers status:', status);
      setWaitingStatus(status);
    });

    newSocket.on('roomFull', () => {
      alert('Room is full!');
      newSocket.disconnect();
    });

    newSocket.on('gameStart', (gameData) => {
      console.log('Game started with data:', gameData);
      onGameStart();
    });

    return () => {
      newSocket.disconnect();
    };
  }, [onGameStart]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mendicot Game</Text>
      <View style={{ width: 200, height: 200, marginBottom: 20 }}>
        <Image style={{ width: 200, height: 200 }} source={require('../assets/images/game-icon.png')} resizeMode='contain' />
      </View>
      <Text style={styles.status}>
        Waiting for players... ({waitingStatus.playersConnected}/4)
      </Text>
      <Text style={styles.subtitle}>
        {waitingStatus.playersNeeded} more players needed
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  status: {
    fontSize: 18,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
}); 