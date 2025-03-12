import React, { useState, useRef, useEffect } from 'react';
import { Pressable, Image, Text, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, Alert, View, ScrollView, StyleSheet } from 'react-native';

import { Link, router } from 'expo-router';
import { useGlobalSearchParams, useLocalSearchParams } from 'expo-router';
import Constants from "expo-constants";
import * as ImagePicker from 'expo-image-picker';


import Title from '@components/Title';
import StyledTextInput from '@components/StyledTextInput';
import StyledButton from '@components/StyledButton';
import StyledPictureInput from '@components/StyledPictureInput';
import ProfilePicture from '@components/ProfilePicture';
import useAuth from '@context/useAuth';
import { useSession } from '@context/ctx';
import ProfileForm from '@components/ProfileForm';
import ReadOnlyProfile from '@components/ReadOnlyProfile';

/*
    route: /view-profile
    View existing profile (if exists)
*/


export default function ViewProfile() {
  const [profileData, setProfileData] = useState({});
  const { userId } = useAuth();
  const { session } = useSession();
  const [isEditing, setIsEditing] = useState(false);


  
  useEffect(() => {
    getProfile();
    if(!getProfile.name){ //supposed to trigger the profile form if the profile name doesn't exist
      isEditing = true;
    }
  }, []);
  
  const getProfile = async () => {
    try {
      const URI = Constants.expoConfig.hostUri.split(':').shift();
      const url = `http://${URI}:${process.env.EXPO_PUBLIC_PORT}/profiles/${userId}`;
  
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session}`
        },
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch profile data: ${response.status} ${response.statusText}`);
      }
  
      const profileData = await response.json();
      setProfileData(profileData);

    } catch (err) {
      console.error("Error fetching profile:", err);
      Alert.alert('Error', 'Failed to fetch profile data');
    }
  };

  const saveProfile = (newProfileData) => {
      
    const URI = Constants.expoConfig.hostUri.split(':').shift();
    const URL = `http://${URI}:${process.env.EXPO_PUBLIC_PORT}/profiles/${userId}`;

    fetch(URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session}`

      },
      body: JSON.stringify(newProfileData)
    }).then(res => {
      if (!res.ok) { 
        res.text().then(text => {
          Alert.alert('', text, [{
            text: 'OK',
            style: 'cancel'
          }]);
          console.log('Login failed');            
        });
      } else {
       
        console.log('Profile updated');
        setIsEditing(false);
        getProfile();
        
      }
    }).catch(err => console.log("ERROR", err));

  };


  return (
    <View style={styles.container}>
      {isEditing ? (
        // Render the edit form (ProfileForm)
        <ProfileForm 
          key={JSON.stringify(profileData)} 
          initialData={profileData}
          onSubmit={saveProfile}
          role={profileData.role}
        />
      ) : (
        <ReadOnlyProfile 
          key={JSON.stringify(profileData)} 
          profileData={profileData}
          onEdit={() => setIsEditing(true)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#ffffff',
      fontFamily: 'Inter',
      display: 'flex',
      flexDirection: 'column'
    }});