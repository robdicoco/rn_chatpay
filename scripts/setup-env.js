#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const envContent = `# XION Network Configuration
EXPO_PUBLIC_RPC_ENDPOINT=https://xion-rpc.publicnode.com
EXPO_PUBLIC_REST_ENDPOINT=https://xion-rest.publicnode.com

# Contract Addresses
EXPO_PUBLIC_TREASURY_CONTRACT_ADDRESS=xion1your_treasury_contract_address_here
EXPO_PUBLIC_USER_MAP_CONTRACT_ADDRESS=xion1your_user_map_contract_address_here

# App Configuration
EXPO_PUBLIC_APP_NAME=ChatPay Go
`;

const envPath = path.join(__dirname, '..', '.env');

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env file with placeholder values');
  console.log('⚠️  Please update the contract addresses with your actual values');
} else {
  console.log('⚠️  .env file already exists, skipping creation');
}

console.log('\n📝 Next steps:');
console.log('1. Update the contract addresses in .env with your actual values');
console.log('2. Run "yarn install" to ensure all dependencies are installed');
console.log('3. Run "yarn start" to start the development server'); 