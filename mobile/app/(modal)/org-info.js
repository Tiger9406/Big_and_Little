import React, { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, Image, Alert, TextInput } from 'react-native';
import { fetchImage } from '@middleware/fetchImage';
import Constants from 'expo-constants';
import StyledButton from '@components/StyledButton';  
import { useSession } from '@context/ctx';

export default function OrgInfo() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [orgId, setOrgId] = useState(null);
  const [organization, setOrg] = useState(null);
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { session } = useSession();

  useEffect(() => {
    if (params?.org) {
      setOrgId(params?.org);
    } else {
        setLoading(false);
        setError('No organization specified');
    }
  }, [params]);

  useEffect(() => {
    if(!orgId) return;
    const fetchOrgDetails = async () => {
      setLoading(true); 
      setError(null);
      try {
        const URI = Constants.expoConfig.hostUri.split(':').shift();
        const PORT = process.env.EXPO_PUBLIC_PORT;
        const response = await fetch(
            `http://${URI}:${PORT}/organizations/${orgId}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session}`,
              },
            }
        );
        if (!response.ok){
          const errorText =  await response.text();
          throw new Error('Server returned ${response.status}: ${errorText}');
        }
        const orgData = await response.json();

        if (orgData) {
          let logoUrl = null;
          if (orgData.logo) {
            try{
              logoUrl = await fetchImage('organization', orgData.logo);
            } catch (err) {
              throw new Error('Could not load logo image:', err);
            }
          }
          //const logoURL = await fetchImage('organization', orgData.logo);
          setOrg({ ...orgData, logo: logoUrl });
          } else {
            throw new Error('Organization data is empty');
          }
        } catch (err) {
          console.error('Error fetching organization details:', err);
          Alert.alert('Error', 'Failed to load organization details.');
        } finally {
          setLoading(false); 
        }
      };

      fetchOrgDetails();
    
  }, [orgId,session]);

  if (loading) {
    return <Text>Loading...</Text>; 
  }

  if (!organization) {
    return <Text>Organization not found or failed to load.</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{organization.name}</Text>
      <Image style={styles.logo} source={{ uri: organization.logo }} />
      <Text style={styles.description}>{organization.description}</Text>

      {organization.private ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter Join Code"
            value={joinCode}
            onChangeText={setJoinCode}
          />
          <StyledButton 
          text="Join Organization" 
          onClick={() => router.push('/join-org')} 
          />
        </>
      ) : (
        <StyledButton 
        text="Join Organization" 
        onClick={() => router.push('/join-org')}
        />
      )}
      <View style={styles.backButton}>
      <StyledButton
        text="Back to Explore"
        onClick={() => router.push('/explore')}
        
      />
      </View>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  logo: {
    width: 300,
    height: 300,
    borderRadius: 10,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 20,
    width: '80%',
    borderRadius: 5,
  },
  backButton: {
    marginTop: 20,
    backgroundColor: '#ccc',
  },
});
