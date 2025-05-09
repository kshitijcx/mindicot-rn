import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Card from './Card';

const GameTable = ({ currentTrick = [], playerIndex, currentTurn }) => {
  // Calculate relative positions of players
  const getRelativePosition = (actualIndex) => {
    if (playerIndex === null) return null;
    
    // Calculate relative position (0 = current player, 1 = player to the right, etc.)
    return (4 + actualIndex - playerIndex) % 4;
  };
  
  // For debugging
  console.log("Current trick:", JSON.stringify(currentTrick), "Player index:", playerIndex);
  
  // Calculate whose turn it is (relative to current player)
  const getCurrentTurnRelative = () => {
    if (currentTrick.length < 4) {
      // During a trick, it's the next player's turn after the last card played
      const nextPlayerIndex = currentTrick.length % 4;
      return getRelativePosition(nextPlayerIndex);
    }
    // If trick is complete (should never happen as the trick gets cleared)
    return null;
  };

  // Get player label based on relative position
  const getPlayerLabel = (relativePos) => {
    switch(relativePos) {
      case 0: return 'You';
      case 1: return 'Right Opponent';
      case 2: return 'Partner';
      case 3: return 'Left Opponent';
      default: return 'Unknown';
    }
  };

  // Prepare positions for displaying cards on table
  const positions = [
    styles.bottomPosition, // Your position
    styles.rightPosition,  // Right opponent
    styles.topPosition,    // Partner across
    styles.leftPosition    // Left opponent
  ];

  return (
    <View style={styles.tableContainer}>
      <View style={styles.table}>
        {/* Display cards that have been played in this trick */}
        {currentTrick.map((play, index) => {
          const relativePos = getRelativePosition(play.playerIndex);
          
          return (
            <View key={index} style={[styles.playPosition, positions[relativePos]]}>
              <Card 
                suit={play.card.suit} 
                rank={play.card.rank} 
                disabled={true} 
              />
              <Text style={styles.playerLabel}>{getPlayerLabel(relativePos)}</Text>
            </View>
          );
        })}
        
        {/* Empty table message */}
        {currentTrick.length === 0 && (
          <Text style={styles.emptyTableText}>
            New trick will start here
          </Text>
        )}
        
        {/* Player positions labels */}
        <View style={[
          styles.positionLabel, 
          styles.topPositionLabel,
          getCurrentTurnRelative() === 2 && styles.activeTurnLabel
        ]}>
          <Text style={styles.labelText}>Partner {getCurrentTurnRelative() === 2 ? '(Turn)' : ''}</Text>
        </View>
        <View style={[
          styles.positionLabel, 
          styles.rightPositionLabel,
          getCurrentTurnRelative() === 1 && styles.activeTurnLabel
        ]}>
          <Text style={styles.labelText}>Right {getCurrentTurnRelative() === 1 ? '(Turn)' : ''}</Text>
        </View>
        <View style={[
          styles.positionLabel, 
          styles.leftPositionLabel,
          getCurrentTurnRelative() === 3 && styles.activeTurnLabel
        ]}>
          <Text style={styles.labelText}>Left {getCurrentTurnRelative() === 3 ? '(Turn)' : ''}</Text>
        </View>
        <View style={[
          styles.positionLabel, 
          styles.bottomPositionLabel,
          getCurrentTurnRelative() === 0 && styles.activeTurnLabel
        ]}>
          <Text style={styles.labelText}>You {getCurrentTurnRelative() === 0 ? '(Turn)' : ''}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tableContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  table: {
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#1a6329', // darker green
    borderWidth: 5,
    borderColor: '#0d4d1a',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  playPosition: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomPosition: {
    bottom: 20,
    alignItems: 'center',
  },
  topPosition: {
    top: 20,
    alignItems: 'center',
  },
  leftPosition: {
    left: 20,
    alignItems: 'center',
  },
  rightPosition: {
    right: 20,
    alignItems: 'center',
  },
  playerLabel: {
    color: 'white',
    fontSize: 12,
    marginTop: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  emptyTableText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    textAlign: 'center',
  },
  positionLabel: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
  },
  labelText: {
    color: 'white',
    fontSize: 12,
  },
  topPositionLabel: {
    top: 0,
  },
  rightPositionLabel: {
    right: 0,
  },
  leftPositionLabel: {
    left: 0,
  },
  bottomPositionLabel: {
    bottom: 0,
  },
  activeTurnLabel: {
    backgroundColor: 'rgba(76, 175, 80, 0.7)',
    borderWidth: 2,
    borderColor: 'yellow',
  },
});

export default GameTable;