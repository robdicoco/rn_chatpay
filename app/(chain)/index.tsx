import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useConfigStore } from '@/store/config-store';
import Button from '@/components/Button';
import { useThemeColors } from '@/constants/colors';


const BLOCKCHAINS = ['XION', 'STELLAR', 'TON', 'STARKNET'] as const;

export default function ConfigScreen() {
  const { blockchain, setBlockchain } = useConfigStore();
  const colors = useThemeColors();

  return (
    <View className="flex-1 p-4 bg-background">
      <Text className="text-3xl align-center font-bold mb-6">Select Blockchain</Text>
      <View style={{paddingVertical: 32}}>
        {BLOCKCHAINS.map((chain) => (
          <View key={chain} style={{paddingVertical: 16, paddingHorizontal: 16}}>
            <Button
              size='large'
              onPress={() => setBlockchain(chain)}
              className={`p-4 mb-2 rounded-lg ${chain === blockchain 
                  ? 'bg-primary' 
                  : 'bg-muted'}`}
              title={chain}
            >
              <Text className={`text-lg ${chain === blockchain 
                  ? 'text-primary-foreground' 
                  : 'text-foreground'}`}>
                {chain}
              </Text>
            </Button>
          </View>
        ))}
      </View>
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