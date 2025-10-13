import { Layout } from 'react-admin';
import CustomMenu from './CustomMenu';
import FuturisticBackground from './components/FuturisticBackground';

const CustomLayout = (props) => (
  <FuturisticBackground>
    <Layout {...props} menu={CustomMenu} />
  </FuturisticBackground>
);

export default CustomLayout;