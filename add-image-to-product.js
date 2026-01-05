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
    
    // Update the existing product to add an image URL
    // Using a placeholder image for now - you can replace with your Vercel image later
    const result = await products.updateOne(
      { name: "Classic Running Shoes" },
      { 
        $set: { 
          imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        } 
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log('✅ Added image URL to existing product');
    } else {
      console.log('⚠️  Product not found or already has image');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('✅ Connection closed');
  }
}

main();
