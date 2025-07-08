import {
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { defineQuery } from "groq";
import { client } from "@/lib/client/client";
import { Exercise } from "sanity/sanity.types";
import ExerciseCard from "@/app/components/exercies-card";

export const exerciesQuery = defineQuery(`*[_type == "exercise"] {
 
}`);

const Exercises = () => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [exercises, setExercies] = useState([]);
  const [filterExercies, setFilterExercies] = useState([]);
  const [stateError, setError] = useState("");

  const fetchExercises = async () => {
    try {
      const exercises = await client.fetch(exerciesQuery);
      // exercises[0].image;
      setExercies(exercises);
      setFilterExercies(exercises);
    } catch (error) {
      Alert.alert("Error fetching exercies", error);
      console.error("Error fetching exercies", error);
      setError(error);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  useEffect(() => {
    const fetchFilteredExercises = async () => {
      try {
        const query = searchQuery
          ? `*[_type == "exercise" && name match "${searchQuery}*"]`
          : `*[_type == "exercise"]`;
        const exercises = await client.fetch(query);
        setExercies(exercises);
        setFilterExercies(exercises);
      } catch (error) {
        setError(error.message || "Unknown error");
      }
    };
    fetchFilteredExercises();
  }, [searchQuery, exercises]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchExercises();
    setRefreshing(false);
  };
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className=" px-4 py-4 bg-white border-b border-gray-200">
        <Text className=" text-2xl font-bold text-gray-900">
          Exercise Library
        </Text>
        <Text className=" text-gray-600 ml-1">
          Discover and master new exercises {stateError}
        </Text>

        <View className=" flex-row items-center bg-gray-100 rounded-xl px-4 py-3 mt-4">
          <Ionicons name="search" size={20} color={"#6B7280"} />
          <TextInput
            className="flex-1 ml-3 text-gray-800"
            placeholder="search exercies..."
            placeholderTextColor={"#9ca3af"}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color={"#6b7280"} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filterExercies}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 15 }}
        renderItem={({ item }) => (
          <ExerciseCard
            item={item}
            onPress={() => router.push(`/exercies-details?id=${item._id}`)}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#3b82f6"]}
            tintColor={"##3b82f6"}
            title="pull to refresh exercises"
            titleColor={"##3b7280"}
          />
        }
        ListEmptyComponent={
          <View className=" bg-white rounded-2xl p-4 items-center">
            <Ionicons name="fitness-outline" size={64} color={"#9ca3af"} />
            <Text className=" text-xl font-semibold text-gray-900 mt-4">
              {searchQuery ? "No Exercises found" : "loading exercises..."}
            </Text>
            <Text className=" text-gray-600 text-center mt-2">
              {searchQuery
                ? "Try adjusting your search"
                : "Your exercies will appear here"}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default Exercises;
