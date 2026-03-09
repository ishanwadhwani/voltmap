import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EV_DATABASE = [
  { id: '1', name: 'Tata Nexon EV', battery: 30, brand: 'Tata' },
  { id: '2', name: 'Tata Nexon EV Max', battery: 40.5, brand: 'Tata' },
  { id: '3', name: 'MG ZS EV', battery: 50.3, brand: 'MG' },
  { id: '4', name: 'BYD Atto 3', battery: 60.48, brand: 'BYD' },
  { id: '5', name: 'Tata Tiago EV', battery: 24, brand: 'Tata' },
  { id: '6', name: 'Mahindra XUV400', battery: 39.4, brand: 'Mahindra' },
];

export default function GargeScreen() {
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);

  useEffect(() => {
    const loadSavedCar = async () => {
      const saved = await AsyncStorage.getItem('@user_car_id');
      if (saved) setSelectedCarId(saved);
    };
    loadSavedCar();
  }, []);

  const handleSelectedCar = async (car: (typeof EV_DATABASE)[0]) => {
    try {
      await AsyncStorage.setItem('@user_car_id', car.id);
      await AsyncStorage.setItem('@user_battery_size', car.battery.toString());
      await AsyncStorage.setItem('@user_car_name', car.name);

      setSelectedCarId(car.id);
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to save vehicle to garage.');
    }
  };

  return (
    <SafeAreaView className="bg-bg flex-1">
      <Stack.Screen options={{ headerShown: false }} />

      <View className="border-border bg-card flex-row items-center border-b px-6 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-theme-bg mr-4 rounded-full p-2">
          <MaterialCommunityIcons name="arrow-left" size={24} color="#0F172A" />
        </TouchableOpacity>
        <View>
          <Text className="text-textmain text-2xl font-black">My Garage</Text>
          <Text className="text-textmuted text-sm font-medium">Select your primary vehicle</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
        {EV_DATABASE.map((car) => {
          const isSelected = selectedCarId === car.id;

          return (
            <TouchableOpacity
              key={car.id}
              onPress={() => handleSelectedCar(car)}
              className={`mb-4 flex-row items-center justify-between rounded-2xl border-2 p-4 shadow-sm
                ${isSelected ? 'bg-secondary border-primary' : 'bg-card border-border'}`}>
              <View className="flex-row items-center">
                <View className={`mr-4 rounded-full p-3 ${isSelected ? 'bg-primary' : 'bg-bg'}`}>
                  <MaterialCommunityIcons
                    name="car-electric"
                    size={28}
                    color={isSelected ? '#FFFFFF' : '#0D9488'}
                  />
                </View>
                <View>
                  <Text
                    className={`text-lg font-bold ${isSelected ? 'text-primary' : 'text-textmain'}`}>
                    {car.name}
                  </Text>
                  <Text className="text-textmuted mt-0.5 text-sm font-medium">
                    {car.battery} kWh Battery
                  </Text>
                </View>
              </View>
              {isSelected && (
                <MaterialCommunityIcons name="check-circle" size={24} color="#0D9488" />
              )}
            </TouchableOpacity>
          );
        })}
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
