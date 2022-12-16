import { View, Text, SafeAreaView, ScrollView, Button, TouchableOpacity } from 'react-native';
import React, { useLayoutEffect, useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BouncyCheckbox from "react-native-bouncy-checkbox";

import Tasks from '../components/Tasks';

const HomeScreen = ({navigation}) => {
	
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
				backgroundColor: '#374151',
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
		<SafeAreaView className="bg-gray-100 h-screen">
			<View className="">
				<View className="bg-gray-700 p-5">
					<Text className="text-xl font-bold text-white">Hi, </Text>
					<Text className="text-lg text-white mb-5">
						{staff.firstName} {staff.lastName}
					</Text>
					<View className="border border-gray-300 rounded-lg py-5 items-center bg-white">
						<Text className="font-bold">Welcome to your BusinessOS App</Text>
					</View>
				</View>
				{/*<Tasks />*/}
				<ScrollView className="flex flex-row space-x-5 mt-5 p-5" horizontal={true} showsHorizontalScrollIndicator={false}>
					<TouchableOpacity onPress={() => goToScreen('Tasks')}>
						<View className="flex text-center p-5 h-20 justify-center items-center rounded-lg bg-white shadow-md">
							<Text className="text-md font-bold text-gray-800">Tasks</Text>
						</View>
					</TouchableOpacity>
					<View className="flex text-center p-5 h-20 justify-center items-center rounded-lg bg-white shadow-md">
						<Text className="text-md font-bold">Chat</Text>
					</View>
					<View className="flex text-center p-5 h-20 justify-center items-center rounded-lg bg-white shadow-md">
						<Text className="text-md font-bold">Leads</Text>
					</View>
					<View className="flex text-center p-5 h-20 justify-center items-center rounded-lg bg-white shadow-md">
						<Text className="text-md font-bold">Customers</Text>
					</View>
				</ScrollView>
				<View className="flex px-5">
					<Text className="text-xl font-bold text-gray-800 py-5">Todos</Text>
					<BouncyCheckbox
						iconStyle={{ borderColor: "#374151" }}
						textStyle={{ color: "#000" }}
						text="Change Task 123 status to complete"
						size={20}
						fillColor="#3B82F6"
						unfillColor="#fff"
					/>
					<BouncyCheckbox
						iconStyle={{ borderColor: "#374151" }}
						textStyle={{ color: "#000" }}
						text="Test the BOS Features before Launch"
						size={20}
						fillColor="#3B82F6"
						unfillColor="#fff"
						paddingTop={15}
					/>
				</View>
			</View>
		</SafeAreaView>
	);
};

export default HomeScreen;
