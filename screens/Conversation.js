import { View, Text, TextInput, SafeAreaView, FlatList, Button, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import React, { useLayoutEffect, useState, useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CometChat } from '@cometchat-pro/react-native-chat';
import UserAvatar from 'react-native-user-avatar';
import {
  DotIndicator,
} from 'react-native-indicators';
import { createIconSetFromIcoMoon } from '@expo/vector-icons';

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


const Icon = createIconSetFromIcoMoon(
  require('../assets/selection.json'),
  'IcoMoon',
  'icomoon.ttf'
);

const Conversation = ({route, navigation}) => {

	const [staff, setStaff] = useState({});
	const [chat, setChat] = useState([]);
	const [loadingChat, setLoadingChat] = useState(true);
	const [messages, setMessages] = useState([]);
	const [msg, setMsg] = useState('');

	const flatListRef = useRef();

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


	const sendMessage = async () => {
		let textMessage = new CometChat.TextMessage(userIdToChatWith, msg, CometChat.RECEIVER_TYPE.USER);
		CometChat.sendMessage(textMessage).then(
			message => {
				console.log('Message sent successfully:', message);
				setMsg('');
				getChat();
			},
			error => {
				console.log('Message sending failed with error:', error);
			}
		);
	};

	const renderMessage = ({ item }) => {
		if (item.sender.uid != userIdToChatWith) {
			return (
				<View className="flex flex-row justify-end mb-5">
					<View className="flex flex-row">
						<View className="flex flex-col justify-end bg-blue-500 shadow p-3 rounded-lg mr-3 max-w-xs">
							<Text className="text-sm text-white">{item.text}</Text>
						</View>
						<UserAvatar className="h-10" size={40} name={item.sender.name} />
					</View>
				</View>
			);
		} else {
			return (
				<View className="flex flex-row justify-start mb-5">
					<View className="flex flex-row">
						<UserAvatar className="h-10" size={40} name={item.sender.name} />
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
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				keyboardVerticalOffset={70}
				className="flex flex-col justify-between h-full"
			>
			<View className="p-5">
				{loadingChat ? (
					<View className="flex-1 items-center justify-center align-center mt-5">
						<DotIndicator color="#374151" />
					</View>
				) : (
					<FlatList
						ref={flatListRef}
						data={chat}
						renderItem={renderMessage}
						keyExtractor={item => item.id}
						showsVerticalScrollIndicator={false}
						style={{ height: '80%' }}
						initialScrollIndex={chat.length - 1}
						getItemLayout={(data, index) => (
							{ length:0, offset: 50 * index, index }
						)}
						scrollToEnd={() => flatListRef.current.scrollToEnd({ animated: true })}
					/>
				)}
				<View className="flex flex-row justify-between py-2">
					<TextInput
						placeholder="Type a message"
						className="bg-gray-200 rounded-full p-3 w-5/6"
						value={msg}
						onChangeText={text => setMsg(text)}
					/>
					<TouchableOpacity 
						onPress={() => sendMessage()}
						className="bg-blue-500 rounded-full p-3">
						<Icon name="icon_svg_paper_plane" size={20} color="#fff" />
					</TouchableOpacity>
				</View>
			</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
};

export default Conversation;
