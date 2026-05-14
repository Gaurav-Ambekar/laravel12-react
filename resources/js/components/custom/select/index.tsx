/**
 * select.tsx
 *
 * A single controlled select component that handles every use case:
 *   - Static options (from page props)
 *   - Async paginated fetch (from server)
 *   - Creatable (local or server-side)
 *   - Single or multi select
 *
 * Do not use this directly in forms — use FormSelect / FormMultiSelect
 * from form-select.tsx which handle Inertia form wiring automatically.
 *
 * Direct use (when you manage value/onChange yourself):
 *
 *   // Static single
 *   <Select options={colors} value={selected} onChange={setSelected} />
 *
 *   // Static multi
 *   <Select options={colors} multiple value={selected} onChange={setSelected} />
 *
 *   // Async single
 *   <Select fetchOptions={fetchColors} value={selected} onChange={setSelected} />
 *
 *   // Async multi + creatable
 *   <Select
 *     multiple
 *     fetchOptions={fetchColors}
 *     onCreate={createColor}
 *     value={selected}
 *     onChange={setSelected}
 *   />
 */

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ChevronDown, Loader2, Plus, X } from 'lucide-react';
import { KeyboardEvent, useCallback, useEffect, useId, useRef, useState } from 'react';

// ─── Public types ─────────────────────────────────────────────────────────────

export interface Option {
    value: string;
    label: string;
    [key: string]: unknown;
}

export interface FetchResult {
    options: Option[];
    hasMore: boolean;
}

export type SingleValue = Option | null;
export type MultiValue = Option[];

export interface SelectProps<TMultiple extends boolean = false> {
    // ── Data source — provide exactly one ─────────────────────────────────────
    /** Static list. Filtered client-side. Use when data comes from page props. */
    options?: Option[];
    /**
     * Async paginated fetch (search, page) → FetchResult.
     * Called on open, debounced search change, and scroll-to-bottom.
     * Your endpoint: GET /resource?search=&page=&per_page=
     *   → { data: Entity[], next_page_url: string | null }
     */
    fetchOptions?: (search: string, page: number) => Promise<FetchResult>;

    // ── Creation ──────────────────────────────────────────────────────────────
    /**
     * Called when user confirms a new option.
     * For local creation: add to state, return the Option.
     * For server creation: POST → return the created Option (throw to cancel).
     * Omit to disable creation.
     */
    onCreate?: (inputValue: string) => Promise<Option>;

    // ── Value (controlled) ────────────────────────────────────────────────────
    value: TMultiple extends true ? MultiValue : SingleValue;
    onChange: TMultiple extends true ? (value: MultiValue) => void : (value: SingleValue) => void;
    multiple?: TMultiple;
    tabIndex?: number;

    // ── Display ───────────────────────────────────────────────────────────────
    placeholder?: string;
    searchPlaceholder?: string;
    createLabel?: string;
    /** Multi: max badges shown before "+N more" (default 3) */
    maxDisplayed?: number;

    // ── Behaviour ─────────────────────────────────────────────────────────────
    disabled?: boolean;
    /** Debounce ms for search before fetching (default 300) */
    debounceMs?: number;
    /** Triggers red border — pass !!form.errors.field_name */
    invalid?: boolean;

    // ── Styling ───────────────────────────────────────────────────────────────
    className?: string;
}

// ─── Internal ─────────────────────────────────────────────────────────────────

interface FetchState {
    options: Option[];
    page: number;
    hasMore: boolean;
    loading: boolean;
    loadingMore: boolean;
    error: string | null;
}

const INITIAL_FETCH: FetchState = {
    options: [],
    page: 1,
    hasMore: false,
    loading: false,
    loadingMore: false,
    error: null,
};

