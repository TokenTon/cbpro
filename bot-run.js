import fetch from 'node-fetch';

// Telegram Bot Token
const TELEGRAM_BOT_TOKEN = '7319839226:AAHKBhjR5s4MFw4E1yFl8URAyFoCrzIpQts';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// Правильный URL для приложения
const APP_URL = 'https://9c531f92-c005-44b6-9262-31633dc0faf8-00-355idei9zjiw8.riker.replit.dev';

// Функция для логирования 
function log(message) {
  console.log(`[${new Date().toLocaleTimeString()}] ${message}`);
}

// Функция отправки сообщения
async function sendMessage(chatId, text, options = {}) {
  try {
    const payload = {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      ...options
    };
    
    const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    if (data.ok) {
      return data.result;
    } else {
      log(`Ошибка отправки сообщения: ${data.description}`);
      return null;
    }
  } catch (error) {
    log(`Ошибка отправки сообщения: ${error}`);
    return null;
  }
}

// Обработка обновлений
async function processUpdate(update) {
  try {
    // Проверяем, что это сообщение
    if (update.message) {
      const message = update.message;
      const chatId = message.chat.id;
      const text = message.text;
      
      log(`Получено сообщение от ${message.from.username || message.from.id}: ${text}`);
      
      // Обрабатываем команды
      if (text && text.startsWith('/')) {
        const command = text.split(' ')[0].substring(1);
        
        switch (command) {
          case 'start':
            await sendMessage(chatId, `
<b>Добро пожаловать в Channel Boost Mini App!</b>

Этот бот помогает вам продвигать ваши Telegram каналы, участвовать в лотереях и получать вознаграждения.

Нажмите на кнопку ниже, чтобы открыть мини-приложение:
            `, {
              reply_markup: JSON.stringify({
                inline_keyboard: [
                  [{ text: '🚀 Открыть Channel Boost App', web_app: { url: APP_URL } }]
                ]
              })
            });
            break;
            
          case 'app':
            await sendMessage(chatId, `
<b>Channel Boost Mini App</b>

Нажмите на кнопку ниже, чтобы открыть приложение:
            `, {
              reply_markup: JSON.stringify({
                inline_keyboard: [
                  [{ text: '🚀 Открыть Channel Boost App', web_app: { url: APP_URL } }]
                ]
              })
            });
            break;
            
          case 'help':
            await sendMessage(chatId, `
<b>Справка по Channel Boost Mini App</b>

Доступные команды:
/start - Запустить бота
/app - Открыть мини-приложение
/help - Показать эту справку
/about - О приложении
            `);
            break;
            
          case 'about':
            await sendMessage(chatId, `
<b>О приложении Channel Boost Mini App</b>

Это мини-приложение позволяет вам:
- Продвигать Telegram каналы
- Играть в tap-игру для заработка PT
- Выполнять задания для получения наград
- Участвовать в лотереях
- Зарабатывать баллы лояльности

Версия: 1.0.0
            `);
            break;
            
          default:
            await sendMessage(chatId, "Я не понимаю эту команду. Попробуйте /help для получения списка команд.");
        }
      }
    }
  } catch (error) {
    log(`Ошибка обработки обновления: ${error}`);
  }
}

// Функция для получения обновлений (long polling)
async function getUpdates(offset = 0) {
  try {
    const response = await fetch(`${TELEGRAM_API_URL}/getUpdates?offset=${offset}&timeout=30`);
    const data = await response.json();
    
    if (data.ok) {
      return data.result;
    } else {
      log(`Ошибка получения обновлений: ${data.description}`);
      return [];
    }
  } catch (error) {
    log(`Ошибка получения обновлений: ${error}`);
    return [];
  }
}

// Основная функция для запуска бота с long polling
async function startBot() {
  log('Запуск Channel Boost Bot...');
  
  // Получаем информацию о боте
  try {
    const botResponse = await fetch(`${TELEGRAM_API_URL}/getMe`);
    const botData = await botResponse.json();
    
    if (botData.ok) {
      log(`Бот @${botData.result.username} онлайн!`);
    } else {
      log(`Ошибка получения информации о боте: ${botData.description}`);
    }
    
    let offset = 0;
    
    // Начинаем бесконечный цикл для получения обновлений
    log('Начинаем получать сообщения...');
    
    while (true) {
      try {
        const updates = await getUpdates(offset);
        
        if (updates.length > 0) {
          // Обрабатываем каждое обновление
          for (const update of updates) {
            await processUpdate(update);
            offset = update.update_id + 1;  // Увеличиваем offset для получения следующих обновлений
          }
        }
        
        // Небольшая задержка перед следующим запросом
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        log(`Произошла ошибка: ${error}`);
        // Ждем 5 секунд перед повторной попыткой в случае ошибки
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  } catch (error) {
    log(`Критическая ошибка: ${error}`);
  }
}

// Запускаем бота
startBot();