import { IDBFactory } from '../IDBFactory';
import { dbConstants } from './constants';
import { FramrDBSchema } from './schema';

export class IDBConnection {
  private static db: IDBFactory<FramrDBSchema>;

  static getDatabase() {
    if (!IDBConnection.db) {
      IDBConnection.db = new IDBFactory<FramrDBSchema>(
        dbConstants.DB_NAME,
        dbConstants.DB_VERSION,
        {
          upgrade(db) {
            for (const store of Object.values(dbConstants.DB_STORES)) {
              db.createObjectStore(
                store as keyof typeof dbConstants.DB_STORES,
                {
                  keyPath: 'id',
                }
              );
            }
          },
        }
      );
    }

    return IDBConnection.db;
  }
}
