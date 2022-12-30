import { View, Text, SafeAreaView, ScrollView, StyleSheet, ActivityIndicator, FlatList, Pressable } from 'react-native';
import React, { useLayoutEffect, useState, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DotIndicator,
} from 'react-native-indicators';

import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';

import { createIconSetFromIcoMoon } from '@expo/vector-icons';

import { REACT_APP_BOS_API_URL } from '@env';

const Icon = createIconSetFromIcoMoon(
  require('../assets/selection.json'),
  'IcoMoon',
  'icomoon.ttf'
);

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
				let response = await axios.get(`${apiUrl}/v1/tasks`, {
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
			<View className="rounded-md p-5 mb-2 bg-white shadow min-h-32">
				<View className="flex flex-row justify-between border-b border-gray-200 pb-2">
					<Text className="text-lg ">{name}</Text>
					<Menu onSelect={value => alert(`Selected option: ${value}`)} className="p-2 w-8 h-8">
						<MenuTrigger>
							<Icon name="icon_svg_dot_menu" size={15} color="#d9d9d9" />
						</MenuTrigger>
						<MenuOptions>
							<MenuOption value="delete">
								<Text>Delete</Text>
							</MenuOption>
							<MenuOption value="edit">
								<Text>Edit</Text>
							</MenuOption>
						</MenuOptions>
					</Menu>
				</View>
				<View className="flex flex-row justify-between pt-4">
					{duedate ? (
						<Text className="text-xs text-gray-500">{duedate}</Text>
					) : (
						<Text className="text-xs text-gray-500">No Due Date</Text>
					)}
					
					{status == 1 ? (
						<View className="bg-white  border border-gray-200 rounded-full py-2 px-4">
							<Text className="text-xs text-gray-500">{status_name}</Text>
						</View>
					) : status == 6 ? (
						<View className="bg-indigo-500 shadow rounded-full py-2 px-4">
							<Text className="text-xs text-white">{status_name}</Text>
						</View>
					) : status == 4 ? (
						<View className="bg-blue-500 shadow rounded-full py-2 px-4">
							<Text className="text-xs text-white">{status_name}</Text>
						</View>
					) : status == 5 ? (
						<View className="bg-green-500 shadow rounded-full py-2 px-4">
							<Text className="text-xs text-white">{status_name}</Text>
						</View>
					) : status == 2 ? (
						<View className="bg-red-500 shadow rounded-full py-2 px-4">
							<Text className="text-xs text-white">{status_name}</Text>
						</View>
					) : (
						<View className="bg-gray-500 shadow rounded-full py-2 px-4">
							<Text className="text-xs text-white">{status_name}</Text>
						</View>
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
		<SafeAreaView className="rounded-md flex flex-row">
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
