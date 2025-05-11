import { AuthContext } from '@/context/auth-context';
import { useRouter } from 'expo-router';
import { useContext, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { initialized, user } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (initialized && !user) {
      router.replace('/(auth)/login');
    }
  }, [initialized, user]);

  if (!initialized || (!user && typeof window !== 'undefined')) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
}
