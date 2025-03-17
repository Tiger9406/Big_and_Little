import Constants from 'expo-constants';
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { fetchImage } from "@middleware/fetchImage";

import Loading from "@components/Loading";
import OrganizationCard from "@components/OrganizationCard";
import StyledButton from "@components/StyledButton";
import { View, StyleSheet, FlatList } from "react-native";
import useAuth from '@context/useAuth';
import { useSession } from '@context/ctx'; 

export default function Explore() {
  const router = useRouter();   
  const [loading, setLoading] = useState(true);
  const [orgs, setOrgs] = useState([]);
  const { userId, profiles } = useAuth();
  const { session } = useSession();


  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      setLoading(true);

      const URI = Constants.expoConfig.hostUri.split(':').shift();
      
      fetch(`http://${URI}:${process.env.EXPO_PUBLIC_PORT}/organizations`)
        .then(res => res.json())
        .then(async json => {
          const updatedOrganizations = await Promise.all(
            json.map(async (org) => {
              // Currently, use MOCK_IMAGE_ID instead of ID found in org.logo
              const logoURL = await fetchImage('organization-images', org.logo);
              const joined = profiles.some(profile => profile.organizationId === org.id);

              return isMounted ? { ...org, logo: logoURL, joined } : null;
            })
          );

          if (isMounted) {
            setOrgs(updatedOrganizations);
            setLoading(false);
          }
        })
        .catch(err => {
          setLoading(false);
        });

      return () => { isMounted = false; }; 
      }, [userId, session])
  );

  const handlePress = (orgId) => {
    const isInOrg = profiles.some(profile => profile.organizationId === orgId);
    console.log(isInOrg);
    if (isInOrg){
      router.push(`/organizations/${orgId}`);
    } 
    else{
      router.push({
        pathname: "/join-org",
        params: { org: orgId }
      });
    }
  }

  return (
    <View style={styles.container}>
      {loading ?
        <Loading /> :
        <View style={styles.body}>
          <FlatList
            style={styles.orgContainer}
            contentContainerStyle={{ padding: 20, gap: 20 }}
            data={orgs}
            renderItem={({ item }) => <OrganizationCard
                org={item}
                onPress={() => handlePress(item.id)}
              />}
            keyExtractor={item => item.id}
          />
          <View style={styles.buttonContainer}>
            <View style={styles.halfWidthButton}>
              <StyledButton
                text="Create New Organization" 
                onClick={() => { 
                  router.push("/create-org");           
                }} />
            </View>
            <View style={styles.halfWidthButton}>
              <StyledButton
                text="Join Organization with Code" 
                onClick={() => { 
                  router.push("/join-code");
                }} 
              />
            </View>
          </View>
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
  orgContainer: {
    flex: 1
  },
  button: {
    padding: 20
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'space-between', 
  },
  halfWidthButton: {
    width: '50%', 
  }
});