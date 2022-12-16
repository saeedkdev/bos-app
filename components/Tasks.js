import { View, Text, SafeAreaView, ScrollView, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import React, { useLayoutEffect, useState, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DotIndicator,
} from 'react-native-indicators';


import { REACT_APP_BOS_API_URL } from '@env';

const Tasks = ({ navigation }) => {

	const [tasks, setTasks] = useState([]);
	const [loading, setLoading] = useState(true);
	const apiUrl = REACT_APP_BOS_API_URL;

	const getTasks = async () => {
		setLoading(true);
		const staffId = await AsyncStorage.getItem('staffId');
		const token = await AsyncStorage.getItem('token');
		try {
			if (staffId !== null && token !== null) {
				let response = await axios.get(`${apiUrl}/v1/getMyTasks/${staffId}`, {
					headers: {
						Authorization: `${token}`,
					},
				});
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


	const Task = ({ name, duedate, status, status_name }) => {
		return (
			<View className="rounded-md p-2 mb-2 bg-white shadow">
				<Text className="text-md pb-2 border-bottom-1 border-gray-200">{name}</Text>
				<View className="flex flex-row justify-between">
					{duedate !== null ? (
						<Text className="text-xs text-gray-500">Due Date: {duedate}</Text>
					) : (
						<Text className="text-xs text-gray-500">No Due Date</Text>
					)}
					{/* tailwindcss class based on status */}
					{status == 1 ? (
						<Text className="text-sm">{status_name}</Text>
					) : status == 4 ? (
						<Text className="text-sm text-blue-500">{status_name}</Text>
					) : status == 5 ? (
						<Text className="text-sm text-green-500">{status_name}</Text>
					) : status == 2 ? (
						<Text className="text-sm text-red-500">{status_name}</Text>
					) : (
						<Text className="text-sm text-gray-500">{status_name}</Text>
					)}
				</View>
			</View>
		);
	};

	const renderItem = ({ item }) => <Task name={item.name} duedate={item.duedate} status={item.status} status_name={item.status_name} />;

	return loading ? (
		<View className="flex-1 items-center justify-center align-center mt-5">
			<DotIndicator color="#374151" />
		</View>
		) : (
		<SafeAreaView className="rounded-md">
			<FlatList
				data={tasks}
				renderItem={renderItem}
				keyExtractor={(task) => task.id}
				listEmptyComponent={<Text className="text-center text-gray-500">No Tasks</Text>}
				showsVerticalScrollIndicator={false}
				listFooterComponent={<View className="h-10" />}
			/>
		</SafeAreaView>
	);
};

export default Tasks;
