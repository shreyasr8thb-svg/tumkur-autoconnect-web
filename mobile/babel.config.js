// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // IMPORTANT: react-native-reanimated MUST be last
      'react-native-reanimated/plugin',
    ],
  };
};
