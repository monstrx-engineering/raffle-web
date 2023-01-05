module.exports = (shipit) => {
	require('shipit-deploy')(shipit);
	require('shipit-shared')(shipit);

	const appName = 'api';

	shipit.initConfig({
		default: {
			keepWorkspace: false,
			repositoryUrl: 'https://github.com/monstrx-engineering/sui-testnet-raffle',
			shallowClone: true,

			deployTo: '/home/deployer/' + appName,
			shared: {
				overwrite: true,
				dirs: ['node_modules'],
			},
			keepReleases: 3,
			deleteOnRollback: false,
			ignores: ['.git', 'node_modules'],
		},
		staging: {
			servers: 'user@myserver.com',
		},
		production: {
			servers: 'deployer@exabyte',
		},
	});

	const path = require('path');
	const configFilePath = path.join(shipit.config.deployTo, 'shared', 'ecosystem.config.js');

	shipit.on('updated', async () => {
		shipit.start('install', 'copy-config', 'build');
	});
	
  shipit.on('rollback', async () => {
		shipit.start('install', 'copy-config');
	});

	shipit.on('published', () => {
		shipit.start('start-server');
	});

	shipit.task('copy-config', async () => {
		const fs = require('fs');
		const ecosystem = `
module.exports = {
  apps: [
    {
      name: '${appName}',
      script: 'pnpm --dir /home/deployer/${appName}/current start',
      watch: '/home/deployer/${appName}/current',
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
};`;

		fs.writeFileSync('ecosystem.config.js', ecosystem, function (err) {
			if (err) throw err;
			console.log('File created successfully.');
		});

		await shipit.copyToRemote('ecosystem.config.js', configFilePath);
	});

	shipit.task('install', async () => {
		await shipit.remote(`cd ${shipit.releasePath} && pnpm install --production`);
	});

	shipit.task('build', async () => {
		await shipit.remote(`cd ${shipit.releasePath} && pnpm build`);
	});

	shipit.task('start-server', async () => {
		await shipit.remote(`pm2 delete -s ${appName} || :`);
		await shipit.remote(`pm2 start ${configFilePath} --env production`);
	});
};
