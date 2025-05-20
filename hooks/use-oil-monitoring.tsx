import { AuthContext } from '@/contexts/auth-context';
import { database } from '@/lib/firebase';
import { Riwayat, RiwayatData } from '@/lib/types';
import { onValue, push, ref, remove, set } from 'firebase/database';
import { useContext, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

const useOilMonitoring = () => {
  const [alatStatus, setAlatStatus] = useState<string>('off');
  const [data, setData] = useState({
    r: 0,
    g: 0,
    b: 0,
    ldr: 0,
    ph: 0,
    status: '',
    timestamp: ''
  });
  const [history, setHistory] = useState<Riwayat[]>([]);
  const [chartHistory, setChartHistory] = useState<Riwayat[]>([]);
  const [phSeries, setPhSeries] = useState<number[]>([]);
  const [ldrSeries, setLdrSeries] = useState<number[]>([]);
  const [focusedValue, setFocusedValue] = useState<number | null>(null);
  const timeoutIdRef = useRef<number | null>(null);

  const { logout } = useContext(AuthContext)

  useEffect(() => {
    const alatRef = ref(database, 'alat');
    const unsubscribe = onValue(alatRef, (snapshot) => {
      setAlatStatus(snapshot.val() || 'off');
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const dataRef = ref(database, 'data');
    let timeout: number | null = null;

    const unsubscribe = onValue(dataRef, (snapshot) => {
      const newData = snapshot.val() || {
        r: 0,
        g: 0,
        b: 0,
        ldr: 0,
        ph: 0,
        status: '',
      };
      setData(newData);

      if (alatStatus === 'on') {
        setPhSeries((prev) => [...prev, newData.ph].slice(-12));
        setLdrSeries((prev) => [...prev, newData.ldr].slice(-12));

        timeout = setTimeout(() => {
          const riwayatRef = ref(database, 'riwayat');
          push(riwayatRef, {
            ...newData,
            timestamp: new Date().toISOString(),
          }).then(() => {
            set(ref(database, 'alat'), 'off');
          });
        }, 60000);
      } else {
        setPhSeries([]);
        setLdrSeries([]);
      }
    });

    return () => {
      unsubscribe();
      if (timeout) clearTimeout(timeout);
    };
  }, [alatStatus]);

  useEffect(() => {
    const riwayatRef = ref(database, 'riwayat');
    const unsubscribe = onValue(riwayatRef, (snapshot) => {
      const riwayatData: Record<string, RiwayatData> | null = snapshot.val();
      const historyArray: Riwayat[] = riwayatData
        ? Object.entries(riwayatData).map(([id, value]) => ({
            id,
            ...value,
          }))
        : [];
      setHistory(historyArray);
      setChartHistory(historyArray);
    });
    return () => unsubscribe();
  }, []);

  const handleUjiMinyak = () => {
    const newStatus = alatStatus === 'off' ? 'on' : 'off';
    set(ref(database, 'alat'), newStatus);
  };

  const handleDeleteRiwayat = (id: string) => {
    const riwayatEntryRef = ref(database, `riwayat/${id}`);
    remove(riwayatEntryRef);
  };

  const handleFocus = (item: { value: number }) => {
    setFocusedValue(item.value);
    if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
    timeoutIdRef.current = setTimeout(() => setFocusedValue(null), 1500);
  };

  const handleLogout = async () => {
    try {
      logout();
    } catch (error: any) {
      Alert.alert("Login Failed", error.message);
    }
  };


  return {
    alatStatus,
    data,
    history,
    chartHistory,
    phSeries,
    ldrSeries,
    focusedValue,
    handleUjiMinyak,
    handleDeleteRiwayat,
    handleFocus,
    handleLogout
  };
};

export default useOilMonitoring;