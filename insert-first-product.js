const { MongoClient } = require('mongodb');

async function main() {
  // Read from .env.local file directly
  const fs = require('fs');
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const uriMatch = envContent.match(/MONGODB_URI=(.+)/);
  
  if (!uriMatch) {
    console.error('❌ MONGODB_URI not found in .env.local');
    return;
  }
  
  const uri = uriMatch[1].trim();
  console.log('Connecting with URI (first 50 chars):', uri.substring(0, 50) + '...');
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('shoetracker');
    const products = db.collection('products');
    
    const firstProduct = {
      name: "Classic Running Shoes",
      description: "Comfortable running shoes for daily use",
      price: 45.99,
      sellingPrice: 89.99,
      expectedProfit: 44.00,
      actualProfit: 0,
      genderCategory: "neutral",
      ageGroup: "neutral",
      sizes: ["7", "8", "9", "10"],
      stockCount: 10,
      isSold: false,
      dateAdded: new Date(),
      dateSold: null
    };
    
    const result = await products.insertOne(firstProduct);
    console.log(`✅ Product inserted with _id: ${result.insertedId}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('✅ Connection closed');
  }
}

main();
