import {
  View,
  Text,
  Modal,
  StatusBar,
  TouchableOpacity,
  TextInput,
  FlatList,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useWorkoutStore } from "store/workout-store";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import ExerciseCard from "./exercies-card";
import { Exercise } from "@/lib/sanity/types";
import { client } from "@/lib/client/client";
import { exerciesQuery } from "../(app)/(tabs)/exercises";

interface ExerciseSelectionModal {
  visible: boolean;
  onClose: () => void;
}

const ExerciseSelectionModal = ({
  visible,
  onClose,
}: ExerciseSelectionModal) => {
  const [exercises, setExercises] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterdExercises, setFilterdExercises] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();
  const { addExerciseWorkout } = useWorkoutStore();

  const fetchExercise = async () => {
    try {
      const exercises = await client.fetch(exerciesQuery);
      setExercises(exercises);
      setFilterdExercises(exercises);
    } catch (error) {
      console.error("Error fetching exercises", error);
    }
  };

  const handleExercisePress = (exercises: Exercise) => {
    addExerciseWorkout({ name: exercises.name, sanityId: exercises._id });
    onClose();
  };

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilterdExercises(exercises);
    } else {
      const filtered = exercises.filter((exercise) =>
        exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilterdExercises(filtered);
    }
  }, [searchQuery, exercises]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchExercise();
    setRefreshing(false);
  };

  console.log(exercises);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className=" flex-1 bg-white">
        <StatusBar barStyle="dark-content" />

        <View className=" bg-white px-4 pt-4 pb-6 shadow-sm border-b border-gray-100">
          <View className=" flex-row items-center justify-between mb-4">
            <Text className=" text-2xl font-bold text-gray-500">
              Add Exercise
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={"#6b7280"} />
            </TouchableOpacity>
          </View>
          <Text>Tap an exercise to add to your workout</Text>

          <View className=" flex-row items-center bg-gray-100 rounded-xl px-4 py-3 mt-3">
            <Ionicons name="search" size={20} color={"#6b7280"} />
            <TextInput
              className=" flex-1 ml-3 text-gray-500"
              placeholder="Search exercises..."
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
          data={filterdExercises}
          renderItem={({ item }) => (
            <ExerciseCard
              item={item}
              onPress={() => handleExercisePress(item)}
              showChevron={false}
            />
          )}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: 16,
            paddingBottom: 32,
            paddingHorizontal: 16,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#3b82f6"]}
              tintColor={"#3b82f6"}
            />
          }
          ListEmptyComponent={
            <View className=" flex-1 items-center justify-center py-20">
              <Ionicons name="fitness-outline" size={64} color={"#d1d5db"} />
              <Text className=" text-lg font-semibold text-gray-400 mt-4">
                {searchQuery ? "No Exercise found" : "Loading exercises..."}
              </Text>
              <Text className=" text-sm text-gray-400 mt-2">
                {searchQuery
                  ? "Try adjusting your search"
                  : "Please wait a moment"}
              </Text>
            </View>
          }
        />
      </SafeAreaView>
    </Modal>
  );
};

export default ExerciseSelectionModal;
