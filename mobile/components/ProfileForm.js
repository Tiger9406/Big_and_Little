import React, { useState, useRef } from 'react';
import { 
    View, 
    ScrollView, 
    StyleSheet, 
    Alert, 
    TouchableWithoutFeedback, 
    Keyboard, 
    KeyboardAvoidingView,
    Platform,
    Text,
    Pressable,
    Image
  } from 'react-native';
import Constants from "expo-constants";
import * as ImagePicker from 'expo-image-picker';

import StyledTextInput from './StyledTextInput';
import StyledButton from './StyledButton';

export default function ProfileForm({ initialData = {}, onSubmit, role }) {
  // States for form data
  const [interests, setInterests] = useState(initialData.interests || ['+']);
  const [major, setMajor] = useState(initialData.major || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [profileName, setProfileName] = useState(initialData.profileName || '');
  const [images, setImages] = useState(initialData.images || []);

  // State for scroll fix
  const scrollViewRef = useRef(null);
  const scrollFix = useRef(false);

  const handlePressInterest = (index) => {
    if (index == 0) {
      addInterest();
    } else {
      removeInterest(index);
    }
  }

  const addInterest = () => {
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
    interests.splice(index, 1)
    setInterests([...interests]);
  }

  const pickImage = async (index) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission to access the camera roll is required!');
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

  const handleSubmit = () => {
    const profileData = {
      interests,
      major,
      description,
      profileName,
      images,
      profilePicture: images[0],
      role,
      numberOfLittles: role === 'Big' ? 0 : undefined
    };

    onSubmit(profileData);
  };

  // Scroll fix handler
  const handleScroll = (event) => {
    if (scrollViewRef.current === undefined) return;
    if (scrollFix.current) {
      scrollFix.current = false;
    } else if (Keyboard.isVisible()) {
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

            <StyledButton
              text="Save Profile"
              onClick={handleSubmit}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContainer: {
    padding: 20,
  },
  form: {
    gap: 15,
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  interestsSection: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  interest: {
    backgroundColor: 'lightgrey',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
});