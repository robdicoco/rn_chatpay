import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useConfigStore } from '@/store/config-store';

const BLOCKCHAINS = ['XION', 'STELLAR', 'TON', 'STARKNET'] as const;

export default function ConfigScreen() {
  const { blockchain, setBlockchain } = useConfigStore();

  return (
    <View className="flex-1 p-4 bg-background">
      <Text className="text-2xl font-bold mb-6">Select Blockchain</Text>
      {BLOCKCHAINS.map((chain) => (
        <TouchableOpacity
          key={chain}
          onPress={() => setBlockchain(chain)}
          className={`p-4 mb-2 rounded-lg ${chain === blockchain 
            ? 'bg-primary' 
            : 'bg-muted'}`}
        >
          <Text className={`text-lg ${chain === blockchain 
            ? 'text-primary-foreground' 
            : 'text-foreground'}`}>
            {chain}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderRadius: 12,
    elevation: 2,
  },
  text: {
    fontSize: 20,
    fontWeight: '500',
  },
  icon: {
  width: 40,
  height: 40,
  marginRight: 16
    }
})