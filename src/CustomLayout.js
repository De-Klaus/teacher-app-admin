import { Layout } from 'react-admin';
import CustomMenu from './CustomMenu';
import FuturisticBackground from './components/FuturisticBackground';
import CustomAppBar from './CustomAppBar';

const CustomLayout = (props) => (
  <FuturisticBackground>
    <Layout {...props} menu={CustomMenu} appBar={CustomAppBar} />
  </FuturisticBackground>
);

export default CustomLayout;