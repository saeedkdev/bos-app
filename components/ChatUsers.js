import { View, Text, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useLayoutEffect, useState, useEffect } from 'react';
import UserAvatar from 'react-native-user-avatar';
import { CometChat } from '@cometchat-pro/react-native-chat';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DotIndicator,
} from 'react-native-indicators';
import { createIconSetFromIcoMoon } from '@expo/vector-icons';

import { useNavigation } from '@react-navigation/native';

import { REACT_APP_BOS_API_URL, COMET_CHAT_APP_ID, COMET_CHAT_AUTH_KEY, COMET_CHAT_REGION } from '@env';

const appID = COMET_CHAT_APP_ID;
const region = COMET_CHAT_REGION;
const authKey = COMET_CHAT_AUTH_KEY;

const Icon = createIconSetFromIcoMoon(
  require('../assets/selection.json'),
  'IcoMoon',
  'icomoon.ttf'
);

const ChatUsers = () => {
	const navigation = useNavigation();
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	
	const getUsers = async () => {
		let loggedInUsers = new CometChat.UsersRequestBuilder().setLimit(100).build();
		loggedInUsers.fetchNext().then(
			userList => {
				setUsers(userList);
				setLoading(false);
				console.log("User list received:", userList);
			},
			error => {
				console.log('User list fetching failed with error:', error);
			}
		);
	};

	useEffect(() => {
		getUsers();
	}, []);	

	const goToConversation = (userIdToChatWith) => {
		navigation.navigate('Conversation', {userIdToChatWith: userIdToChatWith});
	};


	return (
		<ScrollView className="p-2">
			{loading ? (
				<DotIndicator color="#374151" />
			) : (
				<ScrollView>
					{users.map((user) => (
						<TouchableOpacity
							key={user.uid}
							onPress={() => {
								goToConversation(user.uid);
							}}
						>
							<View className="flex flex-row items-center p-4 bg-white rounded-lg border-b border-gray-100">
								<UserAvatar
									size={40}
									name={user.name}
									bgColor="#374151"
									src={user.avatar}
								/>
								<View className="flex flex-col ml-4">
									<Text className="font-bold text-gray-700">
										{user.name}
									</Text>
								</View>
							</View>
						</TouchableOpacity>
					))}
				</ScrollView>
			)}
		</ScrollView>
	);
};

export default ChatUsers;
