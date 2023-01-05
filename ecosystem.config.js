
module.exports = {
  apps: [
    {
      name: 'api',
      script: 'pnpm --dir /home/deployer/api/current start',
      watch: '/home/deployer/api/current',
      autorestart: true,
      restart_delay: 1000,
      env: {

      },
      env_production: {
        NODE_ENV: 'production',
        instances: 'max',
        exec_mode: 'cluster'
      }
    }
  ]
};