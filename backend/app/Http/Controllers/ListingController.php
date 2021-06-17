<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

use App\Exceptions\Listing\ListingProcessException;
use App\Models\Listing;

class ListingController extends Controller
{
    /**
     * @param Request $request
     * Return the records in the database for the product listings
     */
    public function search(Request $request)
    {
        $response = [
            'message'=> '',
            'status' => 'success',
            'data' => []
        ];

        $per_page = $request->input('per_page', 10);
        $page = $request->input('page', 1);

        $query = Listing::query();

        // To-Do... Add potential filtering criteria
        if ($per_page) {
            $paginator = $query->paginate($per_page, ['*'], 'page', $page);
            $total = $paginator->total();
            $from = $total > $per_page ? $per_page * ($page - 1) + 1 : 1;
            $to = $paginator->count() + ($from - 1);
            return [
                'items' => $paginator->getCollection(),
                'page' => $paginator->currentPage(),
                'per_page' => $per_page,
                'from' => $from,
                'to' => $to,
                'total' => $total,
                'last_page' => $paginator->lastPage()
            ];
        } else {
            $records = $query->get();
            $total = $records->count();
            return [
                'items' => $records,
                'current_page' => 1,
                'per_page' => $total,
                'from' => 1,
                'to' => $total,
                'total' => $total,
                'last_page' => 1
            ];
        }

        return response()->json($response);
    }

    /**
     * @param Request $request ['csv_file'=>file]
     * Responsible for taking a CSV file, Parsing it for rows of listing data
     * and attempt to insert into the listing table
     */
    public function upload(Request $request)
    {
        $response_code = 200;
        $response = [
            'message'=> '',
            'status' => 'success',
            'data' => []
        ];

        $listings = collect([]);
        $column_map = ['asin', 'title', 'price', 'net_margin'];
        $errors = [];
        $inserted = 0;
        $found = 0;

        try {
            Validator::make($request->all(), [
                'csv_file'=>'required|mimes:csv,txt|max:1000'
            ])->validate();            

            $csv_file = $request->file('csv_file');
            $path = $csv_file->getRealPath();
            $table = array_map('str_getcsv', file($path));
            foreach ($table as $i => $row) {
                // Ensure each row has a matching number of columns to the column_map
                // otherwise the row is missing data/has extra data and we should skip/log
                if (count($row) != count($column_map)) {
                    $errors[] = ['row'=> $i, 'message'=>"Row #{$i} doesn't have enough columns"];
                }

                // Map to an associative array based on the column mapping to fit the model
                // attribute requirements for mass assignment
                $keyed_row = [];
                foreach ($column_map as $column_num=>$key) {
                    $keyed_row[$key] = $row[$column_num];
                }

                // Using the model we can validate the row and extract error messages for possible
                // error handling messages
                $listing = new Listing($keyed_row);
                $listing_validator = $listing->getValidator();
                if ($listing_validator->fails()) {
                    $errors[] = ['row'=> $i, 'message'=>"Row #{$i} failed the listing field validations", 'validations'=>$listing_validator->messages()];
                } else {
                    $listings->push($listing);
                }
            }

            // Extract the asin as these are supposed to be unique and retrieve every existing record
            // that matches these asins to ensure we don't insert them again, could add an update functionality
            // but would likely want to dispatch onto a job with a monitor as inserts are less expensive to perform
            $asins = $listings->pluck('asin');
            $existing = Listing::whereIn('asin', $asins->all())->get()->keyBy('asin');
            foreach ($listings as $pos=>$listing) {
                if ($existing->get($listing->asin)) {
                    $listings->forget($pos);
                    $found++;
                }
            }

            if ($listings->count()) {
                $inserted = Listing::insert($listings->toArray());
            }

            // If some listings inserted or we have valid existing records, we can count as a success with warnings, 
            // otherwise, throw an exception due to the spreadsheet having nothing actionable
            if (!$found && !$inserted && $errors)
                throw ListingProcessException::withErrors("No listings were inserted and errors were found", $errors);

            $response['data']['found'] = $found;
            $response['data']['failed'] = count($errors);
            $response['data']['errors'] = $errors;
            $response['message'] = "Successfully added `{$inserted}` and found `{$found}` existing record(s).";                
        } catch (ValidationException $e) {
            $response_code = 422;
            $response['status'] = 'error';
            $response['message'] = $e->getMessage();
            $response['data']['errors'] = $e->validator->messages();
        } catch (ListingProcessException $e) {
            $response_code = 422;
            $response['status'] = 'error';
            $response['message'] = $e->getMessage();
            $response['data']['errors'] = $e->getErrors();
        }
        
        return response()->json($response, $response_code);
    }   
}