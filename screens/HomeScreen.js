import { View, Text, SafeAreaView } from 'react-native';
import React, { useLayoutEffect, useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Tasks from '../components/Tasks';

const HomeScreen = () => {
	const navigation = useNavigation();
	
	const [staff, setStaff] = useState({});

	// get staff info
	const getStaffInfo = async () => {
		const staffId = await AsyncStorage.getItem('staffId');
		const token = await AsyncStorage.getItem('token');
		try {
			if (staffId !== null && token !== null) {
				let response = await axios.get(
					`http://192.168.1.233/GI-Perfex/api/v1/getMyStaffProfile/${staffId}`,
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

	useEffect(() => {
		getStaffInfo();
	}, []);
	
	useLayoutEffect(() => {
		navigation.setOptions({
			headerShown: true,
			// if back button goes to login screen, then disable it
			headerLeft: null,
			headerStyle: {
				backgroundColor: '#007bff',
			},
			headerTintColor: '#fff',
			headerTitleStyle: {
				fontWeight: 'bold',
			},
		});
	}, [navigation]);

	return (
		<SafeAreaView>
			<View className="p-5">
				<Text className="text-xl font-bold">Hi, </Text>
				<Text className="text-lg text-gray-800 mb-5">
					{staff.firstName} {staff.lastName}
				</Text>
				<Tasks />
			</View>
		</SafeAreaView>
	);
};

export default HomeScreen;
