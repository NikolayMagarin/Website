export const storage: Storage = {
  users: {},
  global: {
    chat: {
      messages: [],
    },
  },
};

interface UserStorage {
  name: string;
  currentMessageTimings: number[];
  endOfMessageTimeout: NodeJS.Timeout | null;
}

interface Message {
  userName: string;
  text: string;
}

interface Storage {
  users: Record<string, UserStorage>;
  global: {
    chat: {
      messages: Message[];
    };
  };
}
