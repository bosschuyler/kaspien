<?php

namespace App\Models;

use App\Rules\Percentage;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Validator;

class Listing extends Model
{

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'asin',
        'title',
        'price',
        'net_margin'
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'price' => 'float'
    ];

    protected $rules = [
        'asin' => 'required',
        'title' => 'required|max:255',
        'price' => 'required|numeric',
        'net_margin' => 'required|numeric'
    ];

    public function getValidator()
    {
        return Validator::make($this->getAttributes(), $this->rules);
    }

    // Convert the percentage field into a numeric float for standardization
    // strip a % symbol if it's found and then check the remaining if it's numeric
    public function setNetMarginAttribute($value) {
        $parts = explode('%', $value);
        if (is_numeric($parts[0]) && $parts[1] === '') {
            $this->attributes['net_margin'] = ($this->fromFloat($parts[0]) / 100);
        }
    }

    public function validate()
    {
        $this->getValidator()->validate();
    }
}
