import StyledButton from "@components/StyledButton";
import { router } from "expo-router";
import useAuth from '@context/useAuth';


export default function Home() {
  const { userId, profiles } = useAuth();


  //hardcoded orgID for now 
  const handleClick = () => {
    
    const orgID = "67bbc6ffd4f1787c53a90c8b"
    console.log("Fetching profile for userId:", userId);
    console.log("Fetching profile for orgID:", orgID);
    console.log("Fetching profile for profiles:", profiles);
    
    router.push(`/organizations/${orgID}/matches`)
  }

  return (
    <StyledButton
      text="Organization 1"
      onClick={handleClick}
    />
  );
}