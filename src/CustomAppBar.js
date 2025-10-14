import React from 'react';
import { AppBar } from 'react-admin';

const CustomAppBar = (props) => (
  <AppBar {...props} userMenu={false} />
);

export default CustomAppBar;


