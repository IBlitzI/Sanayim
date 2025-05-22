// Push notification test script
const axios = require('axios');

// Expo Push Notification API endpoint
const EXPO_PUSH_ENDPOINT = 'https://exp.host/--/api/v2/push/send';

// Test fonksiyonu
async function sendTestNotification(expoPushToken) {
  try {
    const response = await axios.post(EXPO_PUSH_ENDPOINT, {
      to: expoPushToken,
      title: "Test Bildirim",
      body: "Bu bir test bildirimidir",
      data: { screen: "messages" },
      sound: 'default',
      priority: 'high',
    });
    
    console.log('Push gönderme sonucu:', response.data);
    return response.data;
  } catch (error) {
    console.error('Hata:', error.response ? error.response.data : error);
    throw error;
  }
}

// Kullanım örneği (token'ı buraya ekleyin)
const token = process.argv[2];

if (!token) {
  console.error('Lütfen bir Expo Push Token belirtin!');
  console.log('Kullanım: node test-notification.js EXPO_PUSH_TOKEN');
  process.exit(1);
}

console.log(`${token} adresine test bildirimi gönderiliyor...`);
sendTestNotification(token)
  .then(() => console.log('Bildirim gönderildi!'))
  .catch(err => console.error('Bildirim gönderilemedi:', err));
