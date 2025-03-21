import Constants from "expo-constants";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { fetchImage } from "@middleware/fetchImage";
import useAuth from "@context/useAuth";

import Loading from "@components/Loading";
import OrganizationCard from "@components/OrganizationCard";
import StyledButton from "@components/StyledButton";
import { View, StyleSheet, Text, FlatList } from "react-native";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [orgs, setOrgs] = useState([]);
  const { _, profiles } = useAuth();
  const [haveOrganizations, setHaveOrganizations] = useState(false);
  const router = useRouter();

  const explore = () => {
    router.push('/explore');
  } 

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
        setHaveOrganizations(updatedOrganizations.length > 0);
        setLoading(false);
      }

      fetchData();
    }, [profiles])
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <Loading /> 
      ) : (
        <View style={styles.body}>
          {!haveOrganizations ? (
            <>
              <Text style={styles.title}>You have not joined any organizations! Check out Explore to find some!</Text>
              <View style={styles.button}>
                <StyledButton text="Explore Page" onClick={explore} />
              </View>
            </>
          ) : (
            <>
          <Text style={styles.title}>Joined Organizations</Text>
          <FlatList
            style={styles.orgContainer}
            contentContainerStyle={{ padding: 20, gap: 20 }}
            data={orgs}
            renderItem={({ item }) => (
              <OrganizationCard
                org={item} 
                onPress={() => router.push(`/organizations/${item._id}/matches`)}
              />
            )}
          />
          </>
          )}
        </View>
      )} 
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
  },
  button: {
    width: '85%',
    alignSelf: 'center'
  }
});