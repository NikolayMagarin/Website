interface UserStorage {
  id: string;
  name: string;
  clientIp: string | null;
  requestAccumulator: number;
  endOfMessageTimeout: NodeJS.Timeout | null;
  madeMove: boolean;
  errorToDisplay: 'occupied' | 'secondmove' | null;
}

interface Storage {
  users: Record<string, UserStorage>;
  global: {
    game: {
      data: [
        0 | 1 | 2,
        0 | 1 | 2,
        0 | 1 | 2,
        0 | 1 | 2,
        0 | 1 | 2,
        0 | 1 | 2,
        0 | 1 | 2,
        0 | 1 | 2,
        0 | 1 | 2
      ];
      curMove: 1 | 2;
      lastMovedUserId: string | null;
    };
  };
}

export const storage: Storage = {
  users: {},
  global: {
    game: {
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0],
      curMove: 1,
      lastMovedUserId: null,
    },
  },
};

export function getUserByClientIp(clientIp: string): UserStorage | null {
  return (
    Object.values(storage.users).find((user) => user.clientIp === clientIp) ||
    null
  );
}
