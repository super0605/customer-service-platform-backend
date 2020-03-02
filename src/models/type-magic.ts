import { Model } from "sequelize-typescript";

export type GetExplicitUndefinedType<M> = {
  [P in keyof Required<M>]: undefined extends M[P] ? M[P] | undefined : M[P];
};

type GetDataPropsObjType<M extends Model> = Omit<
  M,
  {
    [P in keyof M]: M[P] extends
      | Model
      | Model[]
      | undefined
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      | ((...args: any[]) => any)
      ? P
      : P extends keyof Model
      ? P
      : never;
  }[keyof M]
>;

type GetUndefinedToNullableType<M> = {
  [P in keyof M]: undefined extends M[P] ? M[P] | null : M[P];
};

export type Undefinable<M> = {
  [P in keyof M]: M[P] | undefined;
};

export type GetModelCreateInputType<
  M extends Model
  // TODO: add explicit undefined
> = GetUndefinedToNullableType<GetDataPropsObjType<M>>;
