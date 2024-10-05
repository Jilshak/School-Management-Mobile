import React, { useState, useEffect } from "react";
import { Provider as AntProvider } from "@ant-design/react-native";
import * as Font from "expo-font";
import { ActivityIndicator, StatusBar, View } from "react-native";
import AppNavigator from "./src/Navigation/AppNavigator";
import * as Notifications from 'expo-notifications';


const triggerNotification = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Local Notification",
      body: "This is a test notification",
    },
    trigger: { seconds: 5 }, // 5 seconds delay
  });
};

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
Notifications.getPermissionsAsync().then(()=>{
  triggerNotification()
})
  useEffect(() => {
    triggerNotification()
    async function loadFonts() {
      await Font.loadAsync(
        "antoutline",
        // eslint-disable-next-line
        require("@ant-design/icons-react-native/fonts/antoutline.ttf")
      );
      setFontsLoaded(true);
    }

    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#001529" />
    <AntProvider>
      <AppNavigator />
    </AntProvider>
    </>
  );
}
