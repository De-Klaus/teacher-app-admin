import { Layout } from 'react-admin';
import CustomMenu from './CustomMenu';

const CustomLayout = (props) => <Layout {...props} menu={CustomMenu} />;

export default CustomLayout;