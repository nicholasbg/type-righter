export type FunctionType = (...args: unknown[]) => unknown;
export type NaNType = number & { __brand: "NaN" };
export type Nullish = undefined | null;
export type Falsy = false | 0 | 0n | "" | Nullish | NaNType;
export type Constructor<
  T = unknown,
  Args extends unknown[] = unknown[],
> = abstract new (...args: Args) => T;

type TypeMap = {
  String: string;
  Number: number;
  Boolean: boolean;
  BigInt: bigint;
  Symbol: symbol;
  Function: FunctionType;
  Object: object;
  Array: unknown[];
  Date: Date;
  IterableObj: Iterable<unknown>;
  Null: null;
  Undefined: undefined;
  Nullish: Nullish;
  Falsy: Falsy;
  NaNType: NaNType;
};

type NormalizeTypeName<S extends string, Map> = S extends keyof Map
  ? S
  : S extends `${infer Base}s`
    ? Base extends keyof Map
      ? Base
      : never
    : never;

type ParseTypeExpression<
  S extends string,
  Map,
> = S extends `${infer Left}Or${infer Right}`
  ? ParseTypeExpression<Left, Map> | ParseTypeExpression<Right, Map>
  : NormalizeTypeName<S, Map> extends infer Name extends keyof Map
    ? Map[Name]
    : never;

type ExpressionType<
  K extends string,
  Prefix extends string,
  Map,
> = K extends `${Prefix}${infer Expression}`
  ? ParseTypeExpression<Expression, Map>
  : never;

type OrChainOf<T extends string> = T | `${T}Or${T}` | `${T}Or${T}Or${T}`;
type AreChainOf<T extends string> = OrChainOf<T> | OrChainOf<`${T}s`>;

type ArePredicate<T> = {
  (vals: unknown[]): vals is T[];
  (vals: readonly unknown[]): vals is readonly T[];
  (vals: Iterable<unknown>): vals is Iterable<T>;
};

export type BaseIsTypeCheck = (val: unknown) => boolean;
export type BaseAreTypeCheck = (vals: Iterable<unknown>) => boolean;

export type TypeCheckFor<Map extends object> = {
  [K in `is${OrChainOf<Extract<keyof Map, string>>}`]: (
    value: unknown,
  ) => value is ExpressionType<K, "is", Map>;
} & {
  [K in `are${AreChainOf<Extract<keyof Map, string>>}`]: ArePredicate<
    ExpressionType<K, "are", Map>
  >;
} & {
  [key: `are${string}`]: BaseAreTypeCheck | undefined;
} & {
  [key: string]: BaseIsTypeCheck | undefined;
};

export type TypeCheck = TypeCheckFor<TypeMap>;
