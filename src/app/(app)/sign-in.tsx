import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import GoogleSignIn from "../components/goggle-sign-in";

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isloading, setIsLoading] = React.useState(false);

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded) return;
    if (!emailAddress || !password) {
      Alert.alert("❌ Error", "please fill in all fields");
    }

    setIsLoading(true);
    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/");
      } else {
        // If the status isn't complete, check why. User might need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View className="flex-1">
          <View className=" flex-1 justify-center px-3">
            <View className="items-center mb-8">
              <View className=" w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl items-center justify-center mb-4 shadow-lg">
                <Ionicons name="fitness" size={40} color="white" />
              </View>
              <Text className=" text-3xl font-bold text-gray-900 mb2">
                FitTracker
              </Text>
              <Text className=" text-lg text-center text-gray-600">
                Track your fitness journey {"\n"} and reach your goals
              </Text>
            </View>

            {/* SIgn in form */}
            <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6 ">
              <Text className="text-2xl font-bold text-gray-900 mb-6 text-center">
                welcome back
              </Text>

              <View className="mb-4 ">
                <Text className=" text-sm font-medium text-gray-700 mb-2">
                  Email
                </Text>
                <View className=" flex-row items-center bg-gray-50 rounded-xl px-4 border  border-gray-200">
                  <Ionicons name="mail-outline" size={20} color={"#6B7280"} />
                  <TextInput
                    autoCapitalize="none"
                    value={emailAddress}
                    placeholder="Enter email"
                    keyboardType="email-address"
                    placeholderTextColor={"#9CA3AF"}
                    className="flex-1 ml-3 text-gray-900 py-4 outline-none"
                    onChangeText={setEmailAddress}
                    editable={!isloading}
                  />
                </View>
              </View>
              <View className="mb-4">
                <Text className=" text-sm font-medium text-gray-700 mb-2">
                  Password
                </Text>
                <View className=" flex-row items-center bg-gray-50 rounded-xl px-4 border  border-gray-200">
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={"#6B7280"}
                  />
                  <TextInput
                    autoCapitalize="none"
                    value={password}
                    placeholder="Enter password"
                    secureTextEntry={true}
                    placeholderTextColor={"#9CA3AF"}
                    className="flex-1 ml-3 text-gray-900 py-4 outline-none"
                    onChangeText={setPassword}
                    editable={!isloading}
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity
              disabled={isloading}
              onPress={onSignInPress}
              className={`rounded-xl py-3 shadow-sm mb-4 ${
                isloading ? "bg-gray-400" : "bg-blue-600"
              }`}
            >
              <View className="flex-row items-center justify-center">
                {isloading ? (
                  <Ionicons name="refresh" size={20} color={"white"} />
                ) : (
                  <Ionicons name="log-in-outline" size={20} color={"white"} />
                )}
                <Text className=" text-white font-semibold text-lg ml-2">
                  {isloading ? "Signing in..." : "Sign in"}
                </Text>
              </View>
            </TouchableOpacity>
            <View className=" flex-row items-center my-4">
              <View className="flex-1 h-px bg-gray-300" />
              <Text className="px-4 text-gray-500 text-base text-center">
                or
              </Text>
              <View className=" flex-1 h-px bg-gray-300" />
            </View>

            <GoogleSignIn />
          </View>
          <View className=" flex-row justify-center gap-2 items-center pb-4">
            <Text className=" text-gray-600">Don't have an account?</Text>
            <Link href={"/sign-up"} asChild>
              <TouchableOpacity>
                <Text className=" text-blue-600 font-semibold">Sign up</Text>
              </TouchableOpacity>
            </Link>
          </View>
          <View className=" pb-6">
            <Text className=" text-center text-gray-500 text-sm">
              Start your fitness journey today!
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
