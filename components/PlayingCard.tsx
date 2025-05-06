import { StyleSheet, Text, View } from 'react-native'
const PlayingCard = ({card}) => {
  return (
    <View style={{height:100,width:70,borderWidth:0.5}}>
      <Text>{card}</Text>
    </View>
  )
}
export default PlayingCard
const styles = StyleSheet.create({})