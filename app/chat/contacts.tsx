// app/chat/contacts.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useThemeColors } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import { collection, query, where, getDocs, getDoc, doc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { MessageCircle, User as UserIcon } from 'lucide-react-native';
import { router } from 'expo-router';

type Contact = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
};

export default function ContactsScreen() {
  const colors = useThemeColors();
  const { user } = useAuthStore();
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    async function fetchContacts() {
      if (!user?.id) return;
      const q = query(collection(db, "contact"), where("uid_user", "==", user.id));
      const snapshot = await getDocs(q);
      const contactsList: Contact[] = await Promise.all(snapshot.docs.map(async contactDoc => {
      const contatoId = contactDoc.data().uid_contato;
      const userSnap = await getDoc(doc(db, "users", contatoId));
      let avatar = "";
      if (userSnap.exists()) {
        const userData = userSnap.data() as Record<string, any>;
        avatar = userData.avatar || userData.photo_url || userData.foto || "";
      }
      return {
        id: contatoId,
        name: contactDoc.data().name,
        email: contactDoc.data().email,
        avatar,
      };
    }));
    setContacts(contactsList);
    }
    fetchContacts();
  }, [user?.id]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.textPrimary }]}>My Contacts</Text>
      {contacts.length === 0 ? (
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 32 }}>
          You haven't added any contacts yet.
        </Text>
      ) : (
        contacts.map((contact, idx) => (
          <View key={contact.id || idx} style={[styles.contactCard, { backgroundColor: colors.card }]}>
            {contact.avatar ? (
              <Image
                source={{ uri: contact.avatar }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <UserIcon size={32} color="#888" />
              </View>
            )}
            <Text style={[styles.contactName, { color: colors.textPrimary }]}>{contact.name}</Text>
            <Text style={[styles.contactEmail, { color: colors.textSecondary }]}>{contact.email}</Text>
            <TouchableOpacity
              style={styles.chatButton}
              onPress={() => router.push(`/chat/${contact.id}`)}
            >
              <MessageCircle size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 24,
  },
  contactCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 8,
    alignSelf: 'center',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#23262F',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    alignSelf: 'center',
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  contactEmail: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
  },
  chatButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    backgroundColor: 'transparent',
  },
});