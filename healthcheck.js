// Health check script for Docker - checks HTTP endpoint
const http = require('http');

async function healthCheck() {
    const port = process.env.HEALTH_PORT || 15015;
    
    const options = {
        hostname: 'localhost',
        port: port,
        path: '/health',
        method: 'GET',
        timeout: 5000
    };

    const req = http.request(options, (res) => {
        let data = '';
  
        res.on('data', (chunk) => {
            data += chunk;
        });
  
        res.on('end', () => {
            try {
                const healthData = JSON.parse(data);
                if (healthData.status === 'healthy') {
                    console.log('Health check passed: Bot is healthy');
                    process.exit(0);
                } else {
                    console.error('Health check failed: Bot is unhealthy');
                    console.error('Health data:', healthData);
                    process.exit(1);
                }
            } catch (error) {
                console.error('Health check failed: Invalid response');
                console.error('Response:', data);
                process.exit(1);
            }
        });
    });

    req.on('error', (error) => {
        console.error('Health check failed:', error.message);
        process.exit(1);
    });

    req.on('timeout', () => {
        console.error('Health check failed: Request timeout');
        req.destroy();
        process.exit(1);
    });

    req.end();
}

healthCheck();