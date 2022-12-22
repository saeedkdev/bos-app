import { View, Text, SafeAreaView, ScrollView, Pressable, TouchableOpacity, Modal } from 'react-native';
import React, { useLayoutEffect, useState, useEffect } from 'react';
import { createIconSetFromIcoMoon } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CometChat } from '@cometchat-pro/react-native-chat';
import UserAvatar from 'react-native-user-avatar';
import {
  DotIndicator,
} from 'react-native-indicators';
import { REACT_APP_BOS_API_URL, COMET_CHAT_APP_ID, COMET_CHAT_AUTH_KEY, COMET_CHAT_REGION } from '@env';

import ChatUsers from '../components/ChatUsers';

const appID = COMET_CHAT_APP_ID;
const region = COMET_CHAT_REGION;
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


const Icon = createIconSetFromIcoMoon(
  require('../assets/selection.json'),
  'IcoMoon',
  'icomoon.ttf'
);

const ChatScreen = ({navigation}) => {

	const [conversations, setConversations] = useState([]);
	const [loadingConversations, setLoadingConversations] = useState(true);
	const [staffModalVisible, setStaffModalVisible] = useState(false);

	const apiUrl = REACT_APP_BOS_API_URL;

	const logout = async () => {
		let response = await axios.get(apiUrl+'/auth/logout');
		console.log(response);
		await AsyncStorage.removeItem('token');
		await AsyncStorage.removeItem('staffId');
		CometChat.logout().then(
			() => {
				console.log('Logout completed successfully');
			},
			error => {
				console.log('Logout failed with exception:', { error });
			}
		);
		navigation.navigate('Login');
	};

	const getConversations = async () => {
		const staffId = await AsyncStorage.getItem('staffId');
		const authKey = COMET_CHAT_AUTH_KEY;
		CometChat.login(staffId, authKey).then(
		  (user) => {
			console.log('Login Successful:', { user });
			let limit = 30;
			let conversationsRequest = new CometChat.ConversationsRequestBuilder().setLimit(limit).build();
			conversationsRequest.fetchNext().then(
				conversationList => {
					setConversations(conversationList);
					setLoadingConversations(false);
				},
				error => {
					console.log("Conversation list fetching failed with error:", error);
				}
			);
		  },
		  (error) => {
			console.log('Login failed with exception:', { error });
		  },
		);
	};

	useEffect(() => {
		getConversations();
		// update the conversations list every 5 seconds
		const interval = setInterval(() => {
			getConversations();
		}, 5000);
	}, []);

	const goToConversation = (userIdToChatWith) => {
		navigation.navigate('Conversation', {userIdToChatWith: userIdToChatWith});
	};

	const showAvailableStaff = () => {
		// open modal
		setStaffModalVisible(true);
	};
	
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
							onPress={() => goToConversation(conversation.conversationWith.uid)}
						>
							<View className="flex flex-row items-center p-4 bg-white rounded-lg border-b border-gray-100">
								<UserAvatar
									size={40}
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
								{conversation.unreadMessageCount > 0 && (
									<View className="flex flex-row items-center justify-center h-7 w-7 ml-auto text-xs bg-blue-500 rounded-full">
										<Text className="text-white">{conversation.unreadMessageCount}</Text>
									</View>
								)}
							</View>
						</TouchableOpacity>
					))}
				</ScrollView>
			)}
			<View className="absolute bottom-40 w-full items-center">
				<TouchableOpacity
					onPress={() => showAvailableStaff()}
				>
					<View className="flex flex-row w-6/12 bg-blue-500 shadow rounded-full px-5 py-3 ">
						<Icon name="icon_svg_plus" size={20} color="#fff" className="mt-1" />
						<Text className="text-white font-bold ml-2 text-lg">New Chat</Text>
					</View>
				</TouchableOpacity>
			</View>
			<Modal 
				onBackdropPress={() => setStaffModalVisible(false)}
				animationType="slide"
				presentationStyle="pageSheet"
				visible={staffModalVisible}
				onRequestClose={() => setStaffModalVisible(false)}
			>
				<View className="flex flex-row items-center h-auto p-5 border-b border-gray-200 justify-between">
					<Text className="text-lg font-bold text-gray-700">Available Staff</Text>
					<TouchableOpacity
						onPress={() => setStaffModalVisible(false)}
					>
						<Icon name="icon_svg_close" size={15} color="#374151" />
					</TouchableOpacity>
				</View>
				<ChatUsers	/>
			</Modal>
				
			
		</SafeAreaView>
	);
};

export default ChatScreen;
