<?php

namespace App\Models\Master;

use App\Helpers\SoftDeleteMarker;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Branch extends Model
{
    use SoftDeletes;

    protected $table = "branches";

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'is_active',
        'is_default',
        'created_by',
        'updated_by',
        'deleted_by',
    ];

    /**
     * Cast marker to something meaningful
     *
     * @var list<string>
     */
    protected $casts = [
        'is_active' => 'boolean',
        'is_default' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

}
