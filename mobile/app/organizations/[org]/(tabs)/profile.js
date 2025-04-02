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
import ProfileCard from '@components/ProfileCard';


/*
    route: /view-profile
    View existing profile (if exists)
*/
export default function ViewProfile() {
  const [interests, setInterests] = useState(['+']);
  const [major, setMajor] = useState('');
  const [description, setDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [images, setImages] = useState([]);
  const [tempImages, setTempImages] = useState([]);
  const { userId, profiles } = useAuth();
  const params = useGlobalSearchParams();
  const [orgID, setOrgID] = useState('');
  const { session } = useSession();

  // State for scroll fix
  const scrollViewRef = useRef(null);
  const scrollFix = useRef(false);

  const toggleIsEditing = (edit) => {
    setIsEditing(edit);
  };

  useEffect(() => {
    getProfile();
  }, []);

  //image picker function 
  const pickImage = async (index) => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Permission to access the camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        // Store the image temporarily
        const newTempImages = [...tempImages];
        newTempImages[index] = {
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: `upload_${index}.jpg`
        };
        setTempImages(newTempImages);

        // Update display images
        const newImages = [...images];
        newImages[index] = result.assets[0].uri;
        setImages(newImages);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  /*
    TODO: add profile updating
    PUT profiles
  */
  const saveProfile = async () => {
    try {
      const targetOrgId = params.org;
      const matchingProfile = profiles.find(profile => profile.organizationId === targetOrgId);
      
      if (!matchingProfile) {
        throw new Error(`No profile found for organization ID: ${targetOrgId}`);
      }
      
      const profileId = matchingProfile.id;

      // Upload images first
      const uploadedImageUrls = [];

      for (const tempImage of tempImages) {
        if (tempImage) {
          const formData = new FormData();
          formData.append('image', tempImage);

          const URI = Constants.expoConfig.hostUri.split(':').shift();
          const uploadUrl = `http://${URI}:${process.env.EXPO_PUBLIC_PORT}/image/upload/big-little-profile-images`;

          const response = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${session}`
            },
            body: formData
          });

          if (!response.ok) {
            throw new Error('Failed to upload image');
          }

          const data = await response.json();
          uploadedImageUrls.push(data.id);
        }
      }

      // Update profile with new image URLs
      const payload = {
        interests: interests,
        major: major,
        description: description,
        profileName: profileName,
        images: uploadedImageUrls.length > 0 ? uploadedImageUrls : images,
        profilePicture: uploadedImageUrls[0] || images[0],
        numberOfLittles: 0
      };

      const URI = Constants.expoConfig.hostUri.split(':').shift();
      const URL = `http://${URI}:${process.env.EXPO_PUBLIC_PORT}/profiles/${profileId}`;

      const response = await fetch(URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      // Clear temporary images after successful save
      setTempImages([]);
      toggleIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
      getProfile(); // Refresh the profile data

    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert('Error', 'Failed to save profile');
    }
  };

  /*
    TODO: get profile to display current information
    GET profiles
  */
  const getProfile = async () => {
    try {
      // Find the profile that matches the organization ID from params
      const targetOrgId = params.org;
      const matchingProfile = profiles.find(profile => profile.organizationId === targetOrgId);
      
      if (!matchingProfile) {
        throw new Error(`No profile found for organization ID: ${targetOrgId}`);
      }
      
      const profileId = matchingProfile.id;
      
      const URI = Constants.expoConfig.hostUri.split(':').shift();
      const url = `http://${URI}:${process.env.EXPO_PUBLIC_PORT}/profiles/${profileId}`;
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
      setProfileName(profileData.profileName);
      setMajor(profileData.major);
      setDescription(profileData.description);
      setImages(profileData.images);
      if (profileData.interests != "") {
        setInterests(profileData.interests);
      }
      else {
        setInterests(['+']);
      }

      setOrgID(profileData.organizationId || '');

    } catch (err) {
      console.error("Error fetching profile:", err);
      Alert.alert('Error', 'Failed to fetch profile data');
    }
  };

  const handlePressInterest = (index) => {
    if (!isEditing) return;

    if (index == 0) {
      addInterest();
    }
    else {
      removeInterest(index);
    }
  }

  const addInterest = () => {
    if (!isEditing) return;

    Alert.prompt(
      'Enter an interest',
      null,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Add',
          onPress: (interest) => setInterests((interests) => [...interests, interest])
        }
      ]
    );
  };

  const removeInterest = (index) => {
    if (!isEditing) return;

    interests.splice(index, 1)

    setInterests([...interests]);
  }

  // Workaround to not hide text input helper/error text
  const handleScroll = (event) => {
    if (scrollViewRef.current === undefined) return;
    if (scrollFix.current) {
      scrollFix.current = false;
    }
    else if (Keyboard.isVisible()) {
      const height = event.nativeEvent.contentOffset.y;
      scrollFix.current = true;
      scrollViewRef.current.scrollTo({
        x: 0,
        y: height + 50,
        animated: true
      });
    }
  }


  return (
    <View style={{ flex: 1 }}>
      {!isEditing ? (
        <View style={{ flex: 1 }}>
          <ProfileCard profile={{
            profileName: profileName,
            major: major,
            description: description,
            interests: interests,
            images: images
          }} />
        </View>
      ) : (
        
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
              >
                <ScrollView
                  ref={scrollViewRef}
                  onMomentumScrollEnd={handleScroll}
                  style={styles.scrollContainer}
                >
                  <View style={styles.form}>
                    <StyledTextInput
                      field="Name"
                      value={profileName}
                      setText={setProfileName}
                      placeholder="Your name"
                      autoCorrect={false}
                      required
                    />
        
                    <View style={styles.imageContainer}>
                      {images.map((image, index) => (
                        <TouchableWithoutFeedback key={index} onPress={() => pickImage(index)}>
                          <Image source={{ uri: image }} style={styles.image} />
                        </TouchableWithoutFeedback>
                      ))}
                    </View>
        
                    {images.length < 3 && (
                      <StyledButton 
                        text="Add Picture"
                        onClick={() => pickImage(images.length)}
                      />
                    )}
        
                    <View style={styles.interestsSection}>
                      <Text style={styles.sectionTitle}>Interests</Text>
                      <View style={styles.interestsContainer}>
                        {interests.map((item, index) => (
                          <Pressable key={index} onPress={() => handlePressInterest(index)}>
                            <Text style={styles.interest}>{item}</Text>
                          </Pressable>
                        ))}
                      </View>
                    </View>
        
                    <StyledTextInput
                      field="Major"
                      value={major}
                      setText={setMajor}
                      placeholder="Your major"
                      autoCorrect={false}
                      required
                    />
        
                    <StyledTextInput
                      field="Bio"
                      value={description}
                      setText={setDescription}
                      placeholder="Tell us about yourself"
                      multiline
                      numberOfLines={4}
                      autoCorrect={false}
                      required
                    />
                    </View>
                </ScrollView>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
      )}
      <View style={styles.buttonContainer}>
            <StyledButton text={isEditing ? "Save" : "Edit"} onClick={() => { isEditing ? saveProfile() : setIsEditing(true) }}/>
      </View>
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
  },
  buttonContainer: {
    backgroundColor: '#ffffff',
    fontFamily: 'Inter',
    gap: 10,
    padding: 10,
  },
  horizontalContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 15,
    paddingVertical: 10,
    paddingHorizontal: 20
  },
  scrollContainer: {
    height: '100%',
    borderTopWidth: 1,
    borderTopColor: 'lightgrey',
    borderRadius: 4,
    padding: 20,
    gap: 30
  },
  interest: {
    borderRadius: 4,
    backgroundColor: 'lightgrey',
    overflow: 'hidden',
    fontSize: 20,
    paddingHorizontal: 5
  },
  form: {
    gap: 15,
    paddingBottom: 80
  },
  profileText: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  emptyContainer: {
    borderWidth: 2,
    borderColor: "red",
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    flexDirection: "row",
    textAlign: "center",
  },
  filledContainer: {
    borderWidth: 2,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#fafafa",
    alignItems: "flex-start",
    justifyContent: "center",
    marginVertical: 10,
    flexDirection: "row",
    textAlign: "left",
    opacity: 0.7,
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  image: {
    width: 100,
    height: 100,
    margin: 5,
    borderRadius: 10,
  },
  animatedContainer: {
    flex: 1, //  entire profile view is animated
  },
  scrollView: {
    paddingHorizontal: 20,
    paddingRight: 15, // right margin, scrollbar
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  profilePicture: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ccc',
  },
  userInfo: {
    marginLeft: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  year: {
    fontSize: 16,
    color: '#888',
  },
  photoContainer: {
    height: 400,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    position: 'relative',
  },
  photoPlaceholder: {
    fontSize: 18,
    color: '#888',
  },
  leftButton: {
    position: 'absolute',
    bottom: 15,
    left: 15,
  },
  rightButton: {
    position: 'absolute',
    bottom: 15,
    right: 15,
  },
  interestsSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  interestItem: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    fontSize: 14,
  },
  descriptionSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  
});