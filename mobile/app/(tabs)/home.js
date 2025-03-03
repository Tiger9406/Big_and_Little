import { Text, View, StyleSheet } from 'react-native';
import StyledButton from "@components/StyledButton";
import { router } from "expo-router";
import { useState, useEffect } from "react";

export default function Home() {
  const [haveOrganizations, setHaveOrganizations] = useState(false);

  useEffect(() => {
    // TODO: Fetch user's organizations and set haveOrganizations state
    const userOrganizations = [];
    setHaveOrganizations(userOrganizations.length > 0);
  }, []);
  const handleClick = () => {
    router.push('/organizations/:id/matches');
  }
  const explore = () => {
    router.push('/explore');
  }

  return (
    <View>
      <View style={styles.container}>
        {!haveOrganizations &&(
          <>
        <Text style={styles.text}>You have not joined any organizations! Check out Explore to find some!</Text>
        <StyledButton text="Explore Page" onClick={explore}/>
        </>
        )}
      </View>
      {haveOrganizations && (
        <StyledButton text="Organization 1" onClick={handleClick}/>
      )}
    </View>
    
  );
}
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20, 
    marginTop: "30%"
  },
  text: {
    fontSize: 40,
    lineHeight: 40,
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 20
  }
});