import FocusToast from "@/components/focus-toast";
import { AuthContext } from "@/contexts/auth-context";
import { database } from "@/lib/firebase";
import { Riwayat, RiwayatData } from "@/lib/types";
import { formattedTime } from "@/lib/utils/format-time";
import { getStatusText } from "@/lib/utils/get-status-helper";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { onValue, push, ref, remove, set } from "firebase/database";
import registerNNPushToken, { unregisterIndieDevice } from "native-notify";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart } from "react-native-gifted-charts";
import styles from "./css/style";

export default function Home() {
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

  registerNNPushToken(29958, "DWbdXJaDAApTWVofAJH8Ie");

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

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <View style={styles.section}>
            <Button
              title="Uji Minyak"
              color="green"
              onPress={handleUjiMinyak}
            />
            <View style={{ marginVertical: 10, alignItems: "center" }}>
              <Text style={{ fontSize: 18 }}>
                Status:{" "}
                <Text
                  style={{
                    color: alatStatus === "on" ? "green" : "red",
                    fontWeight: "bold",
                  }}
                >
                  {alatStatus === "on" ? "ON" : "OFF"}
                </Text>
              </Text>
            </View>
          </View>
          <View style={styles.section}>
            <Button
              title={`Status Minyak: \n${getStatusText(data?.status)}`}
              color="red"
              disabled
            />
          </View>
        </View>

        {data?.status.toLowerCase() === "tidak layak" && (
          <View style={styles.warningSection}>
            <Text style={styles.warningText}>
              ⚠️ Minyak anda sudah beberapa kali pakai, segera ganti.
            </Text>
          </View>
        )}

        {history.length > 0 && (
          <>
            {/* Grafik RGB */}
            <View style={styles.chartSection}>
              <Text style={styles.chartText}>Grafik Perubahan Warna RGB</Text>
              <LineChart
                data={reversedChartHistory.map((item, index) => ({
                  value: item.r,
                  dataPointText: (index + 1).toString(),
                }))}
                color1="red"
                data2={reversedChartHistory.map((item, index) => ({
                  value: item.g,
                  dataPointText: (index + 1).toString(),
                }))}
                color2="green"
                data3={reversedChartHistory.map((item, index) => ({
                  value: item.b,
                  dataPointText: (index + 1).toString(),
                }))}
                color3="blue"
                thickness={3}
                dataPointsColor1="red"
                dataPointsColor2="green"
                dataPointsColor3="blue"
                width={280}
                backgroundColor="#F0F9FF"
                hideRules
                isAnimated
                yAxisLabelWidth={40}
                xAxisLabelTextStyle={{ fontSize: 10, color: "#374151" }}
                yAxisTextStyle={{ fontSize: 10, color: "#374151" }}
                focusEnabled={true}
                focusProximity={30} // default biasanya cukup 30
                delayBeforeUnFocus={1000} // titik fokus akan hilang setelah 1 detik
                unFocusOnPressOut={false} // biar tetap fokus sampai delay habis
                focusedDataPointColor="black"
                focusedDataPointRadius={3}
                focusedDataPointShape="circle"
                onFocus={handleFocus}
              />

              <View style={styles.valuesRow}>
                <Text style={styles.label}>R: {data ? data?.r : 0}</Text>
                <Text style={styles.label}>G: {data ? data?.g : 0}</Text>
                <Text style={styles.label}>B: {data ? data?.b : 0}</Text>
              </View>

              <View style={styles.valuesRow}>
                <Text style={styles.label}>
                  Kualitas: {getStatusText(data?.status)}
                </Text>
              </View>

              <View style={styles.valuesRow}>
                <Text style={[styles.label, { fontSize: 12 }]}>
                  Note: perubahan pada RGB dapat mengindikasi kontaminasi atau
                  perubahan kualitas
                </Text>
              </View>
            </View>

            {/* Grafik pH */}
            <View style={styles.chartSection}>
              <Text style={styles.chartText}>Grafik Tingkat Asam pH</Text>
              <LineChart
                data={chartHistory.map((item, index) => ({
                  value: item.ph,
                  dataPointText: (index + 1).toString(),
                }))}
                color="#F59E0B"
                thickness={3}
                dataPointsColor="#FBBF24"
                width={280}
                backgroundColor="#FFFBEB"
                hideRules
                isAnimated
                xAxisLabelTextStyle={{ fontSize: 10, color: "#374151" }}
                yAxisTextStyle={{ fontSize: 10, color: "#374151" }}
                focusEnabled={true}
                focusProximity={30} // default biasanya cukup 30
                delayBeforeUnFocus={1000} // titik fokus akan hilang setelah 1 detik
                unFocusOnPressOut={false} // biar tetap fokus sampai delay habis
                focusedDataPointColor="black"
                focusedDataPointRadius={3}
                focusedDataPointShape="circle"
                onFocus={handleFocus}
              />
              <Text style={styles.label}>pH: {data ? data.ph : 0}</Text>

              <View style={styles.valuesRow}>
                <Text style={styles.label}>
                  Kualitas: {getStatusText(data?.status)}
                </Text>
              </View>

              <View style={styles.valuesRow}>
                <Text style={[styles.label, { fontSize: 12 }]}>
                  Note: pH dibawah normal dapat menunjukkan oksidasi
                </Text>
              </View>
            </View>

            {/* Grafik LDR */}
            <View style={styles.chartSection}>
              <Text style={styles.chartText}>Grafik Intensitas Cahaya LDR</Text>
              <LineChart
                data={chartHistory.map((item, index) => ({
                  value: item.ldr,
                  dataPointText: (index + 1).toString(),
                }))}
                color="#EF4444"
                thickness={3}
                dataPointsColor="black"
                width={280}
                backgroundColor="#FEF2F2"
                hideRules
                isAnimated
                xAxisLabelTextStyle={{ fontSize: 10, color: "#374151" }}
                yAxisTextStyle={{ fontSize: 10, color: "#374151" }}
                dataPointsColor1="red"
                focusEnabled={true}
                focusProximity={30} // default biasanya cukup 30
                delayBeforeUnFocus={1000} // titik fokus akan hilang setelah 1 detik
                unFocusOnPressOut={false} // biar tetap fokus sampai delay habis
                focusedDataPointColor="black"
                focusedDataPointRadius={3}
                focusedDataPointShape="circle"
                onFocus={handleFocus}
              />
              <Text style={styles.label}>LDR: {data ? data?.ldr : 0}</Text>

              <View style={styles.valuesRow}>
                <Text style={styles.label}>
                  Kualitas: {getStatusText(data?.status)}
                </Text>
              </View>

              <View style={styles.valuesRow}>
                <Text style={[styles.label, { fontSize: 12 }]}>
                  Note: Nilai LDR tinggi menandakan minyak telah keruh akibat
                  penggunaan berulang
                </Text>
              </View>
            </View>
          </>
        )}

        {chartHistory.length === 0 && (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>
              Tidak ada data riwayat untuk grafik
            </Text>
          </View>
        )}

        {!data && (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>Data tidak tersedia</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.text}>Riwayat Pembacaan</Text>
          {history
            .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
            .map((item, idx, arr) => (
              <View key={item.id} style={styles.historyItem}>
                <View style={styles.historyContent}>
                  <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
                    {arr.length - idx}.
                  </Text>
                  <Text>
                    R: {item.r}, G: {item.g}, B: {item.b}
                  </Text>
                  <Text>
                    LDR: {item.ldr}, pH: {item.ph}
                  </Text>
                  <Text>Status: {item.status}</Text>
                  <Text>Time: {formattedTime(item.timestamp)}</Text>
                </View>
                <View style={{ marginTop: 20 }}>
                  <TouchableOpacity
                    onPress={() => handleDeleteRiwayat(item.id)}
                  >
                    <Ionicons name="trash" size={24} color="red" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
        </View>

        <View style={styles.logoutContainer}>
          <Button title="logout" onPress={handleLogout} />
        </View>
      </ScrollView>

      {focusedValue !== null && <FocusToast value={focusedValue} />}
    </View>
  );
}
