import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useThemeColors } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import { db } from '@/firebaseConfig';
import { addDoc } from "firebase/firestore";
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { Feather as Icon } from '@expo/vector-icons';
import { router } from 'expo-router';

type Contact = {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
};

export default function AddContactScreen() {
  const colors = useThemeColors();
  const { user, updateUser } = useAuthStore();
  const [search, setSearch] = useState('');
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleSearch = async () => {
    setLoading(true);
    setContact(null);
    setFeedback('');
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', search.trim()));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        setFeedback('Contact not found!');
      } else {
        const data = snapshot.docs[0].data();
        setContact({
          userId: snapshot.docs[0].id,
          name: data.name || '',
          email: data.email || '',
          avatar: data.avatar || data.photo_url || data.foto || '',
        });
      }
    } catch (error) {
      setFeedback('Error searching contact');
    }
    setLoading(false);
  };

  const handleAddContact = async () => {
    if (!user?.id || !contact) return;
    setAdding(true);
    setFeedback('');
    try {
        await addDoc(collection(db, 'contact'), {
        uid_user: user.id,
        uid_contato: contact.userId,
        name: contact.name,
        email: contact.email,
        foto: contact.avatar || "",
        });
        setFeedback('Contact added successfully!');
        setContact(null);
        setSearch('');
    } catch (error) {
        setFeedback('Error adding contact');
    }
    setAdding(false);
    setTimeout(() => setFeedback(''), 2000);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Icon name="arrow-left" size={28} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.header}>Add Contact</Text>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Contact Email</Text>
        <TextInput
          style={styles.input}
          value={search}
          onChangeText={setSearch}
          placeholder="Enter the email"
          placeholderTextColor="#888"
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>
      <TouchableOpacity
        style={[
          styles.actionButton,
          { backgroundColor: search.trim() ? colors.primary : colors.card },
        ]}
        onPress={handleSearch}
        disabled={loading || !search.trim()}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.actionButtonText}>Search</Text>
        )}
      </TouchableOpacity>
      {feedback ? (
        <Text style={{ color: feedback.includes('successfully') ? '#16C098' : '#F66', textAlign: 'center', marginVertical: 12 }}>
          {feedback}
        </Text>
      ) : null}
      {contact && (
        <View style={styles.resultCard}>
          {contact.avatar ? (
            <Image
              source={{ uri: contact.avatar }}
              style={{ width: 64, height: 64, borderRadius: 32, alignSelf: 'center', marginBottom: 12 }}
            />
          ) : null}
          <Text style={[styles.label, { textAlign: 'center' }]}>Name: {contact.name}</Text>
          <Text style={[styles.label, { textAlign: 'center' }]}>Email: {contact.email}</Text>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary, marginTop: 12 }]}
            onPress={handleAddContact}
            disabled={adding}
          >
            {adding ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.actionButtonText}>Add contact</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181A20',
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  header: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 24,
  },
  backButton: {
    position: 'absolute',
    top: 48,
    left: 24,
    zIndex: 10,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    color: '#bbb',
    fontSize: 14,
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    backgroundColor: '#23262F',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#23262F',
  },
  actionButton: {
    borderRadius: 32,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultCard: {
    marginTop: 32,
    padding: 20,
    backgroundColor: '#23262F',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
});