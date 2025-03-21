import { useRef, useState, useCallback } from 'react';
import { Pressable, ImageBackground, View, Text, StyleSheet } from "react-native";

/*
  Profile Card Component - Displays profile for the Matches page
*/
export default function ProfileCard({ profile }) {
  const interests = profile.interests.slice(1);
  
  const width = useRef();
  
  const handleLayout = (event) => {
    if (event === undefined) return;
    width.current = event.nativeEvent.layout.width;
  }

  const [imageIndex, setImageIndex] = useState(0);

  const handlePress = useCallback((event) => {
    if (event.nativeEvent.locationX < width.current / 2) { // Left side tap
      if (imageIndex === 0) return;
      setImageIndex(imageIndex - 1);
    } else { // Right side tap
      if (imageIndex === profile.images.length - 1) return;
      setImageIndex(imageIndex + 1);
    }
  }, [imageIndex]);

  return (
    <Pressable
      style={styles.container}
      onPress={handlePress}
      onLayout={handleLayout}
    >
      <ImageBackground
        style={styles.card}
        source={{ uri: profile.images[imageIndex] }}
        resizeMode="cover"
      >
        <View style={styles.progress}>
          {profile.images.length > 1 && profile.images.map((_, i) => {
            return (
              <View
                key={i}
                style={[styles.progressBar, i === imageIndex && styles.active]}>
              </View>
            )
          })}
        </View>
        <View style={styles.info}>
          <View style={styles.headerLine}>
            <Text style={styles.name}>{profile.profileName}</Text>
            <Text style={styles.major}>{profile.major}</Text>
          </View>
          <Text style={styles.description}>{profile.description}</Text>
          {interests.length > 0 &&
            <Text style={styles.interests}>Interests: {interests.join(', ')}</Text>
          }
        </View>
      </ImageBackground>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    flex: 1,
    display: 'flex',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff' // Fallback background if image does not exist,
  },
  progress: {
    display: 'flex',
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 5,
    marginTop: 5
  },
  progressBar: {
    flex: 1,
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.6)'
  },
  active: {
    backgroundColor: 'white'
  },
  info: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 10,
  },
  headerLine: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  name: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
  },
  major: {
    fontSize: 15,
    color: 'white'
  },
  description: {
    color: 'white'
  },
  interests: {
    color: 'white'
  }
})