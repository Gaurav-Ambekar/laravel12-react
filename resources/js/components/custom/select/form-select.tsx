/**
 * form-select.tsx
 *
 * Wires Select to an Inertia useForm field.
 * All option mapping, creatable state, and form sync are owned here — not in the parent.
 *
 * ─── Static single ────────────────────────────────────────────────────────────
 *
 *   <FormSelect form={form} field="color_id" items={colors} />
 *
 * ─── Static multi ─────────────────────────────────────────────────────────────
 *
 *   <FormMultiSelect form={form} field="color_ids" items={colors} />
 *
 * ─── Static creatable — component owns the growing list ───────────────────────
 *
 *   <FormSelect form={form} field="color_id" items={colors} creatable />
 *
 *   <FormMultiSelect form={form} field="color_ids" items={colors} creatable />
 *
 * ─── Async single ─────────────────────────────────────────────────────────────
 *
 *   <FormSelect form={form} field="color_id" fetchOptions={Colors.fetch} />
 *
 * ─── Async multi + server creatable ──────────────────────────────────────────
 *
 *   <FormMultiSelect form={form} field="color_ids" fetchOptions={Colors.fetch} onCreate={Colors.create} />
 *
 * ─── Edit forms (pre-select existing value) ───────────────────────────────────
 *
 *   <FormSelect
 *     form={form} field="color_id"
 *     fetchOptions={Colors.fetch}
 *     initial={{ value: String(color.id), label: color.name }}
 *   />
 */

import { Entity } from '@/types/select';
import { useCallback, useRef, useState } from 'react';
import { FetchResult, Option, Select, SelectProps } from '.';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormHandle<TData extends Record<string, unknown>> {
    errors: Partial<Record<keyof TData, string>>;
    setData: (key: keyof TData, value: unknown) => void;
}

function toOptions(items: Entity[]): Option[] {
    return items.map((item) => ({ value: String(item.id), label: item.name }));
}

// Shared extra props — everything SelectProps accepts except the controlled ones
type SharedSelectProps = Omit<SelectProps<false>, 'value' | 'onChange' | 'multiple' | 'invalid' | 'options' | 'onCreate'>;

// ─── FormSelect — single ──────────────────────────────────────────────────────

type FormSelectProps<TData extends Record<string, unknown>> = {
    form: FormHandle<TData>;
    field: keyof TData;
    newField?: keyof TData | null;
    initial?: Option | null;
} & (
    | {
          /** Static options from page props — component handles mapping + creatable state */
          items: Entity[];
          /** Allow user to add new options locally (no server call) */
          creatable?: boolean;
          fetchOptions?: never;
          onCreate?: never;
      }
    | {
          items?: never;
          creatable?: never;
          /** Async paginated fetch */
          fetchOptions: (search: string, page: number) => Promise<FetchResult>;
          /** Server creation — fires POST, returns created Option */
          onCreate?: (name: string) => Promise<Option>;
      }
) &
    SharedSelectProps;

export function FormSelect<TData extends Record<string, unknown>>({
    form,
    field,
    newField = null,
    initial = null,
    items,
    creatable = false,
    fetchOptions,
    onCreate,
    ...rest
}: FormSelectProps<TData>) {
    const [selected, setSelected] = useState<Option | null>(initial);

    // Static creatable state — owned here, invisible to the parent
    const [options, setOptions] = useState<Option[]>(() => (items ? toOptions(items) : []));
    const localIdRef = useRef(-1);

    const onChange = useCallback(
        (opt: Option | null) => {
            setSelected(opt);
            form.setData(field, opt?.value ?? '');
            // eslint-disable-next-line react-hooks/exhaustive-deps
        },
        [field],
    );

    const resolvedOnCreate: ((name: string) => Promise<Option>) | undefined = creatable
        ? async (name: string): Promise<Option> => {
              const id = localIdRef.current--;
              const opt: Option = { value: String(id), label: name };
              setOptions((prev) => [...prev, opt]);
              newField && form.setData(newField, name);
              return opt;
          }
        : onCreate;

    return (
        <Select
            {...rest}
            options={items ? options : undefined}
            fetchOptions={fetchOptions}
            value={selected}
            onChange={onChange}
            onCreate={resolvedOnCreate}
            invalid={!!form.errors[field]}
        />
    );
}

// ─── FormMultiSelect — multi ──────────────────────────────────────────────────

type FormMultiSelectProps<TData extends Record<string, unknown>> = {
    form: FormHandle<TData>;
    field: keyof TData;
    initial?: Option[];
} & (
    | {
          items: Entity[];
          creatable?: boolean;
          fetchOptions?: never;
          onCreate?: never;
      }
    | {
          items?: never;
          creatable?: never;
          fetchOptions: (search: string, page: number) => Promise<FetchResult>;
          onCreate?: (name: string) => Promise<Option>;
      }
) &
    Omit<SelectProps<true>, 'value' | 'onChange' | 'multiple' | 'invalid' | 'options' | 'onCreate'>;

export function FormMultiSelect<TData extends Record<string, unknown>>({
    form,
    field,
    initial = [],
    items,
    creatable = false,
    fetchOptions,
    onCreate,
    ...rest
}: FormMultiSelectProps<TData>) {
    const [selected, setSelected] = useState<Option[]>(initial);

    const [options, setOptions] = useState<Option[]>(() => (items ? toOptions(items) : []));
    const localIdRef = useRef(-1);

    const onChange = useCallback(
        (opts: Option[]) => {
            setSelected(opts);
            form.setData(
                field,
                opts.map((o) => o.value),
            );
            // eslint-disable-next-line react-hooks/exhaustive-deps
        },
        [field],
    );

    const resolvedOnCreate: ((name: string) => Promise<Option>) | undefined = creatable
        ? async (name: string): Promise<Option> => {
              const id = localIdRef.current--;
              const opt: Option = { value: String(id), label: name };
              setOptions((prev) => [...prev, opt]);
              return opt;
          }
        : onCreate;

    return (
        <Select
            {...rest}
            multiple
            options={items ? options : undefined}
            fetchOptions={fetchOptions}
            value={selected}
            onChange={onChange}
            onCreate={resolvedOnCreate}
            invalid={!!form.errors[field]}
        />
    );
}

export type { FetchResult, Option };
