import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="login" 
        options={{ 
          title: 'Admin Login',
          headerShown: false 
        }} 
      />
    </Stack>
  );
}