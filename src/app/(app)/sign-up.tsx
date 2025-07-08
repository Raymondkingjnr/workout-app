import * as React from "react";
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
import { useSignUp } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [code, setCode] = React.useState("");

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return;
    if (!emailAddress || !password) {
      Alert.alert("❌ Error", "please fill in all fields");
    }

    setIsLoading(true);
    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress,
        password,
      });

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setPendingVerification(true);
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return;
    if (!code) {
      Alert.alert("Please enter your code");
    }
    setIsLoading(true);
    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace("/");
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <SafeAreaView className=" flex-1">
        <KeyboardAvoidingView
          className=" flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View className=" flex-1 px-6  ">
            <View className=" flex-1 justify-center">
              <View className=" items-center mb-8">
                <View className=" w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl items-center justify-center mb-4 shadow-lg">
                  <Ionicons name="fitness" size={40} color="white" />
                </View>
                <Text className=" text-3xl font-bold text-gray-900 mb-2">
                  Check You Email
                </Text>
                <Text className=" text-lg text-gray-600 text-center">
                  We've sent a verification code to{"\n"}
                  {emailAddress}
                </Text>
              </View>

              <View className=" bg-white rounded-2xl p-6 shadow-sm brder border-gray-100 mb-6">
                <Text className=" text-2xl font-bold text-gray-900 mb-6 text-center">
                  Enter Verification Code
                </Text>

                <View className=" mb-6">
                  <Text className=" text-sm font-medium text-gray-700 mb-2">
                    Verification code
                  </Text>
                  <View className=" flex-row items-center bg-gray-50 rounded-xl px-4 py-4 border border-gray-200">
                    <Ionicons name="key-outline" size={20} color={"#607280"} />
                    <TextInput
                      value={code}
                      placeholder="Enter 6-digits code"
                      placeholderTextColor={"#9CA3AF"}
                      onChangeText={setCode}
                      keyboardType="number-pad"
                      maxLength={6}
                      editable={!isLoading}
                      className="flex-1 ml-3 text-gray-900 text-center text-lg tracking-widest"
                    />
                  </View>
                </View>

                <TouchableOpacity
                  onPress={onVerifyPress}
                  disabled={isLoading}
                  className={`rounded-xl py-3 mt-5 shadow-sm mb-4 ${
                    isLoading ? "bg-gray-400" : "bg-green-600"
                  }`}
                  activeOpacity={0.8}
                >
                  <View className="flex-row items-center justify-center">
                    {isLoading ? (
                      <Ionicons name="refresh" size={20} color={"white"} />
                    ) : (
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={20}
                        color={"white"}
                      />
                    )}
                    <Text className=" text-white font-semibold text-lg ml-2">
                      {isLoading ? "Verifying..." : "Verify Email"}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className=" flex-1 px-1">
          {/* Main */}
          <View className=" flex-1 px-2">
            <View className=" items-center mb-8">
              <View className=" w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl items-center justify-center mb-4 shadow-lg">
                <Ionicons name="fitness" size={40} color="white" />
              </View>
              <Text className=" text-3xl font-bold text-gray-900 mb2">
                Join FitTracker
              </Text>
              <Text className=" text-lg text-center text-gray-600">
                Track your fitness journey {"\n"} and reach your goals
              </Text>
            </View>
            <View className=" bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
              <Text className=" text-2xl font-bold text-gray-900 mb-6 text-center">
                Create Your Account
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
                    editable={!isLoading}
                  />
                </View>
              </View>

              <View className="mb-4 mt-6">
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
                    editable={!isLoading}
                  />
                </View>
                <Text className=" text-sm text-gray-500 ml-1 mt-1">
                  Must be at least 8 characters long
                </Text>
              </View>

              <TouchableOpacity
                disabled={isLoading}
                onPress={onSignUpPress}
                className={`rounded-xl py-3 mt-5 shadow-sm mb-4 ${
                  isLoading ? "bg-gray-400" : "bg-blue-600"
                }`}
              >
                <View className="flex-row items-center justify-center">
                  {isLoading ? (
                    <Ionicons name="refresh" size={20} color={"white"} />
                  ) : (
                    <Ionicons name="log-in-outline" size={20} color={"white"} />
                  )}
                  <Text className=" text-white font-semibold text-lg ml-2">
                    {isLoading ? "Creating..." : "Create Account"}
                  </Text>
                </View>
              </TouchableOpacity>
              <Text className=" text-sm text-gray-500 text-center mb-4">
                By signing up, you agree to our Terms of service amd privacy
                policy
              </Text>
            </View>

            <View className=" flex-row justify-center items-center">
              <Text className=" text-gray-600">Already have an account?</Text>
              <Link href={"/sign-in"} asChild>
                <TouchableOpacity>
                  <Text className=" text-blue-600 font-semibold">Sign in</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>

          {/* footer */}
          <View className=" pb-6">
            <Text className=" text-center text-gray-500 text-sm">
              Ready to transform your fitness
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
