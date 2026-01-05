const { MongoClient } = require('mongodb');
const fs = require('fs');

async function main() {
  // Read from .env.local
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const uriMatch = envContent.match(/MONGODB_URI=(.+)/);
  
  if (!uriMatch) {
    console.error('❌ MONGODB_URI not found in .env.local');
    return;
  }
  
  const uri = uriMatch[1].trim();
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('shoetracker');
    const products = db.collection('products');
    
    // Delete the mock product
    const result = await products.deleteOne({ 
      name: "Classic Running Shoes" 
    });
    
    if (result.deletedCount > 0) {
      console.log('✅ Mock product removed from database');
    } else {
      console.log('⚠️  Mock product not found (might have been removed already)');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('✅ Connection closed');
  }
}

main();
