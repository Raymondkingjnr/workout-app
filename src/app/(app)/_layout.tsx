import { useAuth } from "@clerk/clerk-expo";
import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";

const Layout = () => {
  const { isSignedIn, isLoaded, userId, getToken } = useAuth();

  if (!isLoaded) {
    return (
      <View>
        <ActivityIndicator size="large" color={"#0000ff"} />
      </View>
    );
  }
  return (
    <Stack>
      <Stack.Protected guard={isSignedIn}>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
            presentation: "modal",
            gestureEnabled: true,
            animationTypeForReplace: "push",
          }}
        />
        <Stack.Screen
          name="exercies-details"
          options={{ headerShown: false }}
        />
      </Stack.Protected>
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="sign-up" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
};

export default Layout;
