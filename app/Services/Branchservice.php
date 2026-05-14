<?php

namespace App\Services;

use App\Models\Master\Branch;

class Branchservice 
{
    /**
     * Find an existing branch by ID.
     * Throws ModelNotFoundException if the ID does not exist.
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    public function findById(int $id): Branch
    {
        return Branch::findOrFail($id);
    }

    /**
     * Find an existing branch by name (case-insensitive) or create a new one.
     *
     * Returns the branch and a boolean indicating whether it was just created.
     *
     * @return array{0: Branch, 1: bool} [branch, wasCreated]
     */
    public function findOrCreateByName(string $name): array
    {
        $name = trim($name);
 
        $existing = Branch::whereRaw('LOWER(name) = ?', [strtolower($name)])->first();
 
        if ($existing) {
            return [$existing, false];
        }
 
        $branch = Branch::create([
            'name'       => $name,
            'is_default' => true,
        ]);
 
        return [$branch, true];
    }

    /**
     * Resolve a branch from a request's branch_id.
     *
     * If branch_id is negative (locally created option), uses branch_name
     * to find or create. If positive, fetches the existing branch.
     *
     * Returns the branch and whether it was newly created.
     *
     * @return array{0: Branch, 1: bool} [branch, wasCreated]
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    public function resolveFromRequest(int $branchId, ?string $branchName): array
    {
        if ($branchId < 0) {
            return $this->findOrCreateByName((string) $branchName);
        }
 
        return [$this->findById($branchId), false];
    }
}