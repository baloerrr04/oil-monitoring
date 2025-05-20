import FocusToast from "@/app/(pages)/components/focus-toast";
import HistorySection from "@/app/(pages)/components/history-section";
import useOilMonitoring from "@/hooks/use-oil-monitoring";
import useWarningToast from "@/hooks/use-warning-toast";
import { getStatusText } from "@/lib/utils/get-status-helper";
import React, { useEffect } from "react";
import { Button, ScrollView, Text, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import WarningToast from "./components/warning-toast";
import styles from "./css/style";

const App: React.FC = () => {
  const {
    alatStatus,
    data,
    history,
    chartHistory,
    focusedValue,
    handleUjiMinyak,
    handleDeleteRiwayat,
    handleFocus,
    handleLogout,
  } = useOilMonitoring();

  const reversedChartHistory = chartHistory.slice().reverse();

  const { handleStatusChange, showWarning } = useWarningToast();

  useEffect(() => {
    console.log("Current status:", data?.status, "Show warning:", showWarning); // Debugging
    handleStatusChange(data?.status || "");
  }, [data?.status, handleStatusChange]);

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

        {/* Grafik RGB */}
        <View style={styles.chartSection}>
          <Text style={styles.chartText}>Grafik Perubahan Warna RGB</Text>
          <LineChart
            data={reversedChartHistory.map((item, index) => ({
              value: item?.r || 0,
              dataPointText: (index + 1).toString(),
            }))}
            color1="red"
            data2={reversedChartHistory.map((item, index) => ({
              value: item?.g || 0,
              dataPointText: (index + 1).toString(),
            }))}
            color2="green"
            data3={reversedChartHistory.map((item, index) => ({
              value: item?.b || 0,
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
              Kualitas: {getStatusText(data?.status || "Belum ada data")}
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
            data={reversedChartHistory.map((item, index) => ({
              value: item?.ph || 0,
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
              Kualitas: {getStatusText(data?.status || "Belum ada data")}
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
            data={reversedChartHistory.map((item, index) => ({
              value: item?.ldr || 0,
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
              Kualitas: {getStatusText(data?.status || "Belum ada data")}
            </Text>
          </View>

          <View style={styles.valuesRow}>
            <Text style={[styles.label, { fontSize: 12 }]}>
              Note: Nilai LDR tinggi menandakan minyak telah keruh akibat
              penggunaan berulang
            </Text>
          </View>
        </View>

        

        {!data && (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>Data tidak tersedia</Text>
          </View>
        )}

        <HistorySection
          history={history}
          handleDeleteRiwayat={handleDeleteRiwayat}
        />

        {chartHistory.length === 0 && (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>
              Tidak ada data riwayat untuk grafik
            </Text>
          </View>
        )}

        <View style={styles.logoutContainer}>
          <Button title="Logout" onPress={handleLogout} />
        </View>
      </ScrollView>

      {focusedValue !== null && <FocusToast value={focusedValue} />}

      <WarningToast
        message="Minyak anda sudah beberapa kali pakai, segera ganti."
        visible={showWarning}
      />
    </View>
  );
};

export default App;
