import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";

const BottomNavbar = () => {
  return (
    <View style={styles.navbar}>
      <TouchableOpacity style={styles.navButton} onPress={() => Alert.alert("Home button pressed")}>
        <Text style={styles.navIcon}>🏠</Text>
        <Text style={styles.navButtonText}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navButton} onPress={() => Alert.alert("Admin Dashboard button pressed")}>
        <Text style={styles.navIcon}>📊</Text>
        <Text style={styles.navButtonText}>Admin Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#f8f8f8",
    paddingVertical: 20,
    borderTopWidth: 1,
    borderColor: "#ccc",
  },
  navButton: {
    alignItems: "center",
  },
  navIcon: {
    fontSize: 25,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default BottomNavbar;
