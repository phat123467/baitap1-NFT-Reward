import React, { useState } from 'react';
import { ChakraProvider, Box, VStack, Input, Button, Text, Image, SimpleGrid, Alert, AlertIcon } from '@chakra-ui/react';
import { ethers } from 'ethers';
import axios from 'axios';

// ABI tối thiểu để truy vấn NFT
const minABI = [
  // Hàm balanceOf
  {
    "inputs": [{"internalType": "address","name": "owner","type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  // Hàm tokenOfOwnerByIndex
  {
    "inputs": [
      {"internalType": "address","name": "owner","type": "address"},
      {"internalType": "uint256","name": "index","type": "uint256"}
    ],
    "name": "tokenOfOwnerByIndex",
    "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  // Hàm tokenURI
  {
    "inputs": [{"internalType": "uint256","name": "tokenId","type": "uint256"}],
    "name": "tokenURI",
    "outputs": [{"internalType": "string","name": "","type": "string"}],
    "stateMutability": "view",
    "type": "function"
  }
];

function App() {
  const [walletAddress, setWalletAddress] = useState('');
  const [nfts, setNfts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Địa chỉ hợp đồng NFT trên BASE Mainnet
  const contractAddress = '0x0e381cd73faa421066dc5e2829a973405352168c';

  const fetchNFTs = async () => {
    if (!ethers.isAddress(walletAddress)) {
      setError('Địa chỉ ví không hợp lệ');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setNfts([]);

      // Kết nối đến BASE Mainnet thông qua Alchemy
      const provider = new ethers.JsonRpcProvider(
        `https://base-mainnet.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_API_KEY}`
      );

      // Tạo instance của hợp đồng
      const contract = new ethers.Contract(contractAddress, minABI, provider);

      // Lấy số lượng NFT của ví
      const balance = await contract.balanceOf(walletAddress);
      
      // Lấy thông tin của từng NFT
      const tokenPromises = [];
      for (let i = 0; i < balance; i++) {
        const promise = async () => {
          const tokenId = await contract.tokenOfOwnerByIndex(walletAddress, i);
          const tokenUri = await contract.tokenURI(tokenId);
          
          // Lấy metadata từ IPFS hoặc HTTP URL
          let metadata;
          try {
            const response = await axios.get(tokenUri);
            metadata = response.data;
          } catch (error) {
            metadata = { name: `Token #${tokenId}`, image: '' };
          }

          return {
            tokenId: tokenId.toString(),
            ...metadata
          };
        };
        tokenPromises.push(promise());
      }

      const tokens = await Promise.all(tokenPromises);
      setNfts(tokens);
    } catch (err) {
      setError('Có lỗi xảy ra khi lấy thông tin NFT: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ChakraProvider>
      <Box p={8}>
        <VStack spacing={6} align="stretch">
          <Text fontSize="2xl" fontWeight="bold">NFT Viewer - BASE Mainnet</Text>
          
          <Box>
            <Input
              placeholder="Nhập địa chỉ ví (vd: 0x...)"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              mb={4}
            />
            <Button
              colorScheme="blue"
              onClick={fetchNFTs}
              isLoading={loading}
              loadingText="Đang tải..."
            >
              Xem NFTs
            </Button>
          </Box>

          {error && (
            <Alert status="error">
              <AlertIcon />
              {error}
            </Alert>
          )}

          <SimpleGrid columns={[1, 2, 3]} spacing={6}>
            {nfts.map((nft) => (
              <Box
                key={nft.tokenId}
                borderWidth={1}
                borderRadius="lg"
                overflow="hidden"
                p={4}
              >
                {nft.image && (
                  <Image
                    src={nft.image}
                    alt={nft.name}
                    mb={4}
                    borderRadius="md"
                  />
                )}
                <Text fontWeight="bold">{nft.name}</Text>
                <Text>Token ID: {nft.tokenId}</Text>
                {nft.description && (
                  <Text fontSize="sm" color="gray.600">
                    {nft.description}
                  </Text>
                )}
              </Box>
            ))}
          </SimpleGrid>
        </VStack>
      </Box>
    </ChakraProvider>
  );
}

export default App;