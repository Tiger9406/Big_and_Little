import React, { useState, useRef, useEffect } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, Alert, 
  SafeAreaView, ScrollView, StyleSheet, Modal,
  ActivityIndicator
} from "react-native";
import BottomNavbar from "./components/bottomNavbar";

const URI = process.env.EXPO_PUBLIC_URI || "localhost";

const OrganizationSettings = ({ route, orgId: propOrgId }) => {
  const { orgId } = (route && route.params) || { orgId: propOrgId || "67ab5ee265519e108202a425" };
  // Organization state
  const [orgData, setOrgData] = useState({
    name: "",
    description: "",
    swipesPerRound: [0, 0, 0],
    roundDates: []
  });
  const [loading, setLoading] = useState(true);

  // Modal visibility states
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [roundModalVisible, setRoundModalVisible] = useState(false);
  
  // Round data for editing
  const [roundData, setRoundData] = useState([
    { id: 1, startDate: {}, endDate: {}, swipes: "" },
    { id: 2, startDate: {}, endDate: {}, swipes: "" },
    { id: 3, startDate: {}, endDate: {}, swipes: "" }
  ]);

  useEffect(() => {
    fetchOrganizationData();
  }, []);

  // Fetch organization data
  const fetchOrganizationData = async () => {
    try {
      // Mock data
      const mockResponse = {
        _id: orgId,
        name: "LeBron James",
        description: "goat",
        logo: "goat.png",
        isPublic: true,
        joinCode: 1,
        owner: "67b541da0a12c97057698e42",
        currentRound: 0,
        isMatching: true,
        members: [],
        roundWeighting: [1, 3, 5],
        rounds: 3,
        swipesPerRound: [20, 10, 5],
        // Adding mock roundDates **Need to add to Events schema
        roundDates: [
          { startDate: "04/01/2025", endDate: "04/15/2025" },
          { startDate: "04/16/2025", endDate: "04/30/2025" },
          { startDate: "05/01/2025", endDate: "05/15/2025" }
        ]
      };
      
      // const response = await fetch(`http://${URI}:${process.env.EXPO_PUBLIC_PORT}/organizations/${org}/admin/orgSettings`);
      // const data = await response.json();
      
      setOrgData(mockResponse);
      
      // Format round data for editing
      if (mockResponse.roundDates && mockResponse.roundDates.length > 0) {
        const formattedRounds = mockResponse.roundDates.map((round, index) => {
          const startParts = round.startDate ? round.startDate.split('/') : ["", "", ""];
          const endParts = round.endDate ? round.endDate.split('/') : ["", "", ""];
          
          return {
            id: index + 1,
            startDate: {
              month: startParts[0] || "",
              day: startParts[1] || "",
              year: startParts[2] || ""
            },
            endDate: {
              month: endParts[0] || "",
              day: endParts[1] || "",
              year: endParts[2] || ""
            },
            swipes: mockResponse.swipesPerRound[index]?.toString() || ""
          };
        });
        
        setRoundData(formattedRounds);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching organization data:", error);
      Alert.alert("Error", "Failed to load organization data.");
      setLoading(false);
    }
  };

  // Updates org data in the database
  const saveOrgSettings = async () => {
    try {
      const updatedData = {
        name: orgData.name,
        description: orgData.description
      };
    
      // const response = await fetch(`http://${URI}:${process.env.EXPO_PUBLIC_PORT}/organizations/${org}/admin/orgSettings`, {
      //   method: "PUT",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(updatedData),
      // });
      
      // For demo:
      console.log("Updating organization with:", updatedData);
      
      Alert.alert("Success", "Organization settings updated successfully.");
      setSettingsModalVisible(false);
    } catch (error) {
      console.error("Error saving organization settings:", error);
      Alert.alert("Error", "Failed to update organization settings.");
    }
  };
  
  const saveRoundSettings = async () => {
    try {
      // Validates dates for rounds that have data
      for (let round of roundData) {
        // Validates rounds that have some data entered
        if (round.startDate.month || round.endDate.month || round.swipes) {
          if (!round.startDate.month || !round.startDate.day || !round.startDate.year ||
              !round.endDate.month || !round.endDate.day || !round.endDate.year ||
              !round.swipes) {
            Alert.alert("Incomplete Data", `Please fill in all fields for Round ${round.id}`);
            return;
          }
          
          // Date formating
          const startMonth = parseInt(round.startDate.month, 10);
          const startDay = parseInt(round.startDate.day, 10);
          const startYear = parseInt(round.startDate.year, 10);
          
          const endMonth = parseInt(round.endDate.month, 10);
          const endDay = parseInt(round.endDate.day, 10);
          const endYear = parseInt(round.endDate.year, 10);
          
          if (
            startMonth < 1 || startMonth > 12 || 
            startDay < 1 || startDay > 31 ||
            startYear < 2023 ||
            endMonth < 1 || endMonth > 12 ||
            endDay < 1 || endDay > 31 ||
            endYear < 2023
          ) {
            Alert.alert("Invalid Date", `Please enter valid dates for Round ${round.id}`);
            return;
          }
        }
      }
      
      // API formatting
      const roundDates = roundData.map(round => ({
        startDate: `${round.startDate.month}/${round.startDate.day}/${round.startDate.year}`,
        endDate: `${round.endDate.month}/${round.endDate.day}/${round.endDate.year}`
      }));
      
      const swipesPerRound = roundData.map(round => parseInt(round.swipes, 10) || 0);
      
      const updatedData = {
        roundDates,
        swipesPerRound
      };
      
      // const response = await fetch(`http://${URI}:${process.env.EXPO_PUBLIC_PORT}/organizations/${org}/admin/orgSettings`, {
      //   method: "PUT",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(updatedData),
      // });
      
      // For testing
      console.log("Updating round settings:", updatedData);
      
      // Updates local state with the new data
      setOrgData(prev => ({
        ...prev,
        roundDates,
        swipesPerRound
      }));
      
      // Summary string for the alert on save
      const summary = roundData.map(round => 
        `Round ${round.id}:\n` +
        `  Start Date: ${round.startDate.month}/${round.startDate.day}/${round.startDate.year}\n` +
        `  End Date: ${round.endDate.month}/${round.endDate.day}/${round.endDate.year}\n` +
        `  Swipes: ${round.swipes}`
      ).join('\n\n');
      
      Alert.alert("Round Settings Saved", summary);
      setRoundModalVisible(false);
    } catch (error) {
      console.error("Error saving round settings:", error);
      Alert.alert("Error", "Failed to update round settings.");
    }
  };
  
  // Input change for round settings
  const handleRoundInputChange = (roundId, field, subField, value) => {
    setRoundData(prev => 
      prev.map(round => 
        round.id === roundId 
          ? { 
              ...round, 
              [field]: subField 
                ? { ...round[field], [subField]: value } 
                : value 
            }
          : round
      )
    );
  };

  // Loading data
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading organization data...</Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Top Navbar */}
      <View style={styles.topNavbar}>
        <TouchableOpacity style={styles.backButton} onPress={() => Alert.alert("Back button pressed")}>
          <Text style={styles.backCaret}>❮</Text>
        </TouchableOpacity>
        <Text style={styles.topNavbarText}>Organization Settings</Text>
      </View>

      {/* Edit Logo Section */}
      <View style={styles.logoContainer}>
        <View style={styles.logoPlaceholder} />
        <TouchableOpacity onPress={() => Alert.alert("Edit Logo button pressed")}>
          <Text style={styles.editLogo}>Edit Logo</Text>
        </TouchableOpacity>
      </View>

      {/* Organization Info Display */}
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Organization Name:</Text>
          <Text style={styles.infoText}>{orgData.name || "Not set"}</Text>
          
          <Text style={styles.infoLabel}>Description:</Text>
          <Text style={styles.infoText}>{orgData.description || "Not set"}</Text>
          
          {/* Display round information */}
          {Array.from({ length: orgData.rounds || 3 }).map((_, index) => (
            <View key={index}>
              <Text style={styles.infoLabel}>{`Round ${index + 1} Start - End Date:`}</Text>
              <Text style={styles.infoText}>
                {orgData.roundDates && orgData.roundDates[index]
                  ? `${orgData.roundDates[index].startDate} - ${orgData.roundDates[index].endDate}`
                  : "Not set"
                }
              </Text>
            </View>
          ))}
        </View>

        {/* Edit Org Settings Button */}
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => setSettingsModalVisible(true)}
        >
          <Text style={styles.editButtonText}>Edit Organization Settings</Text>
        </TouchableOpacity>
        {/* Edit Round Button */}
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => setRoundModalVisible(true)}
        >
          <Text style={styles.editButtonText}>Edit Round Settings</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Org Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={settingsModalVisible}
        onRequestClose={() => setSettingsModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.scrollViewContent}
            >
              <Text style={styles.modalTitle}>Edit Organization Settings</Text>

              {/* Organization Name */}
              <Text style={styles.label}>Organization Name</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Enter organization name" 
                value={orgData.name}
                onChangeText={(text) => setOrgData(prev => ({...prev, name: text}))}
              />

              {/* Organization Description */}
              <Text style={styles.label}>Organization Description</Text>
              <TextInput 
                style={[styles.input, styles.multilineInput]} 
                placeholder="Enter organization description" 
                value={orgData.description}
                onChangeText={(text) => setOrgData(prev => ({...prev, description: text}))}
                multiline={true}
                numberOfLines={4}
              />
              
              {/* Modal Action Buttons */}
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]} 
                  onPress={() => setSettingsModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.saveButton]} 
                  onPress={saveOrgSettings}
                >
                  <Text style={styles.modalButtonText}>Save Settings</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Round Settings Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={roundModalVisible}
        onRequestClose={() => setRoundModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.scrollViewContent}
            >
              <Text style={styles.modalTitle}>Edit Rounds Settings</Text>
              
              {/* Rounds Information */}
              {roundData.map(round => (
                <View key={round.id}>
                  <Text style={styles.label}>{`Round ${round.id}`}</Text>
                  <Text style={styles.label}>Start Date</Text>
                  <View style={styles.dateInputContainer}>
                    <TextInput 
                      style={styles.dateInput} 
                      placeholder="MM"
                      keyboardType="numeric"
                      maxLength={2}
                      value={round.startDate.month}
                      onChangeText={(text) => handleRoundInputChange(round.id, 'startDate', 'month', text)}
                    />
                    <TextInput 
                      style={styles.dateInput} 
                      placeholder="DD"
                      keyboardType="numeric"
                      maxLength={2}
                      value={round.startDate.day}
                      onChangeText={(text) => handleRoundInputChange(round.id, 'startDate', 'day', text)}
                    />
                    <TextInput 
                      style={styles.yearInput} 
                      placeholder="YYYY"
                      keyboardType="numeric"
                      maxLength={4}
                      value={round.startDate.year}
                      onChangeText={(text) => handleRoundInputChange(round.id, 'startDate', 'year', text)}
                    />
                  </View>
                  <Text style={styles.label}>End Date</Text>
                  <View style={styles.dateInputContainer}>
                    <TextInput 
                      style={styles.dateInput} 
                      placeholder="MM"
                      keyboardType="numeric"
                      maxLength={2}
                      value={round.endDate.month}
                      onChangeText={(text) => handleRoundInputChange(round.id, 'endDate', 'month', text)}
                    />
                    <TextInput 
                      style={styles.dateInput} 
                      placeholder="DD"
                      keyboardType="numeric"
                      maxLength={2}
                      value={round.endDate.day}
                      onChangeText={(text) => handleRoundInputChange(round.id, 'endDate', 'day', text)}
                    />
                    <TextInput 
                      style={styles.yearInput} 
                      placeholder="YYYY"
                      keyboardType="numeric"
                      maxLength={4}
                      value={round.endDate.year}
                      onChangeText={(text) => handleRoundInputChange(round.id, 'endDate', 'year', text)}
                    />
                  </View>
                  <Text style={styles.label}>Number of Swipes</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholder={`Number of Swipes - Round ${round.id}`}
                    keyboardType="numeric"
                    value={round.swipes.toString()}
                    onChangeText={(text) => handleRoundInputChange(round.id, 'swipes', null, text)}
                  />
                </View>
              ))}

              {/* Modal Action Buttons */}
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]} 
                  onPress={() => setRoundModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.saveButton]} 
                  onPress={saveRoundSettings}
                >
                  <Text style={styles.modalButtonText}>Save Settings</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation Bar */}
      <BottomNavbar />
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  // Main container style
  container: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    paddingBottom: 80, 
  },

  // Top navigation bar styles
  topNavbar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    height: 120,
    borderBottomWidth: 2,
    borderColor: "#ddd",
    paddingHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    zIndex: 10,
  },
  topNavbarText: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    paddingTop: 50,
  },
  backButton: {
    position: "absolute",
    left: 15,
    top: 52,
    padding: 15,
  },
  backCaret: {
    fontSize: 40,
    fontWeight: "bold",
  },

  // Logo section styles
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 100, 
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: "lightgray",
    borderRadius: 75,
    marginBottom: 10,
  },
  editLogo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
  },

  // Organization info display styles
  infoContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  infoText: {
    fontSize: 18,
    marginBottom: 10,
    paddingLeft: 10,
  },

  // Edit button styles
  editButton: {
    backgroundColor: 'black',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Modal styles
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxHeight: '80%',
  },
  scrollView: {
    width: '100%',
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: 'center',
  },

  // Form input styles
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
    width: "100%",
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dateInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dateInput: {
    width: '30%',
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  yearInput: {
    width: '35%',
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },

  // Modal button styles
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    width: '100%',
  },

  modalButton: {
    borderRadius: 20,
    padding: 12,
    width: '48%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: "#d3d3d3",
  },
  saveButton: {
    backgroundColor: "black",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default orgSettings;