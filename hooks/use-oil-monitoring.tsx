import { AuthContext } from "@/contexts/auth-context";
import { database } from "@/lib/firebase";
import { Riwayat, RiwayatData } from "@/lib/types";
import axios from "axios";
import { onValue, push, ref, remove, set } from "firebase/database";
import { unregisterIndieDevice } from "native-notify";
import { useContext, useEffect, useRef, useState } from "react";
import {
  Alert
} from "react-native";

export default function useMOilMonitoring() {
  
  const [alatStatus, setAlatStatus] = useState("off");
    const [data, setData] = useState({
      r: 0,
      g: 0,
      b: 0,
      ldr: 0,
      ph: 0,
      status: "",
    });
    const [history, setHistory] = useState<Riwayat[]>([]);
    const [chartHistory, setChartHistory] = useState<Riwayat[]>([]);
    const [phSeries, setPhSeries] = useState<number[]>([]);
    const [ldrSeries, setLdrSeries] = useState<number[]>([]);
    const [focusedValue, setFocusedValue] = useState<number | null>(null);
    const { logout } = useContext(AuthContext);
    const notifiedRef = useRef(false);
    const [timeoutId, setTimeoutId] = useState<number | null>(null);

    
  useEffect(() => {
    const alatRef = ref(database, "alat");
    const unsubscribe = onValue(alatRef, (snapshot) => {
      setAlatStatus(snapshot.val() || "off");
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const dataRef = ref(database, "data");
    let timeout: NodeJS.Timeout | null = null;

    const unsubscribe = onValue(dataRef, (snapshot) => {
      const newData = snapshot.val() || {
        r: 0,
        g: 0,
        b: 0,
        ldr: 0,
        ph: 0,
        status: "",
      };
      setData(newData);

      const statusLower = newData.status.toLowerCase();
      if (statusLower === "tidak layak" && !notifiedRef.current) {
        axios.post("https://app.nativenotify.com/api/indie/notification", {
          subID: "minyak_ok2004",
          appId: 29958,
          appToken: "DWbdXJaDAApTWVofAJH8Ie",
          title: "Peringatan Minyak",
          message: "Minyak anda sudah beberapa kali pakai, segera ganti",
        });
        notifiedRef.current = true;

        setTimeout(() => {
          notifiedRef.current = false;
        }, 5 * 60 * 1000);
      }

      console.log(new Date("2025-05-12T07:03:13.496Z").toLocaleString());

      if (alatStatus === "on") {
        setPhSeries((prev) => [...prev, newData.ph].slice(-12));
        setLdrSeries((prev) => [...prev, newData.ldr].slice(-12));

        const timeout = setTimeout(() => {
          const riwayatRef = ref(database, "riwayat");
          push(riwayatRef, {
            ...newData,
            timestamp: new Date().toISOString(),
          }).then(() => {
            set(ref(database, "alat"), "off");
          });
        }, 60000);
      } else {
        setPhSeries([]);
        setLdrSeries([]);
      }
    });

    return () => {
      unsubscribe();
      if (timeout) clearTimeout(timeout); // ✅ Hapus timeout saat unmount
    };
  }, []);

  // Listen to riwayat updates
  useEffect(() => {
    const riwayatRef = ref(database, "riwayat");
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
    const newStatus = alatStatus === "off" ? "on" : "off";
    set(ref(database, "alat"), newStatus);
  };

  const handleLogout = async () => {
    try {
      logout();
      unregisterIndieDevice("minyak_ok2004", 29958, "DWbdXJaDAApTWVofAJH8Ie");
    } catch (error: any) {
      Alert.alert("Login Failed", error.message);
    }
  };

  const handleDeleteRiwayat = (id: string) => {
    const riwayatEntryRef = ref(database, `riwayat/${id}`);
    remove(riwayatEntryRef);
  };

  const handleFocus = (item: { value: number }) => {
    setFocusedValue(item.value);

    if (timeoutId) clearTimeout(timeoutId);

    const id = setTimeout(() => setFocusedValue(null), 1500);
    setTimeoutId(id);
  };

  const reversedChartHistory = chartHistory.slice().reverse();
  
  return {
    data,
    setData,
    alatStatus,
    history, 
    setHistory,
    chartHistory, 
    setChartHistory,
    phSeries, 
    setPhSeries, 
    ldrSeries, 
    setLdrSeries, 
    focusedValue, 
    setFocusedValue,
    timeoutId, 
    setTimeoutId,
    handleLogout,
    handleUjiMinyak,
    handleDeleteRiwayat,
    handleFocus,
    reversedChartHistory
  }
}