import ProtectedRoute from '@/components/protected-route';
import { Stack } from 'expo-router';

export default function TabsLayout() {
  return (
    <ProtectedRoute>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            title: "Minyak_OK",
          }}
        />
      </Stack>
    </ProtectedRoute>
  );
}