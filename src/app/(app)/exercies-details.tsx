import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking,
  ActivityIndicator,
} from "react-native";

import { useLocalSearchParams, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useState } from "react";
import { Exercise } from "@/lib/sanity/types";
import { client, urlfor } from "@/lib/client/client";
import { defineQuery } from "groq";
import Markdown from "react-native-markdown-display";

const singleExeciesQuery = defineQuery(
  `*[_type == "exercise" && _id == $id][0]`
);

export const getdifficultColor = (difficulty: string) => {
  switch (difficulty) {
    case "beginner":
      return "bg-green-500";
    case "intermediate":
      return "bg-yellow-500";
    case "advanced":
      return "bg-gray-500";
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

const ExerciesDetails = () => {
  const [exercies, setExercies] = useState<Exercise>(null);
  const [loading, setLoading] = useState(true);
  const [AiGuidance, setAiGudiance] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);

  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  useEffect(() => {
    const fetchExercies = async () => {
      if (!id) return;
      try {
        const exerciesData = await client.fetch(singleExeciesQuery, { id });
        setExercies(exerciesData);
      } catch (error) {
        console.error("Error fetching exercies", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExercies();
  }, [id]);

  const getAiGudiance = async () => {
    if (!exercies) return;

    setAiLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exerciesName: exercies?.name }),
      });

      if (!res.ok) {
        throw new Error("failed to fetch AI guidance");
      }
      const data = await res.json();
      setAiGudiance(data.message);
    } catch (error) {
      console.error("Error fetching AI guidance", error);
      setAiGudiance(
        "Sorry, there was an error gettting AI guidance, please try again"
      );
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className=" flex-1 bg-white">
        <View className=" flex-1 items-center justify-center">
          <ActivityIndicator size={"large"} color={"#0000ff"} />
          <Text className=" text-gray-500">Loading exercies...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!exercies) {
    return (
      <SafeAreaView className=" flex-1 bg-white">
        <View className=" flex-1 items-center justify-center">
          <Text className=" text-gray-500">Exercies not found: {id}</Text>
          <TouchableOpacity
            className=" mt-4 bg-blue-500 px-6 py-3 rounded-lg"
            onPress={() => router.back()}
          >
            <Text className=" text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className=" flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor={"#000"} />

      <View className=" absolute top-12 left-0 right-0 z-10 px-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className=" w-10 h-10 bg-black/20 rounded-full items-center justify-center backdrop-blur-sm"
        >
          <Ionicons name="close" size={24} color={"white"} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className=" h-80 bg-white relative">
          {exercies?.image ? (
            <Image
              source={{ uri: urlfor(exercies?.image?.asset?._ref).url() }}
              className=" w-full h-full"
              resizeMode="contain"
            />
          ) : (
            <View className=" w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 items-center justify-center">
              <Ionicons name="fitness" size={24} color={"white"} />
            </View>
          )}
          <View className=" absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-r from-black/50 to-transparent" />
        </View>

        <View className=" px-4 py-4">
          <View className=" flex-row items-start justify-between mb-4">
            <View className=" flex-1 mr-4">
              <Text className=" text-3xl font-bold text-gray-800 mb-2">
                {exercies?.name}
              </Text>
              <View
                className={`self-start px-4 py-2 rounded-full ${getdifficultColor(
                  exercies?.difficulty
                )}`}
              >
                <Text className=" text-sm font-semibold text-white">
                  {getDifficultyText(exercies?.difficulty)}
                </Text>
              </View>
            </View>
          </View>

          <View className=" mb-6">
            <Text className=" text-xl font-semibold text-gray-800 mb-3">
              Description
            </Text>
            <Text className=" text-gray-600 leading-5 text-base">
              {exercies?.description ||
                "No description available for this exercies"}
            </Text>
          </View>

          {exercies?.videoUrl && (
            <View className=" mb-6">
              <Text className=" text-xl font-semibold text-gray-800 mb-3">
                Video Tutorial
              </Text>
              <TouchableOpacity
                className=" bg-red-500 rounded-xl px-4 py-5 flex-row items-center"
                onPress={() => Linking.openURL(exercies?.videoUrl)}
              >
                <View className=" w-12 h-12 bg-white rounded-full items-center justify-center mr-4">
                  <Ionicons name="play" size={20} color={"#ef4444"} />
                </View>
                <View>
                  <Text className=" text-white font-semibold text-lg">
                    Watch Tutorial
                  </Text>
                  <Text className=" text-red-100 text-sm">
                    Learn Proper form
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* AI GUIDANCE */}
          {(AiGuidance || aiLoading) && (
            <View className=" mb-6">
              <View className=" flex-row items-center mb-2">
                <Ionicons name="fitness" size={24} color={"#3b82f6"} />
                <Text className=" text-xl font-semibold text-gray-800 ml-2">
                  Ai Coach says
                </Text>
              </View>
              {aiLoading ? (
                <View className="bg-gray-50 rounded-lg py-5 px-4 items-center">
                  <ActivityIndicator size={"small"} color={"#3b82f6"} />
                  <Text className=" pt-3">
                    Getting personalized guidance...
                  </Text>
                </View>
              ) : (
                <View className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
                  <Markdown
                    style={{
                      body: {
                        paddingBottom: 20,
                      },

                      heading2: {
                        fontSize: 10,
                        fontWeight: "bold",
                        lineHeight: 20,
                        color: "#1f2937",
                        marginTop: 12,
                        marginBottom: 6,
                      },
                      heading1: {
                        fontSize: 16,
                        fontWeight: "600",
                        lineHeight: 20,
                        color: "#374151",
                        marginTop: 8,
                        marginBottom: 4,
                      },
                    }}
                  >
                    {AiGuidance}
                  </Markdown>
                </View>
              )}
            </View>
          )}

          {/* ____________ */}
          <View className=" mt-8 gap-2">
            <TouchableOpacity
              className={`rounded-xl py-4 items-center ${
                aiLoading
                  ? "bg-gray-400"
                  : AiGuidance
                  ? "bg-green-500"
                  : "bg-blue-500"
              }`}
              onPress={getAiGudiance}
              disabled={aiLoading}
            >
              {aiLoading ? (
                <View className=" flex-row items-center">
                  <ActivityIndicator size={"small"} color={"white"} />
                  <Text className=" text-white font-bold text-lg ml-1">
                    Loading...
                  </Text>
                </View>
              ) : (
                <Text className=" text-white font-bold text-lg">
                  {AiGuidance
                    ? "Refresh Ai Guidance"
                    : "Get Ai Guidance on Form & Technique"}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-gray-200 rounded-xl py-4 items-center"
              onPress={() => router.back()}
            >
              <Text className="text-gray-800 font-bold text-lg">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ExerciesDetails;
