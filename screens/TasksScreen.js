import { View, Text, SafeAreaView, Pressable } from 'react-native';
import React, { useLayoutEffect, useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { REACT_APP_BOS_API_URL } from '@env';

import Tasks from '../components/Tasks';

const TasksScreen = ({navigation}) => {
	const [staff, setStaff] = useState({});
	const apiUrl = REACT_APP_BOS_API_URL;

	// get staff info
	const getStaffInfo = async () => {
		const staffId = await AsyncStorage.getItem('staffId');
		const token = await AsyncStorage.getItem('token');
	};

	const logout = async () => {
		let response = await axios.get(apiUrl+'/auth/login');
		console.log(response);
		await AsyncStorage.removeItem('token');
		await AsyncStorage.removeItem('staffId');
		navigation.navigate('Login');
	};

	const goToScreen = (screen) => {
		navigation.navigate(screen);
	};

	useEffect(() => {
		getStaffInfo();
	}, []);
	
	useLayoutEffect(() => {
		navigation.setOptions({
			headerShown: true,
			// if back button goes to login screen, then disable it
			headerLeft: null,
			headerStyle: {
				backgroundColor: '#374151',
			},
			headerTintColor: '#fff',
			headerTitleStyle: {
				fontWeight: 'bold',
			},
			headerRight: () => (
				<Pressable
					style={{backgroundColor: '#374151', padding: 10}}
					onPress={() => {
						logout();
					}}>
					<Text style={{color: '#fff'}}>Logout</Text>
				</Pressable>
			),
		});
	}, [navigation]);
	return (
		<SafeAreaView className="h-screen">
			<View className="">
				<View className="bg-gray-700 p-5">
					<View className="border border-gray-300 rounded-lg py-5 items-center bg-white">
						<Text className="font-bold">Tasks Overview</Text>
					</View>
				</View>
				<View className="p-5">
					<Tasks />
				</View>
			</View>
		</SafeAreaView>
	);
};

export default TasksScreen;
