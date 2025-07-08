import React from "react";
import {
  Alert,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@clerk/clerk-expo";

export default function Page() {
  const { signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert("Sign out", "Are yu sure you want to sign out", [
      {
        text: "cancle",
        style: "cancel",
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => signOut(),
      },
    ]);
  };
  return (
    <SafeAreaView className="flex flex-1">
      <Text>Profile</Text>
      <View>
        <TouchableOpacity
          onPress={handleSignOut}
          activeOpacity={0.8}
          className=" bg-red-600 rounded-2xl p-4 shadow-sm"
        >
          <View className=" flex-row items-center justify-center">
            <Ionicons name="log-out-outline" color="white" size={20} />
            <Text className=" text-white font-semibold text-lg ml-2">
              Sign Out
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
