import { AuthContext } from "@/context/auth-context";
import { database } from "@/lib/firebase";
import { Riwayat, RiwayatData } from "@/lib/types";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { onValue, push, ref, remove, set } from "firebase/database";
import registerNNPushToken from "native-notify";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";

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
  const [phSeries, setPhSeries] = useState<number[]>([]);
  const [ldrSeries, setLdrSeries] = useState<number[]>([]);
  const { logout } = useContext(AuthContext);
  const notifiedRef = useRef(false);

  registerNNPushToken(29958, "DWbdXJaDAApTWVofAJH8Ie");

  // Update header title when alatStatus changes
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

      if (alatStatus === "on") {
        setPhSeries((prev) => [...prev, newData.ph].slice(-12));
        setLdrSeries((prev) => [...prev, newData.ldr].slice(-12));

        timeout = setTimeout(() => {
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
    });
    return () => unsubscribe();
  }, []);

  const handleUjiMinyak = () => {
    const newStatus = alatStatus === "off" ? "on" : "off";
    set(ref(database, "alat"), newStatus);
  };

  const handleLogout = async () => {
    try {
      logout(); // Redirect ke tabs setelah login
    } catch (error: any) {
      Alert.alert("Login Failed", error.message);
    }
  };

  const chartDataRGB = {
    labels: ["R", "G", "B"],
    datasets: [
      {
        data: [data.r, data.g, data.b],
        color: (opacity = 1) => `rgba(255, 99, 71, ${opacity})`, // Red line
      },
    ],
  };

  const chartDataPh = {
    labels: ["PH"], // Label as "1", "2", "3", ...
    datasets: [
      {
        data: [data.ph],
        color: (opacity = 1) => `rgba(50, 205, 50, ${opacity})`, // Green line
      },
    ],
  };

  const chartDataLdr = {
    labels: ["LDR"], // Label as "1", "2", "3", ...
    datasets: [
      {
        data: [data.ldr],
        color: (opacity = 1) => `rgba(135, 206, 250, ${opacity})`, // Light blue line
      },
    ],
  };

  const handleDeleteRiwayat = (id: string) => {
    const riwayatEntryRef = ref(database, `riwayat/${id}`);
    remove(riwayatEntryRef);
  };

  return (
    <ScrollView style={styles.container}>
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <View style={styles.section}>
          <Button title="Uji Minyak" color="green" onPress={handleUjiMinyak} />
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
            title={`Status Minyak: ${data.status || "Unknown"}`}
            color="red"
            disabled
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.text}>Grafik RGB</Text>
        <LineChart
          data={chartDataRGB}
          width={Dimensions.get("window").width - 40}
          height={220}
          chartConfig={{
            backgroundColor: "#e26a00",
            backgroundGradientFrom: "#fb8c00",
            backgroundGradientTo: "#ffa726",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: "#ffa726",
            },
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.text}>Grafik PH</Text>
        <LineChart
          data={chartDataPh}
          width={Dimensions.get("window").width - 40}
          height={220}
          chartConfig={{
            backgroundColor: "#e26a00",
            backgroundGradientFrom: "#fb8c00",
            backgroundGradientTo: "#ffa726",
            decimalPlaces: 1,

            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: "#ffa726",
            },
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.text}>Grafik LDR</Text>
        <LineChart
          data={chartDataLdr}
          width={Dimensions.get("window").width - 40}
          height={220}
          chartConfig={{
            backgroundColor: "#e26a00",
            backgroundGradientFrom: "#fb8c00",
            backgroundGradientTo: "#ffa726",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: "#ffa726",
            },
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.text}>Riwayat Pembacaan</Text>
        {history.map((item) => (
          <View key={item.id} style={styles.historyItem}>
            <View style={styles.historyContent}>
              <Text>
                R: {item.r}, G: {item.g}, B: {item.b}
              </Text>
              <Text>
                LDR: {item.ldr}, pH: {item.ph}
              </Text>
              <Text>Status: {item.status}</Text>
              <Text>Time: {new Date(item.timestamp).toLocaleString()}</Text>
            </View>
            <View style={{ marginTop: 20 }}>
              <TouchableOpacity onPress={() => handleDeleteRiwayat(item.id)}>
                <Ionicons name="trash" size={24} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Button title="logout" onPress={handleLogout} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  section: {
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    marginVertical: 10,
  },
  historyItem: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
    elevation: 2,
    flex: 1,
    flexDirection: "row",
  },
  historyContent: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
