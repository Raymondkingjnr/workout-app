import { client } from "@/lib/client/client";
import { GetworkoutrecordqueryResult, Workout } from "@/lib/sanity/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { defineQuery } from "groq";
import { formatDuration } from "lib/util";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";

const getworkoutrecordquery =
  defineQuery(`*[_type == "workout" && _id == $workoutId][0] {
   _id,
   type,
   date,
   duration,
   exercises[]{
    exercise-> {
     _id,
     name,
     description,
    },
    sets[] {
    reps,
    weight,
    weightUnit,
    _type,
    _key
    },
    _type,
    _key
   }
  }`);

const Workoutrecord = () => {
  const [loading, setLoading] = useState(true);
  const [isDeleted, setIsDeleted] = useState(false);
  const [workout, setWorkout] = useState<GetworkoutrecordqueryResult>(null);

  const router = useRouter();
  const { workoutId } = useLocalSearchParams();

  useEffect(() => {
    const fetchworkout = async () => {
      if (!workoutId) return;

      try {
        const result = await client.fetch(getworkoutrecordquery, {
          workoutId,
        });
        setWorkout(result);
      } catch (error) {
        console.error("Error fetching workout", error);
      } finally {
        setLoading(false);
      }
    };
  }, [workoutId]);

  const formatData = (dateString?: string) => {
    if (!dateString) return "UnKnown Date";
    const date = new Date(dateString);

    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatWorkoutDurarion = (seconds?: number) => {
    if (!seconds) return "Duration not recorded";
    return formatDuration(seconds);
  };

  const getTotalSets = () => {
    return (
      workout?.exercises?.reduce((total, exercise) => {
        return total + (exercise?.sets?.length || 0);
      }, 0) || 0
    );
  };

  const getTotalVolume = () => {
    let totalValue = 0;
    let unit = "lbs";

    workout?.exercises?.forEach((exercise) => {
      exercise.sets?.forEach((set) => {
        if (set.weight && set.reps) {
          totalValue += set.weight + set.reps;
          unit = set.weightUnit || "lbs";
        }
      });
    });
    return { volume: totalValue, unit };
  };

  if (loading) {
    return (
      <SafeAreaView className=" flex-1 bg-gray-50">
        <View className=" flex-1 items-center justify-center">
          <ActivityIndicator size={"large"} color={"#3b82f6"} />
          <Text className=" text-gray-600 mt-4">Loading workout...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!workout) {
    <SafeAreaView className=" flex-1 bg-gray-50">
      <View className=" flex-1 items-center justify-center">
        <Ionicons name="alert-circle-outline" size={64} color={"#ef4444"} />
        <Text className=" text-xl font-semibold text-gray-900 mt-4">
          Workout Not Found
        </Text>
        <Text className=" text-gray-600 text-center mt-2">
          This workout record could not be found
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className=" bg-blue-600 px-5 py-3 rounded-lg mt-3"
        >
          <Text className=" text-white font-medium">Go Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>;
  }

  const { volume, unit } = getTotalVolume();
  const handleDeleteWorkout = () => {};

  return (
    <SafeAreaView className=" flex-1 bg-gray-50">
      <ScrollView className=" flex-1">
        <View className=" bg-white p-5 border-b border-gray-300">
          <View className=" flex-row items-center justify-between mb-4">
            <Text className=" text-lg font-semibold text-gray-900">
              Workout Summary
            </Text>
            <TouchableOpacity
              onPress={handleDeleteWorkout}
              disabled={isDeleted}
              className=" bg-red-600 px-4 py-2 rounded-md flex-row items-center"
            >
              {isDeleted ? (
                <ActivityIndicator size={"small"} color={"#fff"} />
              ) : (
                <>
                  <Ionicons name="trash-outline" size={16} color={"#FFFFFF"} />
                  <Text className=" text-white font-medium ml-2">Delete</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
          <View className=" flex-row items-center mb-2">
            <Ionicons name="calendar-outline" size={20} color={"#6b7280"} />
            <Text className=" text-gray-700 ml-3 font-medium">
              {formatData(workout?.date)} at {formatTime(workout?.date)}
            </Text>
          </View>

          <View className=" flex-row items-center mb-3">
            <Ionicons name="time-outline" color="#6b7280" />
            <Text className=" text-gray-700 ml-3 font-medium">
              {formatWorkoutDurarion(workout?.duration)}
            </Text>
          </View>

          <View className=" flex-row items-center mb-3">
            <Ionicons name="fitness-outline" size={20} color="#6b7280" />
            <Text className=" text-gray-700 ml-3 font-medium">
              {workout?.exercises?.length || 0} exercises
            </Text>
          </View>

          <View className=" flex-row items-center mb-3">
            <Ionicons name="bar-chart-outline" size={20} color={"#6b7280"} />
            <Text className=" text-gray-700 ml-3 font-medium">
              {getTotalSets()} total sets
            </Text>
          </View>

          {volume > 0 && (
            <View className=" flex-row items-center mb-3">
              <Ionicons name="barbell-outline" size={20} color={"#6b7280"} />
              <Text className=" text-gray-700 ml-3 font-medium">
                {volume.toLocaleString()} {unit} total volume
              </Text>
            </View>
          )}
        </View>
        <View className=" space-y-4 p-5 gap-4">
          {workout?.exercises?.map((data, index) => (
            <View
              key={data?._key}
              className=" bg-white rounded-xl p-5 shadow border border-gray-100"
            >
              <View className=" flex-row items-center justify-between mb-4">
                <View className=" flex-1">
                  <Text className=" text-lg font-bold text-gray-900">
                    {data?.exercise?.name || "Unknown Execise"}
                  </Text>
                  <Text className=" text-sm font-bold text-gray-900">
                    {data?.sets?.length || 0} sets completed
                  </Text>
                </View>
                <View className=" bg-blue-100 rounded-full w-10 h-10 items-center justify-center">
                  <Text className=" text-blue-600 font-bold">{index + 1}</Text>
                </View>
              </View>

              <View className=" space-y-2">
                <Text className=" text-sm font-bold text-gray-700 mb-2">
                  Sets:
                </Text>
                {data?.sets?.map((set, setIndex) => (
                  <View
                    key={set?._key}
                    className=" bg-gray-50 rounded-md flex-row items-center justify-between"
                  >
                    <View className=" flex-row items-center">
                      <View className=" bg-gray-200 rounded-full w-6 h-6 items-center justify-center mr-3">
                        <Text className=" text-gray-700 text-sm font-bold">
                          {setIndex + 1}
                        </Text>
                      </View>
                      <Text>{set?.reps} reps</Text>
                    </View>

                    {set?.weight && (
                      <View className=" flex-row items-center">
                        <Ionicons
                          name="barbell-outline"
                          size={16}
                          color={"#687280"}
                        />
                        <Text className=" text-gray-700 ml-2 font-medium">
                          {set?.weight} {set?.weightUnit || "lbs"}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Workoutrecord;
