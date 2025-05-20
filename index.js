const express = require('express');
const { ethers } = require('ethers');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

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

// Địa chỉ hợp đồng NFT trên BASE Mainnet
const contractAddress = '0x0e381cd73faa421066dc5e2829a973405352168c';

// API endpoint để lấy danh sách NFT
app.get('/api/nfts/:walletAddress', async (req, res) => {
  const { walletAddress } = req.params;

  try {
    // Kiểm tra địa chỉ ví hợp lệ
    if (!ethers.isAddress(walletAddress)) {
      return res.status(400).json({ error: 'Địa chỉ ví không hợp lệ' });
    }

    // Kết nối đến BASE Mainnet thông qua Alchemy
    const provider = new ethers.JsonRpcProvider(
      `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
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
    res.json({ nfts: tokens });
  } catch (error) {
    console.error('Lỗi:', error);
    res.status(500).json({ error: 'Có lỗi xảy ra khi lấy thông tin NFT' });
  }
});

// Serve giao diện người dùng
app.use(express.static('public'));

// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});