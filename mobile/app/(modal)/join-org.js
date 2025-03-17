import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Constants from "expo-constants";

import Loading from '@components/Loading';
import ProfileForm from '@components/ProfileForm';
import StyledButton from '@components/StyledButton';
import useAuth from '@context/useAuth';
import { useSession } from '@context/ctx';


export default function JoinOrg() {
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const { userId } = useAuth();
  const { session } = useSession();
  const { org } = useLocalSearchParams();
  const router = useRouter();
  const {signIn} = useSession();

  const handleCreateProfile = async (profileData) => {
    if (!selectedRole) {
      Alert.alert('Error', 'Please select a role first');
      return;
    }

    try {
      setLoading(true);
      const URI = Constants.expoConfig.hostUri.split(':').shift();
      
      const fullProfileData = {
        ...profileData,
        userId: userId,
        organizationId: org,
        role: selectedRole
      };


      const response = await fetch(
        `http://${URI}:${process.env.EXPO_PUBLIC_PORT}/profiles`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session}`
          },
          body: JSON.stringify(fullProfileData)
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to create profile');
      }

      const result = await response.json();
      
      if (result.accessToken) {
        await signIn({ newToken: result.accessToken });
      } else {
        throw new Error('No access token returned');
      }

      Alert.alert(
        'Success', 
        'Profile created successfully',
        [
          {
            text: 'OK',
            onPress: () => router.replace(`/organizations/${org}`)
          }
        ]
      );
    } catch (error) {
      console.error('Profile creation error:', error);
      Alert.alert('Error', error.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!selectedRole) {
    return (
      <View style={styles.roleSelection}>
        <Text style={styles.heading}>Select Your Role</Text>
        <View style={styles.buttonContainer}>
          <StyledButton
            text="I'm a Big"
            onClick={() => setSelectedRole('Big')}
          />
          <StyledButton
            text="I'm a Little"
            onClick={() => setSelectedRole('Little')}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ProfileForm
        onSubmit={handleCreateProfile}
        role={selectedRole}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  roleSelection: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
    justifyContent: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonContainer: {
    gap: 20,
  }
});