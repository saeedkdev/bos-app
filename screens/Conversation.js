import { View, Text, SafeAreaView, FlatList, Button, TouchableOpacity } from 'react-native';
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


const Conversation = ({route, navigation}) => {

	const [staff, setStaff] = useState({});
	const [chat, setChat] = useState([]);
	const [loadingChat, setLoadingChat] = useState(true);
	const [messages, setMessages] = useState([]);

	const { userIdToChatWith } = route.params;
	console.log(userIdToChatWith);

	const getChat = async () => {
		let messagesRequest = new CometChat.MessagesRequestBuilder()
			.setUID(userIdToChatWith)
			.setLimit(30)
			.build();
		messagesRequest.fetchPrevious().then(
			messages => {
				console.log('Message list fetched:', messages);
				setChat(messages);
				setLoadingChat(false);
			}
		).catch(
			error => {
				console.log('Message fetching failed with error:', error);
			}
		);
	};


	const logout = async () => {
		let response = await axios.get('http://192.168.0.26/GI-Perfex/api/auth/logout');
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

	useEffect(() => {
		getChat();
	}, []);


	const renderMessage = ({ item }) => {
		if (item.sender.uid != userIdToChatWith) {
			return (
				<View className="flex flex-row justify-end mb-5">
					<View className="flex flex-row justify-end">
						<View className="flex flex-col justify-end bg-blue-500 shadow p-3 rounded-lg mr-3">
							<Text className="text-sm text-white">{item.text}</Text>
						</View>
						<UserAvatar size={40} name={item.sender.name} />
					</View>
				</View>
			);
		} else {
			return (
				<View className="flex flex-row justify-start mb-5">
					<View className="flex flex-row justify-start">
						<UserAvatar size={40} name={item.sender.name} />
						<View className="flex flex-col justify-start bg-gray-200 shadow p-3 rounded-lg ml-3">
							<Text className="text-sm text-gray-700">{item.text}</Text>
						</View>
					</View>
				</View>
			);
		}
	};

	return (
		<SafeAreaView className="bg-white h-screen">
			<View className="p-5">
			{loadingChat ? (
				<View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
					<DotIndicator color="#374151" />
				</View>
			) : (
				<FlatList
					data={chat}
					renderItem={renderMessage}
					keyExtractor={item => item.id}
				/>
			)}
			</View>
		</SafeAreaView>
	);
};

export default Conversation;
