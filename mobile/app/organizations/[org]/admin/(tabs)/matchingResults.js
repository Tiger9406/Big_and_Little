import React, { useState } from "react";
import { 
    View, Text, SafeAreaView, TouchableOpacity, TextInput, FlatList, StyleSheet 
} from "react-native";
import BottomNavbar from "./components/BottomNavbar"; // Make sure this exists or your app will break

const MatchingResults = () => {
    const [search, setSearch] = useState("");
    const [expanded, setExpanded] = useState({});
    const [matchingDone, setMatchingDone] = useState(true); // Flag to check if matching is done

    const toggleExpand = (id) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Placeholder data 
    const data = matchingDone ? [
        { id: "1", big: "Member A", littles: ["Member B", "Member C"] },
        { id: "2", big: "Member AB", littles: ["Member B"] },
        { id: "3", big: "Member AC", littles: ["Member D"] }
    ] : [];

    return (
        <SafeAreaView style={styles.container}>
            {/* Top Navbar */}
            <View style={styles.topNavbar}>
                <TouchableOpacity style={styles.backButton}>
                    <Text style={styles.backCaret}>❮</Text>
                </TouchableOpacity>
                <Text style={styles.topNavbarText}>Matching Results</Text>
            </View>

            {/* Show "Matching in Progress" if matching isn't done yet */}
            {!matchingDone ? (
                <View style={styles.centerMessage}>
                    <Text style={styles.matchingText}>Matching in Progress</Text>
                </View>
            ) : (
                <>
                    {/* Search Bar */}
                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search for specific members or matches"
                            value={search}
                            onChangeText={setSearch}
                        />
                        <TouchableOpacity style={styles.searchButton}>
                            <Text style={styles.searchIcon}>🔍</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.searchHint}>Use keywords to filter results</Text>

                    {/* Matching Results List */}
                    <FlatList
                        data={data}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <View style={styles.matchCard}>
                                <TouchableOpacity onPress={() => toggleExpand(item.id)}>
                                    <View style={styles.matchHeader}>
                                        <Text style={styles.memberName}>{item.big}</Text>
                                        <Text style={styles.role}>Big</Text>
                                        <Text style={styles.expandIcon}>{expanded[item.id] ? "▲" : "▼"}</Text>
                                    </View>
                                </TouchableOpacity>
                                {expanded[item.id] && (
                                    <View>
                                        {item.littles.map((little, index) => (
                                            <View key={index} style={styles.littleContainer}>
                                                <Text style={styles.memberName}>{little}</Text>
                                                <Text style={styles.role}>Little</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>
                        )}
                    />
                </>
            )}
            {/* Bottom Navbar */}
            <BottomNavbar />
        </SafeAreaView>
    );
};

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
        paddingTop: 50,
    },
    topNavbar: {
        flexDirection: "row",
        alignItems: "center",
        height: 60,
        borderBottomWidth: 1,
        borderColor: "#ddd",
        paddingHorizontal: 15,
    },
    topNavbarText: {
        flex: 1,
        textAlign: "center",
        fontSize: 20,
        fontWeight: "bold",
    },
    backButton: {
        padding: 10,
    },
    backCaret: {
        fontSize: 24,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        margin: 15,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        paddingHorizontal: 10,
    },
    searchInput: {
        flex: 1,
        height: 40,
    },
    searchButton: {
        padding: 10,
    },
    searchIcon: {
        fontSize: 20,
    },
    searchHint: {
        marginLeft: 15,
        color: "gray",
        fontSize: 12,
    },
    centerMessage: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    matchingText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "gray",
    },
    matchCard: {
        margin: 15,
        padding: 10,
        borderBottomWidth: 1,
        borderColor: "#ddd",
    },
    matchHeader: {
        flexDirection: "row",
        alignItems: "center",
    },
    memberName: {
        fontSize: 16,
        fontWeight: "bold",
        flex: 1,
    },
    role: {
        fontSize: 14,
        color: "gray",
    },
    expandIcon: {
        fontSize: 18,
        paddingLeft: 10,
    },
    littleContainer: {
        marginLeft: 20,
        paddingVertical: 5,
    },
});

export default MatchingResults;
