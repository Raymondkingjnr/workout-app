import { client } from "@/lib/client/client";
import { GetWorkoutQueryResult } from "@/lib/sanity/types";
import { useUser } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
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
import { getWorkoutQuery } from "./profile";
import { formatDuration } from "lib/util";
import Ionicons from "@expo/vector-icons/Ionicons";
import { formatdate, getTotalSets } from "./history";

export default function HomePage() {
  const { user } = useUser();
  const router = useRouter();
  const [workouts, setWorkouts] = useState<GetWorkoutQueryResult>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWorkouts = async () => {
    if (!user?.id) return;

    try {
      const results = await client.fetch(getWorkoutQuery, { userId: user?.id });
      setWorkouts(results);
    } catch (error) {
      console.error("Error fetching workout:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, [user?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchWorkouts();
  };

  const totalWorkouts = workouts.length;
  const lastWorkout = workouts[0];

  const totalDuration = workouts.reduce(
    (sum, workout) => sum + (workout.duration || 0),
    0
  );

  const averageDuration =
    totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;

  if (loading) {
    return (
      <SafeAreaView className=" flex-1 bg-gray-50">
        <View className=" flex-1 items-center justify-center">
          <ActivityIndicator size={"large"} color="#3b82f6" />
          <Text className=" text-gray-600 mt-4">Loading Profile</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-gray-50 flex-1">
      <ScrollView
        className=" flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className=" px-4 pt-8 pb-6">
          <Text className=" text-lg text-gray-600">Welcome Back</Text>
          <Text className=" text-3xl font-bold text-gray-900 capitalize">
            {user?.firstName || "Athlete"}! 💪
          </Text>
        </View>

        <View className=" px-4 mb-6">
          <View className=" bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <Text className=" text-lg font-semibold text-gray-900 mb-4">
              Your Sets
            </Text>
            <View className=" flex-row justify-between">
              <View className=" items-center flex-1">
                <Text className=" text-2xl font-bold text-blue-600">
                  {totalWorkouts}
                </Text>
                <Text className=" text-sm text-gray-600 text-center">
                  Total{"\n"}Workouts
                </Text>
              </View>
              <View className=" items-center flex-1">
                <Text className=" text-2xl font-bold text-green-600">
                  {formatDuration(totalDuration)}
                </Text>
                <Text className=" text-sm text-gray-600 text-center">
                  Total{"\n"}Time
                </Text>
              </View>
              <View className=" items-center flex-1">
                <Text className=" font-bold text-2xl text-purple-600">
                  {averageDuration > 0 ? formatDuration(averageDuration) : "0m"}
                </Text>
                <Text className=" text-gray-600 text-center text-sm">
                  Average workout duration
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className=" px-4 mb-6">
          <Text className=" text-lg font-semibold text-gray-900 mb-4">
            Quick Action
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/workout")}
            className="bg-blue-600 rounded-2xl p-5 mb-4 shadow-sm"
            activeOpacity={0.8}
          >
            <View className=" flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-12 h-12 bg-blue-500 rounded-full items-center justify-center mr-4">
                  <Ionicons name="play" size={24} color={"white"} />
                </View>
                <View>
                  <Text className="text-white text-xl font-semibold">
                    Start Workout
                  </Text>
                  <Text className="text-blue-100">
                    Begin your training session
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color={"white"} />
            </View>
          </TouchableOpacity>

          <View className=" flex-row gap-4">
            <TouchableOpacity
              onPress={() => router.push("/history")}
              className=" bg-white rounded-2xl p-4 flex-1 shadow-sm border border-gray-100"
            >
              <View className=" items-center">
                <View className=" w-12 h-12 bg-gray-100 rounded-full items-center justify-center mb-3">
                  <Ionicons name="time-outline" size={24} color={"#6b7280"} />
                </View>
                <Text className="text-gray-900 font-medium text-center">
                  Workout history
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/exercises")}
              className=" bg-white rounded-2xl p-4 flex-1 shadow-sm border border-gray-100"
            >
              <View className=" items-center">
                <View className=" w-12 h-12 bg-gray-100 rounded-full items-center justify-center mb-3">
                  <Ionicons
                    name="barbell-outline"
                    size={24}
                    color={"#6b7280"}
                  />
                </View>
                <Text className="text-gray-900 font-medium text-center">
                  Workout Exercises
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {lastWorkout && (
          <View className=" px-4 mb-8">
            <Text className=" text-lg font-semibold text-gray-900 mb-4">
              Last workout
            </Text>
            <TouchableOpacity
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
              onPress={() =>
                router.push({
                  pathname: "/history/workout-record",
                  params: { workoutId: lastWorkout._id },
                })
              }
            >
              <View className="flex-row items-center justify-between mb-4">
                <View>
                  <Text className="text-lg font-semibold text-gray-900">
                    {formatdate(lastWorkout.date || "")}
                  </Text>
                  <View className=" flex-row items-center mt-1">
                    <Ionicons name="time-outline" color={"#6b7280"} size={16} />
                    <Text className=" text-gray-600 ml-2">
                      {lastWorkout.duration
                        ? formatDuration(lastWorkout.duration)
                        : "Duration Not Recorded"}
                    </Text>
                  </View>
                </View>
                <View className=" bg-blue-100 rounded-full w-12 h-12 items-center justify-center">
                  <Ionicons
                    name="fitness-outline"
                    size={24}
                    color={"#3b82f6"}
                  />
                </View>
              </View>

              <View className="flex-row items-center justify-between">
                <Text className=" text-gray-600">
                  {lastWorkout.exercises?.length || 0} exercises +{" "}
                  {getTotalSets(lastWorkout)} sets
                </Text>
                <Ionicons name="chevron-forward" size={20} color={"#6b7280"} />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {totalWorkouts === 0 && (
          <View className=" px-5 mb-8">
            <View className=" bg-white rounded-2xl p-7 items-center shadow-sm border border-gray-100">
              <View className=" w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-4">
                <Ionicons name="barbell-outline" size={32} color={"#3b82f6"} />
              </View>
              <Text className=" text-xl font-semibold text-gray-900 mb-2">
                Ready tostart your fitness journey?
              </Text>
              <Text>Track your workouts and see</Text>
              <TouchableOpacity
                onPress={() => router.push("/workout")}
                className="bg-blue-600 rounded-xl px-4 py-3 mt-4"
                activeOpacity={0.8}
              >
                <Text className=" text-white font-semibold">
                  Start Your first workout
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
