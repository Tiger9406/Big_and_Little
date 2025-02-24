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
    const { userId, profiles, token } = useAuth();
    const params = useGlobalSearchParams();
    const [orgID, setOrgID] = useState('');
    
    
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
      
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
      if (permissionResult.granted === false) {
        alert('Permission to access the camera roll is required!');
        return;
      }
  
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
  
      if (!result.canceled) {
        const newImages = [...images];
        newImages[index] = result.assets[0].uri; 
        setImages(newImages);
      }
    };

    /*
      TODO: add profile updating
      PUT profiles
      
    */
    const saveProfile = () => {
      
      toggleIsEditing(false);
      //bio, images, profilePicture, numberOfLittles
      //NEED TO UPDATE ALL VALUES NOT JUST THESE 4
      const payload = {
        interests: interests,
        major: major,
        description: description,
        profileName: profileName,
        images: images,
        profilePicture: images[0],
        numberOfLittles: 0
      };
      
  
      const URI = Constants.expoConfig.hostUri.split(':').shift();
      const URL = `http://${URI}:${process.env.EXPO_PUBLIC_PORT}/profiles/${userId}`;

      fetch(URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`

        },
        body: JSON.stringify(payload)
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
          
        }
      }).catch(err => console.log("ERROR", err));
    };

    /*
      TODO: get profile to display current information
      GET profiles
    */
      const getProfile = async () => {
        try {
          const URI = Constants.expoConfig.hostUri.split(':').shift();
          const url = `http://${URI}:${process.env.EXPO_PUBLIC_PORT}/profiles/${userId}`;
      
          const response = await fetch(url, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
          });
      
          if (!response.ok) {
            throw new Error(`Failed to fetch profile data: ${response.status} ${response.statusText}`);
          }
      
          const profileData = await response.json();
          
          
          setProfileName(profileData.profileName || '');
          setMajor(profileData.major || '');
          setDescription(profileData.description || '');
          setImages(profileData.images || []);
          setInterests(profileData.interests || ['+']);
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
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <View style={[styles.horizontalContainer]}>
            <ProfilePicture
              src={''}
              /> 
              
                  {isEditing ? (
                <StyledTextInput
                  field="Name"
                  value={profileName}
                  setText={setProfileName}
                  placeholder="Your name"
                  autocorrect={false}
                  editable={true}
                  required
                />
              ) : (
                <Text style={profileName ? styles.profileText : styles.emptyContainer}>{profileName || "No name set"}</Text>
              )}

          </View>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView
              style={styles.scrollContainer}
              ref={scrollViewRef}
              onMomentumScrollEnd={handleScroll}>
              <View onStartShouldSetResponder={() => true} style={styles.form}>
                  <View style={styles.imageContainer}>
                        {images.map((image, index) => (
                          isEditing ? (
                            <TouchableWithoutFeedback key={index} onPress={() => pickImage(index)}>
                              <Image source={{ uri: image }} style={styles.image} />
                            </TouchableWithoutFeedback>
                          ) : (
                            <Image key={index} source={{ uri: image }} style={styles.image} />
                          )
                        ))}
                      </View>
                  <View style={styles.buttonContainer}>
                      
                  {isEditing && images.length < 3 ? (
                    <StyledButton text={"Insert Picture" } onClick={() => pickImage(images.length)} />
                  ) : null}                      
                  </View>



                <Text style={{fontSize: 20}}>Interests</Text>
                <View>
                  {interests && <View style={styles.horizontalContainer}>{interests.map((item, index) => (
                    <Pressable key={index} onPress={() => handlePressInterest(index)}>
                      <Text style={styles.interest}>
                        {item}
                      </Text>
                      
                    </Pressable>
                ))}</View>}
                </View>
                
                {isEditing ? (
                  <StyledTextInput
                  field="Major"
                  value={major}
                  setText={setMajor}
                  placeholder="Your major"
                  autocorrect={false}
                  editable={isEditing}
                  required />) : (<Text style={major ? styles.filledContainer : styles.emptyContainer}>{major || "No major set"}</Text>)}
              
              {isEditing ? (
                <StyledTextInput
                  field="Description"
                  value={description}
                  setText={setDescription}
                  multiline
                  numberOfLines={4}
                  placeholder="Tell us about yourself"
                  autocorrect={false}
                  editable={isEditing}
                  required />) : (<Text style={description ? styles.filledContainer : styles.emptyContainer}>{description || "No description set"}</Text>)}
              </View>


              <View style={styles.buttonContainer}>
                <StyledButton text={isEditing ? "Save" : "Edit" } onClick={() => {isEditing ? saveProfile() : toggleIsEditing(true) }} />
              </View>

                {/* <StyledButton text="Save" onClick={saveProfile} /> */}
              
              
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
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
    flex: 1,
    backgroundColor: '#ffffff',
    fontFamily: 'Inter',
    gap: 10
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
  
  
});