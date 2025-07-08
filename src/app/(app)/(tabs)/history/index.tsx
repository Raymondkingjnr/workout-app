import { client } from "@/lib/client/client";
import { GetworkoutqueryResult, Workout } from "@/lib/sanity/types";
import { useUser } from "@clerk/clerk-expo";
import { useLocalSearchParams, useRouter } from "expo-router";
import { defineQuery } from "groq";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { formatDuration } from "lib/util";
import Ionicons from "@expo/vector-icons/Ionicons";

export const getworkoutquery =
  defineQuery(`*[_type == "workout" && userId == $userId] | order(date desc) {
   _id,
   date,
   duration,
   exercises[]{
    exercise-> {
     _id,
     name
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

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [workouts, setWorkOuts] = useState<GetworkoutqueryResult>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { refresh } = useLocalSearchParams();
  const router = useRouter();

  const { user } = useUser();

  const fetchWorkouts = async () => {
    if (!user.id) return;

    try {
      const results = await client.fetch(getworkoutquery, { userId: user.id });
      setWorkOuts(results);
      console.log(user.id);

      setLoading(true);
      setRefreshing(false);
    } catch (error) {
      console.error("Error getting workout", error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, [user?.id]);

  useEffect(() => {
    if (refresh === "true") {
      fetchWorkouts();

      router.replace("/(app)/(tabs)/history");
    }
  }, [refresh]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchWorkouts();
  };

  const formatdate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }
  };

  const formatWorkoutDuration = (seconds?: number) => {
    if (!seconds) return "Duration not received";

    return formatDuration(seconds);
  };

  const getTotalSets = (workout: GetworkoutqueryResult[number]) => {
    return (
      workout?.exercises?.reduce((total, exercise) => {
        return total + (exercise?.sets?.length || 0);
      }, 0) || 0
    );
  };

  const exerciesName = (workout: GetworkoutqueryResult[number]) => {
    return (
      workout?.exercises?.map((ex) => ex.exercise.name).filter(Boolean) || []
    );
  };
  if (!loading) {
    return (
      <SafeAreaView className=" flex-1 bg-gray-50">
        <View className=" px-4 py-4 bg-white border-b border-gray-200">
          <Text className=" text-2xl font-bold text-gray-900">
            Workout History
          </Text>
        </View>
        <View className=" flex-1 items-center justify-center">
          <ActivityIndicator size={"large"} color={"#3b82f6"} />
          <Text className=" text-gray-600 mt-4">Loading your workout...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className=" px-5 py-4 bg-white border-b border-gray-200">
        <Text className=" text-2xl font-bold text-gray-900">
          Workout History
        </Text>
        <Text className=" text-gray-600 mt-1">
          {workouts?.length} workout{workouts?.length !== 1 ? "s" : ""}{" "}
          completed
        </Text>
      </View>

      <ScrollView
        className=" flex-1"
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {workouts?.length === 0 ? (
          <View className=" bg-white rounded-xl p-6 items-center">
            <Ionicons name="barbell-outline" size={64} color={"#9ca3af"} />
            <Text className=" text-xl font-semibold text-gray-900 mt-4">
              No Workout yet
            </Text>
            <Text className=" text-gray-600 text-center mt-2">
              Your completed workouts will apper here
            </Text>
          </View>
        ) : (
          <View className=" space-y-4 gap-4">
            {workouts?.map((workout) => (
              <TouchableOpacity
                key={workout._id}
                className=" bg-white rounded-xl p-5 shadow-sm border border-gray-100"
                activeOpacity={0.7}
                onPress={() => {
                  router.push({
                    pathname: "/history/workout-record",
                    params: {
                      workoutId: workout._id,
                    },
                  });
                }}
              >
                <View className=" flex-row items-center justify-between mb-4">
                  <View className=" flex-1">
                    <Text className=" text-lg font-semibold text-gray-900">
                      {formatdate(workout.date || "")}
                    </Text>
                    <View className=" flex-row items-center mt-1">
                      <Ionicons
                        name="time-outline"
                        size={16}
                        color={"#6b7280"}
                      />
                      <Text className=" text-gray-900 ml-2">
                        {formatWorkoutDuration(workout.duration)}
                      </Text>
                    </View>
                  </View>

                  <View className=" bg-blue-100 rounded-full w-12 h-12 items-center justify-center">
                    <Ionicons
                      name="fitness-outline"
                      size={24}
                      color={"#6b7280"}
                    />
                  </View>
                </View>

                <View className=" flex-row items-center justify-between mb-4">
                  <View className=" flex-row items-center">
                    <View className=" bg-gray-100 rounded-md px-3 py-2 mr-3">
                      <Text className=" text-sm font-bold capitalize text-gray-700">
                        {workout?.exercises?.length || 0} exercises
                      </Text>
                    </View>
                    <View className=" bg-gray-100 rounded-lg px-3 py-2">
                      <Text className=" text-sm capitalize font-bold text-gray-700">
                        {getTotalSets(workout)} sets
                      </Text>
                    </View>
                  </View>
                </View>

                {workout.exercises && workout.exercises.length > 0 && (
                  <View>
                    <Text className=" text-sm font-bold text-gray-700 mb-2">
                      Exercises:
                    </Text>
                    <View className=" flex-row flex-wrap">
                      {exerciesName(workout)
                        .slice(0, 3)
                        .map((name, index) => (
                          <View
                            key={index}
                            className=" bg-blue-50 rounded-lg px-3 py-1 mr-2 mb-2"
                          >
                            <Text className=" text-blue-700 text-sm font-medium">
                              {name}
                            </Text>
                          </View>
                        ))}
                      {exerciesName(workout).length > 3 && (
                        <View className=" bg-gray-100 rounded-lg px-3 py-1 mr-2 mb-2">
                          <Text className=" text-gray-600 text-sm font-bold">
                            +{exerciesName(workout).length - 3} moew
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
