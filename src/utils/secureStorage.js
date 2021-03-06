import * as Keychain from 'react-native-keychain';

const saveToken = async token => {
  const username = 'token';
  const password = JSON.stringify(token);

  // Store the credentials
  await Keychain.setGenericPassword(username, password);
};

const loadToken = async () => {
  try {
    // Retreive the credentials
    const credentials = await Keychain.getGenericPassword();
    if (credentials) {
      return JSON.parse(credentials.password);
    }
  } catch (error) {
    console.log("Keychain couldn't be accessed!", error);
  }
  return null;
};

const clearToken = () => saveToken({});

export { saveToken, loadToken, clearToken };
