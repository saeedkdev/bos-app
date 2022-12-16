import { View, Text, SafeAreaView, ScrollView, Button, TouchableOpacity } from 'react-native';
import React, { useLayoutEffect, useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CometChat } from '@cometchat-pro/react-native-chat';

const appID = '2278040d1ff15f21';
const region = 'us';
const appSetting = new CometChat.AppSettingsBuilder()
	.subscribePresenceForAllUsers()
	.setRegion(region)
	.build();

CometChat.init(appID, appSetting).then(
	() => {
		console.log('Initialization completed successfully');
	},
	error => {
		console.log('Initialization failed with error:', error);
	}
);


const ChatScreen = ({navigation}) => {

	const [staff, setStaff] = useState({});

	// get staff info
	const getStaffInfo = async () => {
		const staffId = await AsyncStorage.getItem('staffId');
		const token = await AsyncStorage.getItem('token');
		const authKey = '86239a6e1000cb3200d6f34f79cd8cedee7bd443';
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
		CometChat.login(staffId, authKey).then(
			User => {
				console.log('Login Successful:', { User });
			},
			error => {
				console.log('Login failed with exception:', { error });
			}
		);
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
		</SafeAreaView>
	);
};

export default ChatScreen;
