import Constants from "expo-constants";
import { useFocusEffect, useRouter } from "expo-router";
import { useEffect, useCallback, useState } from "react";
import { fetchImage } from "@middleware/fetchImage";
import useAuth from "@context/useAuth";

import Loading from "@components/Loading";
import OrganizationCard from "@components/OrganizationCard";
import { View, StyleSheet, Text, FlatList } from "react-native";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [orgs, setOrgs] = useState([]);
  const { _, profiles } = useAuth();

  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      // Get IP that Expo server is using to host app, allows to connect with the backend
      const URI = Constants.expoConfig.hostUri.split(':').shift();

      async function fetchData() {
        const updatedOrganizations = await Promise.all(
          profiles.map(async profile => {
            const res = await fetch(`http://${URI}:${process.env.EXPO_PUBLIC_PORT}/organizations/${profile.organizationId}`);
            const org = await res.json();
            return {
              ...org,
              logo: await fetchImage('organization', org.logo)
            };
          })
        );
        setOrgs(updatedOrganizations);
        setLoading(false);
      }

      fetchData();
    }, [])
  );

  return (
    <View style={styles.container}>
      {loading ?
        <Loading /> :
        <View style={styles.body}>
          <Text style={styles.title}>Joined Organizations</Text>
          <FlatList
            style={styles.orgContainer}
            contentContainerStyle={{ padding: 20, gap: 20 }}
            data={orgs}
            renderItem={({ item }) => 
              <OrganizationCard
                org={item} 
                onPress={() => router.push(`/organizations/${item.id}`)}
              />
            }
          />
        </View>
      } 
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    display: 'flex',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20
  },
  orgContainer: {
    flex: 1
  }
});