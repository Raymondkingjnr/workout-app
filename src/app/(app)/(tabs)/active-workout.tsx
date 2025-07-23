import { WorkoutData } from "@/app/api/save-workout+api";
import ExerciseSelectionModal from "@/app/components/exercise-selection-modal";
import { client } from "@/lib/client/client";
import { useUser } from "@clerk/clerk-expo";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect, useRouter } from "expo-router";
import { defineQuery } from "groq";
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
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useStopwatch } from "react-timer-hook";
import { useWorkoutStore, WorkoutSet } from "store/workout-store";

const fetchExerciseQuery =
  defineQuery(`*[_type == "exercise" && name == $name][0] 
   {
  _id,
  name
  }
  `);

const ActiveWorkout = () => {
  const [showExerciseSelection, setShowExerciseSelection] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useUser();

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

  const deleteExercise = (id: string) => {
    setWorkoutExercise((exercises) =>
      exercises.filter((exercise) => exercise.id !== id)
    );
  };

  const addNewSet = (exerciseId: string) => {
    const newSet: WorkoutSet = {
      id: Math.random().toString(),
      reps: "",
      weight: "",
      weightUnit: weightUnit,
      isCompleted: false,
    };

    setWorkoutExercise((exercises) =>
      exercises.map((exercise) =>
        exercise.id === exerciseId
          ? { ...exercise, sets: [...exercise.sets, newSet] }
          : exercise
      )
    );
  };

  const updateSet = (
    exerciseId: string,
    setId: string,
    field: "reps" | "weight",
    value: string
  ) => {
    setWorkoutExercise((exercise) =>
      exercise.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map((set) =>
                set.id === setId ? { ...set, [field]: value } : set
              ),
            }
          : exercise
      )
    );
  };

  const deleteSet = (exerciseId: string, setId: string) => {
    setWorkoutExercise((exercises) =>
      exercises.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.filter((set) => set.id !== setId),
            }
          : exercise
      )
    );
  };

  const toggleSetCompletion = (exerciseId: string, setId: string) => {
    setWorkoutExercise((exercises) =>
      exercises.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map((set) =>
                set.id === setId
                  ? { ...set, isCompleted: !set.isCompleted }
                  : set
              ),
            }
          : exercise
      )
    );
  };

  const saveWorkoutToDatabase = async () => {
    if (isSaving) return false;
    setIsSaving(true);

    try {
      const durationInsec = totalSeconds;

      const exercisesForSanity = await Promise.all(
        workoutExercises.map(async (exerxise) => {
          const exerciseDoc = await client.fetch(fetchExerciseQuery, {
            name: exerxise.name,
          });

          if (!exerxise) {
            throw new Error(
              `Exercise "${exerxise.name}" not found in database`
            );
          }

          const setForSanity = exerxise.sets
            .filter((set) => set.isCompleted && set.reps && set.weight)
            .map((set) => ({
              _type: "set",
              _key: Math.random().toString(36).substr(2, 9),
              reps: parseInt(set.reps, 10) || 0,
              weight: parseFloat(set.weight) || 0,
              weightUnit: set.weightUnit,
            }));

          return {
            _type: "workoutExercise",
            _key: Math.random().toString(36).substr(2, 9),
            exercise: {
              _type: "reference",
              _ref: exerciseDoc._id,
            },
            sets: setForSanity,
          };
        })
      );

      const validExercise = exercisesForSanity.filter(
        (exercise) => exercise.sets.length > 0
      );

      if (validExercise.length === 0) {
        Alert.alert(
          "No Completed Sets",
          "Please complete at least one set before saving the workout,"
        );
        return false;
      }
      const workoutData: WorkoutData = {
        _type: "workout",
        userId: user?.id,
        date: new Date().toISOString(),
        duration: durationInsec,
        exercises: validExercise,
      };
      const result = await fetch("/api/save-workout", {
        method: "POST",
        body: JSON.stringify({ workoutData }),
      });
      console.log("workout saved successfully", result);
      return true;
    } catch (error) {
      console.error("Error saving workout:", error);
      Alert.alert("Save failed", "failed to save workout. please try again");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const endWorkout = async () => {
    const saved = await saveWorkoutToDatabase();

    if (saved) {
      Alert.alert("Workout Saved", "Your workout has been saved successfully:");
      resetWorkout();

      router.replace("/(app)/(tabs)/history?refresh=true");
    }
  };

  const saveWorkout = () => {
    Alert.alert("Complete workout", "Are you sure you want to sav workout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "compelete",
        onPress: async () => await endWorkout(),
      },
    ]);
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
            <Text className=" text-white text-xl font-semibold font-san_sarif">
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
              <View key={exercise.id} className=" mb-6">
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/exercies-details",
                      params: {
                        id: exercise.sanityId,
                      },
                    })
                  }
                  className=" bg-blue-50 rounded-xl p-4 mb-4"
                >
                  <View className=" flex-row items-center justify-between">
                    <View className=" flex-1">
                      <Text className=" text-xl font-bold text-gray-900 mb-2">
                        {exercise?.name}
                      </Text>
                      <Text>
                        {exercise.sets.length} sets +{" "}
                        {exercise.sets.filter((set) => set.isCompleted).length}{" "}
                        completed
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => deleteExercise(exercise.id)}
                      className=" w-10 h-10 rounded-xl items-center justify-center bg-red-500 ml-3"
                    >
                      <Ionicons name="trash" size={16} color={"white"} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>

                <View className=" bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-3">
                  <Text className=" text-lg font-semibold text-gray-900 mb-3">
                    Sets
                  </Text>
                  {exercise.sets.length === 0 ? (
                    <Text>No sets yet. Add your first set bellow</Text>
                  ) : (
                    exercise.sets.map((set, setIndex) => (
                      <View
                        key={set.id}
                        className={`py-3 px-3 mb-2 rounded-lg border ${
                          set.isCompleted
                            ? "bg-green-100 border-green-300"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <View className=" flex-row items-center justify-between">
                          <Text className=" text-gray-700 font-medium w-8">
                            {setIndex + 1}
                          </Text>

                          {/* Reps input */}
                          <View className=" flex-1 mx-2">
                            <Text className=" text-xs text-gray-500 mb-1">
                              Reps
                            </Text>
                            <TextInput
                              value={set.reps}
                              onChangeText={(value) =>
                                updateSet(exercise.id, set.id, "reps", value)
                              }
                              placeholder="0"
                              keyboardType="numeric"
                              className={`border rounded-lg px-3 py-2 text-center ${
                                set.isCompleted
                                  ? " bg-gray-100 border-gray-300 text-gray-500"
                                  : " bg-white border-gray-300"
                              }`}
                              editable={!set.isCompleted}
                            />
                          </View>
                          <View className=" flex-1 mx-2">
                            <Text className=" text-xs text-gray-500 mb-1">
                              Weight ({weightUnit})
                            </Text>
                            <TextInput
                              value={set.weight}
                              onChangeText={(value) =>
                                updateSet(exercise.id, set.id, "weight", value)
                              }
                              placeholder="0"
                              keyboardType="numeric"
                              className={`border rounded-lg px-3 py-2 text-center ${
                                set.isCompleted
                                  ? " bg-gray-100 border-gray-300 text-gray-500"
                                  : " bg-white border-gray-300"
                              }`}
                              editable={!set.isCompleted}
                            />
                          </View>

                          {/* Complete Button */}
                          <TouchableOpacity
                            onPress={() =>
                              toggleSetCompletion(exercise.id, set.id)
                            }
                            className={`w-12 h-12 mt-2 rounded-xl items-center justify-center mx-1 ${
                              set.isCompleted ? "bg-green-500" : "bg-gray-200"
                            }`}
                          >
                            <Ionicons
                              name={
                                set.isCompleted
                                  ? "checkmark"
                                  : "checkmark-outline"
                              }
                              size={20}
                              color={set.isCompleted ? "white" : "#9ca3af"}
                            />
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => deleteSet(exercise.id, set.id)}
                            className="w-12 h-12 rounded-xl items-center justify-center bg-red-500 ml-1 mt-2"
                          >
                            <Ionicons name="trash" size={16} color={"white"} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                  )}
                  <TouchableOpacity
                    onPress={() => addNewSet(exercise.id)}
                    className=" bg-blue-100 border-2 border-dashed border-blue-300 rounded-lg py-3 items-center mt-2"
                  >
                    <View className=" flex-row items-center">
                      <Ionicons
                        name="add"
                        size={16}
                        color={"#3b82f6"}
                        style={{ marginRight: 6 }}
                      />
                      <Text className=" text-blue-600 font-medium">
                        Add Set
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
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

            <TouchableOpacity
              onPress={saveWorkout}
              className={`rounded-2xl py-4 items-center mb-8 ${
                isSaving ||
                workoutExercises.length === 0 ||
                workoutExercises.some((exercise) =>
                  exercise.sets.some((set) => !set.isCompleted)
                )
                  ? "bg-gray-400"
                  : "bg-green-500 active:bg-green-700"
              }`}
              disabled={
                isSaving ||
                workoutExercises.length === 0 ||
                workoutExercises.some((exercise) =>
                  exercise.sets.some((set) => !set.isCompleted)
                )
              }
            >
              {isSaving ? (
                <View className="flex-row items-center">
                  <ActivityIndicator size={"small"} color={"white"} />
                  <Text className="text-white font-semibold text-lg ml-2">
                    Saving...
                  </Text>
                </View>
              ) : (
                <Text className="text-white font-semibold text-lg">
                  Complete Workout
                </Text>
              )}
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
