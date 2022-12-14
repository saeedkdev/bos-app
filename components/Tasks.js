import { View, Text, SafeAreaView, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import React, { useLayoutEffect, useState, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Tasks = ({ navigation }) => {

	const [tasks, setTasks] = useState([]);
	const [loading, setLoading] = useState(true);

	const getTasks = async () => {
		setLoading(true);
		const staffId = await AsyncStorage.getItem('staffId');
		const token = await AsyncStorage.getItem('token');
		try {
			if (staffId !== null && token !== null) {
				let response = await axios.get(`http://192.168.0.26/GI-Perfex/api/v1/getMyTasks/${staffId}`, {
					headers: {
						Authorization: `${token}`,
					},
				});
				console.log(response.data.tasks);
				setTasks(response.data.tasks);
				setLoading(false);
			}
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		getTasks();
	}, []);

	return loading ? (
		<View className="flex-1 items-center justify-center align-center mt-5">
			<ActivityIndicator size="large" color="#007bff" />
		</View>
		) : (
		<SafeAreaView className="rounded-md">
				<ScrollView className="flex flex-col mt-4" showsVerticalScrollIndicator={false}>
						{tasks.map((task) => (
						<View key={task.id} className="border border-gray-200 rounded-md p-2 mb-2 bg-white">
							<Text className="text-md pb-2 border-bottom-1 border-gray-200">{task.name}</Text>
							<View className="flex flex-row justify-between">
								{task.duedate !== null ? (
									<Text className="text-xs text-gray-500">Due Date: {task.duedate}</Text>
								) : (
									<Text className="text-xs text-gray-500">No Due Date</Text>
								)}
								{/* tailwindcss class based on status */}
								{task.status == 1 ? (
									<Text className="text-sm">{task.status_name}</Text>
								) : task.status == 4 ? (
									<Text className="text-sm text-blue-500">{task.status_name}</Text>
								) : task.status == 5 ? (
									<Text className="text-sm text-green-500">{task.status_name}</Text>
								) : task.status == 2 ? (
									<Text className="text-sm text-red-500">{task.status_name}</Text>
								) : (
									<Text className="text-sm text-gray-500">{task.status_name}</Text>
								)}
							</View>
						</View>
					))}
				</ScrollView>
		</SafeAreaView>
	);
};

export default Tasks;
