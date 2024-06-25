import { useEffect, useState } from 'react';
import {
  reactExtension,
  useApi,
  AdminAction,
  BlockStack,
  Button,
  Text,
} from '@shopify/ui-extensions-react/admin';

// The target used here must match the target used in the extension's toml file (./shopify.extension.toml)
const TARGET = 'admin.product-details.action.render';

export default reactExtension(TARGET, () => <App />);

function App() {
  // The useApi hook provides access to several useful APIs like i18n, close, and data.
  const { i18n, close, data } = useApi(TARGET);
  console.log({ data });
  const [productTitle, setProductTitle] = useState('');

  // Load the Facebook SDK
  useEffect(() => {
    window.fbAsyncInit = function () {
      FB.init({
        appId: '{your-app-id}', // Replace with your Facebook App ID
        cookie: true,
        xfbml: true,
        version: 'v11.0', // Replace with the Facebook API version you want to use
      });
      FB.AppEvents.logPageView();
    };

    (function (d, s, id) {
      var js,
        fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
        return;
      }
      js = d.createElement(s);
      js.id = id;
      js.src = 'https://connect.facebook.net/en_US/sdk.js';
      fjs.parentNode.insertBefore(js, fjs);
    })(document, 'script', 'facebook-jssdk');
  }, []);

  // Fetch product information
  useEffect(() => {
    (async function getProductInfo() {
      const getProductQuery = {
        query: `query Product($id: ID!) {
          product(id: $id) {
            title
          }
        }`,
        variables: { id: data.selected[0].id },
      };

      const res = await fetch('shopify:admin/api/graphql.json', {
        method: 'POST',
        body: JSON.stringify(getProductQuery),
      });

      if (!res.ok) {
        console.error('Network error');
      }

      const productData = await res.json();
      setProductTitle(productData.data.product.title);
    })();
  }, [data.selected]);

  const handleFBLogin = () => {
    FB.login(
      (response) => {
        if (response.authResponse) {
          console.log('Welcome! Fetching your information...');
          FB.api('/me', { fields: 'id,name,email' }, function (response) {
            console.log('Good to see you, ' + response.name + '.');
            // Handle the response and save the access token or user data as needed
            fetch('/api/store-facebook-token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ accessToken: response.authResponse.accessToken }),
            })
              .then((res) => res.json())
              .then((data) => {
                console.log('Token stored:', data);
              })
              .catch((error) => {
                console.error('Error storing token:', error);
              });
          });
        } else {
          console.log('User cancelled login or did not fully authorize.');
        }
      },
      { scope: 'email,public_profile' }
    );
  };

  return (
    <AdminAction
      primaryAction={
        <Button
          onPress={() => {
            console.log('saving');
            close();
          }}
        >
          Done
        </Button>
      }
      secondaryAction={
        <Button
          onPress={() => {
            console.log('closing');
            close();
          }}
        >
          Close
        </Button>
      }
    >
      <BlockStack>
        {/* Set the translation values for each supported language in the locales directory */}
        <Text fontWeight="bold">{i18n.translate('welcome', { TARGET })}</Text>
        <Text>Current product: {productTitle}</Text>
        <Button onPress={handleFBLogin}>Login with Facebook</Button>
      </BlockStack>
    </AdminAction>
  );
}
