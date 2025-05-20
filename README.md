# NFT Viewer - BASE Mainnet

Ứng dụng Node.js để xem danh sách NFT từ một địa chỉ ví trên mạng BASE Mainnet.

## Tính năng

- Server Node.js với Express
- Kết nối với BASE Mainnet thông qua Alchemy API
- API endpoint để lấy danh sách NFT của một địa chỉ ví
- Giao diện người dùng đơn giản và đẹp mắt
- Xử lý lỗi và hiển thị thông báo thân thiện

## Cài đặt

1. Clone repository này về máy
2. Cài đặt các dependencies:
```bash
npm install
```

## Cấu hình

1. Đăng ký tài khoản trên [Alchemy](https://www.alchemy.com/)
2. Tạo một ứng dụng mới trên mạng BASE Mainnet
3. Sao chép API key từ Alchemy
4. Tạo file `.env` trong thư mục gốc và thêm API key:
```
ALCHEMY_API_KEY=your_alchemy_api_key_here
```

## Chạy ứng dụng

Chạy trong môi trường development với nodemon (tự động restart khi có thay đổi):
```bash
npm run dev
```

Hoặc chạy trong môi trường production:
```bash
npm start
```

Ứng dụng sẽ chạy tại [http://localhost:3000](http://localhost:3000)

## Cấu trúc dự án

```
├── public/                 # Thư mục chứa file tĩnh
│   ├── index.html         # Giao diện người dùng
│   └── styles.css         # File CSS
├── .env                   # File cấu hình (chứa API key)
├── index.js              # File chính của server
├── package.json          # Cấu hình npm và dependencies
└── README.md             # Tài liệu hướng dẫn
```

## API Endpoints

### GET /api/nfts/:walletAddress

Lấy danh sách NFT của một địa chỉ ví.

**Parameters:**
- `walletAddress`: Địa chỉ ví Ethereum (dạng 0x...)

**Response:**
```json
{
  "nfts": [
    {
      "tokenId": "1",
      "name": "NFT Name",
      "description": "NFT Description",
      "image": "https://..."
    }
  ]
}
```

## Lưu ý

- Đảm bảo địa chỉ ví nhập vào là hợp lệ
- Một số NFT có thể không hiển thị hình ảnh nếu metadata không hợp lệ
- Cần có kết nối internet để truy cập BASE Mainnet và lấy metadata của NFT