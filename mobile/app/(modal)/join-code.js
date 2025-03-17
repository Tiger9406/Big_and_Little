import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from "expo-constants";
import StyledButton from '@components/StyledButton';
import Loading from '@components/Loading';
import useAuth from '@context/useAuth';
import { useSession } from '@context/ctx';

export default function JoinCodePage() {
  const [loading, setLoading] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const router = useRouter();
  const { session } = useSession();
  const { userId, profiles } = useAuth();

  const handleFetchOrganization = async () => {
    if (joinCode.length !== 6) {
      Alert.alert('Error', 'Please enter a 6-digit join code.');
      return;
    }

    try {
      setLoading(true);
      const URI = Constants.expoConfig.hostUri.split(':').shift();

      const response = await fetch(`http://${URI}:${process.env.EXPO_PUBLIC_PORT}/organizations/${joinCode}/get-org`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session}`,
        }
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to fetch organization');
      }

      const organization = await response.json();
      console.log(organization);

      handlePress(organization.id);

    } catch (error) {
      console.error('Error fetching organization:', error);
      Alert.alert('Error', error.message || 'Failed to fetch organization');
    } finally {
      setLoading(false);
    }
  };

  const handlePress = (orgId) => {
    const isInOrg = profiles.some(profile => profile.organizationId === orgId);
    console.log(isInOrg);
    if (isInOrg){
      router.push(`/organizations/${orgId}`);
    } else {
      router.push({
        pathname: "/join-org",
        params: { org: orgId }
      });
    }
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Enter Join Code</Text>
      <TextInput
        style={styles.input}
        value={joinCode}
        onChangeText={setJoinCode}
        maxLength={6}
        keyboardType="number-pad"
        placeholder="6-digit code"
      />
      <StyledButton
        text="Submit"
        onClick={handleFetchOrganization}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: '#cccccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
});