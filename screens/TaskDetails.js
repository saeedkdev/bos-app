import { View, Text, SafeAreaView, ScrollView, Button, TouchableOpacity, TextInput, Pressable } from 'react-native';
import React, { Component, useLayoutEffect, useState, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import {
  DotIndicator,
} from 'react-native-indicators';
import { REACT_APP_BOS_API_URL } from '@env';
import Modal from "react-native-modal";
import { createIconSetFromIcoMoon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';


const Icon = createIconSetFromIcoMoon(
  require('../assets/selection.json'),
  'IcoMoon',
  'icomoon.ttf'
);


const TaskDetails = ({ taskId }) => {

	const apiUrl = REACT_APP_BOS_API_URL;
	const navigation = useNavigation();

	const [task, setTask] = useState([]);
	const [loading, setLoading] = useState(true);

	const logout = async () => {
		let response = await axios.get(apiUrl+'/auth/login');
		console.log(response);
		await AsyncStorage.removeItem('token');
		await AsyncStorage.removeItem('staffId');
		navigation.navigate('Login');
	};

	const getTask = async () => {
		setLoading(true);
		const staffId = await AsyncStorage.getItem('staffId');
		const token = await AsyncStorage.getItem('token');
		const taskId = taskId;
		console.log(taskId);
		try {
			if (staffId !== null && token !== null && taskId !== null) {
				let response = await axios.get(`${apiUrl}/v1/tasks/index/${taskId}`, {
					headers: {
						Authorization: `${token}`,
					},
				});
				console.log(response.data);
				setTask(response.data.task);
				setLoading(false);
			}
		} catch (error) {
			console.log(error);
		}
	};

	const goToScreen = (screen) => {
		navigation.navigate(screen);
	};

	useEffect(() => {
		getTask();
		console.log(task);
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
		<SafeAreaView>
			<View className="p-5">
				<Text>Task Details</Text>
			</View>
		</SafeAreaView>
	);
}

export default TaskDetails;
