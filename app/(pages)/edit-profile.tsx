import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { storage } from '@/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';

const EditProfileScreen = () => {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState('');
  const [photo, setPhoto] = useState(user?.avatar || '');

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Permission to access photos is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhoto(result.assets[0].uri);
      console.log('Preview URI:', result.assets[0].uri);
    }
  };

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const uploadImageAsync = async (uri: string, userId: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const imageRef = ref(storage, `avatars/${userId}.jpg`);
    await uploadBytes(imageRef, blob);
    const url = await getDownloadURL(imageRef);
    return url;
  };

  const handleSave = async () => {
    if (!user) return;
    let avatarUrl = user?.avatar;

    if (photo && photo !== user?.avatar && !photo.startsWith('http')) {
      avatarUrl = await uploadImageAsync(photo, user.id);
    }
  
    await updateUser({
      ...user,
      name,
      avatar: avatarUrl,
    });

    setFeedback('Profile updated successfully!');
    setTimeout(() => setFeedback(''), 2000);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton}>
        <Icon name="arrow-left" size={28} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.header}>Edit Profile</Text>
      {photo ? (
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <Image
            source={{ uri: photo }}
            style={{ width: 100, height: 100, borderRadius: 50 }}
            resizeMode="cover"
          />
        </View>
      ) : null}
      <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
        <Text style={styles.photoButtonText}>Change Photo</Text>
      </TouchableOpacity>
      {feedback ? (
        <Text style={{ color: '#16C098', textAlign: 'center', marginBottom: 12 }}>
          {feedback}
        </Text>
      ) : null}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Your Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Your Name"
          placeholderTextColor="#888"
        />
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: '#2d2f36',
              color: '#aaa',
              borderColor: '#444',
              opacity: 0.7,
            }
          ]}
          value={email}
          onChangeText={setEmail}
          placeholder="[email]"
          placeholderTextColor="#888"
          editable={false}
        />
      </View>
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181A20',
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  backButton: {
    position: 'absolute',
    top: 48,
    left: 24,
    zIndex: 10,
  },
  header: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  photoButton: {
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 32,
    marginBottom: 32,
  },
  photoButtonText: {
    color: '#bbb',
    fontSize: 16,
  },
  inputGroup: {
    marginBottom: 32,
  },
  label: {
    color: '#bbb',
    fontSize: 14,
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#23262F',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#23262F',
  },
  saveButton: {
    backgroundColor: '#16C098',
    borderRadius: 32,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EditProfileScreen;