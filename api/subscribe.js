// api/subscribe.js
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  const { email } = req.body;
  
  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }
  
  const filePath = path.join(process.cwd(), 'api', 'subscribers.json');
  let subscribers = [];
  
  if (existsSync(filePath)) {
    try {
      const data = readFileSync(filePath, 'utf-8');
      subscribers = JSON.parse(data);
    } catch (error) {
      console.error("Error reading subscribers file:", error);
      res.status(500).json({ error: 'Error reading subscribers file' });
      return;
    }
  }
  
  if (!subscribers.includes(email)) {
    subscribers.push(email);
    writeFileSync(filePath, JSON.stringify(subscribers, null, 2));
  }
  
  res.status(200).json({ message: 'Subscription successful', subscribers });
}
