import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Image,SafeAreaView, TouchableOpacity } from 'react-native';
import { useAuthStore } from '@/store/auth-store';
import { router } from 'expo-router';
import Button from '@/components/Button';
//import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Icon } from 'lucide-react-native';




export default function EditProfileScreen() {
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [icon, setFoto] = useState(user?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80');

  
  const handleSave = () => {
    updateUser({ id: user?.id || '', name, email, avatar: icon });
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      
      <Image source={{ uri: icon }} style={{ width: 100, height: 100, borderRadius: 50, alignSelf: 'center' }} />
     <View style={{ alignItems: 'center', marginVertical: 16 }}>
        
      </View>

      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />
      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} />
      <Text style={styles.label}>Foto</Text>
      <TextInput style={styles.input} value={icon} onChangeText={setFoto} />
      <Button style={styles.input} variant="primary" title="Save" onPress={handleSave} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  label: { fontWeight: 'bold', marginTop: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginTop: 8 },
});