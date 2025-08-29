module.exports = {
  apps: [
    {
      name: 'backend',
      script: 'index.js',
      cwd: '/app/backend',
      env: {
        NODE_ENV: 'production',
        MONGODB_URI:'mongodb+srv://yadavanubhav848:zHjucA4rNlmQNaay@cluster1.hcyqa2d.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1',
        PORT: 5000
      },
      instances: 1,
      exec_mode: 'fork'
    },
    {
      name: 'frontend',
      script: 'npx',
      args: 'serve -s . -l 8080',
      cwd: '/app/frontend',
      env: {
        NODE_ENV: 'production'
      },
      instances: 1,
      exec_mode: 'fork'
    }
  ]
};