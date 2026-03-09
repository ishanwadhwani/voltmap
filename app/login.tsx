import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth } from '../firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleAuthentication = async () => {
    if (email === '' || password === '') {
      Alert.alert('Error', 'Enter email and password');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        Alert.alert('Success', 'Account created successfully!');
      }
    } catch (error: any) {
      Alert.alert('Authentication Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="bg-card flex-1">
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View className="mx-auto w-full max-w-sm py-8">
            <View className="mb-10 items-center">
              <MaterialCommunityIcons name="lightning-bolt" size={25} color="#0D9488" />
              <Text className="text-textmain ml-1 text-2xl font-black tracking-wider">
                Volt<Text>Map</Text>
              </Text>
              <Text className="text-textmuted mt-2 text-sm font-medium">
                Find and track EV charging stations
              </Text>
            </View>
            <View className="space-y-4">
              <View className="bg-bg/20 border-textmuted/30 mb-2 rounded-xl border px-4 py-3 ">
                <Text className="text-primary mb-1 text-xs font-bold uppercase tracking-wider">
                  Email
                </Text>
                <TextInput
                  className="text-textmain text-base font-medium"
                  placeholder="driver@voltmap.com"
                  placeholderTextColor="#cbd5e1"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View className="bg-bg/20 border-textmuted/30 rounded-xl border px-4 py-3">
                <Text className="text-primary mb-1 text-xs font-bold uppercase tracking-wider">
                  Password
                </Text>
                <TextInput
                  className="text-textmain text-base font-medium"
                  placeholder="••••••••"
                  placeholderTextColor="#cbd5e1"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
            </View>

            <TouchableOpacity
              className={`mt-8 items-center rounded-xl py-4 shadow-lg ${loading ? 'bg-secondary' : 'bg-primary'}`}
              onPress={handleAuthentication}
              disabled={loading}>
              <Text className={`text-lg font-black ${loading ? 'text-primary' : 'text-white'}`}>
                {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="mt-6 items-center p-2"
              onPress={() => setIsLogin(!isLogin)}>
              <Text className="text-textmuted font-medium">
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <Text className="text-primary font-bold">{isLogin ? 'Sign Up' : 'Log In'}</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
