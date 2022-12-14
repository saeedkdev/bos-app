import { View, Text, SafeAreaView, ScrollView, Button } from 'react-native';
import React, { useLayoutEffect, useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Tasks from '../components/Tasks';

const TasksScreen = ({navigation}) => {
	const [staff, setStaff] = useState({});

	// get staff info
	const getStaffInfo = async () => {
		const staffId = await AsyncStorage.getItem('staffId');
		const token = await AsyncStorage.getItem('token');
		try {
			if (staffId !== null && token !== null) {
				let response = await axios.get(
					`http://192.168.0.26/GI-Perfex/api/v1/getMyStaffProfile/${staffId}`,
					{
						headers: {
							Authorization: `${token}`,
						},
					}
				);
				

				let userInformation = {};
				userInformation.firstName = response.data.staff.firstname;
				userInformation.lastName = response.data.staff.lastname;
				userInformation.email = response.data.staff.email;
				userInformation.phoneNumber = response.data.staff.phonenumber;
				userInformation.profileImage = response.data.staff.profile_image;
				console.log(userInformation);
				setStaff(userInformation);
			}
		} catch (error) {
			console.log(error);
		}
	};

	const logout = async () => {
		let response = await axios.get('http://192.168.0.26/GI-Perfex/api/auth/login');
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
				backgroundColor: '#3F3F3F',
			},
			headerTintColor: '#fff',
			headerTitleStyle: {
				fontWeight: 'bold',
			},
			headerRight: () => (
				<Button
					onPress={() => logout()}
					title="Logout"
					color="#fff"
				/>
			),
		});
	}, [navigation]);
	return (
		<SafeAreaView className="bg-white h-screen">
			<View className="p-5">
				<Text className="text-xl font-bold">Hi, </Text>
				<Text className="text-lg text-gray-800 mb-5">
					{staff.firstName} {staff.lastName}
				</Text>
				<View className="border border-gray-300 rounded-lg py-5 items-center mb-5">
					<Text className="font-bold">Tasks Overview</Text>
				</View>
				<Tasks />
			</View>
		</SafeAreaView>
	);
};

export default TasksScreen;
