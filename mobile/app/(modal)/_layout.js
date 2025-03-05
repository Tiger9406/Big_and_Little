import { Stack } from 'expo-router';
import React from 'react';

export default function ModalLayout() {
  return (
    <Stack screenOptions={{ 
      headerTitleAlign: 'center',
     }}>
      <Stack.Screen 
        name="create-org" 
        options={{ 
          headerTitle: "Create Organization",
          presentation: 'card'  // Instead of modal presentation
        }} 
      />
      <Stack.Screen 
        name="join-org" 
        options={{ 
          headerTitle: "Join Organization",
          presentation: 'card'  // Instead of modal presentation
        }} 
      />
    </Stack>  );
}
