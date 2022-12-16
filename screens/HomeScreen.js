import { View, Text, SafeAreaView, ScrollView, Button, TouchableOpacity, TextInput, Pressable, Modal } from 'react-native';
import React, { Component, useLayoutEffect, useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import {
  DotIndicator,
} from 'react-native-indicators';
import { REACT_APP_BOS_API_URL } from '@env';

import Tasks from '../components/Tasks';

const HomeScreen = ({navigation}) => {
	
	const [staff, setStaff] = useState({});
	const [todos, setTodos] = useState([]);
	const [newTodo, setNewTodo] = useState('');
	const [loadingTodos, setLoadingTodos] = useState(true);
	const [modalVisible, setModalVisible] = useState(false);
	const apiUrl = REACT_APP_BOS_API_URL;

	// get staff info
	const getStaffInfo = async () => {
		const staffId = await AsyncStorage.getItem('staffId');
		const token = await AsyncStorage.getItem('token');
		try {
			if (staffId !== null && token !== null) {
				let response = await axios.get(
					`${apiUrl}/v1/getMyStaffProfile/${staffId}`,
					{
						headers: {
							Authorization: `${token}`,
						},
					}
				);
				

				let userInformation = {};
				userInformation.firstName = response.data.staff.firstname;
				userInformation.lastName = response.data.staff.lastname;
				userInformation.email = response.data.staff.email;
				userInformation.phoneNumber = response.data.staff.phonenumber;
				userInformation.profileImage = response.data.staff.profile_image;
				console.log(userInformation);
				setStaff(userInformation);
			}
		} catch (error) {
			console.log(error);
		}
	};
	
	const getStaffTodos = async () => {
		const staffId = await AsyncStorage.getItem('staffId');
		const token = await AsyncStorage.getItem('token');
		try {
			if (staffId !== null && token !== null) {
				let response = await axios.get(
					`${apiUrl}/v1/getMyTodos`,
					{
						headers: {
							Authorization: `${token}`,
						},
					}
				);
				console.log(response.data);
				setTodos(response.data.todos);
				setLoadingTodos(false);
			}
		} catch (error) {
			console.log(error);
		}
	};

	const logout = async () => {
		let response = await axios.get(apiUrl+'/auth/logout');
		console.log(response);
		await AsyncStorage.removeItem('token');
		await AsyncStorage.removeItem('staffId');
		navigation.navigate('Login');
	};

	const goToScreen = (screen) => {
		navigation.navigate(screen);
	};

	const addTodo = async () => {
		const staffId = await AsyncStorage.getItem('staffId');
		const token = await AsyncStorage.getItem('token');
		try {
			if (staffId !== null && token !== null) {
				let response = await axios.post(
					`${apiUrl}/v1/createTodo`,
					{
						headers: {
							Authorization: `${token}`,
						},
						data: {
							description: newTodo,
							staffid: staffId,
						},
					}
				);
				console.log(response.data);
				setTodos(response.data.todos);
			}
		} catch (error) {
			console.log(error);
		}
	};


	useEffect(() => {
		getStaffInfo();
		getStaffTodos();
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
				<Button
					onPress={() => logout()}
					title="Logout"
					color="#fff"
				/>
			),
		});
	}, [navigation]);

	return (
		<SafeAreaView className="bg-gray-100 h-screen">
			<View className="">
				<View className="bg-gray-700 p-5">
					<Text className="text-xl font-bold text-white">Hi, </Text>
					<Text className="text-lg text-white mb-5">
						{staff.firstName} {staff.lastName}
					</Text>
					<View className="border border-gray-300 rounded-lg py-5 items-center bg-white">
						<Text className="font-bold">Welcome to your BusinessOS App</Text>
					</View>
				</View>
				{/*<Tasks />*/}
				<ScrollView className="flex flex-row space-x-5 mt-5 p-5" horizontal={true} showsHorizontalScrollIndicator={false}>
					<TouchableOpacity onPress={() => goToScreen('Tasks')}>
						<View className="flex text-center p-5 h-20 justify-center items-center rounded-lg bg-white shadow-md">
							<Text className="text-md font-bold text-gray-800">Tasks</Text>
						</View>
					</TouchableOpacity>
					<View className="flex text-center p-5 h-20 justify-center items-center rounded-lg bg-white shadow-md">
						<Text className="text-md font-bold">Chat</Text>
					</View>
					<View className="flex text-center p-5 h-20 justify-center items-center rounded-lg bg-white shadow-md">
						<Text className="text-md font-bold">Leads</Text>
					</View>
					<View className="flex text-center p-5 h-20 justify-center items-center rounded-lg bg-white shadow-md">
						<Text className="text-md font-bold">Customers</Text>
					</View>
				</ScrollView>
				<View className="flex px-5">
					<View className="flex flex-row flex-wrap-reverse justify-between">
						<Text className="flex items-center content-center justify-center text-xl font-bold text-gray-800 py-5">Todos</Text>
						<Pressable
							onPress={() => setModalVisible(true)}
							className="flex flex-row justify-between bg-white rounded-md shadow-md h-9 w-9 justify-center"
							>
							<Text className="text-md font-bold text-gray-800 p-2 text-center">
								+
							</Text>
						</Pressable>
					</View>
					{loadingTodos ? (
						<View className="flex justify-center items-center">
							<DotIndicator color="#374151" size={10} />
						</View>
					) : (
						<>
						{todos.map((todo) => (
							<BouncyCheckbox
								key={todo.todoid}
								iconStyle={{ borderColor: "#374151" }}
								textStyle={{ color: "#000" }}
								text={todo.description}
								size={20}
								paddingBottom={15}
								fillColor="#3B82F6"
								unfillColor="#fff"
							/>
						))}
						</>
					)}
			
						<Modal
						animationType="slide"
						visible={modalVisible}
						presentationStyle="formSheet"
						onRequestClose={() => {
							setModalVisible(!modalVisible);
						}}>
							<View className="justify-center  rounded-lg flex flex-row mt-5 p-5 bg-white">
								<TextInput className="w-10/12 bg-white shadow rounded-md p-4 my-2" 
									value={newTodo}
									onChangeText={(text) => setNewTodo(text)}
									placeholder="New Todo" />
								<Pressable className="w-1/6 bg-blue-500 shadow rounded-r-md p-4 my-2 justify-end" onPress={() => addTodo()}>
									<Text className="text-white text-center">+</Text>
								</Pressable>
							</View>
					</Modal>

				</View>
			</View>
		</SafeAreaView>
	);
};

export default HomeScreen;
