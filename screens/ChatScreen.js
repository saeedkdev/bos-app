import { View, Text, SafeAreaView, ScrollView, Button, TouchableOpacity } from 'react-native';
import React, { useLayoutEffect, useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CometChat } from '@cometchat-pro/react-native-chat';
import UserAvatar from 'react-native-user-avatar';
import {
  DotIndicator,
} from 'react-native-indicators';

const appID = '2278040d1ff15f21';
const region = 'us';
const authKey = '86239a6e1000cb3200d6f34f79cd8cedee7bd443';
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
	const [conversations, setConversations] = useState([]);
	const [loadingConversations, setLoadingConversations] = useState(true);

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
				userInformation.staffId = staffId;
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

	const getConversations = async () => {
		const staffId = await AsyncStorage.getItem('staffId');
		const authKey = '86239a6e1000cb3200d6f34f79cd8cedee7bd443';
		CometChat.login(staffId, authKey).then(
		  (user) => {
			console.log('Login Successful:', { user });
		  },
		  (error) => {
			console.log('Login failed with exception:', { error });
		  },
		);
		let limit = 30;
		let conversationsRequest = new CometChat.ConversationsRequestBuilder().setLimit(limit).build();
		conversationsRequest.fetchNext().then(
			conversationList => {
				console.log("Conversation list fetched:", conversationList);
				setConversations(conversationList);
				setLoadingConversations(false);
			},
			error => {
				console.log("Conversation list fetching failed with error:", error);
			}
		);
	};

	useEffect(() => {
		getStaffInfo();
		// every 5 seconds, get the conversations
		const interval = setInterval(() => {
			getConversations();
		}, 2000);
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
		<SafeAreaView className="bg-white h-screen">
			{loadingConversations ? (
				<View className="absolute inset-40">
					<DotIndicator color="#374151" size={20} />
				</View>
			) : (
				<ScrollView className="p-5">
					{conversations.map((conversation) => (
						<TouchableOpacity
							key={conversation.conversationId}
							onPress={() => goToScreen('Chat')}
						>
							<View className="flex flex-row items-center p-4 bg-white rounded-lg shadow-lg mb-5">
								<UserAvatar
									size={50}
									name={conversation.conversationWith.name}
									bgColor="#374151"
									src={conversation.conversationWith.avatar}
								/>
								<View className="flex flex-col ml-4">
									<Text className="font-bold text-gray-700">
										{conversation.conversationWith.name}
									</Text>
									<Text className="text-gray-500">
										{conversation.lastMessage.text}
									</Text>
								</View>
							</View>
						</TouchableOpacity>
					))}
				</ScrollView>
			)}
		</SafeAreaView>
	);
};

export default ChatScreen;
