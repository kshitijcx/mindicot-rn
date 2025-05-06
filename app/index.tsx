import { Image, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GameIcon from "@/assets/images/game-icon.png";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        alignItems: "center",
        padding: 50,
        justifyContent: "space-evenly",
        backgroundColor: "white",
      }}
    >
      <Text style={{ fontSize: 30, fontWeight: "bold" }}>MINDICOT</Text>
      <Image
        source={GameIcon}
        style={{ height: 200, width: 200 }}
        resizeMode="contain"
      />
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "lightgray",
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 24,
          elevation: 6,
        }}
        onPress={() => router.navigate("/gameScreen")}
      >
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>START GAME ➡️</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
