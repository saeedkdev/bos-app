import { View, Text, TextInput, SafeAreaView, FlatList, Pressable, 
	TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet, Keyboard, TouchableWithoutFeedback } from 'react-native';
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
import { REACT_APP_BOS_API_URL, COMET_CHAT_APP_ID, COMET_CHAT_AUTH_KEY, COMET_CHAT_REGION } from '@env';


const apiUrl = REACT_APP_BOS_API_URL;
const appID = COMET_CHAT_APP_ID;
const region = COMET_CHAT_REGION;
const authKey = COMET_CHAT_AUTH_KEY;
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
	const [isTyping, setIsTyping] = useState(false);
	const [isSent, setIsSent] = useState(false);
	const [isDelivered, setIsDelivered] = useState(false);
	const [isRead, setIsRead] = useState(false);

	const flatListRef = useRef();

	const { userIdToChatWith } = route.params;

	const getChat = async () => {
		let messagesRequest = new CometChat.MessagesRequestBuilder()
			.setUID(userIdToChatWith)
			.setLimit(30)
			.build();
		messagesRequest.fetchPrevious().then(
			messages => {
				setChat(messages);
				setLoadingChat(false);
				flatListRef.current.scrollToEnd({ animated: true });
				// mark as read
				messages.forEach(message => {
					if (message.getSender().getUid() !== staff.staffid && typeof message.getReadAt() === 'undefined') {
						CometChat.markAsRead(message).then(
							() => {
								console.log('Message marked as read');
							}
						);
					}
				});
			}
		).catch(
			error => {
				console.log('Message fetching failed with error:', error);
			}
		);
	};


	const logout = async () => {
		let response = await axios.get(apiUrl+'/auth/logout');
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

	useEffect(() => {
		getChat();
		startListeningForMessages();
	}, []);


	const sendMessage = async () => {
		let textMessage = new CometChat.TextMessage(userIdToChatWith, msg, CometChat.RECEIVER_TYPE.USER);
		CometChat.sendMessage(textMessage).then(
			message => {
				setMsg('');
				getChat();
				setIsSent(true);
			},
			error => {
				console.log('Message sending failed with error:', error);
			}
		);
	};

	const startListeningForMessages = async () => {
		const staffId = await AsyncStorage.getItem('staffId');
		let listenerID = 'STAFF_LISTENER'+staffId;
		CometChat.addMessageListener(
			listenerID,
			new CometChat.MessageListener({
				onTextMessageReceived: textMessage => {
					getChat();
				},
				onMediaMessageReceived: mediaMessage => {
					console.log('Media message received successfully:', mediaMessage);
				},
				onCustomMessageReceived: customMessage => {
					console.log('Custom message received successfully:', customMessage);
				},
				onTypingStarted: typingIndicator => {
					console.log('Typing indicator started:', typingIndicator);
					setIsTyping(true);
				},
				onTypingEnded: typingIndicator => {
					console.log('Typing indicator ended:', typingIndicator);
					setIsTyping(false);
				},
				onMessagesDelivered: messageReceipt => {
					console.log('Messages delivered:', messageReceipt);
					setIsDelivered(true);
				},
				onMessagesRead: messageReceipt => {
					console.log('Messages read:', messageReceipt);
					setIsRead(true);
				},
			})
		);
	};

	const renderMessage = ({ item }) => {
		if (item.sender.uid != userIdToChatWith) {
			return (
				<View className="flex flex-row justify-end mb-5"
					onStartShouldSetResponder={() => true}
				>
					<View className="flex flex-row">
						<View className="flex flex-col justify-end bg-blue-500 shadow p-3 rounded-2xl mr-3 max-w-xs">
							<Text className="text-sm text-white">{item.text}</Text>
						</View>
						{item.sender.avatar ? (
							<UserAvatar bgColor="#fff" size={40} name={item.sender.name} src={item.sender.avatar} />
						) : (
							<UserAvatar bgColor="#fff" name={item.sender.name} size={40} />
						)}
					</View>
				</View>
			);
		} else {
			return (
				<View className="flex flex-row justify-start mb-5"
					onStartShouldSetResponder={() => true}
				>
					<View className="flex flex-row">
						{item.sender.avatar ? (
							<UserAvatar bgColor="#fff" size={40} name={item.sender.name} src={item.sender.avatar} />
						) : (
							<UserAvatar bgColor="#ffF" size={40} name={item.sender.name} />
						)}
						<View className="flex flex-col bg-gray-200 shadow p-3 rounded-2xl ml-3" style={{ maxWidth: 250 }}>
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
				keyboardVerticalOffset={10}
				style={styles.container}
				
			>
			<TouchableWithoutFeedback onPress={() => Keyboard.dismiss }>
			<View style={styles.inner}
			>
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
						onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
						onLayout={() => flatListRef.current.scrollToEnd({ animated: true })}
						className="pt-5"
					/>
				)}
				{isTyping && ( 
					<View className="flex flex-row justify-start mb-5">
						<View className="px-2 flex-row">
							<Text className="text-sm text-gray-300 mr-7">Typing</Text>
							<DotIndicator color="#ebebeb" size={5} />
						</View>
					</View>
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
						className="bg-blue-500 rounded-full p-3 h-11 w-11">
						<Icon name="icon_svg_paper_plane" size={20} color="#fff" />
					</TouchableOpacity>
				</View>
			</View>
			</TouchableWithoutFeedback>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
};

export default Conversation;

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	inner: {
		paddingBottom: 80,
		paddingLeft: 15,
		paddingRight: 15,
		flex: 1,
	},
});
