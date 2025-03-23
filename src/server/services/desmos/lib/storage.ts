// export type Serializable =
//   | string
//   | number
//   | boolean
//   | Serializable[]
//   | SerializableRecord
//   | null;
// interface SerializableRecord extends Record<string, Serializable> {}

// interface Options {
//   /**
//    * If specified, the `userId` is used with the `key` as a composite key.
//    */
//   userId?: string;
// }

// export interface DataStorage {
//   set: (key: string, value: Serializable, opts?: Options) => void;
//   get: (key: string, opts?: Options) => Serializable;
//   has: (key: string, opts?: Options) => boolean;
// }

// let data = {
//   global: Object.create(null),
//   forUser: Object.create(null),
// };

// export function createDataStorage(projectId: string): DataStorage {
//   const storage: DataStorage = {
//     set(key, value, opts) {
//       if (opts && opts.userId) {
//         if (data.forUser[opts.userId] === undefined) {
//           data.forUser[opts.userId] = Object.create(null);
//         }
//         data.forUser[opts.userId][key] = value;
//       } else {
//         data.global[key] = value;
//       }
//     },
//     get(key, opts) {
//       return false;
//     },
//     has(key, opts) {
//       return false;
//     },
//   };

//   return storage;
// }

// // Решил пока бд сюда не подключать
// // Подключу потом наверное, но только для бэкапов, а не для взаимодействия в реальном времени
