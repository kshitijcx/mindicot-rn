import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PlayingCardProps {
  card: string;
  onPress?: () => void;
}

const PlayingCard = ({ card, onPress }: PlayingCardProps) => {
  const CardComponent = onPress ? TouchableOpacity : View;
  
  return (
    <CardComponent 
      style={{
        height: 100,
        width: 70,
        borderWidth: 0.5,
        backgroundColor: 'white',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
      }} 
      onPress={onPress}
    >
      <Text>{card}</Text>
    </CardComponent>
  )
}

export default PlayingCard
const styles = StyleSheet.create({})