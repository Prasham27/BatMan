export interface RouteEntry {
  href: string;
  label: string;
  codename: string;
  key: string;
}

export const ROUTES: RouteEntry[] = [
  { href: '/', label: 'Cave', codename: 'CAVE', key: 'cave' },
  { href: '/overview', label: 'Overview', codename: 'OVERVIEW', key: 'overview' },
  { href: '/cases', label: 'Cases', codename: 'CASES', key: 'cases' },
  { href: '/loadout', label: 'Loadout', codename: 'EQUIPMENT', key: 'loadout' },
  { href: '/log', label: 'Log', codename: 'MISSION_LOG', key: 'log' },
  { href: '/network', label: 'Network', codename: 'NETWORK', key: 'network' },
  { href: '/channel', label: 'Channel', codename: 'COMMS', key: 'channel' },
];

/** Where the "home" of the Batcomputer (post-cave) lives. */
export const HOME_HREF = '/overview';
