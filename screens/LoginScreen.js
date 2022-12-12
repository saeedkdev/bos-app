
import { View, Text, SafeAreaView, TextInput, Button } from 'react-native';
import React, { useLayoutEffect, useState, createContext } from 'react';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwt_decode from 'jwt-decode';

const AuthContext = createContext();


const LoginScreen = ({navigation}) => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

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
		console.log(data);
		axios.post('http://192.168.1.233/GI-Perfex/api/auth/login', data).then((response) => {
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
		<SafeAreaView className="flex-1 justify-center items-center bg-white">
			<Text className="text-gray-500 font-bold text-xl mb-3">Welcome to BOS app</Text>
			<TextInput className="w-9/12 border-2 border-gray-300 rounded-md p-3 my-2" 
				value={email}
				onChangeText={(text) => setEmail(text)}
				placeholder="Email" />
			<TextInput
				value={password}
				onChangeText={(text) => setPassword(text)}
				textContentType="password"
				secureTextEntry={true}
				className="w-9/12 border-2 border-gray-300 rounded-md p-3 my-2" 
				placeholder="Password" />
			<Button
				className="w-9/12 bg-blue-500 rounded-md p-3 my-2"
				title="Login"
				onPress={LoginToApp}
			/>
		</SafeAreaView>
	);
}

export default LoginScreen;
