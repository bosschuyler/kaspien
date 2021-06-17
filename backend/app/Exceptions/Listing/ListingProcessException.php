<?php

namespace App\Exceptions\Listing;

use Exception;

class ListingProcessException extends Exception
{
    protected $errors = [];

    public static function withErrors($message, $errors = [])
    {
        $e = new static($message);
        $e->errors = $errors;
        return $e;
    }

    public function getErrors()
    {
        return $this->errors;
    }
}