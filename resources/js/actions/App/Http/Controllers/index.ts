import Dashboards from './Dashboards'
import Settings from './Settings'
import Auth from './Auth'
const Controllers = {
    Dashboards: Object.assign(Dashboards, Dashboards),
Settings: Object.assign(Settings, Settings),
Auth: Object.assign(Auth, Auth),
}

export default Controllers