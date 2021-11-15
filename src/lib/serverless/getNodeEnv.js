module.exports = (serverless) => {
  const { stage } = serverless.options;

  switch (stage) {
    case 'staging':
      return 'staging';
    case 'production':
      return 'production';
    case 'demo':
      return 'demo';
    case 'development': default:
      return 'development';
  }
};
