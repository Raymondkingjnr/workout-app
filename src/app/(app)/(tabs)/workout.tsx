import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from "react-native";

const Workout = () => {
  const router = useRouter();

  const startWorkout = () => {
    router.push("/active-workout");
  };
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />
      <View className=" flex-1 px-4">
        <View className=" pt-7 pb-7">
          <Text className=" text-2xl font-bold text-gray-900 mb-2">
            Ready To Train?
          </Text>
          <Text className=" text-lg text-gray-600">
            Start your workout session
          </Text>
        </View>
      </View>

      <View className=" bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mx-5 mb-7">
        <View className=" flex-row items-center justify-between mb-5">
          <View className=" flex-row items-center">
            <View className=" w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-3">
              <Ionicons name="fitness" size={24} color={"#3b82f6"} />
            </View>
            <View>
              <Text className=" text-xl font-semibold text-gray-900">
                Start Workout
              </Text>
              <Text className=" text-gray-500">
                Begin your training session
              </Text>
            </View>
          </View>
          <View className=" bg-green-100 px-4 py-1 rounded-full">
            <Text className=" text-green-700 font-medium text-sm">Ready</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={startWorkout}
          className=" bg-blue-600 rounded-2xl py-4 items-center active:bg-blue-700"
          activeOpacity={0.8}
        >
          <View className=" flex-row items-center">
            <Ionicons
              name="play"
              size={20}
              color={"white"}
              style={{ marginRight: 8 }}
            />
            <Text className=" text-white font-semibold text-lg">
              Start workout
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Workout;
