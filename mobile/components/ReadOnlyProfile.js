import React from 'react';
import { 
  TouchableWithoutFeedback, 
  Keyboard, 
  View, 
  Text, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  Image, 
  StyleSheet, 
  Pressable 
} from 'react-native';
import ProfilePicture from '@components/ProfilePicture';
import StyledButton from '@components/StyledButton';

export default function ReadOnlyProfile({ profileData, onEdit }) {
  const { profileName, major, description, images = [], interests = [] } = profileData || {};

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <View style={styles.horizontalContainer}>
          <ProfilePicture src={''} />
          <Text style={profileName ? styles.profileText : styles.emptyContainer}>
            {profileName || "No name set"}
          </Text>
        </View>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView style={styles.scrollContainer}>
            <View style={styles.form}>
              <View style={styles.imageContainer}>
                {images.map((image, index) => (
                  <Image key={index} source={{ uri: image }} style={styles.image} />
                ))}
              </View>
              <Text style={styles.sectionTitle}>Interests</Text>
              <View style={styles.horizontalContainer}>
                {interests.map((item, index) => (
                  <Pressable key={index}>
                    <Text style={styles.interest}>{item}</Text>
                  </Pressable>
                ))}
              </View>
              <Text style={styles.sectionTitle}>Major</Text>
              <Text style={major ? styles.filledContainer : styles.emptyContainer}>
                {major || "No major set"}
              </Text>
              <Text style={styles.sectionTitle}>Bio</Text>
              <Text style={description ? styles.filledContainer : styles.emptyContainer}>
                {description || "No description set"}
              </Text>
            </View>
            <View style={styles.buttonContainer}>
              <StyledButton text="Edit" onClick={onEdit} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  horizontalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 20,
  },
  profileText: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  emptyContainer: {
    borderWidth: 2,
    borderColor: 'red',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    textAlign: 'center',
  },
  scrollContainer: {
    paddingVertical: 20,
  },
  form: {
    gap: 15,
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
    margin: 5,
  },
  sectionTitle: {
    fontSize: 20,
    marginVertical: 1,
  },
  filledContainer: {
    borderWidth: 2,
    borderColor: '#ccc',
    padding: 5,
    borderRadius: 10,
    backgroundColor: '#fafafa',
    marginVertical: 5,
    textAlign: 'left',
    opacity: 0.7,
  },
  interest: {
    backgroundColor: 'lightgrey',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    margin: 5,
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
});
