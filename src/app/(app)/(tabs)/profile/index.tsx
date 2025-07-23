import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { defineQuery } from "groq";
import { GetworkoutqueryResult } from "@/lib/sanity/types";
import { client } from "@/lib/client/client";
import { formatDuration } from "lib/util";

export const getWorkoutQuery =
  defineQuery(`*[_type == "workout" && userId == $userId] | order(date desc) 
 {
  _id,
  date,
  duration,
  exercises[]{
    exercise-> {
      _id,
      name,
    },
    sets[]{
      reps,
      weight,
      weightUnit,
      _type,
      _key,
    },
    _type,
    _key,
  }
}`);

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [workouts, setWorkouts] = useState<GetworkoutqueryResult>([]);

  const { signOut } = useAuth();
  const { user } = useUser();

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

  const totalWorkouts = workouts.length;
  const totalDuration = workouts.reduce(
    (sum, workout) => sum + (workout.duration || 0),
    0
  );

  const averageDuration =
    totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;

  const joinDate = user?.createdAt ? new Date(user.createdAt) : new Date();

  const daysSinceJoining = Math.floor(
    (new Date().getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const formartJoinDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

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
    <SafeAreaView className="flex flex-1">
      <ScrollView className=" flex-1">
        <View className=" px-4 pt-8 pb-6">
          <Text className=" text-3xl font-bold text-gray-900">Profile</Text>
          <Text className=" text-lg text-gray-600 mt-1">
            Manage your account and stats
          </Text>
        </View>

        <View className=" px-4 mb-6">
          <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <View className=" flex-row items-center mb-4">
              <View className=" w-16 h-16 bg-blue-600 rounded-full items-center justify-center mr-4">
                <Image
                  source={{
                    uri: user.externalAccounts[0]?.imageUrl ?? user?.imageUrl,
                  }}
                  className=" rounded-full"
                  style={{ width: 64, height: 64 }}
                />
              </View>
              <View className=" flex-1">
                <Text className=" text-xl font-semibold text-gray-900">
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.firstName || "User"}
                </Text>
                <Text className=" text-gray-600">
                  {user?.emailAddresses?.[0]?.emailAddress}
                </Text>
                <Text className=" text-sm text-gray-500 mt-1">
                  Member Since {formartJoinDate(joinDate)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stat Overview */}

        <View className=" px-4 mb-6">
          <View className=" bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <Text className=" text-lg font-semibold text-gray-900 mb-4">
              Your Fitness Stats
            </Text>

            <View className=" flex-row justify-between">
              <View className=" items-center gap-1 flex-1">
                <Text className=" text-2xl font-bold text-blue-600">
                  {totalWorkouts}
                </Text>
                <Text className=" capitalize font-bold  text-sm text-gray-600 text-center">
                  Total Workouts
                </Text>
              </View>
              <View className=" items-center gap-1 flex-1">
                <Text className=" text-2xl font-bold text-green-600">
                  {formatDuration(totalDuration)}
                </Text>
                <Text className="capitalize font-bold  text-sm text-gray-600 text-center">
                  Total Time
                </Text>
              </View>
              <View className=" items-center gap-1 flex-1">
                <Text className=" text-2xl font-bold text-purple-600">
                  {daysSinceJoining}
                </Text>
                <Text className="capitalize font-bold  text-sm text-gray-600 text-center">
                  Days Since Joining
                </Text>
              </View>
            </View>

            {totalWorkouts > 0 && (
              <View className=" mt-4 pt-4 border-1 border-gray-100">
                <View className=" flex-row items-center justify-between">
                  <Text className=" capitalize font-bold text-sm text-gray-600">
                    Average workout duration
                  </Text>
                  <Text className=" font-semibold text-gray-900">
                    {formatDuration(averageDuration)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        <View className=" px-4 mb-6">
          <Text className=" text-lg font-semibold text-gray-900 mb-4">
            Account Settings
          </Text>
          <View className=" bg-white rounded-2xl shadow-sm border border-gray-100">
            <TouchableOpacity className=" flex-row items-center justify-between p-4 border-b border-gray-100">
              <View className=" flex-row items-center">
                <View className=" w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="person-outline" size={20} color={"#2563eb"} />
                </View>
                <Text className=" text-gray-900 font-semibold">
                  Edit Profile
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={"#6b7280"} />
            </TouchableOpacity>
            <TouchableOpacity className=" flex-row items-center justify-between p-4 border-b border-gray-100">
              <View className=" flex-row items-center">
                <View className=" w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                  <Ionicons
                    name="notifications-outline"
                    size={20}
                    color={"#166534"}
                  />
                </View>
                <Text className=" text-gray-900 font-semibold">
                  Notification
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={"#6b7280"} />
            </TouchableOpacity>

            <TouchableOpacity className=" flex-row items-center justify-between p-4 border-b border-gray-100">
              <View className=" flex-row items-center">
                <View className=" w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-3">
                  <Ionicons
                    name="settings-outline"
                    size={20}
                    color={"#9333ea"}
                  />
                </View>
                <Text className=" text-gray-900 font-semibold">Preference</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={"#6b7280"} />
            </TouchableOpacity>

            <TouchableOpacity className=" flex-row items-center justify-between p-4 border-b border-gray-100">
              <View className=" flex-row items-center">
                <View className=" w-10 h-10 bg-yellow-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="help-outline" size={20} color={"#ca8a04"} />
                </View>
                <Text className=" text-gray-900 font-semibold">
                  Help & Support
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={"#6b7280"} />
            </TouchableOpacity>
          </View>
        </View>

        <View className=" px-4 mb-8">
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
      </ScrollView>
    </SafeAreaView>
  );
}
