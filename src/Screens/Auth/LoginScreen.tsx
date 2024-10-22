import React, { useState } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { Text, Icon } from "@ant-design/react-native";
import useAuthStore from "../../store/authStore";
import { useToast } from '../../contexts/ToastContext';
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state: any) => state.login);
  const decodeAndSaveToken = useAuthStore((state: any) => state.decodeAndSaveToken);
  
  const { showToast } = useToast();
  const navigate: any = useNavigation()

  const handleLogin = async () => { 
    if (isLoading) return;
    setIsLoading(true);
    try {
      await login(email, password);   
      const token = await AsyncStorage.getItem("token");
      if (token) { 
        decodeAndSaveToken(token);
        setEmail("");
        setPassword("");
        navigate.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
        showToast('Login successful', 'success');
      } else {
        showToast('Login failed', 'error');
      }
    } catch (error) {
      showToast('Login failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <Image
              source={require("../../../assets/school-logo.avif")}
              style={styles.logo}
            />
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.subText}>Sign in to continue</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Icon
                name="user"
                size={24}
                color="#001529"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#4a4a4a"
                value={email || ""}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Icon
                name="lock"
                size={24}
                color="#001529"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#4a4a4a"
                value={password || ""}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Icon
                  name={showPassword ? "eye" : "eye-invisible"}
                  size={24}
                  color="#001529"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.loginButton, isLoading && styles.disabledButton]} 
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? "Signing In..." : "Sign In"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.forgotPasswordButton}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: height * 0.1,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: width * 0.25,
    height: width * 0.25,
    resizeMode: "contain",
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#001529",
    marginBottom: 10,
  },
  subText: {
    fontSize: 16,
    color: "#4a4a4a",
  },
  formContainer: {
    width: "100%",
    maxWidth: 350,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 15,
    backgroundColor: "#ffffff",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: "#4a4a4a",
  },
  eyeIcon: {
    padding: 10,
  },
  loginButton: {
    backgroundColor: "#001529",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: "#cccccc",
  },
  forgotPasswordButton: {
    alignItems: "center",
    marginTop: 20,
  },
  forgotPasswordText: {
    color: "#001529",
    fontSize: 16,
  },
});

export default LoginScreen;