function useDebounce<T>(value: T, ms: number): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), ms);
        return () => clearTimeout(t);
    }, [value, ms]);
    return debounced;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Select<TMultiple extends boolean = false>({
    options: staticOptions,
    fetchOptions,
    onCreate,
    value,
    onChange,
    multiple = false as TMultiple,
    placeholder = 'Select…',
    searchPlaceholder = 'Search…',
    createLabel = 'Create',
    maxDisplayed = 3,
    disabled = false,
    debounceMs = 300,
    invalid = false,
    className,
    tabIndex,
}: SelectProps<TMultiple>) {
    const triggerId = useId();
    const listRef = useRef<HTMLDivElement>(null);
    const abortRef = useRef<AbortController | null>(null);
    const isAsync = !!fetchOptions;

    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [fetchState, setFetchState] = useState<FetchState>(INITIAL_FETCH);
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);

    const debouncedSearch = useDebounce(search, debounceMs);

    // ── Static filtering ──────────────────────────────────────────────────────

    const filteredStatic = !isAsync && staticOptions ? staticOptions.filter((o) => o.label.toLowerCase().includes(search.toLowerCase())) : [];

    // ── Async fetch ───────────────────────────────────────────────────────────

    const fetchPage = useCallback(
        async (term: string, page: number, append: boolean) => {
            if (!fetchOptions) return;
            abortRef.current?.abort();
            const ctrl = new AbortController();
            abortRef.current = ctrl;
            setFetchState((p) => ({ ...p, loading: !append, loadingMore: append, error: null }));
            try {
                const result = await fetchOptions(term, page);
                if (ctrl.signal.aborted) return;
                setFetchState((p) => ({
                    options: append ? [...p.options, ...result.options] : result.options,
                    page,
                    hasMore: result.hasMore,
                    loading: false,
                    loadingMore: false,
                    error: null,
                }));
            } catch (err) {
                if (ctrl.signal.aborted) return;
                setFetchState((p) => ({
                    ...p,
                    loading: false,
                    loadingMore: false,
                    error: err instanceof Error ? err.message : 'Failed to load options.',
                }));
            }
        },
        [fetchOptions],
    );

    useEffect(() => {
        if (open && isAsync) fetchPage(debouncedSearch, 1, false);
    }, [open, debouncedSearch, isAsync, fetchPage]);

    useEffect(() => {
        if (!open) setSearch('');
    }, [open]);

    // ── Infinite scroll ───────────────────────────────────────────────────────

    const handleScroll = useCallback(() => {
        const el = listRef.current;
        if (!el || !isAsync) return;
        if (el.scrollHeight - el.scrollTop - el.clientHeight < 60 && fetchState.hasMore && !fetchState.loadingMore && !fetchState.loading) {
            fetchPage(debouncedSearch, fetchState.page + 1, true);
        }
    }, [isAsync, fetchState, debouncedSearch, fetchPage]);

    // ── Selection ─────────────────────────────────────────────────────────────

    const handleSelect = useCallback(
        (option: Option) => {
            if (multiple) {
                const cur = value as MultiValue;
                const next = cur.some((v) => v.value === option.value) ? cur.filter((v) => v.value !== option.value) : [...cur, option];
                (onChange as (v: MultiValue) => void)(next);
            } else {
                const isSame = (value as SingleValue)?.value === option.value;
                (onChange as (v: SingleValue) => void)(isSame ? null : option);
                setOpen(false);
            }
        },
        [multiple, value, onChange],
    );

    const handleRemove = useCallback(
        (optionValue: string) => {
            if (multiple) {
                (onChange as (v: MultiValue) => void)((value as MultiValue).filter((v) => v.value !== optionValue));
            } else {
                (onChange as (v: SingleValue) => void)(null);
            }
        },
        [multiple, value, onChange],
    );

    // ── Create ────────────────────────────────────────────────────────────────

    const handleCreate = useCallback(async () => {
        if (!onCreate || !search.trim() || creating) return;
        setCreating(true);
        setCreateError(null);
        try {
            const created = await onCreate(search.trim());
            if (isAsync) setFetchState((p) => ({ ...p, options: [created, ...p.options] }));
            handleSelect(created);
            setSearch('');
        } catch (err) {
            setCreateError(err instanceof Error ? err.message : 'Failed to create option.');
        } finally {
            setCreating(false);
        }
    }, [onCreate, search, creating, isAsync, handleSelect]);

    // ── Derived ───────────────────────────────────────────────────────────────

    const activeOptions = isAsync ? fetchState.options : filteredStatic;
    const trimmed = search.trim();
    const exactMatch = activeOptions.some((o) => o.label.toLowerCase() === trimmed.toLowerCase());
    const showCreate = !!onCreate && !!trimmed && !exactMatch && !fetchState.loading;
    const selectedValues = multiple ? (value as MultiValue) : [];
    const singleValue = !multiple ? (value as SingleValue) : null;
    const displayedBadges = selectedValues.slice(0, maxDisplayed);
    const overflowCount = selectedValues.length - maxDisplayed;

    // Hide already-selected options from the list
    const visibleOptions = activeOptions.filter((o) =>
        multiple ? !(value as MultiValue).some((v) => v.value === o.value) : (value as SingleValue)?.value !== o.value,
    );

    const handleKeyDown = useCallback(
        (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter' && showCreate) {
                e.preventDefault();
                handleCreate();
            }
        },
        [showCreate, handleCreate],
    );

    // ── Trigger content ───────────────────────────────────────────────────────

    const renderTrigger = () => {
        if (multiple) {
            if (selectedValues.length === 0) return <span className="text-muted-foreground">{placeholder}</span>;
            return (
                <div className="flex flex-wrap gap-1">
                    {displayedBadges.map((v) => (
                        <span
                            key={v.value}
                            className="border-border bg-secondary text-secondary-foreground inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs font-medium"
                        >
                            {v.label}
                            <span
                                role="button"
                                tabIndex={0}
                                aria-label={`Remove ${v.label}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove(v.value);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.stopPropagation();
                                        handleRemove(v.value);
                                    }
                                }}
                                className="focus:ring-ring ml-0.5 cursor-pointer rounded-sm opacity-60 transition-opacity hover:opacity-100 focus:ring-2 focus:outline-none"
                            >
                                <X className="h-3 w-3" />
                            </span>
                        </span>
                    ))}
                    {overflowCount > 0 && (
                        <span className="border-border bg-secondary text-muted-foreground inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs font-medium">
                            +{overflowCount} more
                        </span>
                    )}
                </div>
            );
        }
        if (singleValue) return <span className="truncate">{singleValue.label}</span>;
        return <span className="text-muted-foreground">{placeholder}</span>;
    };

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
            <PopoverTrigger asChild>
                <button
                    id={triggerId}
                    type="button"
                    role="combobox"
                    aria-expanded={open}
                    aria-haspopup="listbox"
                    aria-invalid={invalid}
                    disabled={disabled}
                    tabIndex={tabIndex}
                    className={cn(
                        'border-input ring-offset-background flex min-h-9 w-full items-center justify-between rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm',
                        'hover:bg-accent/30 transition-colors',
                        'focus:ring-ring focus:ring-2 focus:ring-offset-2 focus:outline-none',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                        'aria-invalid:border-destructive aria-invalid:ring-destructive',
                        multiple && selectedValues.length > 0 && 'h-auto py-1.5',
                        className,
                    )}
                >
                    <span className="flex min-w-0 flex-1 flex-wrap gap-1">{renderTrigger()}</span>
                    <ChevronDown
                        className={cn('text-muted-foreground ml-2 h-4 w-4 shrink-0 transition-transform duration-200', open && 'rotate-180')}
                    />
                </button>
            </PopoverTrigger>

            <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start" sideOffset={4}>
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder={searchPlaceholder}
                        value={search}
                        onValueChange={setSearch}
                        onKeyDown={handleKeyDown}
                        className="h-9"
                    />
                    <CommandList ref={listRef} onScroll={handleScroll} className="max-h-60 overflow-y-auto">
                        {fetchState.loading && (
                            <div className="text-muted-foreground flex items-center justify-center py-6 text-sm">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
                            </div>
                        )}

                        {fetchState.error && !fetchState.loading && (
                            <div className="text-destructive px-3 py-4 text-center text-sm">{fetchState.error}</div>
                        )}

                        {!fetchState.loading && !fetchState.error && visibleOptions.length === 0 && !showCreate && (
                            <CommandEmpty>No results found.</CommandEmpty>
                        )}

                        {!fetchState.loading && visibleOptions.length > 0 && (
                            <CommandGroup>
                                {visibleOptions.map((option) => (
                                    <CommandItem
                                        key={option.value}
                                        value={option.value}
                                        onSelect={() => handleSelect(option)}
                                        className="cursor-pointer"
                                    >
                                        <span className="truncate">{option.label}</span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}

                        {fetchState.loadingMore && (
                            <div className="text-muted-foreground flex items-center justify-center py-3 text-xs">
                                <Loader2 className="mr-1.5 h-3 w-3 animate-spin" /> Loading more…
                            </div>
                        )}

                        {showCreate && (
                            <>
                                {visibleOptions.length > 0 && <CommandSeparator />}
                                <CommandGroup>
                                    <CommandItem
                                        value={`__create__${trimmed}`}
                                        onSelect={handleCreate}
                                        disabled={creating}
                                        className="text-primary cursor-pointer"
                                    >
                                        {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                        {creating ? `Creating "${trimmed}"…` : `${createLabel} "${trimmed}"`}
                                    </CommandItem>
                                    {createError && <p className="text-destructive px-2 pt-1 pb-2 text-xs">{createError}</p>}
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
