import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Platform,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import MapViewDirections from 'react-native-maps-directions';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, router } from 'expo-router';

import { auth } from '../firebaseConfig';

interface GooglePlace {
  id: string;
  displayName: {
    text: string;
  };
  formattedAddress: string;
  location: {
    latitude: number;
    longitude: number;
  };
  evChargeOptions?: {
    connectorCount: number;
  };
}

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

export default function Home() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [stations, setStations] = useState<GooglePlace[]>([]);
  const [selectedStation, setSelectedStation] = useState<GooglePlace | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null);
  const [batterySize, setBatterySize] = useState<number>(30);
  const [carName, setCarName] = useState<string>('Standard EV');

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['25%', '25%'], []);
  const PRICE_PER_KWH = 18;
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      const loadGarageData = async () => {
        const savedBattery = await AsyncStorage.getItem('@user_battery_size');
        const savedName = await AsyncStorage.getItem('@user_car_name');

        if (savedBattery) setBatterySize(parseFloat(savedBattery));
        if (savedName) setCarName(savedName);
      };
      loadGarageData();
    }, [])
  );

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);

      try {
        const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': GOOGLE_API_KEY,
            'X-Goog-FieldMask':
              'places.id,places.displayName,places.formattedAddress,places.location,places.evChargeOptions',
          },
          body: JSON.stringify({
            includedTypes: ['electric_vehicle_charging_station'],
            maxResultCount: 20,
            locationRestriction: {
              circle: {
                center: {
                  latitude: currentLocation.coords.latitude,
                  longitude: currentLocation.coords.longitude,
                },
                radius: 10000.0,
              },
            },
          }),
        });

        const data = await response.json();

        if (data.places) {
          setStations(data.places);
        } else {
          setStations([]);
        }
      } catch (error) {
        console.error('Failed to fetch stations:', error);
      }
    })();
  }, []);

  const getMockData = (id: string) => {
    const num = id.charCodeAt(id.length - 1) || 5;
    return {
      rating: (4 + (num % 10) / 10).toFixed(1),
      uptime: 90 + (num % 10),
      minsAgo: (num % 60) + 2,
    };
  };

  if (!location) {
    return (
      <View className="bg-bg flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="bg-bg flex-1">
          <View
            className="bg-bg/95 shadow-ev-card/50 absolute left-4 right-4 flex-row items-center justify-between rounded-2xl px-5 py-4 shadow-lg"
            style={{ top: insets.top + 10, zIndex: 50 }}>
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="lightning-bolt" size={25} color="#0D9488" />
              <Text className="text-textmain ml-1 text-2xl font-black tracking-wider">
                Volt<Text>Map</Text>
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                className="bg-secondary rounded-full p-2.5"
                onPress={() => router.push('/garage')}>
                <MaterialCommunityIcons name="garage-variant" size={22} color="#0D9488" />
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-primary rounded-full p-2"
                onPress={async () => {
                  try {
                    await signOut(auth);
                  } catch {
                    Alert.alert('Error', 'Failed to log out.');
                  }
                }}>
                <MaterialCommunityIcons name="logout" size={20} color="#E5E7EB" />
              </TouchableOpacity>
            </View>
          </View>
          <View className="relative flex-1">
            <MapView
              style={{ width: '100%', height: '100%' }}
              initialRegion={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
              showsUserLocation={true}
              showsCompass={false}
              showsMyLocationButton={false}
              toolbarEnabled={false}>
              {stations.map((station) => (
                <Marker
                  key={station.id}
                  coordinate={{
                    latitude: station.location.latitude,
                    longitude: station.location.longitude,
                  }}
                  onPress={() => {
                    setSelectedStation(station);
                    setRouteInfo(null);
                    bottomSheetRef.current?.snapToIndex(0);
                  }}>
                  <View className="border-card bg-primary rounded-full border-2 p-2 shadow-lg">
                    <MaterialCommunityIcons name="ev-station" size={20} color="white" />
                  </View>
                </Marker>
              ))}
              {selectedStation && (
                <MapViewDirections
                  origin={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                  }}
                  destination={{
                    latitude: selectedStation.location.latitude,
                    longitude: selectedStation.location.longitude,
                  }}
                  apikey={GOOGLE_API_KEY}
                  strokeWidth={5}
                  strokeColor="#0D9488"
                  onReady={(result) => {
                    setRouteInfo({
                      distance: result.distance,
                      duration: result.duration,
                    });
                  }}
                  onError={(errorMessage) => {
                    console.log('Directions Error:', errorMessage);
                  }}
                />
              )}
            </MapView>

            <View
              className="border-border bg-bg absolute left-4 right-4 top-12 rounded-2xl border p-4 shadow-lg"
              style={{ top: insets.top + 85, zIndex: 40 }}>
              <View className="mb-3 flex-row items-center justify-between">
                <View className="px-3">
                  <Text className="text-textmuted text-lg font-bold">EV Charge Calculator</Text>
                  <Text className="text-textmuted text-xs">
                    Avg fast-charging rate <Text className="text-textmain">{'\u20B9'}18/kWh</Text>
                  </Text>
                </View>
                <View className="bg-secondary border-primary/20 flex-row items-center rounded-lg border px-3 py-1.5">
                  <MaterialCommunityIcons name="car-electric" size={16} color="#0D9488" />
                  <Text className="text-primary ml-1 text-xs font-bold">{carName}</Text>
                </View>
              </View>

              <View className="bg-bg border-border flex-row items-center justify-between rounded-xl border px-3 py-3">
                <Text className="text-textmain text-sm font-bold">Full Charge (0-100%):</Text>
                <Text className="text-primary text-xl font-black">
                  {'\u20B9'} {(batterySize * PRICE_PER_KWH).toFixed(0)}
                </Text>
              </View>

              <Text className="text-textmuted/80 mt-2 px-2 text-[10px] italic">
                Maximize your rewards by swiping your HDFC, ICICI, IDFC credit card.
              </Text>

              {errorMsg && <Text className="text-red-500">Something went wrong</Text>}
            </View>
            <BottomSheet
              ref={bottomSheetRef}
              index={-1}
              snapPoints={snapPoints}
              enablePanDownToClose={true}
              backgroundStyle={{ borderRadius: 36, backgroundColor: '#F8FAFC' }}>
              <BottomSheetView className="flex-1 px-6 py-4">
                {selectedStation ? (
                  <View>
                    <Text className="text-textmain/80 mb-2 px-2 text-2xl font-bold">
                      {selectedStation.displayName.text}
                    </Text>
                    <View className="mb-4 flex-row items-center">
                      <View className="bg-secondary/35 mr-3 rounded-full px-3 py-1">
                        <Text className="text-primary text-sm font-semibold">
                          {selectedStation.evChargeOptions?.connectorCount || 'Unknown'} Connectors
                        </Text>
                      </View>
                      <Text className="text-primary font-semibold">Open Now</Text>
                    </View>

                    <View className="mb-4">
                      {routeInfo ? (
                        <Text className="text-primary px-2 text-sm font-bold">
                          {Math.ceil(routeInfo.duration)} min drive ({routeInfo.distance.toFixed(1)}{' '}
                          km)
                        </Text>
                      ) : (
                        <Text className="text-textmuted text-sm font-bold">
                          Calculating route...
                        </Text>
                      )}
                    </View>

                    {/* Hardware Reliability Stats */}
                    <View className="border-border mb-4 rounded-xl border bg-white p-3">
                      <View className="mb-2 flex-row items-center justify-between">
                        <View className="flex-row items-center">
                          <View className="bg-primary mr-2 h-2 w-2 rounded-full" />
                          <Text className="text-textmain/70 text-sm font-medium">
                            {selectedStation.evChargeOptions?.connectorCount || '2'} Connectors
                            Available
                          </Text>
                        </View>
                        <Text className="text-primary text-sm font-bold">
                          {getMockData(selectedStation.id).uptime}% Uptime
                        </Text>
                      </View>
                      <Text className="text-textmuted/80 text-xs">
                        Last successful charge: {getMockData(selectedStation.id).minsAgo} mins ago
                      </Text>
                    </View>

                    <TouchableOpacity
                      className="bg-primary items-center rounded-xl py-4"
                      onPress={() => {
                        const lat = selectedStation.location.latitude;
                        const lng = selectedStation.location.longitude;
                        if (Platform.OS === 'ios') {
                          Alert.alert(
                            'Choose Map App',
                            'Which app would you like to use for navigation?',
                            [
                              {
                                text: 'Google Maps',
                                onPress: () =>
                                  Linking.openURL(
                                    `comgooglemaps://?daddr=${lat},${lng}&directionsmode=driving`
                                  ),
                              },
                              {
                                text: 'Apple Maps',
                                onPress: () =>
                                  Linking.openURL(
                                    `http://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`
                                  ),
                              },
                              {
                                text: 'Cancel',
                                style: 'cancel',
                              },
                            ]
                          );
                        } else {
                          Linking.openURL(`google.navigation:q=${lat},${lng}`);
                        }
                      }}>
                      <Text className="text-lg font-bold text-white">Get Directions</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text className="mt-4 text-center text-gray-500">
                    Select a station on the map
                  </Text>
                )}
              </BottomSheetView>
            </BottomSheet>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </GestureHandlerRootView>
  );
}
