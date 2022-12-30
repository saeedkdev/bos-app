import React, { useState, Component, Fragment } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwt_decode from 'jwt-decode';
import { useFonts } from 'expo-font';
import { createIconSetFromIcoMoon } from '@expo/vector-icons';
import { MenuProvider } from 'react-native-popup-menu';

import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import TasksScreen from './screens/TasksScreen';
import ChatScreen from './screens/ChatScreen';
import Conversation from './screens/Conversation';
import TaskDetails from './screens/TaskDetails';

const Stack = createNativeStackNavigator();

const Icon = createIconSetFromIcoMoon(
  require('./assets/selection.json'),
  'IcoMoon',
  'icomoon.ttf'
);

export default function App() {
	const [isLogin, setIsLogin] = useState(false);
	const [fontsLoaded] = useFonts({
		IcoMoon: require('./assets/fonts/icomoon.ttf'),
	});

	if (!fontsLoaded) {
		return null;
	}
	
	const CheckLogin = async () => {
		try {
			let staffId = await AsyncStorage.getItem('staffId');
			let token = await AsyncStorage.getItem('token');
			if (staffId !== null && token !== null) {
				// if token is not expired
				let decoded = jwt_decode(token);
				let currentTime = Date.now() / 1000;
				console.log(decoded.exp, currentTime);
				if (decoded.exp > currentTime) {
					setIsLogin(true);
				} else {
					setIsLogin(false);
				}
			}
		} catch (error) {
			console.log(error);
		}
	};


  return (
	<MenuProvider>
	<NavigationContainer>
	  <Stack.Navigator>
		{isLogin ? (
			<>
			<Stack.Screen name="Home" component={HomeScreen} options={{
				title: 'Home',
			}} />
			<Stack.Screen name="Tasks" component={TasksScreen} options={{
				title: 'Tasks',
			}} />
			<Stack.Screen name="Chat" component={ChatScreen} options={{
				title: 'Chat',
			}} />'
			<Stack.Screen name="Conversation" component={Conversation} options={{
				title: 'Conversation',
			}} />
			<Stack.Screen name="TaskDetails" component={TaskDetails} options={{
				title: 'Task Details',
			}} />
			</>
		) : (
			<Stack.Screen name="Login" component={LoginScreen} />
		)}
			<Stack.Screen name="Home" component={HomeScreen} />
			<Stack.Screen name="Tasks" component={TasksScreen} options={{
				title: 'Tasks',
			}} />
			<Stack.Screen name="Chat" component={ChatScreen} options={{
				title: 'Chat',
			}} />
			<Stack.Screen name="Conversation" component={Conversation} options={{
				title: 'Conversation',
			}} />
			<Stack.Screen name="TaskDetails" component={TaskDetails} options={{
				title: 'Task Details',
			}} />
		</Stack.Navigator>
	</NavigationContainer>
	</MenuProvider>
  );
}
