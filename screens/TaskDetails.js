import { View, Text, SafeAreaView, ScrollView, Button, TouchableOpacity, TextInput, Pressable } from 'react-native';
import { WebView } from 'react-native-webview';
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


const TaskDetails = ({ route, navigation }) => {

	const apiUrl = REACT_APP_BOS_API_URL;

	const [task, setTask] = useState([]);
	const [projectData, setProjectData] = useState([]);
	const [loading, setLoading] = useState(true);

	const taskId = route.params.taskId;

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
		console.log(taskId);
		try {
			if (staffId !== null && token !== null && taskId !== null) {
				let response = await axios.get(`${apiUrl}/v1/tasks/index/${taskId}`, {
					headers: {
						Authorization: `${token}`,
					},
				});
				console.log(JSON.stringify(response.data.task));
				setTask(response.data.task);
				setProjectData(response.data.task.project_data);
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
				{loading ? (
					<DotIndicator color="#374151" />
				) : (
					<>
					<View className="rounded-md bg-white shadow p-5">
						<View className="flex flex-row justify-between border-b border-gray-200 pb-2">
							<Text className="text-lg text-gray-700">
								{task.name}
							</Text>
						</View>
						{projectData !== null ? (
						<View className="flex flex-col mt-2">
							{projectData.client_data !== null ? (
								<Text className="text-gray-700 text-md py-2">
									Customer: {projectData.client_data.company}
								</Text>
							) : (
								<></>
							)}
							<Text className="flex text-gray-700 text-md py-2">
								Related : {projectData.gi_formatted_number + ' - ' + projectData.name}
							</Text>
						</View>
						) : (
							<>
							</>
						)}
						<View className="mt-2 pb-2">
							<TouchableOpacity>
								<View className="flex flex-row justify-center bg-green-500 shadow rounded-lg py-2 px-4">
									<Icon name="icon_svg_clock" size={18} color="#fff" />
									<Text className="text-white text-center"> Start Timer </Text>
								</View>
							</TouchableOpacity>
						</View>
					</View>
					<View className="rounded-md bg-white shadow p-5 mt-5">
						<View className="flex flex-col">
							<Text className="text-lg text-gray-700">Description</Text>
							<WebView
								source={{ html: task.description }}
							/>
						</View>
					</View>
					</>
				)}
			</View>
		</SafeAreaView>
	);
}

export default TaskDetails;
