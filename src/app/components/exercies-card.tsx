import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import { Exercise } from "@/lib/sanity/types";
import { urlfor } from "@/lib/client/client";
import Ionicons from "@expo/vector-icons/Ionicons";

export const getdifficultColor = (difficulty: string) => {
  switch (difficulty) {
    case "beginner":
      return "bg-green-500";
    case "intermediate":
      return "bg-yellow-500";
    case "advanced":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

export const getDifficultyText = (difficulty: string) => {
  switch (difficulty) {
    case "beginner":
      return "Beginner";
    case "intermediate":
      return "Intermediate";
    case "advanced":
      return "Advanced";
    default:
      return "Unknown";
  }
};

interface ExercisesCardProps {
  item?: Exercise;
  onPress?: () => void;
  showChevron?: boolean;
}

const ExerciseCard = ({
  onPress,
  item,
  showChevron = false,
}: ExercisesCardProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className=" bg-white mb-4 shadow-sm border border-gray-100 rounded-xl"
    >
      <View className=" flex-row p-5">
        <View className=" w-20 h-20 bg-white rounded-xl mr-4 overflow-hidden">
          {item.image ? (
            <Image
              source={{ uri: urlfor(item?.image?.asset?._ref).url() }}
              className=" w-full h-full"
              resizeMode="contain"
            />
          ) : (
            <View className=" w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 items-center justify-center">
              <Ionicons name="fitness" size={24} color={"white"} />
            </View>
          )}
        </View>

        <View className=" flex-1 justify-between">
          <View>
            <Text className=" text-lg font-bold text-gray-900 mb-1">
              {item.name}
            </Text>
            <Text className=" text-sm text-gray-600 mb-2" numberOfLines={2}>
              {item.description || "No description available"}
            </Text>
          </View>

          <View className=" flex-row items-center justify-between">
            <View
              className={`px-3 py-1 rounded-full ${getdifficultColor(
                item.difficulty
              )}`}
            >
              <Text className=" text-sm font-semibold text-white">
                {getDifficultyText(item.difficulty)}
              </Text>
            </View>

            {showChevron && (
              <TouchableOpacity className="p-2">
                <Ionicons name="chevron-forward" size={20} color={"#6b7280"} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ExerciseCard;
