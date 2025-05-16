// CustomStyles.ts
import { StyleSheet } from 'react-native';

const CustomStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  section: {
    marginBottom: 5,
  },
  chartSection: {
    // flex: 1,
    marginVertical: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
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
  noDataContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f1f1f1",
  },
  logoutContainer: {
    marginBottom: 30,
  },
  noDataText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
  chartText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#111827',
  },
  label: {
    marginTop: 6,
    fontSize: 14,
    color: '#374151',
  },
  valuesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 8,
  },
  warningSection: {
    backgroundColor: '#FEF3C7',
    borderLeftWidth: 5,
    borderLeftColor: '#F59E0B',
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
  },
  warningText: {
    color: '#92400E',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default CustomStyles;
