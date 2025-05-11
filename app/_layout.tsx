import { AuthProvider } from '@/context/auth-context';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(pages)" />
      </Stack>
    </AuthProvider>
  );
}