import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { InputItem, Button, WhiteSpace, WingBlank, Toast } from '@ant-design/react-native';
import { StackNavigationProp } from '@react-navigation/stack';

// const API_URL = 'http://localhost:3000'; // Replace with your actual API URL

type RootStackParamList = {
  Login: undefined;
  Home: undefined;
};

type LoginScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Login'>;
};

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    navigation.navigate("Home")
    // try {
    //   const response = await axios.post(`${API_URL}/auth/login`, {
    //     username,
    //     password,
    //   });
      
    //   // Handle successful login
    //   console.log('Login successful', response.data);
    //   navigation.navigate('Home');
    // } catch (err) {
    //   setError('Invalid username or password');
    //   console.error('Login error', err);
    // }
  };

  return (
    <View style={styles.container}>
      <WingBlank size="lg">
        <WhiteSpace size="xl" />
        <InputItem
          clear
          value={username}
          onChange={value => setUsername(value)}
          placeholder="Username"
        >
          Username
        </InputItem>
        <WhiteSpace />
        <InputItem
          clear
          type="password"
          value={password}
          onChange={value => setPassword(value)}
          placeholder="Password"
        >
          Password
        </InputItem>
        <WhiteSpace size="xl" />
        <Button type="primary" onPress={handleLogin}>
          Login
        </Button>
      </WingBlank>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
});

export default LoginScreen;