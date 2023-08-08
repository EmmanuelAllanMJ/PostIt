import * as redis from 'redis';


// Environment variables for cache
const cacheHostName = process.env.AZURE_CACHE_FOR_REDIS_HOST_NAME;
const cachePassword = process.env.AZURE_CACHE_FOR_REDIS_ACCESS_KEY;

if (!cacheHostName) throw Error("AZURE_CACHE_FOR_REDIS_HOST_NAME is empty");
if (!cachePassword) throw Error("AZURE_CACHE_FOR_REDIS_ACCESS_KEY is empty");

// Connection configuration
export const Redis = redis.createClient({
    // rediss for TLS
    url: `rediss://${cacheHostName}`,
    password: cachePassword
});



// Connect to Redis
// await cacheConnection.connect();


// Disconnect
// cacheConnection.disconnect()
