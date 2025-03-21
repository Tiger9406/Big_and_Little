import { useState, useEffect, useRef } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Swiper from 'react-native-deck-swiper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from "expo-router";
import Constants from "expo-constants";

import { fetchImage } from "@middleware/fetchImage";
import { useSession } from "@context/ctx";

import Loading from '@components/Loading';
import ProfileCard from "@components/ProfileCard";

export default function Matches() {
  const { org } = useLocalSearchParams();
  const { session } = useSession();

  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState({});
  const [profiles, setProfiles] = useState([]);
  const [swipes, setSwipes] = useState(0);
  const [cardIndex, setCardIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  
  useEffect(() => {
    // Get IP that Expo server is using to host app, allows to connect with the backend
    const URI = Constants.expoConfig.hostUri.split(':').shift();

    const fetchData = async () => {
      // Get organization
      const organization = await fetch(`http://${URI}:${process.env.EXPO_PUBLIC_PORT}/organizations/${org}`,
        {
          headers: {
            'Authorization': `Bearer ${session}`
          }
        }
      ).then(res => res.json());
      setOrganization(organization);
      if (!organization.isMatching) {
        setLoading(false);
        return;
      }

      // Get matching info
      const matchInfo = await fetch(`http://${URI}:${process.env.EXPO_PUBLIC_PORT}/organizations/${org}/matches/profiles`,
        {
          headers: {
            'Authorization': `Bearer ${session}`
          }
        }
      ).then(res => res.json());

      const profiles = await Promise.all(
        matchInfo.profiles.map(async profile => {
          const updatedImages = await Promise.all(
            profile.images.map(async imageId => fetchImage('profile-images', imageId))
          );
          return { ...profile, images: updatedImages };
        })
      );
      const swipes = matchInfo.swipes;

      // If user has ran out of swipes or there are no remaining profiles
      if (swipes === 0 || profiles.length === 0) {
        setFinished(true);
      } else {
        setProfiles(profiles);
        setSwipes(Math.min(profiles.length, swipes));
      }

      setLoading(false);
    }

    fetchData();
  }, []);

  const swiper = useRef();

  const swipe = () => {
    setCardIndex(cardIndex + 1);
    setSwipes(swipes - 1);

    // User has gone through all swipes
    if (swipes === 1) {
      setFinished(true);
    }
  }

  const swipeLeft = async () => {
    const profileId = profiles[cardIndex]._id;

    // Get IP that Expo server is using to host app, allows to connect with the backend
    const URI = Constants.expoConfig.hostUri.split(':').shift();

    await fetch(`http://${URI}:${process.env.EXPO_PUBLIC_PORT}/organizations/${org}/matches/swipeLeft/${profileId}`,
      {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${session}`
        }
      }
    );
  }

  const swipeRight = async () => {
    const profileId = profiles[cardIndex]._id;

    // Get IP that Expo server is using to host app, allows to connect with the backend
    const URI = Constants.expoConfig.hostUri.split(':').shift();

    await fetch(`http://${URI}:${process.env.EXPO_PUBLIC_PORT}/organizations/${org}/matches/swipeRight/${profileId}`,
      {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${session}`
        }
      }
    );
  }

  // User has gone through all profiles
  // TODO: User may still have swipes left over
  const swipeFinish = () => {
    setFinished(true);
  }

  return (
    <View style={styles.container}>
    {loading ?
      <Loading /> :
      organization.isMatching ?
        <View style={styles.body}>
          <View style={styles.info}>
            <Text style={styles.infoText}>Matching Round {organization.currentRound + 1}/{organization.rounds}</Text>
          </View>
          <View style={styles.body}>
          {finished ?
            <View style={styles.finish}>
              <Text style={styles.text}>You have finished matching for Round {organization.currentRound + 1}!</Text>
            </View> :
            <View style={styles.body}>
              <View style={styles.swiper}>
                <Swiper
                  ref={swiper}
                  backgroundColor='transparent'
                  cardVerticalMargin={0}
                  cardHorizontalMargin={0}	
                  cards={profiles}
                  renderCard={profile => <ProfileCard profile={profile} />}
                  cardStyle={styles.card}
                  stackSize={profiles.length}
                  stackScale={0}
                  stackSeparation={0}
                  horizontalSwipe={swipes !== 0}
                  verticalSwipe={false}
                  onSwiped={swipe}
                  onSwipedLeft={swipeLeft}
                  onSwipedRight={swipeRight}
                  onSwipedAll={swipeFinish}
                />
              </View>
              <View style={styles.buttons}>
                <Pressable
                  disabled={swipes === 0}
                  onPress={() => swiper.current.swipeLeft()}
                >
                  <MaterialCommunityIcons name="close-circle-outline" size={70} color="black" />
                </Pressable>
                <Pressable
                  disabled={swipes === 0}
                  onPress={() => swiper.current.swipeRight()}
                >
                  <MaterialCommunityIcons name="heart-circle-outline" size={70} color="black" />
                </Pressable>
              </View>
            </View>
          }
          </View>
          {!finished &&
            <View style={styles.info}>
              <Text style={styles.infoText}>{swipes} swipe{swipes !== 1 && "s"} left!</Text>
              <Text style={styles.infoText}>{profiles.length - cardIndex} profile{profiles.length - cardIndex !== 1 && "s"} left!</Text>
            </View>
          }
        </View> :
        <Text style={styles.text}>{organization.name} is currently not matching, come again later!</Text>
    }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    display: 'flex',
    justifyContent: 'center'
  },
  text: {
    textAlign: 'center',
    marginHorizontal: 20
  },
  body: {
    flex: 1,
  },
  info: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10
  },
  infoText: {
    fontSize: 20
  },
  finish: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center'
  },
  swiper: {
    flex: 1,
    zIndex: 1
  },
  card: {
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: 'auto',
    height: 'auto'
  },
  buttons: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around'
  }
});