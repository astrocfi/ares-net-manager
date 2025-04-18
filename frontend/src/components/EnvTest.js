import React from 'react';

const EnvTest = () => {
  console.log('Environment variables:', {
    REACT_APP_API_URL: process.env.REACT_APP_API_URL,
    NODE_ENV: process.env.NODE_ENV,
  });

  return (
    <div>
      <h2>Environment Variables Test</h2>
      <pre>
        {JSON.stringify({
          REACT_APP_API_URL: process.env.REACT_APP_API_URL,
          NODE_ENV: process.env.NODE_ENV,
        }, null, 2)}
      </pre>
    </div>
  );
};

export default EnvTest;
