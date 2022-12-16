
import { View, Text, SafeAreaView, TextInput, Button, Pressable } from 'react-native';
import React, { useLayoutEffect, useState, createContext } from 'react';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwt_decode from 'jwt-decode';
import { REACT_APP_BOS_API_URL } from '@env';
import { createIconSetFromIcoMoon } from '@expo/vector-icons';

const AuthContext = createContext();


const Icon = createIconSetFromIcoMoon(
  require('../assets/selection.json'),
  'IcoMoon',
  'icomoon.ttf'
);

const LoginScreen = ({navigation}) => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const apiUrl = REACT_APP_BOS_API_URL;
	console.log(apiUrl);
	console.log(process.env);

	useLayoutEffect(() => {
		navigation.setOptions({
			headerShown: false,
		});
	}, [navigation]);

	
	// if user came back by pressing back button, then check if token is still valid
	// if token is still valid, then redirect to home screen
	navigation.addListener('focus', () => {
		// check if token is still valid
		checkLogin();
	});
	

	// if logged in, redirect to HomeScreen
	const checkLogin = async () => {
		// TODO: animate loading
		try {
			let staffId = await AsyncStorage.getItem('staffId');
			let token = await AsyncStorage.getItem('token');
			if (staffId !== null && token !== null) {
				// if token is not expired
				let decoded = jwt_decode(token);
				let currentTime = Date.now() / 1000;
				console.log(decoded.exp, currentTime);
				if (decoded.exp > currentTime) {
					navigation.navigate('Home');
				} else {
					navigation.navigate('Login');
				}
			}
		} catch (error) {
			console.log(error);
		}
	};

	checkLogin();

	const LoginToApp = () => {
		let data = {
			email: email,
			password: password,
		};
		if (email === '' || password === '') {
			alert('Please enter email and password');
			return;
		}
		let url = `${apiUrl}/auth/login`;
		console.log(url);
		axios.post(url, data).then((response) => {
			let staffId = response.data.staffId;
			let token = response.data.token;
			AddToAsyncStorage(staffId, token);
		}).catch((error) => {
			console.log(error);
		});
	
		// navigation.navigate('Home');
	};

	const AddToAsyncStorage = async (staffId, token) => {
		try {
			await AsyncStorage.setItem('staffId', staffId);
			await AsyncStorage.setItem('token', token);
			navigation.navigate('Home');
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<SafeAreaView className="flex-1 justify-center items-center">
			<Icon name="icon_svg_gi_no-ring" size={70} color="#374151" />
			<Text className="text-gray-800 font-black text-3xl mt-5">BusinessOS</Text>
			<Text className="text-gray-500 text-lg mb-3">Login with your BusinessOS account</Text>
			<TextInput className="w-9/12 bg-white shadow rounded-md p-4 my-2" 
				value={email}
				onChangeText={(text) => setEmail(text)}
				placeholder="Email" />
			<TextInput
				value={password}
				onChangeText={(text) => setPassword(text)}
				textContentType="password"
				secureTextEntry={true}
				className="w-9/12 bg-white shadow rounded-md p-4 my-2" 
				placeholder="Password" />
			<Pressable
				className="w-20 bg-blue-500 shadow rounded-md p-4 my-2"
				title="Login"
				onPress={LoginToApp}
			>
				<Text className="text-white text-center font-bold">Login</Text>
			</Pressable>
		</SafeAreaView>
	);
}

export default LoginScreen;
