module.exports = (serverless) => {
  const { stage } = serverless.options;

  switch (stage) {
    case 'staging':
      return 'staging';
    case 'production':
      return 'production';
    case 'rbc':
      return 'rbc';
    case 'demo':
      return 'demo';
    case 'development': default:
      return 'development';
  }
};
