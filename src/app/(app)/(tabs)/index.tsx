import { client } from "@/lib/client/client";
import { GetWorkoutQueryResult } from "@/lib/sanity/types";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
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
import { BarChart, LineChart } from "react-native-gifted-charts";
import CalendarWeekView from "@/app/components/calender";

export default function HomePage() {
  const { user } = useUser();
  const router = useRouter();
  const [workouts, setWorkouts] = useState<GetWorkoutQueryResult>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getMonthlySets = (workouts: GetWorkoutQueryResult) => {
    const monthSetsMap: Record<string, number> = {
      Jan: 0,
      Feb: 0,
      Mar: 0,
      Apr: 0,
      May: 0,
      Jun: 0,
      Jul: 0,
      Aug: 0,
      Sep: 0,
      Oct: 0,
      Nov: 0,
      Dec: 0,
    };

    workouts.forEach((workout) => {
      const date = new Date(workout.date || "");
      const month = date.toLocaleString("en-US", { month: "short" });

      if (workout.exercises && Array.isArray(workout.exercises)) {
        const totalSets = workout.exercises.reduce((sum, ex) => {
          return sum + (Array.isArray(ex.sets) ? ex.sets.length : 0);
        }, 0);

        monthSetsMap[month] += totalSets;
      }
    });

    return Object.entries(monthSetsMap).map(([label, value]) => ({
      label,
      value,
    }));
  };

  const getMonthlyExercises = (workouts: GetWorkoutQueryResult) => {
    const monthExercisesMap: Record<string, number> = {
      Jan: 0,
      Feb: 0,
      Mar: 0,
      Apr: 0,
      May: 0,
      Jun: 0,
      Jul: 0,
      Aug: 0,
      Sep: 0,
      Oct: 0,
      Nov: 0,
      Dec: 0,
    };

    workouts.forEach((workout) => {
      const date = new Date(workout.date || "");
      const month = date.toLocaleString("en-US", { month: "short" }); // e.g., "Jan"

      const exerciseCount = Array.isArray(workout.exercises)
        ? workout.exercises.length
        : 0;

      monthExercisesMap[month] += exerciseCount;
    });

    return Object.entries(monthExercisesMap).map(([label, value]) => ({
      label,
      value,
    }));
  };

  const monthlySetData = getMonthlySets(workouts);

  const monthlyExerciseData = useMemo(
    () => getMonthlyExercises(workouts),
    [workouts]
  );

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
          <Text className=" text-gray-600 mt-4">Loading..</Text>
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
        <CalendarWeekView workoutDates={workouts.map((w) => w.date)} />

        <View className=" px-4 mb-6">
          <Text className=" text-lg font-semibold text-gray-900 mb-4">
            Your Sets
          </Text>

          <View className=" flex-row gap-3 justify-between">
            <View className=" flex-1 justify-between py-3 bg-blue-100 rounded-2xl px-2 shadow-sm shadow-blue-400 border border-blue-100">
              <View className=" w-12 h-12 bg-blue-200 rounded-full items-center justify-center mb-3">
                <Ionicons name="barbell-outline" size={24} color={"#000"} />
              </View>
              <View className="items-end">
                <Text className=" text-2xl font-bold text-blue-600">
                  {totalWorkouts}
                </Text>
                <Text className="capitalize font-semibold text-sm text-black text-center">
                  Total Workouts
                </Text>
              </View>
            </View>
            <View className="flex-1 justify-between py-3 bg-white rounded-2xl px-2 shadow-sm border border-gray-100">
              <View className=" w-12 h-12 bg-gray-100 rounded-full items-center justify-center mb-3">
                <Ionicons name="timer-outline" size={24} color={"#000"} />
              </View>
              <View className=" items-end">
                <Text className=" text-2xl font-bold text-green-600">
                  {formatDuration(totalDuration)}
                </Text>
                <Text className="capitalize font-semibold text-sm text-black text-center">
                  Total Time
                </Text>
              </View>
            </View>
            <View className=" flex-1 justify-between py-3 bg-purple-100 rounded-2xl px-2 shadow-sm shadow-purple-400 border border-purple-100">
              <View className=" w-12 h-12 bg-purple-200 rounded-full items-center justify-center mb-3">
                <Ionicons name="timer-outline" size={24} color={"#000"} />
              </View>
              <View className=" items-end">
                <Text className=" font-bold text-2xl text-purple-600">
                  {averageDuration > 0 ? formatDuration(averageDuration) : "0m"}
                </Text>
                <Text className="capitalize text-ellipsis font-semibold text-black text-center text-sm">
                  workout Avg
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
                  <Ionicons name="time-outline" size={24} color={"#000"} />
                </View>
                <Text className="text-gray-900 font-bold text-center">
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
                  <Ionicons name="barbell-outline" size={24} color={"#000"} />
                </View>
                <Text className="text-gray-900 font-bold text-center">
                  Workout Exercises
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View className=" px-3 my-5">
          <Text className=" text-lg pl-2 font-semibold text-gray-900 mb-4">
            Your Set Monthly Progress
          </Text>
          <BarChart
            frontColor={"#2563eb"}
            barWidth={22}
            data={monthlySetData}
            width={300}
            height={200}
            minHeight={3}
            barBorderTopLeftRadius={5}
            barBorderTopRightRadius={5}
          />
        </View>
        <View className=" mt-5 px-3 my-5">
          <Text className=" text-lg pl-2 font-semibold text-gray-900 mb-4">
            Your Exercise Monthly Progress
          </Text>
          <LineChart
            areaChart
            data={monthlyExerciseData}
            startFillColor="#2563eb"
            startOpacity={0.8}
            endFillColor="rgb(203, 217, 250)"
            endOpacity={0.3}
            width={300}
            height={200}
            curved
            color="#2563eb"
          />
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
                  <Text className="text-lg font-semibold text-gray-900 capitalize">
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
                <Text className=" text-gray-600 font-bold text-sm">
                  {lastWorkout.exercises?.length || 0} Exercises +{" "}
                  {getTotalSets(lastWorkout)} Sets
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
