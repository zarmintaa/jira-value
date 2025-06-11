interface User {
  name: string;
  email: string;
  avatar: string;
}

interface Stat {
  label: string;
  value: string | number;
  icon: string;
}

export interface RankedUser {
  rank: number;
  user: User;
  stats: Stat[];
}
