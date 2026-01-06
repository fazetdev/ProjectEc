// Termux-compatible database connection
// Uses mock database in Termux, real MongoDB in production

console.log('🔧 Database Configuration');
console.log('Platform:', process.platform);
console.log('Node:', process.version);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Check if we're in Termux
const isTermux = process.platform === 'android';
const isDevelopment = process.env.NODE_ENV === 'development';

// In Termux development, always use mock
const useMock = isTermux && isDevelopment;

if (useMock) {
  console.log('📱 Termux Development Detected');
  console.log('⚡ Using FAST mock database');
  console.log('💾 Data stored in memory (resets on restart)');
  console.log('🌐 Deploy to Vercel for real MongoDB Atlas');
}

let clientPromise;

if (useMock) {
  // Simple, fast mock database for Termux
  const mockData = {
    products: [],
    lastId: 0
  };
  
  const mockDB = {
    connect: async () => {
      console.log('✅ Mock database ready');
      return mockDB;
    },
    
    db: () => ({
      collection: (name) => {
        // Initialize collection if not exists
        if (!mockData[name]) {
          mockData[name] = [];
        }
        
        return {
          insertOne: async (doc) => {
            mockData.lastId++;
            const id = `mock_${mockData.lastId}_${Date.now()}`;
            const document = { ...doc, _id: id };
            mockData[name].push(document);
            console.log(`📝 Mock: Added "${doc.name || 'item'}" to ${name}`);
            return { insertedId: id, document };
          },
          
          insertMany: async (docs) => {
            const insertedIds = [];
            docs.forEach(doc => {
              mockData.lastId++;
              const id = `mock_${mockData.lastId}_${Date.now()}`;
              mockData[name].push({ ...doc, _id: id });
              insertedIds.push(id);
            });
            console.log(`📝 Mock: Added ${docs.length} items to ${name}`);
            return { insertedIds, documents: docs };
          },
          
          find: (query = {}) => ({
            toArray: async () => {
              // Simple filtering (for bundleId queries)
              let results = [...mockData[name]];
              if (query.bundleId) {
                results = results.filter(item => item.bundleId === query.bundleId);
              }
              console.log(`📝 Mock: Found ${results.length} items in ${name}`);
              return results;
            }
          }),
          
          countDocuments: async (query = {}) => {
            let count = mockData[name].length;
            if (query.bundleId) {
              count = mockData[name].filter(item => item.bundleId === query.bundleId).length;
            }
            return count;
          }
        };
      }
    }),
    
    close: async () => {
      console.log('🔌 Mock database closed');
    }
  };
  
  clientPromise = Promise.resolve(mockDB);
  
} else {
  // Real MongoDB for production/Vercel
  const { MongoClient } = require('mongodb');
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    throw new Error('MONGODB_URI is not defined for production');
  }
  
  console.log('🌐 Using real MongoDB Atlas');
  const options = {
    tls: true,
    ssl: true,
    serverSelectionTimeoutMS: 10000,
  };
  
  const client = new MongoClient(uri, options);
  clientPromise = client.connect()
    .then(client => {
      console.log('✅ Connected to MongoDB Atlas');
      return client;
    })
    .catch(error => {
      console.error('❌ MongoDB connection failed:', error.message);
      throw error;
    });
}

export default clientPromise;
