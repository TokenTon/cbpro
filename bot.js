import fetch from 'node-fetch';

// Telegram Bot Token
const TELEGRAM_BOT_TOKEN = '7319839226:AAHKBhjR5s4MFw4E1yFl8URAyFoCrzIpQts';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// Your app URL - use the provided replit URL
const APP_URL = 'https://9c531f92-c005-44b6-9262-31633dc0faf8-00-355idei9zjiw8.riker.replit.dev/telegram.html';

// Logging function
function log(message) {
  console.log(`[${new Date().toLocaleTimeString()}] ${message}`);
}

// Function to set up bot commands
async function setBotCommands() {
  try {
    const response = await fetch(`${TELEGRAM_API_URL}/setMyCommands`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        commands: [
          {
            command: 'start',
            description: 'Start the bot and open the mini app'
          },
          {
            command: 'help',
            description: 'Show help information'
          },
          {
            command: 'about',
            description: 'Learn about this mini app'
          },
          {
            command: 'app',
            description: 'Open the Channel Boost Mini App'
          }
        ]
      })
    });
    
    const data = await response.json();
    
    if (data.ok) {
      log('Bot commands set successfully');
      return true;
    } else {
      log(`Failed to set bot commands: ${data.description}`);
      return false;
    }
  } catch (error) {
    log(`Error setting bot commands: ${error}`);
    return false;
  }
}

// Function to set the web app menu button
async function setWebAppMenuButton() {
  try {
    const response = await fetch(`${TELEGRAM_API_URL}/setChatMenuButton`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        menu_button: {
          type: 'web_app',
          text: 'Channel Boost App',
          web_app: {
            url: APP_URL
          }
        }
      })
    });
    
    const data = await response.json();
    
    if (data.ok) {
      log('Web app menu button set successfully');
      return true;
    } else {
      log(`Failed to set web app menu button: ${data.description}`);
      return false;
    }
  } catch (error) {
    log(`Error setting web app menu button: ${error}`);
    return false;
  }
}

// Function to check bot info
async function getBotInfo() {
  try {
    const response = await fetch(`${TELEGRAM_API_URL}/getMe`);
    const data = await response.json();
    
    if (data.ok) {
      log(`Bot information: ${JSON.stringify(data.result)}`);
      return data.result;
    } else {
      log(`Failed to get bot information: ${data.description}`);
      return null;
    }
  } catch (error) {
    log(`Error getting bot information: ${error}`);
    return null;
  }
}

// Function to start polling for new messages
async function startPolling(offset = 0) {
  try {
    const response = await fetch(`${TELEGRAM_API_URL}/getUpdates?offset=${offset}&timeout=30`);
    const data = await response.json();
    
    if (data.ok) {
      // Process updates
      if (data.result.length > 0) {
        for (const update of data.result) {
          processUpdate(update);
          offset = update.update_id + 1;
        }
      }
      
      // Continue polling
      setTimeout(() => startPolling(offset), 1000);
    } else {
      log(`Failed to get updates: ${data.description}`);
      setTimeout(() => startPolling(offset), 5000);
    }
  } catch (error) {
    log(`Error polling updates: ${error}`);
    setTimeout(() => startPolling(offset), 5000);
  }
}

// Function to send messages
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
      log(`Failed to send message: ${data.description}`);
      return null;
    }
  } catch (error) {
    log(`Error sending message: ${error}`);
    return null;
  }
}

// Function to process updates
async function processUpdate(update) {
  try {
    // Check if this is a message
    if (update.message) {
      const message = update.message;
      const chatId = message.chat.id;
      const text = message.text;
      
      log(`Received message from ${message.from.username || message.from.id}: ${text}`);
      
      // Handle commands
      if (text && text.startsWith('/')) {
        const command = text.split(' ')[0].substring(1);
        
        switch (command) {
          case 'start':
            await sendMessage(chatId, `
<b>Welcome to Channel Boost Mini App!</b>

This bot helps you boost your Telegram channels, participate in lotteries, and earn rewards.

Use the button below to open the mini app.
            `, {
              reply_markup: JSON.stringify({
                inline_keyboard: [
                  [{ text: '🚀 Open Channel Boost App', web_app: { url: APP_URL } }]
                ]
              })
            });
            break;
            
          case 'app':
            await sendMessage(chatId, `
<b>Channel Boost Mini App</b>

Click the button below to open the app:
            `, {
              reply_markup: JSON.stringify({
                inline_keyboard: [
                  [{ text: '🚀 Open Channel Boost App', web_app: { url: APP_URL } }]
                ]
              })
            });
            break;
            
          case 'help':
            await sendMessage(chatId, `
<b>Channel Boost Mini App Help</b>

Here are the available commands:
/start - Start the bot
/app - Open the mini app
/help - Show this help message
/about - About the app
            `);
            break;
            
          case 'about':
            await sendMessage(chatId, `
<b>About Channel Boost Mini App</b>

This mini app allows you to:
- Boost Telegram channels
- Play the tap game to earn PT
- Complete tasks for rewards
- Participate in lotteries
- Earn loyalty points

Version: 1.0.0
            `);
            break;
            
          default:
            await sendMessage(chatId, "I don't recognize that command. Try /help for a list of commands.");
        }
      }
    }
  } catch (error) {
    log(`Error processing update: ${error}`);
  }
}

// Main function to start the bot
async function startBot() {
  log('Starting Channel Boost Bot...');
  
  // Get bot information
  const botInfo = await getBotInfo();
  if (botInfo) {
    log(`Bot @${botInfo.username} is online!`);
  } else {
    log('Warning: Could not get bot information.');
  }
  
  // Set bot commands
  await setBotCommands();
  
  // Set web app menu button
  await setWebAppMenuButton();
  
  // Start polling for new messages
  log('Starting to poll for new messages...');
  startPolling();
}

// Start the bot
startBot();