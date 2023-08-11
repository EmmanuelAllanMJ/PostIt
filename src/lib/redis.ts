import * as redis from 'redis';

// Environment variables for cache
const cacheHostName = process.env.AZURE_CACHE_FOR_REDIS_HOST_NAME;
const cachePassword = process.env.AZURE_CACHE_FOR_REDIS_ACCESS_KEY;

if (!cacheHostName) throw new Error("AZURE_CACHE_FOR_REDIS_HOST_NAME is empty");
if (!cachePassword) throw new Error("AZURE_CACHE_FOR_REDIS_ACCESS_KEY is empty");

    // export const Redis = redis.createClient({
    //   url: `rediss://${cacheHostName}`,
    //   password: cachePassword
    // });
    export const Redis = redis.createClient({ socket: { host: cacheHostName, port: 6380, tls: true }, password: cachePassword,    legacyMode: true
    });

// Create Redis cache connection
// async function Redis() {
//     const cacheConnection = redis.createClient({
//       url: `rediss://${cacheHostName}`,
//       password: cachePassword
//     });
  
//     await new Promise((resolve, reject) => {
//       cacheConnection.on('connect', resolve);
//       cacheConnection.on('error', reject);
//     });
  
//     return cacheConnection;
//   }
  
// // Export the cache connection
// export default Redis;


// Connect to Redis
// await cacheConnection.connect();


// Disconnect
// cacheConnection.disconnect()
