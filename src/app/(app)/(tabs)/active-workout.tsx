import ExerciseSelectionModal from "@/app/components/exercise-selection-modal";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  Platform,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { useStopwatch } from "react-timer-hook";
import { useWorkoutStore } from "store/workout-store";

const ActiveWorkout = () => {
  const [showExerciseSelection, setShowExerciseSelection] = useState(false);

  const {
    weightUnit,
    setWeightUnit,
    workoutExercises,
    setWorkoutExercise,
    resetWorkout,
  } = useWorkoutStore();

  const router = useRouter();

  const { seconds, minutes, hours, totalSeconds, reset } = useStopwatch({
    autoStart: true,
  });

  useFocusEffect(
    useCallback(() => {
      if (workoutExercises.length === 0) {
        reset();
      }
    }, [workoutExercises.length === 0])
  );

  const getworkoutDuration = () => {
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const cancelWorkout = () => {
    Alert.alert(
      "Cancle Workout",
      "Are you sure you want to cancel the workout",
      [
        { text: "No", style: "cancel" },
        {
          text: "End Workout",
          style: "destructive",
          onPress: () => {
            resetWorkout();
            router.back();
          },
        },
      ]
    );
  };

  const addExercise = () => {
    setShowExerciseSelection(true);
  };

  return (
    <View className="flex-1">
      <StatusBar barStyle="light-content" backgroundColor={"#1f2937"} />
      <View
        className=" bg-gray-800"
        style={{
          paddingTop: Platform.OS === "ios" ? 40 : StatusBar.currentHeight || 0,
        }}
      />
      <View className=" bg-gray-800 px-5 py-4">
        <View className=" flex-row items-center justify-between">
          <View>
            <Text className=" text-white text-xl font-semibold">
              Active Workout
            </Text>
            <Text className="text-gray-300">{getworkoutDuration()}</Text>
          </View>
          <View className=" flex-row items-center space-x-3 gap-2">
            <View className=" flex-row bg-gray-700 rounded-lg">
              <TouchableOpacity
                onPress={() => setWeightUnit("lbs")}
                className={`px-3 py-1 rounded ${
                  weightUnit === "lbs" ? "bg-blue-600" : ""
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    weightUnit === "lbs" ? "text-white" : "text-gray-200"
                  }`}
                >
                  lbs
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setWeightUnit("kg")}
                className={`px-3 py-1 rounded ${
                  weightUnit === "kg" ? "bg-blue-600" : ""
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    weightUnit === "kg" ? "text-white" : "text-gray-200"
                  }`}
                >
                  kg
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={cancelWorkout}
              className=" bg-red-600 px-4 py-2 rounded-lg"
            >
              <Text className=" text-white font-medium">End Workout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View className=" flex-1 bg-white">
        <View className=" px-6 mt-4">
          <Text className=" text-center text-gray-600 mb-2">
            {workoutExercises.length} exercises
          </Text>
        </View>

        {workoutExercises.length === 0 && (
          <View className=" bg-gray-50 rounded-2xl p-6 items-center mx-5">
            <Ionicons name="barbell-outline" size={48} color={"#9ca3af"} />
            <Text className="text-gray-600 text-lg text-center mt-4 font-medium">
              No Exercises yet
            </Text>
            <Text className=" text-gray-500 text-center mt-2">
              Get Started by add your first exercise below
            </Text>
          </View>
        )}

        <KeyboardAvoidingView
          behavior={Platform.OS == "ios" ? "padding" : "height"}
          className=" flex-1"
        >
          <ScrollView className=" flex-1 px-5 mt-4">
            {workoutExercises.map((exercise) => (
              <View key={exercise.id} className=" mb-6"></View>
            ))}

            <TouchableOpacity
              className=" bg-blue-600 rounded-2xl py-4 items-center mb-6 active:bg-blue-700"
              activeOpacity={0.8}
              onPress={addExercise}
            >
              <View className="flex-row items-center">
                <Ionicons
                  name="add"
                  size={20}
                  color={"white"}
                  style={{ marginRight: 8 }}
                />
                <Text className="text-white font-semibold text-lg">
                  Add Exercise
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
      <ExerciseSelectionModal
        visible={showExerciseSelection}
        onClose={() => setShowExerciseSelection(false)}
      />
    </View>
  );
};

export default ActiveWorkout;
