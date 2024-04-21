import type {
  IDBPTransaction,
  IndexNames,
  StoreKey,
  StoreNames,
  StoreValue,
} from 'idb';
import type { IDBFactory } from './IDBFactory';

type StoreRecordKey<T, S extends StoreNames<T> = StoreNames<T>> = StoreKey<
  T,
  S
>;
type StoreRecordValue<T, S extends StoreNames<T> = StoreNames<T>> = StoreValue<
  T,
  S
>;
type StoreIndexNames<T, S extends StoreNames<T>> = IndexNames<T, S>;
type StoreRecord<T, S extends StoreNames<T> = StoreNames<T>> = {
  /**
   * Should not be provided for object stores using in-line keys.
   *
   * for example a profile object store using `profileId` as keyPath
   */
  key?: StoreRecordKey<T, S>;
  value: StoreRecordValue<T, S>;
};
type QueryStore<T, S> = {
  key?: IDBKeyRange;
  count?: number;
  indexName: StoreIndexNames<T, S>;
};

type IDBTransaction<
  T,
  S extends StoreNames<T>,
  M extends IDBTransactionMode
> = IDBPTransaction<T, S[], M>;
interface TransactionCallback<
  T,
  M extends IDBTransactionMode,
  S extends StoreNames<T> = StoreNames<T>
> {
  (tx: IDBTransaction<T, S, M>): unknown | Promise<unknown>;
}

type MethodNames = keyof IDBFactory<T>;
type IDBMethodType<T extends DBSchema> = IDBFactory<T>[MethodNames<T>];
