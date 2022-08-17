import React from 'react';
import logo from './logo.svg';
import { Counter } from './features/counter/Counter';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';

function App() {
  return (
    <Container sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
      <img src={logo} alt="logo" />
      <Counter />
      <p>
        Edit <code>src/App.tsx</code> and save to reload.
      </p>
      <span>
        <span>Learn </span>
        <Link
          href="https://reactjs.org/"
          target="_blank"
          rel="noopener noreferrer"
        >
          React
        </Link>
        <span>, </span>
        <Link
          href="https://redux.js.org/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Redux
        </Link>
        <span>, </span>
        <Link
          href="https://redux-toolkit.js.org/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Redux Toolkit
        </Link>
        ,<span> and </span>
        <Link
          href="https://react-redux.js.org/"
          target="_blank"
          rel="noopener noreferrer"
        >
          React Redux
        </Link>
      </span>
    </Container>
  );
}

export default App;
